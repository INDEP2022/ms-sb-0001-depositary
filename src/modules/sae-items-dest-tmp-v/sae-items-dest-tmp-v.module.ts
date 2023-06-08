import { Module } from '@nestjs/common';
import { SaeItemsDestTmpVController } from './sae-items-dest-tmp-v.controller';
import { SaeItemsDestTmpVService } from './sae-items-dest-tmp-v.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaeItemsDestVBEntity } from './entities/sae-items-dest-v-b.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SaeItemsDestVBEntity])],
  controllers: [SaeItemsDestTmpVController],
  providers: [SaeItemsDestTmpVService],
})
export class SaeItemsDestTmpVModule {}
