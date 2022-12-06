import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComerEventEntity } from './entity/comer-event.entity';
import { ComerLotsEntity } from './entity/comer-lots.entity';
import { ComerParameterModEntity } from './entity/comer-parameter-mod.entity';
import { ValidatePaymentsRefController } from './validate-payments-ref.controller';
import { ValidatePaymentsRefService } from './validate-payments-ref.service';

@Module({
  controllers: [ValidatePaymentsRefController],
  providers: [ValidatePaymentsRefService],
  imports:[
    TypeOrmModule.forFeature([
      ComerLotsEntity, ComerEventEntity,ComerParameterModEntity
    ])
  ]

})
export class ValidatePaymentsRefModule {}
