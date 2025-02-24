import { WinstonModuleOptions } from 'nest-winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export const loggerConfig: WinstonModuleOptions = {
  transports: [
    // Console Transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        nestWinstonModuleUtilities.format.nestLike(),
      ),
    }),
    // Debug Logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/debug-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // Info Logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/info-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // Warning Logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/warn-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'warn',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // Error Logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxSize: '20m',
      maxFiles: '14d',
    }),
  ],
};
