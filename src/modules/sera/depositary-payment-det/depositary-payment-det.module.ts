import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositaryPaymentDetController } from './depositary-payment-det.controller';
import { DepositaryPaymentDetService } from './depositary-payment-det.service';
import { DepositaryPaymentDetEntity } from './entity/depositary-payment-det.entity';

@Module({
  controllers: [DepositaryPaymentDetController],
  providers: [DepositaryPaymentDetService],
  imports:[
    TypeOrmModule.forFeature([
      DepositaryPaymentDetEntity
    ])
  ]
})
export class DepositaryPaymentDetModule {}
