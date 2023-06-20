import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { Repository } from 'typeorm';
import { DepositaryPaymentDetDTO } from './dto/depositary-payment-det.dto';
import { DepositaryPaymentDetEntity } from './entity/depositary-payment-det.entity';
import { Text } from 'src/shared/config/text'
import { SearchDepositaryPaymentDetDTO } from './dto/filter-depositary-payment-det.dto';
import { DepositaryAppointmentEntity } from '../depositary-appointment/entity/depositary-appointment.entity';

@Injectable()
export class DepositaryPaymentDetService {

    constructor(
        @InjectRepository(DepositaryPaymentDetEntity) private entity: Repository<DepositaryPaymentDetEntity>,
    ) { }


    async createDepositaryPaymentDet(depositaryPaymentDetDTO: DepositaryPaymentDetDTO) {
        const task = await this.entity.findOne({
            where: {
                appointmentNumber: depositaryPaymentDetDTO.appointmentNumber,
                paymentConceptKey: depositaryPaymentDetDTO.paymentConceptKey,
                paymentDate: depositaryPaymentDetDTO.paymentDate
            }
        });
        if (task) return { statusCode: 400, message: 'Este registro ya existe!' }
        try {
            return await this.entity.save(depositaryPaymentDetDTO);
            
        } catch (error) {
            return { statusCode: 400, message: error.message }
        }
    }

    async getAllDepositaryPaymentDet({ page = 1, limit = 10, text }: PaginationDto) {
        const queryBuilder = await this.entity.createQueryBuilder('table');
        queryBuilder.leftJoinAndMapOne('table.appointmentNumber', DepositaryAppointmentEntity, 'fk', 'table.no_nombramiento=fk.no_nombramiento')

        if (text) {
            queryBuilder.where(`${Text.formatTextDb('table.observacion')} LIKE '%${Text.formatText(text)}%'`)
        }
        queryBuilder.take(limit || 10)
        queryBuilder.orderBy("", "DESC")
        queryBuilder.skip((page - 1) * limit || 0)
        const [result, total] = await queryBuilder.getManyAndCount();
        return {    
            statusCode:200,
            message:["OK"],
            data: result,
            count: total
        }
    }

    async filterDepositaryPaymentDet(data: SearchDepositaryPaymentDetDTO, { page = 1, limit = 10 }: PaginationDto) {
        const queryBuilder = this.entity.createQueryBuilder();

        queryBuilder.where(`no_nombramiento = coalesce(:nomb,no_nombramiento)`, { nomb: data.appointmentNumber || null })
        queryBuilder.andWhere(`fec_pago = coalesce(:date,fec_pago)`, { date: data.paymentDate || null })
        queryBuilder.andWhere(`cve_concepto_pago = coalesce(:payment,cve_concepto_pago)`, { payment: data.paymentConceptKey || null })

        queryBuilder.take(limit || 10)
        queryBuilder.skip((page - 1) * limit || 0)
        const [result, total] = await queryBuilder.getManyAndCount();
        return {
            data: result,
            count: total
        }
    }

    parseNotNull(value: string) {
        return value ? value.length > 0 ? `${value}` : null : null
    }


    async updateDepositaryPaymentDet(depositaryPaymentDetDTO: DepositaryPaymentDetDTO) {
        const keys = {
            appointmentNumber: depositaryPaymentDetDTO.appointmentNumber,
            paymentConceptKey: depositaryPaymentDetDTO.paymentConceptKey,
            paymentDate: depositaryPaymentDetDTO.paymentDate
        }
        return await this.entity.update(keys, depositaryPaymentDetDTO);
    }


}
