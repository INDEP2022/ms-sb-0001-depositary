import { Module } from '@nestjs/common';
import { DepositaryQueriesService } from './depositary-queries.service';
import { DepositaryQueriesController } from './depositary-queries.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VTypeWellEntity } from '../infrastructure/entities/views/v-type-well.entity';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { CatEntfedEntity } from '../infrastructure/entities/cat-entfed.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature(
      [
        VTypeWellEntity,
        CatEntfedEntity
      ]
    )
  ],
  providers: [DepositaryQueriesService, CommonFiltersService],
  controllers: [DepositaryQueriesController]
})
export class DepositaryQueriesModule {}
