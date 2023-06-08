import { Module } from '@nestjs/common';
import { FcondepoconcilpagService } from './fcondepoconcilpag.service';
import { FcondepoconcilpagController } from './fcondepoconcilpag.controller';

@Module({
  providers: [FcondepoconcilpagService],
  controllers: [FcondepoconcilpagController]
})
export class FcondepoconcilpagModule {}
