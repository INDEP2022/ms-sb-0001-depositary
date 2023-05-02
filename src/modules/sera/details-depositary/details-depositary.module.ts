
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { detailsDepositaryEntity } from './entities/details-depositary.entity';
import { DetailsDepositaryController } from './details-depositary.controller';
import { DetailsDepositaryService } from './details-depositary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature( [
      detailsDepositaryEntity
    ])
  ],
  controllers: [DetailsDepositaryController],
  providers: [DetailsDepositaryService,CommonFiltersService]
})
export class DetailsDepositaryModule {}
