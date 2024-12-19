import express, { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import authenticateToken from '../utils/authenticateToken';

const userRouter: Router = express.Router();

userRouter.post('/users/login', UserController.login);
userRouter.post('/users/refresh', UserController.refresh);
userRouter.post('/users/logout', authenticateToken, UserController.logout);

userRouter.get('/users', UserController.findAll);
userRouter.get('/users/:id', UserController.findById);
userRouter.post('/users', UserController.create);
userRouter.put('/users/:id', UserController.update);
userRouter.delete('/users/delete/:id', UserController.delete);

export default userRouter;
