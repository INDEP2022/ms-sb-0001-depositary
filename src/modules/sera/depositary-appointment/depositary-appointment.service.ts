import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { Repository } from 'typeorm';
import { DepositaryAppointmentDTO } from './dto/depositary-appointment.dto';
import { DepositaryAppointmentEntity } from './entity/depositary-appointment.entity';
import { PersonEntity } from './entity/person.entity';
import { SegUsersEntity } from './entity/seg-users.entity';
import { FilterOperator, paginate, Paginate, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class DepositaryAppointmentService {

    constructor(
        @InjectRepository(DepositaryAppointmentEntity) private entity: Repository<DepositaryAppointmentEntity>,
    ) { }


    async createDepositaryAppointment(depositaryAppointmentDTO: DepositaryAppointmentDTO) {
        const task = await this.entity.findOne({ where: { appointmentNumber: depositaryAppointmentDTO.appointmentNumber } });
        if (task) return { statusCode: 400, message: ['Este registro ya existe!'] }

        try {
            const row = await this.entity.save(depositaryAppointmentDTO);
            return {
                statusCode: 200,
                message: ["OK"],
                data: row,
            }

        } catch (error) {
            return { statusCode: 500, message: [error.message] }
        }
    }

    async getAllDepositaryAppointment(query: PaginateQuery) {
        const queryBuilder = this.entity.createQueryBuilder('table');
        queryBuilder.innerJoinAndMapOne('table.personNumber', PersonEntity, 'p', 'table.no_persona = p.no_persona')
        const res = await paginate<DepositaryAppointmentEntity>(query, queryBuilder, {
            sortableColumns: [
                "appointmentNumber","appointmentNumber","nameProvDate","revocationDate","revocation",
                "contractKey","contractStartDate","contractEndDate","quantity","typeNameKey",
                "typeAdminKey","assignmentDate","appointmentDate","appointmentCard","depositaryType","observation",
                "officialRevocationNumber","importConsideration","feeAmount","provisionalOfficialNumber","annexed",
                "governmentMeetingOfficialDate","governmentMeetingOfficialNumber","shippingDateGeneralAddress",
                "replyDateGeneralAddress","jobShiftNumber","turnDate","returnDate","answerOfficeNumber","appointmentAgreement",
                "governmentBoardAppointmentCard","officialNumberAnswerAddressGeneral","authorityOrdersAllocation",
                "responsible","seraRepresentative","propertyNumber","registerNumber","validity","amountIVA","universalFolio",
                "folioReturn","personNumber","reference","iva","withKitchenware","goodNumber"],
            //searchableColumns:['description'],
            defaultSortBy: [['appointmentNumber', 'DESC']],
            filterableColumns: {
                appointmentNumber: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                nameProvDate: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                revocationDate: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                revocation: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                contractKey: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                contractStartDate: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                contractEndDate: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                quantity: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                typeNameKey: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                typeAdminKey: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                assignmentDate: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                appointmentDate: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                appointmentCard: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                depositaryType: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                observation: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                officialRevocationNumber: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                importConsideration: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                feeAmount: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                provisionalOfficialNumber: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                annexed: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                governmentMeetingOfficialDate: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                governmentMeetingOfficialNumber: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                shippingDateGeneralAddress: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                replyDateGeneralAddress: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                jobShiftNumber: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                turnDate: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                returnDate: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                answerOfficeNumber: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                appointmentAgreement: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                governmentBoardAppointmentCard: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                officialNumberAnswerAddressGeneral: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                authorityOrdersAllocation: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                responsible: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                seraRepresentative: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                propertyNumber: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                registerNumber: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                validity: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                amountIVA: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                universalFolio: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                folioReturn: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                personNumber: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                reference: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                iva: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                withKitchenware: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL],
                goodNumber: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NULL, FilterOperator.NULL]

            }
        })

        return res.meta.totalItems > 0 ?
            {
                statusCode: HttpStatus.OK,
                message: ["Datos obtenidos correctamente."],
                data: res.data,
                count: res.meta.totalItems
            }
            : {
                statusCode: HttpStatus.BAD_REQUEST,
                message: ["No se encontrarón registros."],
                data: [],
                count: 0
            }
    }

    async searchDepositaryAppointmentById(id: number) {
        return await this.entity.findOne({ where: { appointmentNumber: id } });
    }

    parseNotNull(value: string) {
        return value ? value.length > 0 ? `${value}` : null : null
    }


    async updateDepositaryAppointment(depositaryAppointmentDTO: DepositaryAppointmentDTO) {

        return await this.entity.update(depositaryAppointmentDTO.appointmentNumber, depositaryAppointmentDTO);
    }

}
