import { Module } from '@nestjs/common';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { CommonFilterQueryService } from 'src/shared/service/common-filter-query.service';

@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService, CommonFilterQueryService]
})
export class ApplicationModule {}
