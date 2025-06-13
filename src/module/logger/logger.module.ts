import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';
import * as fs from 'fs';
import * as moment from 'moment-timezone';

const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const customFormat = winston.format.printf(
  ({ timestamp, level, message, ...meta }) => {
    const timeInTimezone = moment(timestamp)
      .tz('Europe/Kiev')
      .format('YYYY-MM-DDTHH:mm:ss');
    return JSON.stringify({
      timestamp: timeInTimezone,
      level,
      message,
      ...meta,
    });
  },
);
const fileFilter = winston.format((info) => {

  if ((info.level === 'info' && !info.name) || info.error || info.level === 'error') {
    return false;
  }
  return info;
});

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            customFormat,
          ),
        }),
        new winston.transports.DailyRotateFile({
          dirname: logDir,
          filename: '%DATE%-info.log',
          datePattern: 'YYYY-MM-DD',
          level: 'info',
          format: winston.format.combine(
            fileFilter(),
            winston.format.timestamp(),
            customFormat,
          ),
        }),
        new winston.transports.DailyRotateFile({
          dirname: logDir,
          filename: '%DATE%-error.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            customFormat,
          ),
        }),
      ],
    }),
  ],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule { }
