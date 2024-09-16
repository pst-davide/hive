import express, {Router} from 'express';
import { RoomController } from '../controllers/room.controller';
import {PressCategoryController} from "../controllers/press-category.controller";

const pressRouter: Router = express.Router();

pressRouter.get('/press/categories', PressCategoryController.findAll);
pressRouter.get('/press/categories/:id', PressCategoryController.findById);
pressRouter.post('/press/categories', PressCategoryController.create);
pressRouter.put('/press/categories/:id', PressCategoryController.update);
pressRouter.delete('/press/categories/:id', PressCategoryController.delete);

pressRouter.get('/press/keywords', RoomController.findAll);
pressRouter.get('/press/keywords/:id', RoomController.findById);
pressRouter.post('/press/keywords', RoomController.create);
pressRouter.put('/press/keywords/:id', RoomController.update);
pressRouter.delete('/press/keywords/:id', RoomController.delete);

export default pressRouter;
