import express from 'express';
import { OcrImageController } from '../controllers/ocr-image.controller';

const ocrRouter = express.Router();

ocrRouter.post('/ocr-img', OcrImageController.recognizeImage);
ocrRouter.post('/ocr-pdf');

export default ocrRouter;