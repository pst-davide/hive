import {processQueue} from './email';
import * as amqp from 'amqplib';

async function testQueue(): Promise<void> {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue: string = 'emailQueue';

    await channel.assertQueue(queue, { durable: true });
    console.log('Coda creata con successo');

    // Avvia il processo di elaborazione della coda
    console.log('Avvio del processo di elaborazione della coda...');
    processQueue().then(() => {
      console.log('ProcessQueue completato');
    }).catch(error => {
      console.error('Errore in processQueue:', error);
    });
    console.log('ProcessQueue è stato avviato');

    // Attendi un po' di tempo per vedere se il processo sta funzionando
    await new Promise(resolve => setTimeout(resolve, 10000));

    // Chiudi la connessione e il canale
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Errore:', error);
  }
}

testQueue();

