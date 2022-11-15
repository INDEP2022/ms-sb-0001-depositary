import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { Repository } from 'typeorm';
import { LegalDestinationForPropertyDTO } from './dto/legal-destination-for-property.dto';
import { LegalDestinationForPropertyEntity } from './entity/legal-destination-for-property.entity';
import { Text } from 'src/shared/config/text'


@Injectable()
export class LegalDestinationForPropertyService {


    constructor(
        @InjectRepository(LegalDestinationForPropertyEntity) private entity: Repository<LegalDestinationForPropertyEntity>,
    ) { }


    async createLegalDestinationForProperty(legalDestinationForPropertyDTO: LegalDestinationForPropertyDTO) {
        const task = await this.entity.findOne({
            where: {
                propertyNumber: legalDestinationForPropertyDTO.propertyNumber,
                requestDate: legalDestinationForPropertyDTO.requestDate
            }
        });
        if (task) return { statusCode: 400, message: ['Este registro ya existe!'] }
        
        try {
            const row = await this.entity.save(legalDestinationForPropertyDTO);
            return {    
                statusCode:200,
                message:["OK"],
                data: row,
            }
            
        } catch (error) {
            return { statusCode: 500, message: [error.message] }
        }
    }

    async getAllLegalDestinationForProperty({ inicio = 1, pageSize = 10, text }: PaginationDto) {
        const queryBuilder = await this.entity.createQueryBuilder('table');
        //queryBuilder.innerJoinAndMapOne('table.appointmentNumber','nombramientos_depositaria','fk','table.no_nombramiento=fk.no_nombramiento')

        if (text) {
            queryBuilder.where(`${Text.formatTextDb('table.candidato_propuesto')} LIKE '%${Text.formatText(text)}%'`)
        }
        queryBuilder.take(pageSize || 10)
        queryBuilder.orderBy("fec_solicitud", "DESC")
        queryBuilder.skip((inicio - 1) * pageSize || 0)
        const [result, total] = await queryBuilder.getManyAndCount();
        return {    
            statusCode:200,
            message:["OK"],
            data: result,
            count: total
        }
    }

    async filterLegalDestinationForPropertyById(property: number, requestDate: Date) {
        const queryBuilder = this.entity.createQueryBuilder();
        if (!property && !requestDate) {
            queryBuilder.andWhere(`fec_solicitud = null`)

        }
        else {
            queryBuilder.where(`no_bien = coalesce(:property,no_bien)`, { property: property || null })
            queryBuilder.andWhere(`fec_solicitud = coalesce(:date,fec_solicitud)`, { date: requestDate || null })
        }



        // queryBuilder.take(pageSize || 10)
        // queryBuilder.skip((inicio - 1) * pageSize || 0)
        const [result, total] = await queryBuilder.getManyAndCount();
        return {    
            statusCode:200,
            message:[total == 0?"No se encontraron resultados!":"OK"],
            data: result,
            count: total
        }
    }

    parseNotNull(value: string) {
        return value ? value.length > 0 ? `${value}` : null : null
    }


    async updateLegalDestinationForProperty(legalDestinationForPropertyDTO: LegalDestinationForPropertyDTO) {

        return await this.entity.update({ propertyNumber: legalDestinationForPropertyDTO.propertyNumber, requestDate: legalDestinationForPropertyDTO.requestDate }, legalDestinationForPropertyDTO);
    }


}
