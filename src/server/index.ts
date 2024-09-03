import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import express, {Express} from 'express';
const {PORT = 3000} = process.env;

/* orm */
import 'reflect-metadata';
import {AppDataSource} from './database/dataSource';
import roomRouter from './routes/room.router';

/* cors */
import cors from 'cors';

/* body parser */
import bodyParser from 'body-parser';

import fs from 'fs';
import path from 'path';
import ocrRouter from './routes/ocr.router';

/* initialize */
const app: Express = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

/* orm routes */
app.use('/api', roomRouter);

/* ocr routes */
app.use('/api', ocrRouter);

AppDataSource.initialize()
.then(async () => {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  console.log('Data Source has been initialized!');
});
