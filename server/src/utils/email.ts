import nodemailer from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import winston from 'winston';
import {Job, Queue, Worker} from 'bullmq';
import Redis from 'ioredis';

const MAX_CONCURRENCY: number = 2;
const EMAIL_DELAY: number = 1000;

/******************************************************************
 *
 * Logger
 *
 * ***************************************************************/

const logger: winston.Logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({timestamp, level, message}) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({filename: 'email.log'})
  ]
});

/******************************************************************
 *
 * Nodemailer Transporter
 *
 * ***************************************************************/

/***
 const transporter: nodemailer.Transporter<SMTPPool.SentMessageInfo> = nodemailer.createTransport({
 pool: true,
 host: 'zimbra.altovicentino.net',
 port: 465,
 secure: true,
 auth: {
 user: 'guesttracker@pasubiotecnologia.it',
 pass: 'VS)Ce39k@89u!3'
 },
 maxConnections: MAX_CONCURRENCY, // Numero di connessioni in parallelo
 rateLimit: 5, // Max mail per secondo
 maxMessages: Infinity
 });
 ****/

const transporter = nodemailer.createTransport({
  pool: true,
  host: 'sandbox.smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '7fbc5ea16d2990',
    pass: '1c87da8f70846b'
  },
  maxConnections: MAX_CONCURRENCY, // Numero di connessioni in parallelo
  rateLimit: 5, // Max mail per secondo
  maxMessages: Infinity
});

/******************************************************************
 *
 * Redis and Queue
 *
 * ***************************************************************/

const connection: Redis = new Redis({
  maxRetriesPerRequest: null
});
const emailQueue: Queue<any, any, string> = new Queue('emailQueue', {connection});

async function addEmailsToQueue(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await emailQueue.add('sendEmail', {
      to: `name+${i}@inbox.mailtrap.io`,
      subject: `Test Email ${i}`,
      text: `This is a test email number ${i}.`
    }, {
      // delay: i * 1000, // 10 secondi di delay tra ogni email
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000
      }
    });

    // Log ogni volta che un job viene aggiunto alla coda
    logger.info(`Job ${i} added to the queue`);
  }
  await emailQueue.add('sendEmail', {
    to: `qweertyofemccdhienwòfrrnjrgr@gmail.com`,
    subject: `Test Email fake`,
    text: `This is a fake email.`
  }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 3000
    }
  });
  logger.info(`Fake added to the queue`);
}

// Chiama la funzione per aggiungere le email alla coda
addEmailsToQueue().then(() => startWorker()).catch(err => logger.error(err));

/******************************************************************
 *
 * View jobs on queue
 *
 * ***************************************************************/

async function viewJobsInQueue(): Promise<void> {
  const waitingJobs: Job<any, any, string>[] = await emailQueue.getJobs(['waiting']);
  const completedJobs: Job<any, any, string>[] = await emailQueue.getJobs(['completed']);

  logger.info(`Waiting Jobs: ${waitingJobs.length}`);
  waitingJobs.forEach((job: Job<any, any, string>) => logger.info(`Job ID: ${job.id}, Data: ${JSON.stringify(job.data)}`));

  logger.info(`Completed Jobs: ${completedJobs.length}`);
  completedJobs.forEach((job: Job<any, any, string>) => logger.info(`Job ID: ${job.id}, Data: ${JSON.stringify(job.data)}`));
}

/******************************************************************
 *
 * Clear queue
 *
 * ***************************************************************/

async function emptyQueue(): Promise<void> {
  try {
    await emailQueue.obliterate({force: true});
    logger.info('Queue has been obliterated.');
  } catch (err: any) {
    logger.error(`Error while emptying queue: ${err.message}`);
  }
}

// emptyQueue().catch(err => logger.error(err));

/******************************************************************
 *
 * Worker
 *
 * ***************************************************************/

let worker: Worker<any, any, string> | null = null;

