import * as dotenv from 'dotenv';
dotenv.config();

import { Sequelize } from 'sequelize-typescript';

const { DB_NAME, DB_USER,
  DB_PASS, DB_HOST, DB_PORT } = process.env;

export const sequelize: Sequelize = new Sequelize({
  dialect: 'mariadb',
  host: DB_HOST || 'localhost',
  port: parseInt(DB_PORT as string) || 3306,
  database: DB_NAME,
  username: DB_USER,
  password: DB_PASS,
  logging: true,
  models: [__dirname + '/../**/*.models.{ts,js}'],
});

// Connessione al database
(async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('Connessione al database riuscita!');
  } catch (error) {
    console.error('Errore durante la connessione al database:', error);
  }
})();
