import express, {Router} from 'express';
import { OcrImageController } from '../controllers/ocr-image.controller';

const ocrRouter: Router = express.Router();

ocrRouter.post('/ocr-img', OcrImageController.recognizeImage);
ocrRouter.post('/ocr-pdf');

export default ocrRouter;
