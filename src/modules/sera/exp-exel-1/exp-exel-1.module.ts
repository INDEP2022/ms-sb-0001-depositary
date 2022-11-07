import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonEntity } from './entity/person.entity';
import { ExpExel1Controller } from './exp-exel-1.controller';
import { ExpExel1Service } from './exp-exel-1.service';

@Module({
  controllers: [ExpExel1Controller],
  providers: [ExpExel1Service],
  imports:[
    TypeOrmModule.forFeature([
      PersonEntity
    ])
  ]
})
export class ExpExel1Module {}
