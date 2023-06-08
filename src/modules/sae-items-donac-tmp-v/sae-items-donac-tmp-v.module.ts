
import { Module } from '@nestjs/common';
import { SaeItemsDonacTmpVController } from './sae-items-donac-tmp-v.controller';
import { SaeItemsDonacTmpVService } from './sae-items-donac-tmp-v.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaeItemsDonacVBEntity } from './entities/sae-items-donac-v-b.entity';


@Module({
  imports: [TypeOrmModule.forFeature([SaeItemsDonacVBEntity])],
  controllers: [SaeItemsDonacTmpVController],
  providers: [SaeItemsDonacTmpVService]
})
export class SaeItemsDonacTmpVModule {}
