import { Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';
import _ from "lodash";

const UPLOADS_FOLDER: string = './public/uploads';

function normalizeFilename(filename: string): string {

  const ext: string = path.extname(filename);
  const name: string = path.basename(filename, ext);

  const normalizedName: string = _.kebabCase(name);

  return `${normalizedName}${ext}`;
}

const storage: multer.StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(UPLOADS_FOLDER)) {
        fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
      }
      cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix: string = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const normalizedFilename = normalizeFilename(file.originalname);
      cb(null, `${uniqueSuffix}-${normalizedFilename}`);
    }
  });

const upload: multer.Multer = multer({ storage });

const uploadSingleFile = promisify(upload.single('file'));

export class UploadController {

  static async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      // Esegue il middleware di upload
      await uploadSingleFile(req, res);

      // Verifica se un file è stato caricato
      if (!req.file) {
        res.status(400).json({ error: 'Nessun file caricato' });
        return;
      }

      // Rimuove 'public/' dal percorso del file
      const relativeFilePath: string = req.file.path.replace(`public`, '');

      console.log(req.file.originalname);
      console.log(relativeFilePath);

      // Risponde con successo
      res.json({
        message: 'File caricato con successo',
        fileName: req.file.originalname,
        filePath: relativeFilePath,
      });

    } catch (err) {
      res.status(500).json({ error: (err as Error).message || 'Errore durante il caricamento del file' });
    }
  }
}

