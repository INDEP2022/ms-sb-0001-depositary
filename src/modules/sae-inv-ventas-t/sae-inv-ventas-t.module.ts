import { Module } from '@nestjs/common';
import { SaeInvVentasTController } from './sae-inv-ventas-t.controller';
import { SaeInvVentasTService } from './sae-inv-ventas-t.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SaeInvSalesTBEntity } from './entities/sae-inv-sales-t-b.dto';

@Module({
  imports: [TypeOrmModule.forFeature([SaeInvSalesTBEntity])],
  controllers: [SaeInvVentasTController],
  providers: [SaeInvVentasTService],
})
export class SaeInvVentasTModule {}
