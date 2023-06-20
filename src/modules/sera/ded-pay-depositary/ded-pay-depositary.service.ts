
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FilterOperator, PaginateQuery, paginate } from 'nestjs-paginate';

import { CommonFiltersService } from 'src/shared/common-filters.service';
import { Repository } from 'typeorm';
import { dedPayDepositaryIdDto } from './dto/ded-pay-depositary-id.dto';
import { dedPayDepositaryDto } from './dto/ded-pay-depositary.dto';
import { dedPayDepositaryEntity } from './entities/ded-pay-depositary.entity';
import { ResponseDataDTO } from 'src/core/interfaces/response.data.dto';

@Injectable()
export class DedPayDepositaryService {

    constructor(
        @InjectRepository(dedPayDepositaryEntity) private repository: Repository<dedPayDepositaryEntity>,

        private commonFiltersService: CommonFiltersService
    ) { }

    //getAll
    async dedPayDepositary(query: PaginateQuery) {
        try {
            const queryBuilder = this.repository.createQueryBuilder('table')

            const res = await paginate<dedPayDepositaryEntity>(query, queryBuilder, {
                relations: ['conceptPay'],
                sortableColumns: ["appointmentNum", "datePay", "conceptPayKey", "amount", "observation", "registryNum", "nbOrigin",
                    "conceptPay.id", "conceptPay.description", "conceptPay.numRegister"],

                //searchableColumns:['description'], 
                defaultSortBy: [['appointmentNum', 'DESC']],
                filterableColumns: {
                    appointmentNum: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                    datePay: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                    conceptPayKey: [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                    'amount': [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                    'observation': [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                    'registryNum': [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                    'nbOrigin': [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                    'conceptPay.id': [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                    'conceptPay.description': [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
                    'conceptPay.numRegister': [FilterOperator.EQ, FilterOperator.IN, FilterOperator.ILIKE, FilterOperator.NOT, FilterOperator.NULL],
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
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
            }
        }
    }


    //getOne
    async dedPayDepositaryOne(body: dedPayDepositaryIdDto) {

        let appointmentNum = body.appointmentNum;
        let datePay = body.datePay;
        let conceptPayKey = body.conceptPayKey;


        try {
            const exists = await this.repository.findOne({ where: { appointmentNum, datePay, conceptPayKey } })
            if (!exists) return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de appointmentNum, datePay y conceptPayKey.'
            }

            return {
                statusCode: HttpStatus.OK,
                message: "Registro encontrado exitosamente",
                data: exists,
                count: 1
            }

        }
        catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Ocurrio un error al intentar obtener los datos.",
            }
        }

    }

    //============ POST ============
    async dedPayDepositaryPost(body: dedPayDepositaryDto) {
        let appointmentNum = body.appointmentNum;
        let datePay = body.datePay;
        let conceptPayKey = body.conceptPayKey;


        try {

            const exists = await this.repository.findOne({ where: { appointmentNum, datePay, conceptPayKey } })
            if (exists)
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Existe un registro con esta combinación de appointmentNum, datePay y conceptPayKey.',
                    count: 0,
                    data: []
                }
            const data = await this.repository.save(body)
            return {
                statusCode: HttpStatus.OK,
                message: 'Registro guardado correctamente.',
                count: 1,
                data: data
            }
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Ocurrio un error al intentar obtener los datos.",
            }
        }
    }

    //============ PUT ============
    async dedPayDepositaryPut(body: dedPayDepositaryDto) {
        let appointmentNum = body.appointmentNum;
        let datePay = body.datePay;
        let conceptPayKey = body.conceptPayKey;



        try {
            const exists = await this.repository.findOne({ where: { appointmentNum, datePay, conceptPayKey } })
            if (!exists)
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'No se encontró registro para esta combinación de appointmentNum, datePay y conceptPayKey.'
                }

            delete body.appointmentNum;
            delete body.datePay;
            delete body.conceptPayKey;

            const data = await this.repository.update({ appointmentNum, datePay, conceptPayKey }, body)

            if (data)
                return {
                    statusCode: HttpStatus.OK,
                    message: 'Registro actualizado correctamente.'

                }
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se guardo el registro',
            }

        }
        catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error,
            }
        }
    }

    //============ delete ============
    async dedPayDepositaryDelete(body: dedPayDepositaryIdDto) {

        let appointmentNum = body.appointmentNum;
        let datePay = body.datePay;
        let conceptPayKey = body.conceptPayKey;


        try {
            const exists = await this.repository.findOne({ where: { appointmentNum, datePay, conceptPayKey } })
            if (!exists) return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de appointmentNum, datePay y conceptPayKey.'
            }

            await this.repository.delete({ appointmentNum, datePay, conceptPayKey })
            return {
                statusCode: HttpStatus.OK,
                message: 'Registro eliminado correctamente.',
            }
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Ocurrio un error al intentar obtener los datos.",
            }
        }
    }
}
