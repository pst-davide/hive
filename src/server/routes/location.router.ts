import express, {Router} from 'express';
import { LocationController } from '../controllers/location.controller';
import authenticateToken from '../utils/authenticateToken';

const locationRouter: Router = express.Router();

locationRouter.get('/locations', authenticateToken, LocationController.findAll);
locationRouter.get('/locations/:id', authenticateToken, LocationController.findById);
locationRouter.post('/locations', authenticateToken, LocationController.create);
locationRouter.put('/locations/:id', authenticateToken, LocationController.update);
locationRouter.delete('/locations/delete/:id', authenticateToken, LocationController.delete);

export default locationRouter;
