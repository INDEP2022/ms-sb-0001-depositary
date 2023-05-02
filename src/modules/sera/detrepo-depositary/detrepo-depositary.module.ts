
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { detrepoDepositaryEntity } from './entities/detrepo-depositary.entity';
import { DetrepoDepositaryController } from './detrepo-depositary.controller';
import { DetrepoDepositaryService } from './detrepo-depositary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature( [
      detrepoDepositaryEntity
    ])
  ],
  controllers: [DetrepoDepositaryController],
  providers: [DetrepoDepositaryService,CommonFiltersService]
})
export class DetrepoDepositaryModule {}
