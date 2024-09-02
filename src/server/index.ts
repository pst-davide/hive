import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import express, {Express} from 'express';
import 'reflect-metadata';
import {AppDataSource} from './database/dataSource';
import roomRouter from './routes/room.router';
import cors from 'cors';

const {PORT = 3000} = process.env;

const app: Express = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', roomRouter);

AppDataSource.initialize()
.then(async () => {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  console.log('Data Source has been initialized!');
});
