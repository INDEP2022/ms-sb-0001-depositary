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
        if (task) return {status:403,message:'Record already exists'}
        return await this.entity.save(depositaryAppointmentDTO)  ;
    }

    async getAllDepositaryAppointment({ inicio=1, pageSize=10, text }: PaginationDto) {
        const queryBuilder = await this.entity.createQueryBuilder('table');
        //queryBuilder.innerJoinAndMapOne('table.appointmentNumber','nombramientos_depositaria','fk','table.no_nombramiento=fk.no_nombramiento')
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
