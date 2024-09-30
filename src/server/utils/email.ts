import nodemailer from 'nodemailer';
import * as amqp from 'amqplib';
import SMTPPool from 'nodemailer/lib/smtp-pool';
import winston from 'winston';

/******************************************************************
 * Logger
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
 * Nodemailer Transponder
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
  maxConnections: 1, // Numero di connessioni in parallelo
  maxMessages: Infinity
});

/******************************************************************
 *
 * Rabbit Connection and send to queue
 *
 * ***************************************************************/

let rabbitConnection: amqp.Connection | null = null;
let rabbitChannel: amqp.Channel | null = null;

async function connectQueue(): Promise<amqp.Channel> {
  if (rabbitChannel) return rabbitChannel;

  try {
    if (!rabbitConnection) {
      rabbitConnection = await amqp.connect('amqp://localhost');
      logger.info('Connessione a RabbitMQ stabilita.');
    }
    rabbitChannel = await rabbitConnection.createChannel();
    return rabbitChannel;
  } catch (error) {
    logger.error(`Errore durante la connessione a RabbitMQ: ${(error as Error).message}`);
    throw error;
  }
}

export async function sendToQueue(emailData: any): Promise<void> {
  await connectQueue();
  const queue: string = 'emailQueue';

  if (!rabbitChannel) {
    return;
  }

  // Assicura che la coda esista
  await rabbitChannel.assertQueue(queue, {
    durable: true
  });

  // Invia i dettagli dell'email alla coda
  rabbitChannel.sendToQueue(queue, Buffer.from(JSON.stringify(emailData)), {
    persistent: true
  });

  logger.info(`Email aggiunta alla coda: ${emailData.to}`);
}


/******************************************************************
 *
 * Rabbit Clear queue
 *
 * ***************************************************************/

async function clearQueue(): Promise<void> {
  await connectQueue();
  const queue: string = 'emailQueue';

  if (!rabbitChannel) {
    return;
  }

  // Svuota la coda
  const result:amqp.Replies.PurgeQueue = await rabbitChannel.purgeQueue(queue);
  logger.info(`Coda svuotata. Messaggi rimossi: ${result.messageCount}`);
}

async function processQueue3(): Promise<void> {
  await connectQueue();
  const queue: string = 'emailQueue';

  if (!rabbitChannel) {
    return;
  }

  await rabbitChannel.consume(queue, async (msg: amqp.ConsumeMessage | null) => {
    if (msg === null) {
      return;
    }

    const emailData = JSON.parse(msg.content.toString());
    console.log(emailData);
  });
}

/******************************************************************
 *
 * Rabbit Clear queue
 *
 * ***************************************************************/
// Funzione per inserire un ritardo tra l'invio delle email
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MAX_RETRIES: number = 3;
const RETRY_DELAY: number = 5000;
const BATCH_SIZE: number = 2;
const BATCH_DELAY: number = 60000;
const SEND_DELAY: number = 10000;

async function sendEmailWithRetry(emailData: any, retries: number = MAX_RETRIES): Promise<void> {
  try {
    if (!emailData.to) {
      throw new Error('No recipient defined');
    }

    await transporter.sendMail({
      from: '"Guest Tracker" <guesttracker@pasubiotecnologia.it>',
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text
    });
    logger.info(`Email inviata a ${emailData.to}`);
  } catch (error: any) {
    if (retries > 0) {
      logger.error(`Errore durante l'invio dell'email a ${emailData.to}: ${error.message}. Ritentando in ${RETRY_DELAY / 1000} secondi...`);
      await delay(RETRY_DELAY);
      await sendEmailWithRetry(emailData, retries - 1); // Ritenta
    } else {
      logger.error(`Errore persistente durante l'invio dell'email a ${emailData.to}: ${error.message}.`);
    }
  }
}

