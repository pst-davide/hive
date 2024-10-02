import nodemailer from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import winston from 'winston';
import {Job, Queue, Worker} from 'bullmq';
import Redis from 'ioredis';

/******************************************************************
 *
 * Logger
 *
 * ***************************************************************/

const logger: winston.Logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'email.log' })
  ]
});

/******************************************************************
 *
 * Nodemailer Transporter
 *
 * ***************************************************************/

const transporter: nodemailer.Transporter<SMTPPool.SentMessageInfo> = nodemailer.createTransport({
  pool: true,
  host: 'zimbra.altovicentino.net',
  port: 465,
  secure: true,
  auth: {
    user: 'guesttracker@pasubiotecnologia.it',
    pass: 'VS)Ce39k@89u!3'
  },
  maxConnections: 2, // Numero di connessioni in parallelo
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
const emailQueue: Queue<any, any, string> = new Queue('emailQueue', { connection });

async function addEmailsToQueue(): Promise<void> {
  for (let i = 0; i < 2; i++) {
    await emailQueue.add('sendEmail', {
      to: `davide.sorrentino@gmail.com`,
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
      to: `davide.sorrentino@gmail.comxxxewewew`,
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
    await emailQueue.obliterate({ force: true });
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
  if (!worker) {
    worker = new Worker('emailQueue', async job => {
      const { to, subject, text } = job.data;

      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        const info: any = await new Promise((resolve, reject) => {
          transporter.sendMail({
            from: 'guesttracker@pasubiotecnologia.it',
            to,
            subject,
            text,
            headers: {
              'Return-Path': 'bounce@pasubiotecnologia.it' // Header per i bounce
            }
          }, (error, info) => {
            if (error) {
              logger.error(`Error sending email to ${to}: ${error.message}`);
              return reject(error);
            }

            logger.info(`Email sent to ${to} with subject: "${subject}". SMTP response: ${info.response}`);
            resolve(info);
          });
        });

        if (info.accepted && info.accepted.length > 0) {
          logger.info(`Email accepted by SMTP server for ${to}`);
        } else if (info.rejected && info.rejected.length > 0) {
          logger.error(`Email rejected for ${to}: ${info.rejected}`);
        }
      } catch (error: any) {
        logger.error(`Error sending email to ${to}: ${error.message}`);
      }
    }, {
      connection,
      concurrency: 1
    });

    logger.info('Worker started.');
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
