
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { depositaryAppointmentsEntity } from './entities/depositary-appointments.entity';
import { DepositaryAppointmentsController } from './depositary-appointments.controller';
import { DepositaryAppointmentsService } from './depositary-appointments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature( [
      depositaryAppointmentsEntity
    ])
  ],
  controllers: [DepositaryAppointmentsController],
  providers: [DepositaryAppointmentsService,CommonFiltersService]
})
export class DepositaryAppointmentsModule {}
