
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { requestsDepositaryEntity } from './entities/requests-depositary.entity';
import { RequestsDepositaryController } from './requests-depositary.controller';
import { RequestsDepositaryService } from './requests-depositary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature( [
      requestsDepositaryEntity
    ])
  ],
  controllers: [RequestsDepositaryController],
  providers: [RequestsDepositaryService,CommonFiltersService]
})
export class RequestsDepositaryModule {}
