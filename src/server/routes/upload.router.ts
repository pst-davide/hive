import express, {Router} from 'express';
import { UploadController } from '../controllers/upload.controller';

const uploadRouter: Router = express.Router();

uploadRouter.post('/upload', UploadController.uploadImage);

export default uploadRouter;
