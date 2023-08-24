import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComerPaymentController } from './comer-payment.controller';
import { ComerPaymentService } from './comer-payment.service';
import { ComerLotsEntity } from './entity/comer-lots.entity';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';

@Module({
  controllers: [ComerPaymentController],
  providers: [ComerPaymentService,
    {
      provide: 'CAPTURELINE',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
            ClientProxyFactory.create({
                  transport: Transport.TCP,
                  options: {
                        host: configService.get('CAPTURELINE_HOST_NAME'),
                        port: configService.get('CAPTURELINE_HOST_PORT'),
                  },
            }),
    }],
  imports:[
    TypeOrmModule.forFeature([
      ComerLotsEntity
    ])
  ]
})
export class ComerPaymentModule {}
