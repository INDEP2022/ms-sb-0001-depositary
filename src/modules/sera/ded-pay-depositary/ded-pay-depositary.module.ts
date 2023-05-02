
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { dedPayDepositaryEntity } from './entities/ded-pay-depositary.entity';
import { DedPayDepositaryController } from './ded-pay-depositary.controller';
import { DedPayDepositaryService } from './ded-pay-depositary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature( [
      dedPayDepositaryEntity
    ])
  ],
  controllers: [DedPayDepositaryController],
  providers: [DedPayDepositaryService,CommonFiltersService]
})
export class DedPayDepositaryModule {}
