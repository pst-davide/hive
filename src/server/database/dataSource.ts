import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource } from 'typeorm';

const { DB_NAME, DB_USER, DB_PASS, DB_HOST, DB_PORT } = process.env;

export const AppDataSource: DataSource = new DataSource({
  type: 'mariadb',
  host: DB_HOST || 'localhost',
  port: parseInt(DB_PORT as string) || 3306,
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASS,
  synchronize: true,
  logging: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  subscribers: [],
  migrations: [__dirname + '/../migration/**/*{.ts,.js}'],
});
