import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonEntity } from './entity/person.entity';
import { ValidBlackListController } from './valid-black-list.controller';
import { ValidBlackListService } from './valid-black-list.service';

@Module({
  controllers: [ValidBlackListController],
  providers: [ValidBlackListService],
  imports:[
    TypeOrmModule.forFeature([
      PersonEntity
    ])
  ]
})
export class ValidBlackListModule {}
