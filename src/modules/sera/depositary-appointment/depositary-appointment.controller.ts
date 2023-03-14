import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaginateQuery } from 'nestjs-paginate';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { DepositaryAppointmentService } from './depositary-appointment.service';
import { DepositaryAppointmentDTO } from './dto/depositary-appointment.dto';

@Controller('depositary-appointment')
export class DepositaryAppointmentController {

    constructor(
        private readonly service: DepositaryAppointmentService,
    ) { }
    @MessagePattern({ cmd: 'getAllDepositaryAppointment' })
    async getAllDepositaryAppointment(pagination: PaginateQuery){
        var rows = await this.service.getAllDepositaryAppointment(pagination);
        return  rows
    }



    @MessagePattern({ cmd: 'getdepositaryAppointmentById' })
    
    async getdepositaryAppointmentById( id:number){
        var row = await this.service.searchDepositaryAppointmentById(id)
        if(!row) return {statusCode:400,message:'Este registro no existe!'}
        return {statusCode:200, message:["Búsqueda exitosa!"],data:row}
    }
    @MessagePattern({ cmd: 'createDepositaryAppointment' })
    async createDepositaryAppointment( depositaryAppointmentDTO:DepositaryAppointmentDTO){

        const task = await this.service.createDepositaryAppointment(depositaryAppointmentDTO);
        return task
    }

    @MessagePattern({ cmd: 'updateDepositaryAppointment' })
    async updateDepositaryAppointment( depositaryAppointmentDTO:DepositaryAppointmentDTO){

        const {affected} = await this.service.updateDepositaryAppointment(depositaryAppointmentDTO);
        return affected==1?{statusCode:200,message:['Actualizado correctamente!']}:
        { statusCode: 400, message: ["No se realizarón cambios!"]};
    }
}
