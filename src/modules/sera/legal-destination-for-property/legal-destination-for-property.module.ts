import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalDestinationForPropertyEntity } from './entity/legal-destination-for-property.entity';
import { LegalDestinationForPropertyController } from './legal-destination-for-property.controller';
import { LegalDestinationForPropertyService } from './legal-destination-for-property.service';

@Module({
  controllers: [LegalDestinationForPropertyController],
  providers: [LegalDestinationForPropertyService],
  imports:[
    TypeOrmModule.forFeature([
      LegalDestinationForPropertyEntity
    ])
  ]
})
export class LegalDestinationForPropertyModule {}
