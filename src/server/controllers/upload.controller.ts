import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

const upload = multer({ storage });

export class UploadController {
    
    static uploadImage = async (req: Request, res: Response): Promise<void> => {
        
        const uploadMiddleware = upload.single('file');
        
        try {
          // Promisify il middleware multer
          await new Promise<void>((resolve, reject) => {
            uploadMiddleware(req, res, (err) => {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          });
    
          if (!req.file) {
            res.status(400).json({ error: 'Nessun file caricato' });
            return;
          }
    
          // Restituisce informazioni sul file caricato
          res.json({
            message: 'File caricato con successo',
            filePath: req.file.path // Restituisce il percorso del file salvato
          });
        } catch (err) {
          // Gestione degli errori
          res.status(500).json({ error: err });
        }
      }

}

