import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm"
import { PaymentRefController } from './payment-ref.controller';
import { PaymentRefService } from './payment-ref.service';
import { ParametersmodDepositoryEntity } from "../infrastructure/entities/parametersmod-depository.entity";
import { TmpPagosGensDepEntity } from '../infrastructure/entities/tmp-pagosgens-dep.entity';
import { refpayDepositoriesEntity } from "../infrastructure/entities/refpay-depositories.entity";
import { paymentsgensDepositaryEntity } from "../infrastructure/entities/paymentsgens-depositary.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([ParametersmodDepositoryEntity, TmpPagosGensDepEntity, refpayDepositoriesEntity,
    paymentsgensDepositaryEntity]),
  ],
  controllers: [PaymentRefController],
  providers: [PaymentRefService]
})
export class PaymentRefModule { }