export async function processQueue2(): Promise<void> {
  try {
    const channel: amqp.Channel = await connectQueue();
    const queue: 'emailQueue' = 'emailQueue';
    let batchSize: number = BATCH_SIZE; // Numero di email per batch
    let currentBatchSize: number = 0; // Batch size corrente

    logger.info('Inizio a processare la coda email.');

    await channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const emailData = JSON.parse(msg.content.toString());
        logger.info(`Questo email data: ${emailData}`);
        try {
          if (!emailData.to) {
            throw new Error('No recipient defined');
          }

          logger.info(`Processo email a ${emailData.to}. Batch size corrente: ${currentBatchSize}`);

          await sendEmailWithRetry(emailData);

          // Ritardo tra l'invio delle email
          await delay(SEND_DELAY);

          currentBatchSize++;

          // Quando il batch è completo, attende il delay
          if (currentBatchSize >= batchSize) {
            logger.info('Batch completo. Attendo il delay del batch...');
            currentBatchSize = 0; // Reset batch size corrente
            await delay(BATCH_DELAY);
          }

          // Conferma che il messaggio è stato processato con successo
          channel.ack(msg);

        } catch (error: any) {
          logger.error(`Errore durante l'invio dell'email a ${emailData.to}: ${error.message}`);
          channel.nack(msg, false, true); // aggiungo di nuovo il messaggio alla coda
        }
      }
    }, {
      noAck: false // Conferma che l'email è stata inviata prima di rimuovere il messaggio dalla coda
    });
  } catch (error: any) {
    logger.error(`Errore durante la connessione a RabbitMQ: ${error.message}`);
  }
}

export async function processQueue(): Promise<void> {
  try {
    const channel: amqp.Channel = await connectQueue();
    const queue: string = 'emailQueue';
    const batchSize: number = BATCH_SIZE;
    let currentBatch: { msg: amqp.Message, emailData: any }[] = [];

    logger.info('Inizio a processare la coda email.');

    await channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const emailData = JSON.parse(msg.content.toString());

        if (!emailData.to) {
          logger.error(`Errore: Nessun destinatario definito per l'email. Messaggio ignorato.`);
          channel.nack(msg, false, false); // Non riaggiungere il messaggio alla coda
          return;
        }

        logger.info(`Email aggiunta al batch: ${emailData.to}`);
        currentBatch.push({ msg, emailData });

        // Se il batch è completo, processa il batch
        if (currentBatch.length >= batchSize) {
          await processBatch(currentBatch, channel);
          currentBatch = []; // Pulisce il batch corrente
        }
      }
    }, {
      noAck: false // Conferma che l'email è stata inviata prima di rimuovere il messaggio dalla coda
    });

  } catch (error: any) {
    logger.error(`Errore durante la connessione a RabbitMQ: ${error.message}`);
  }
}

async function processBatch(batch: { msg: amqp.Message, emailData: any }[], channel: amqp.Channel) {
  try {
    for (const item of batch) {
      const { msg, emailData } = item;
      try {
        logger.info(`Processo email a ${emailData.to}`);

        await sendEmailWithRetry(emailData);

        // Ritardo tra l'invio delle email
        await delay(SEND_DELAY);

        // Conferma che il messaggio è stato processato con successo
        channel.ack(msg);
      } catch (error: any) {
        logger.error(`Errore durante l'invio dell'email a ${emailData.to}: ${error.message}`);
        // In caso di errore, nack del messaggio e riaggiunta alla coda
        channel.nack(msg, false, true);
      }
    }

    logger.info('Batch completo. Attendo il delay del batch...');
    await delay(BATCH_DELAY);
    logger.info('Delay del batch completato.');

  } catch (error: any) {
    logger.error(`Errore durante il processamento del batch: ${error.message}`);
    // Gestione degli errori per il batch (opzionale)
  }
}

const emailList: string[] = ['davide.sorrentino@gmail.com', 'davide.sorrentino@gmail.com', 'davide.sorrentino@gmail.com',
  'davide.sorrentino@gmail.com', 'davide.sorrentino@gmail.com', 'davide.sorrentino@gmail.com'];
const createTestEmail = (index: number) => ({
  to: emailList[index],
  subject: `Test Email ${index}`,
  text: `This is a test email number ${index}.`
});

async function sendTestEmails(): Promise<void> {
  for (let i = 0; i <= 5; i++) {
    const emailData = createTestEmail(i);
    await sendToQueue(emailData);
    console.log(`Email ${i} inviata alla coda.`);
  }
}

sendTestEmails().then(async () => {
  await delay(5000)
  processQueue3()
  await delay(15000)
  clearQueue()
  // processQueue().then(() => {});
})
