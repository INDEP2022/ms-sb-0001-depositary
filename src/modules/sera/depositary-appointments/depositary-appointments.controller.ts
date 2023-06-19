
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'src/core/interfaces/response.data.dto';
import { depositaryAppointmentsIdDto } from './dto/depositary-appointments-id.dto';
import { depositaryAppointmentsDto } from './dto/depositary-appointments.dto';
import { depositaryAppointmentsEntity } from './entities/depositary-appointments.entity';
import { DepositaryAppointmentsService } from './depositary-appointments.service';

@Controller('depositary-appointments')
export class DepositaryAppointmentsController {
    constructor(private readonly service: DepositaryAppointmentsService) {
        
    }

    @MessagePattern({cmd:'depositaryAppointments'})
    async depositaryAppointments(query: PaginateQuery): Promise<ResponseDataDTO<depositaryAppointmentsEntity>> {
        return this.service.depositaryAppointments(query);
    }

    @MessagePattern({cmd:'depositaryAppointmentsOne'})
    async depositaryAppointmentsOne(id:depositaryAppointmentsIdDto){
        return this.service.depositaryAppointmentsOne(id);
    }

    //============ POST ============
    @MessagePattern({ cmd: 'depositaryAppointmentsPost' })
    async depositaryAppointmentsPost(sendItem: depositaryAppointmentsDto)  {
        return await this.service.depositaryAppointmentsPost(sendItem);
    }

    //============ PUT ============
    @MessagePattern({ cmd: 'depositaryAppointmentsPut' })
    async depositaryAppointmentsPut(body: depositaryAppointmentsDto)  {
        return await this.service.depositaryAppointmentsPut(body);
    }

    //_______________delete
    @MessagePattern({ cmd: 'depositaryAppointmentsDelete' })
    async depositaryAppointmentsdelete(id:depositaryAppointmentsIdDto)  {
        return await this.service.depositaryAppointmentsDelete(id);
    }
}
