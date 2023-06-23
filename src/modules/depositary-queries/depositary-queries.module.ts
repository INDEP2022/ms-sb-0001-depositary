import { Module } from '@nestjs/common';
import { DepositaryQueriesService } from './depositary-queries.service';
import { DepositaryQueriesController } from './depositary-queries.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VTypeWellEntity } from '../infrastructure/entities/views/v-type-well.entity';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { CommonFilterQueryService } from 'src/shared/service/common-filter-query.service';
import { CatEntfedEntity } from '../infrastructure/entities/cat-entfed.entity';
import { AppointmentDepositoryEntity } from '../infrastructure/entities/appointment-depository.entity';
import { GoodEntity } from '../infrastructure/entities/good.entity';
import { PersonEntity } from '../sera/depositary-appointment/entity/person.entity';
import { SegUsersEntity } from '../sera/depositary-appointment/entity/seg-users.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature(
      [
        VTypeWellEntity,
        CatEntfedEntity,
        AppointmentDepositoryEntity,
        GoodEntity,
        PersonEntity,
        SegUsersEntity
      ]
    )
  ],
  providers: [DepositaryQueriesService, CommonFiltersService,CommonFilterQueryService],
  controllers: [DepositaryQueriesController]
})
export class DepositaryQueriesModule {}
