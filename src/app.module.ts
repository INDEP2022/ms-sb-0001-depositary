import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';

import { PrometheusModule } from 'nestjs-prometheus';
import * as path from 'path';
import * as winston from 'winston';
import { configService } from './shared/config/config.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(
      configService.getTypeOrmConfig(),),
    WinstonModule.forRoot({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.File({
          dirname: path.join(__dirname, './../log/debug/'),
          filename: 'debug.log',
          level: 'debug',
        }),
        new winston.transports.File({
          dirname: path.join(__dirname, './../log/error/'),
          filename: 'error.log',
          level: 'error',
        }),
        new winston.transports.File({
          dirname: path.join(__dirname, './../log/info/'),
          filename: 'info.log',
          level: 'info',
        }),
        new winston.transports.Console({ level: 'debug' }),
      ],
    }),
    PrometheusModule.register(),
   
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