// Funzione per avviare il worker
function startWorker() {
  const invalidEmails: Set<string> = new Set();

  let totalEmailsSent: number = 0;
  let totalErrors: number = 0;
  let totalWaitTime: number = 0;
  let totalEmailsAttempted: number = 0;

  if (!worker) {
    worker = new Worker('emailQueue', async job => {
      const {to, subject, text} = job.data;
      const attemptsMade: number = job.attemptsMade;

      // Controlla se l'email è già segnata come non valida
      if (invalidEmails.has(to)) {
        logger.error(`Skipping sending email to invalid address: ${to}`);
        totalErrors++;
        return;
      }

      await new Promise(resolve => setTimeout(resolve, EMAIL_DELAY));
      totalWaitTime += EMAIL_DELAY;

      try {
        const info: SMTPPool.SentMessageInfo = await transporter.sendMail({
          from: 'guesttracker@pasubiotecnologia.it',
          to,
          subject,
          text,
          headers: {
            'Return-Path': 'bounce@pasubiotecnologia.it' // Header per i bounce
          },
          envelope: {
            from: 'bounce@pasubiotecnologia.it',  // Mittente per i bounce
            to // Destinatario dell'email
          }
        });

        if (info.accepted && info.accepted.length > 0) {
          logger.info(`Email sent to ${to} with subject: "${subject}". SMTP response: ${info.response}`);
          totalEmailsSent++;
        }
      } catch (error: any) {
        logger.error(`Error sending email to ${to} (attempt ${attemptsMade + 1}): ${error.message}`);
        if (attemptsMade >= 2) {
          totalErrors++;
        }

        if (error.responseCode) {
          const responseCode = error.responseCode;

          switch (responseCode) {
            case 421:
              logger.warn(`Message temporarily deferred for ${to}. Too many connections in a short timeframe.`);
              break;
            case 450:
              logger.warn(`Mailbox unavailable for ${to}. It may be locked or not routable.`);
              break;
            case 451:
              logger.warn(`Message failed for ${to}. This is likely a server problem.`);
              break;
            case 452:
              logger.warn(`Not enough system storage for ${to}. Message deferred until storage is available.`);
              break;
            case 550:
              logger.error(`Mailbox unavailable or message rejected for ${to}.`);
              // invalidEmails.add(to);
              break;
            case 551:
              logger.error(`Mailbox does not exist for ${to}.`);
              invalidEmails.add(to);
              break;
            case 552:
              logger.error(`Mailbox full for ${to}.`);
              break;
            case 553:
              logger.error(`Mailbox name does not exist for ${to}.`);
              invalidEmails.add(to);
              break;
            case 554:
              logger.error(`Generic error for ${to}: ${responseCode}. This may require further investigation.`);
              break;
            default:
              logger.error(`Unknown error for ${to}: ${responseCode}`);
          }
        }

        throw error;
      } finally {
        totalEmailsAttempted++; // Incrementa il conteggio delle email tentate
      }
    }, {
      connection,
      concurrency: MAX_CONCURRENCY
    });

    logger.info('Worker started.');

    worker.on('completed', async () => {
      await processInvalidEmails(invalidEmails);

      // Statistiche finali
      const successRate: number = totalEmailsSent / totalEmailsAttempted * 100;
      const averageWaitTime: number = totalWaitTime / totalEmailsAttempted;

      logger.info(`Total Emails Sent: ${totalEmailsSent}`);
      logger.info(`Total Errors: ${totalErrors}`);
      logger.info(`Success Rate: ${successRate.toFixed(2)}%`);
      logger.info(`Total Emails Attempted: ${totalEmailsAttempted}`);
      logger.info(`Total Wait Time: ${totalWaitTime} ms`);
      logger.info(`Average Wait Time: ${averageWaitTime.toFixed(2)} ms`);
    });
  }
}

/******************************************************************
 *
 * Invalid Emails
 *
 * ***************************************************************/

async function processInvalidEmails(invalidEmails: Set<string>) {
  if (invalidEmails.size > 0) {
    // Qui puoi implementare la logica per gestire gli indirizzi non validi
    logger.info(`Processing invalid emails: ${Array.from(invalidEmails).join(', ')}`);

    // Esempio: aggiungi la logica per notificare o registrare gli indirizzi
    // await saveInvalidEmailsToDatabase(Array.from(invalidEmails));
    // Oppure invia una notifica a un sistema esterno
  }
}

/******************************************************************
 *
 * Avvio del Server
 *
 * ***************************************************************/

// Funzione per avviare il server
function startServer() {
  logger.info('Server is running...');
}

startServer();
