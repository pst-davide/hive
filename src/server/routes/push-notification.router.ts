import { Router } from 'express';
import { subscribe } from '../controllers/push-notification.controller';

const router: Router = Router();

// Definisci la rotta POST per la sottoscrizione
router.post('/subscribe', subscribe);

export default router;
