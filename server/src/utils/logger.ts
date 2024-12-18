import winston, { createLogger, format, transports } from 'winston';

const logger: winston.Logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message, ...meta }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${
        Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
      }`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'logs/server.log' }),
  ],
});

export default logger;
