
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { destinyLegalByGoodEntity } from './entities/destiny-legal-by-good.entity';
import { DestinyLegalByGoodController } from './destiny-legal-by-good.controller';
import { DestinyLegalByGoodService } from './destiny-legal-by-good.service';

@Module({
  imports: [
    TypeOrmModule.forFeature( [
      destinyLegalByGoodEntity
    ])
  ],
  controllers: [DestinyLegalByGoodController],
  providers: [DestinyLegalByGoodService,CommonFiltersService]
})
export class DestinyLegalByGoodModule {}
