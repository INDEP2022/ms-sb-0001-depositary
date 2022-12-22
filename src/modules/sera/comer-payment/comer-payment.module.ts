import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComerPaymentController } from './comer-payment.controller';
import { ComerPaymentService } from './comer-payment.service';
import { ComerLotsEntity } from './entity/comer-lots.entity';

@Module({
  controllers: [ComerPaymentController],
  providers: [ComerPaymentService],
  imports:[
    TypeOrmModule.forFeature([
      ComerLotsEntity
    ])
  ]
})
export class ComerPaymentModule {}
