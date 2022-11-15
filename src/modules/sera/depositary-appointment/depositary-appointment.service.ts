import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { Repository } from 'typeorm';
import { DepositaryAppointmentDTO } from './dto/depositary-appointment.dto';
import { DepositaryAppointmentEntity } from './entity/depositary-appointment.entity';
import { Text } from 'src/shared/config/text'
import { PersonEntity } from './entity/person.entity';
import { SegUsersEntity } from './entity/seg-users.entity';

@Injectable()
export class DepositaryAppointmentService {

    constructor(
        @InjectRepository(DepositaryAppointmentEntity) private entity: Repository<DepositaryAppointmentEntity>,
    ) { }


    async createDepositaryAppointment(depositaryAppointmentDTO: DepositaryAppointmentDTO) {
        const task = await this.entity.findOne({ where: {appointmentNumber:depositaryAppointmentDTO.appointmentNumber} });
        if (task) return { statusCode: 400, message: ['Este registro ya existe!'] }
        
        try {
            const row = await this.entity.save(depositaryAppointmentDTO);
            return {    
                statusCode:200,
                message:["OK"],
                data: row,
            }
            
        } catch (error) {
            return { statusCode: 500, message: [error.message] }
        }
    }

    async getAllDepositaryAppointment({ inicio=1, pageSize=10, text }: PaginationDto) {
        const queryBuilder = this.entity.createQueryBuilder('table');
        queryBuilder.innerJoinAndMapOne('table.personNumber',PersonEntity,'p','table.no_persona = p.no_persona')
       // queryBuilder.innerJoinAndMapOne('table.seraRepresentative',SegUsersEntity,'u','table.representante_sera = u.usuario')

        if (text) {
            queryBuilder.where(`${Text.formatTextDb('table.cve_contrato')} LIKE '%${Text.formatText(text)}%'`)
        }
        queryBuilder.take(pageSize || 10)
        queryBuilder.orderBy("","DESC")
        queryBuilder.skip((inicio - 1) * pageSize || 0)
        const [result, total] = await queryBuilder.getManyAndCount();
        return {    
            statusCode:200,
            message:["OK"],
            data: result,
            count: total
        }
    }

    async searchDepositaryAppointmentById(id:number){
        return await this.entity.findOne({ where: {appointmentNumber:id} });
    }

    parseNotNull(value:string){
        return value?value.length> 0?`${value}`:null:null
    }


    async updateDepositaryAppointment(depositaryAppointmentDTO:DepositaryAppointmentDTO) {

        return await this.entity.update(depositaryAppointmentDTO.appointmentNumber, depositaryAppointmentDTO);
    }

}
