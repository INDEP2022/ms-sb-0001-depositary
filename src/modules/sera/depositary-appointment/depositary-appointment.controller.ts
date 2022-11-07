import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { DepositaryAppointmentService } from './depositary-appointment.service';
import { DepositaryAppointmentDTO } from './dto/depositary-appointment.dto';

@Controller('depositary-appointment')
export class DepositaryAppointmentController {

    constructor(
        private readonly service: DepositaryAppointmentService,
    ) { }
    @MessagePattern({ cmd: 'getAllDepositaryAppointment' })
    async getAllDepositaryAppointment( pagination:PaginationDto){
        var rows = await this.service.getAllDepositaryAppointment(pagination);
        if(rows.count == 0) return {status:404,message:'No results found'}
        return  rows
    }



    @MessagePattern({ cmd: 'getdepositaryAppointmentById' })
    
    async getdepositaryAppointmentById( id:number){
        var row = await this.service.searchDepositaryAppointmentById(id)
        if(!row) return {status:404,message:'No results found'}
        return row
    }
    @MessagePattern({ cmd: 'createDepositaryAppointment' })
    async createDepositaryAppointment( depositaryAppointmentDTO:DepositaryAppointmentDTO){

        const task = await this.service.createDepositaryAppointment(depositaryAppointmentDTO);
        return task?task:
        { statusCode: 503, message: "This depositaryAppointment was not created", error: "Create Error"};
    }

    @MessagePattern({ cmd: 'updateDepositaryAppointment' })
    async updateDepositaryAppointment( depositaryAppointmentDTO:DepositaryAppointmentDTO){

        const {affected} = await this.service.updateDepositaryAppointment(depositaryAppointmentDTO);
        return affected==1?{status:200,message:'Update succesfull'}:
        { statusCode: 403, message: "This depositaryAppointment was not update", error: "Update Error"};
    }
}
