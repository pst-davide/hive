import express, {Router} from 'express';
import {ShiftController} from '../controllers/shift.controller';
import authenticateToken from '../utils/authenticateToken';

const shiftRouter: Router = express.Router();

shiftRouter.get('/shifts', authenticateToken, ShiftController.findAll);
shiftRouter.get('/shifts/:id', authenticateToken, ShiftController.findById);
shiftRouter.post('/shifts', authenticateToken, ShiftController.create);
shiftRouter.put('/shifts/:id', authenticateToken, ShiftController.update);
shiftRouter.delete('/shifts/delete/:id', authenticateToken, ShiftController.delete);

export default shiftRouter;
