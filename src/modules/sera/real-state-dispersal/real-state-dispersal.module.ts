import { Module } from '@nestjs/common';
import { RealStateDispersalService } from './real-state-dispersal.service';
import { RealStateDispersalController } from './real-state-dispersal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComerLotsEntity } from './entity/comer-lots.entity';

@Module({
  providers: [RealStateDispersalService],
  controllers: [RealStateDispersalController],
  imports:[
    TypeOrmModule.forFeature([
      ComerLotsEntity
    ])
  ]

})
export class RealStateDispersalModule {}
