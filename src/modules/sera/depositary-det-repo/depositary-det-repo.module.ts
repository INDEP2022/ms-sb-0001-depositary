import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositaryDetRepoController } from './depositary-det-repo.controller';
import { DepositaryDetRepoService } from './depositary-det-repo.service';
import { DepositaryDetRepoEntity } from './entity/depositary-det-repo.entity';

@Module({
  controllers: [DepositaryDetRepoController],
  providers: [DepositaryDetRepoService],
  imports:[
    TypeOrmModule.forFeature([
      DepositaryDetRepoEntity
    ])
  ]
})
export class DepositaryDetRepoModule {}
