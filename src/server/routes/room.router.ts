import express, {Router} from 'express';
import { RoomController } from '../controllers/room.controller';

const roomRouter: Router = express.Router();

roomRouter.get('/rooms', RoomController.findAll);
roomRouter.get('/rooms/:id', RoomController.findById);
roomRouter.post('/rooms', RoomController.create);
roomRouter.put('/rooms/:id', RoomController.update);
roomRouter.delete('/rooms/:id', RoomController.delete);

export default roomRouter;
