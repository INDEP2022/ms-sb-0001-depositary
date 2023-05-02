
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { parametersModDepositaryEntity } from './entities/parameters-mod-depositary.entity';
import { ParametersModDepositaryController } from './parameters-mod-depositary.controller';
import { ParametersModDepositaryService } from './parameters-mod-depositary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature( [
      parametersModDepositaryEntity
    ])
  ],
  controllers: [ParametersModDepositaryController],
  providers: [ParametersModDepositaryService,CommonFiltersService]
})
export class ParametersModDepositaryModule {}
