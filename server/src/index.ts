import dotenv from 'dotenv';

dotenv.config({path: '../../.env'});

import express, {Express} from 'express';

/* orm */
import 'reflect-metadata';

/* cors */
import cors from 'cors';

/* body parser */
import bodyParser from 'body-parser';

import fs from 'fs';
import path from 'path';

/* routes */
import newsletterRouter from './routes/newsletter.router';
import shiftRouter from './routes/shift.router';
import calendarRouter from './routes/calendar.router';
import roomRouter from './routes/room.router';
import locationRouter from './routes/location.router';
import pressRouter from './routes/press.router';
import userRouter from './routes/user.routes';

/* ocr route */
import ocrRouter from './routes/ocr.router';

/* upload route */
import uploadRouter from './routes/upload.router';

/* ai route */
import openAiRouter from './routes/openai.router';

/* web push route */
import pushRouter from './routes/push-notification.router';
import {sequelize} from './database/dataSource';

/* initialize */
const {PORT = 3000} = process.env;
const app: Express = express();

/* cors */
app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json({limit: '50mb'}));

/* push notification */
app.use('/push', pushRouter);

/* orm routes */
app.use('/api', roomRouter);
app.use('/api', locationRouter);
app.use('/api', pressRouter);
app.use('/api', newsletterRouter);
app.use('/api', shiftRouter);
app.use('/api', userRouter);
app.use('/api', calendarRouter);

/* ocr routes */
app.use('/api', ocrRouter);

/* upload routes */
app.use('/api', uploadRouter);

/* openAi notification */
app.use('/api', openAiRouter);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

/* web push */
app.use('/subscribe', pushRouter);

app.use((req, res, next) => {
  console.log(`${req.method} request for ${req.url}`);
  next();
});

/* upload directory */
const uploadsDir: string = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });
