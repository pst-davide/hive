import express from 'express';
import { LocationController } from '../controllers/location.controller';

const locationRouter = express.Router();

locationRouter.get('/locations', LocationController.findAll);
locationRouter.get('/locations/:id', LocationController.findById);
locationRouter.post('/locations', LocationController.create);
locationRouter.put('/locations/:id', LocationController.update);
locationRouter.delete('/locations/:id', LocationController.delete);

export default locationRouter;
