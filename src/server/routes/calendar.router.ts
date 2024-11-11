import express, {Router} from 'express';
import authenticateToken from '../utils/authenticateToken';
import {CalendarController} from '../controllers/calendar.controller';

const calendarRouter: Router = express.Router();

calendarRouter.get('/calendar', authenticateToken, CalendarController.findAll);
calendarRouter.get('/calendar/:id', authenticateToken, CalendarController.findById);
calendarRouter.post('/calendar/range', authenticateToken, CalendarController.getEventsInRange);
calendarRouter.get('/calendar/serial/:shiftId', authenticateToken, CalendarController.getMaxSerialByShiftId);
calendarRouter.post('/calendar', authenticateToken, CalendarController.create);
calendarRouter.put('/calendar/:id', authenticateToken, CalendarController.update);
calendarRouter.delete('/calendar/delete/:id', authenticateToken, CalendarController.delete);

export default calendarRouter;
