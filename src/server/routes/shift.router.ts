import express, {Router} from 'express';
import {ShiftController} from '../controllers/shift.controller';

const shiftRouter: Router = express.Router();

shiftRouter.get('/shift', ShiftController.findAll);
shiftRouter.get('/shift/:id', ShiftController.findById);
shiftRouter.post('/shift', ShiftController.create);
shiftRouter.put('/shift/:id', ShiftController.update);
shiftRouter.delete('/shift/delete/:id', ShiftController.delete);

export default shiftRouter;
