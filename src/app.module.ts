import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';

import * as path from 'path';
import * as winston from 'winston';
import { DepositaryPaymentDetModule } from './modules/sera/depositary-payment-det/depositary-payment-det.module';
import { DepositaryDetRepoModule } from './modules/sera/depositary-det-repo/depositary-det-repo.module';
import { DepositaryAppointmentModule } from './modules/sera/depositary-appointment/depositary-appointment.module';
import { LegalDestinationForPropertyModule } from './modules/sera/legal-destination-for-property/legal-destination-for-property.module';
import { PupPreviewCsvDataModule } from './modules/sera/pup-preview-csv-data/pup-preview-csv-data.module';
import { ValidBlackListModule } from './modules/sera/valid-black-list/valid-black-list.module';
import { ExpExel1Module } from './modules/sera/exp-exel-1/exp-exel-1.module';
import { ExpExel2Module } from './modules/sera/exp-exel-2/exp-exel-2.module';
import { LoadClientModule } from './modules/sera/load-client/load-client.module';
import { RefPagoModule } from './modules/sera/ref-pago/ref-pago.module';
import { ValidatePaymentsRefModule } from './modules/sera/validate-payments-ref/validate-payments-ref.module';
import { ComerPaymentModule } from './modules/sera/comer-payment/comer-payment.module';
import { RealStateDispersalModule } from './modules/sera/real-state-dispersal/real-state-dispersal.module';
import { configService } from 'sigebi-lib-common';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    DepositaryPaymentDetModule,
    DepositaryDetRepoModule,
    DepositaryAppointmentModule,
    LegalDestinationForPropertyModule,
    PupPreviewCsvDataModule,
    ValidBlackListModule,
    ExpExel1Module,
    ExpExel2Module,
    LoadClientModule,
    RefPagoModule,
    ValidatePaymentsRefModule,
    ComerPaymentModule,
    RealStateDispersalModule,
   
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
