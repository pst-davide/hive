import express, {Router} from 'express';
import {NewsletterChannelController} from '../controllers/newsletter-channel.controller';
import {NewsletterSubscriberController} from '../controllers/newsletter-subscriber.controller';

const newsletterRouter: Router = express.Router();

newsletterRouter.get('/newsletters/channels', NewsletterChannelController.findAll);
newsletterRouter.get('/newsletters/channels/:id', NewsletterChannelController.findById);
newsletterRouter.post('/newsletters/channels', NewsletterChannelController.create);
newsletterRouter.put('/newsletters/channels/:id', NewsletterChannelController.update);
newsletterRouter.delete('/newsletters/channels/delete/:id', NewsletterChannelController.delete);

newsletterRouter.get('/newsletters/subscriptions', NewsletterSubscriberController.findAll);
newsletterRouter.get('/newsletters/subscriptions/:id', NewsletterSubscriberController.findById);
newsletterRouter.post('/newsletters/subscriptions', NewsletterSubscriberController.create);
newsletterRouter.put('/newsletters/subscriptions/:id', NewsletterSubscriberController.update);
newsletterRouter.delete('/newsletters/subscriptions/delete/:id', NewsletterSubscriberController.delete);

export default newsletterRouter;
