import express, { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import authenticateToken from '../utils/authenticateToken';
import pressRouter from './press.router';

const userRouter: Router = express.Router();

userRouter.post('/users/register', UserController.register);
userRouter.post('/users/login', UserController.login);
userRouter.post('/users/refresh', authenticateToken, UserController.refresh);
userRouter.post('/users/logout', authenticateToken, UserController.logout);

pressRouter.get('/users', UserController.findAll);
pressRouter.get('/users/:id', UserController.findById);
pressRouter.post('/users', UserController.create);
pressRouter.put('/users/:id', UserController.update);
pressRouter.delete('/users/delete/:id', UserController.delete);

export default userRouter;
