import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComerLotsEntity } from './entity/comer-lots.entity';
import { ExpExel2Controller } from './exp-exel-2.controller';
import { ExpExel2Service } from './exp-exel-2.service';

@Module({
  controllers: [ExpExel2Controller],
  providers: [ExpExel2Service],
  imports:[
    TypeOrmModule.forFeature([
      ComerLotsEntity
    ])
  ]
})
export class ExpExel2Module {}
