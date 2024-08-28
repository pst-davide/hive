import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const {DATABASE_NAME, DATABASE_USER, DATABASE_PASSWORD,
  DATABASE_HOST, DATABASE_PORT} = process.env;
export const AppDataSource: DataSource = new DataSource({
  type: 'mariadb',
  host: DATABASE_HOST || 'localhost',
  port: parseInt(DATABASE_PORT as string) || 3306,
  database: DATABASE_NAME,
  username: DATABASE_USER,
  password: DATABASE_PASSWORD,
  synchronize: false,
  logging: true,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  subscribers: [],
  migrations: [],
});
