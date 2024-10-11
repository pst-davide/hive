import express, {Router} from 'express';
import {ShiftController} from '../controllers/shift.controller';
import authenticateToken from '../utils/authenticateToken';

const shiftRouter: Router = express.Router();

shiftRouter.get('/shifts', authenticateToken, ShiftController.findAll);
shiftRouter.get('/shifts/:id', ShiftController.findById);
shiftRouter.post('/shifts', ShiftController.create);
shiftRouter.put('/shifts/:id', ShiftController.update);
shiftRouter.delete('/shifts/delete/:id', ShiftController.delete);

export default shiftRouter;
