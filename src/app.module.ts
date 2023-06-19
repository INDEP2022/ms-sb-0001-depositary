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
import { ConfigModule } from '@nestjs/config';
import { DestinyLegalByGoodModule } from './modules/sera/destiny-legal-by-good/destiny-legal-by-good.module';
import { DedPayDepositaryModule } from './modules/sera/ded-pay-depositary/ded-pay-depositary.module';
import { DetrepoDepositaryModule } from './modules/sera/detrepo-depositary/detrepo-depositary.module';
import { DepositaryAppointmentsModule } from './modules/sera/depositary-appointments/depositary-appointments.module';
import { DetailsDepositaryModule } from './modules/sera/details-depositary/details-depositary.module';
import { InfoDepositaryModule } from './modules/sera/info-depositary/info-depositary.module';
import { ParametersModDepositaryModule } from './modules/sera/parameters-mod-depositary/parameters-mod-depositary.module';
import { PersonsModDepositaryModule } from './modules/sera/persons-mod-depositary/persons-mod-depositary.module';
import { RequestsDepositaryModule } from './modules/sera/requests-depositary/requests-depositary.module';
import { PaymentRefModule } from './modules/sera/payment-ref/payment-ref.module';
import { ApplicationModule } from './modules/application/application.module';
import { DepositaryQueriesModule } from './modules/depositary-queries/depositary-queries.module';
import { SaeInvVentasTModule } from './modules/sae-inv-ventas-t/sae-inv-ventas-t.module';
import { SaeItemsDestTmpVModule } from './modules/sae-items-dest-tmp-v/sae-items-dest-tmp-v.module';
import { SaeItemsDonacTmpVModule } from './modules/sae-items-donac-tmp-v/sae-items-donac-tmp-v.module';
import { ScheduleModule } from '@nestjs/schedule';
import { FcondepoconcilpagModule } from './modules/fcondepoconcilpag/fcondepoconcilpag.module';
import { configService } from './shared/config/config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
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
    ScheduleModule.forRoot(),
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
    DestinyLegalByGoodModule,
    DedPayDepositaryModule,
    DetrepoDepositaryModule,
    DepositaryAppointmentsModule,
    DetailsDepositaryModule,
    InfoDepositaryModule,
    ParametersModDepositaryModule,
    PersonsModDepositaryModule,
    RequestsDepositaryModule,
    PaymentRefModule,
    ApplicationModule,
    DepositaryQueriesModule,
    SaeInvVentasTModule,
    SaeItemsDestTmpVModule,
    SaeItemsDonacTmpVModule,
    FcondepoconcilpagModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
