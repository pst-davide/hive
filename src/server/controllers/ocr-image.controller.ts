import { Request, Response } from 'express';
import { preprocessImage } from '../utils/process-image';
import {createWorker, PSM} from 'tesseract.js';

export class OcrImageController {

    static async recognizeTextFromBuffer(imageBuffer: Buffer): Promise<string> {

        const worker = await createWorker('ita', 1, {
            logger: m => console.log(m),
            cachePath: './ocr-cache'
          });

        try {

            await worker.setParameters({
                lang: 'ita',
                tessedit_pageseg_mode: PSM.SINGLE_COLUMN,
              });

            const { data: { text } } = await worker.recognize(imageBuffer);
            return text;

        } catch (error) {
            console.error('Error during OCR processing:', error);
            throw error;

        } finally {
            await worker.terminate();
        }
    }

    static async recognizeImage(req: Request, res: Response): Promise<void> {
        const { imageBase64 } = req.body;

        if (!imageBase64) {
            res.status(400).json({ error: 'No image provided' });
        }

        // Converti l'immagine base64 in buffer
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        try {
            const preprocessedBuffer = await preprocessImage(imageBuffer);

            const text = await OcrImageController.recognizeTextFromBuffer(preprocessedBuffer);
            res.json({ text });
        } catch (error) {
            console.error('Error during OCR:', error);
            res.status(500).json({ error: 'OCR processing failed' });
        }
    }
}
