import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

import express, {Express} from 'express';
import 'reflect-metadata';
import {AppDataSource} from './database/dataSource';

const {PORT = 3000} = process.env;

const app: Express = express();
app.use(express.json());

AppDataSource.initialize()
.then(async () => {
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  console.log('Data Source has been initialized!');
});
