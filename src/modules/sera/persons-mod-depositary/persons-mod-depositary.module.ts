
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { personsModDepositaryEntity } from './entities/persons-mod-depositary.entity';
import { PersonsModDepositaryController } from './persons-mod-depositary.controller';
import { PersonsModDepositaryService } from './persons-mod-depositary.service';

@Module({
  imports: [
    TypeOrmModule.forFeature( [
      personsModDepositaryEntity
    ])
  ],
  controllers: [PersonsModDepositaryController],
  providers: [PersonsModDepositaryService,CommonFiltersService]
})
export class PersonsModDepositaryModule {}
