import express, {Router} from 'express';
import { BranchController } from '../controllers/branch.controller';
import authenticateToken from '../utils/authenticateToken';

const locationRouter: Router = express.Router();

locationRouter.get('/locations', authenticateToken, BranchController.findAll);
locationRouter.get('/locations/:id', authenticateToken, BranchController.findById);
locationRouter.post('/locations', authenticateToken, BranchController.create);
locationRouter.put('/locations/:id', authenticateToken, BranchController.update);
locationRouter.delete('/locations/delete/:id', authenticateToken, BranchController.delete);

export default locationRouter;
