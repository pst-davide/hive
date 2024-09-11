import { Request, Response } from 'express';
import webPush from 'web-push';

// Chiavi VAPID
const publicVapidKey: string = 'BFGQimvmI8cHZDwbhBp1NxDfXAkzX00juGwr1v4TL72CKsBTNacANfkvhZeKrDCuZzQSSZDjvm1ItWI-wbDVyT0';
const privateVapidKey: string = 'ci3uYT1g3UBdExNeWFX8jf8J59zAC1hrnjyLsj4ZTsk';

// Configurazione di VAPID
webPush.setVapidDetails(
  'mailto:davide.sorrentino@gmail.com',
  publicVapidKey,
  privateVapidKey
);

// Funzione che gestisce la sottoscrizione e invia la notifica
export const subscribe = (req: Request, res: Response): void => {
  const subscription = req.body;

  // Risposta di conferma della sottoscrizione
  res.status(201).json({});

  // Contenuto della notifica
  const payload: string = JSON.stringify({ title: 'Push Notification' });

  // Invio della notifica
  webPush.sendNotification(subscription, payload).catch(error => {
    console.error('Errore invio notifica:', error);
  });
};
