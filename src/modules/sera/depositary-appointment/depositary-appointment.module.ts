import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositaryAppointmentController } from './depositary-appointment.controller';
import { DepositaryAppointmentService } from './depositary-appointment.service';
import { DepositaryAppointmentEntity } from './entity/depositary-appointment.entity';
import { GoodEntity } from './entity/good.entity';
import { PersonEntity } from './entity/person.entity';
import { SegUsersEntity } from './entity/seg-users.entity';

@Module({
  controllers: [DepositaryAppointmentController],
  providers: [DepositaryAppointmentService],
  imports:[
    TypeOrmModule.forFeature([
      DepositaryAppointmentEntity,
      SegUsersEntity,
      PersonEntity,
      GoodEntity
    ])
  ]
})
export class DepositaryAppointmentModule {}
