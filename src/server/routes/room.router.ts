import express from 'express';
import { RoomController } from '../../server/controllers/room.controller';

const roomRouter = express.Router();

roomRouter.get('/rooms', RoomController.findAllRooms);
roomRouter.get('/rooms/:id', RoomController.findRoomById);
roomRouter.post('/rooms', RoomController.createRoom);
roomRouter.put('/rooms/:id', RoomController.updateRoom);
roomRouter.delete('/rooms/:id', RoomController.deleteRoom);

export default roomRouter;
