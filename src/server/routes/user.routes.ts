import express, { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import authenticateToken from '../utils/authenticateToken';

const userRouter: Router = express.Router();

userRouter.post('/register', UserController.register);
userRouter.post('/login', UserController.login);
userRouter.post('/refresh', authenticateToken, UserController.refresh);
userRouter.post('/logout', authenticateToken, UserController.logout);

export default userRouter;
