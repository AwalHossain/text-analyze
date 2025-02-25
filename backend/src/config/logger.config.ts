import {
  utilities as nestWinstonModuleUtilities,
  WinstonModuleOptions,
} from 'nest-winston';
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
    // Combined Logs (debug, info, warn)
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'debug', // This captures debug, info, and warn levels
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      maxSize: '20m',
      maxFiles: '14d',
    }),
    // Error Logs (separate file)
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
