import webpush, { PushSubscription } from 'web-push';
import { Request, Response } from 'express';

// Configura le chiavi VAPID
const vapidKeys = {
  publicKey: 'BNoxscD2qZ71bMDlSu0bYaWMODSCaShPVqGlYxF03iLT_LkqrVveen2gnOJwaqDBkSx_K6UAigGCVfSoI13d9vE',
  privateKey: '3OSEg8Q_yCEKBlSTTz-rOiIYKdpo0lVrAXKnh4Su6Es',
};

webpush.setVapidDetails(
  'mailto:davide.sorrentino@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export class PushNotificationController {
  static async pushSubscribe(req: Request, res: Response): Promise<void> {
    const subscription: PushSubscription = req.body;

    // Salva la sottoscrizione nel tuo database (opzionale)
    console.log(subscription);

    // Rispondi con successo
    res.status(201).json({});

    // Invia una notifica di test
    const payload: string = JSON.stringify({ title: 'Test Notification' });

    try {
      await webpush.sendNotification(subscription, payload);
      console.log('Notification sent successfully.');
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  }
}
