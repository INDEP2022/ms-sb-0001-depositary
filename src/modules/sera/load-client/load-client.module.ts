import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonEntity } from '../depositary-appointment/entity/person.entity';
import { LoadClientController } from './load-client.controller';
import { LoadClientService } from './load-client.service';

@Module({
  controllers: [LoadClientController],
  providers: [LoadClientService],
  imports:[
    TypeOrmModule.forFeature([
      PersonEntity
    ])
  ]
})
export class LoadClientModule {}
