import { Router } from 'express';
import {PushNotificationController} from '../controllers/push-notification.controller';

const pushRouter: Router = Router();

// Definisci la rotta POST per la sottoscrizione
pushRouter.post('/', PushNotificationController.pushSubscribe);

export default pushRouter;
