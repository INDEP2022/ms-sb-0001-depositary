
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { infoDepositaryEntity } from './entities/info-depositary.entity';
import { InfoDepositaryController } from './info-depositary.controller';
import { InfoDepositaryService } from './info-depositary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature( [
      infoDepositaryEntity
    ])
  ],
  controllers: [InfoDepositaryController],
  providers: [InfoDepositaryService,CommonFiltersService]
})
export class InfoDepositaryModule {}
