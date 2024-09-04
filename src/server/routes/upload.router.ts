import express from 'express';
import { UploadController } from '../controllers/upload.controller';

const uploadRouter = express.Router();

uploadRouter.post('/upload', UploadController.uploadImage);

export default uploadRouter;