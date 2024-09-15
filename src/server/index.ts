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

/* routes */
import ocrRouter from './routes/ocr.router';
import uploadRouter from './routes/upload.router';
import locationRouter from './routes/location.router';
import pushNotificationRouter from './routes/push-notification.router';
import openAiRouter from './routes/openai.router';

/* initialize */
const app: Express = express();
// app.use(cors());
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

/* push notification */
app.use('/push', pushNotificationRouter);

/* orm routes */
app.use('/api', roomRouter);
app.use('/api', locationRouter);

/* ocr routes */
app.use('/api', ocrRouter);

/* upload routes */
app.use('/api', uploadRouter);

/* openAi notification */
app.use('/api', openAiRouter);

/* upload directory */
const uploadsDir: string = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

AppDataSource.initialize()
.then(async () => {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  console.log('Data Source has been initialized!');

})
.catch(error => {
  console.error('Error initializing Data Source:', error);
});
