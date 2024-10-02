import express, {Router} from 'express';
import {NewsletterChannelController} from '../controllers/newsletter-channel.controller';

const newsletterRouter: Router = express.Router();

newsletterRouter.get('/newsletters/channels', NewsletterChannelController.findAll);
newsletterRouter.get('/newsletters/channels/:id', NewsletterChannelController.findById);
newsletterRouter.post('/newsletters/channels', NewsletterChannelController.create);
newsletterRouter.put('/newsletters/channels/:id', NewsletterChannelController.update);
newsletterRouter.delete('/newsletters/channels/delete/:id', NewsletterChannelController.delete);

export default newsletterRouter;
