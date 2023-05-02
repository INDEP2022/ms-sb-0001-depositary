
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'sigebi-lib-common';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { Repository } from 'typeorm';
import { infoDepositaryIdDto } from './dto/info-depositary-id.dto';
import { infoDepositaryDto } from './dto/info-depositary.dto';
import { infoDepositaryEntity } from './entities/info-depositary.entity';

@Injectable()
export class InfoDepositaryService {
   
    constructor(
        @InjectRepository(infoDepositaryEntity) private repository: Repository<infoDepositaryEntity>,

        private commonFiltersService: CommonFiltersService
    ){}

    //getAll
    async infoDepositary(query: PaginateQuery): Promise<ResponseDataDTO<infoDepositaryEntity>> {
        return this.commonFiltersService.paginateFilter<infoDepositaryEntity>(query,this.repository,null,'reportDate');
    }

     //getOne
    async infoDepositaryOne(body: infoDepositaryIdDto) {

        let reportDate=body.reportDate;
let personNum=body.personNum;

       
        try {
            const exists = await this.repository.findOne({ where: {reportDate,personNum} })
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de reportDate y personNum.'
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
      async infoDepositaryPost(body: infoDepositaryDto) {
        let reportDate=body.reportDate;
let personNum=body.personNum;


        try {

            const exists = await this.repository.findOne({ where: {reportDate,personNum}})
            if(exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Existe un registro con esta combinación de reportDate y personNum.',
                count: 0,
                data:[] 
            }
            const data = await this.repository.save(body)
            return {
                statusCode: HttpStatus.OK,
                message: 'Registro guardado correctamente.',
                count: 1,
                data:data  
            }
        } catch (error) {
            return  { 
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Ocurrio un error al intentar obtener los datos.",
                }
        }
    }

     //============ PUT ============
     async infoDepositaryPut(body: infoDepositaryDto) {
        let reportDate=body.reportDate;
let personNum=body.personNum;



        try{
            const exists = await this.repository.findOne({ where:{reportDate,personNum} })
            if(!exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de reportDate y personNum.'
            }

            delete body.reportDate;
delete body.personNum;

            const data = await this.repository.update({reportDate,personNum},body)

            if(data)
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
            return  { 
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error,
                }
        }
    }

    //============ delete ============
    async infoDepositaryDelete(body:infoDepositaryIdDto) {
        
        let reportDate=body.reportDate;
let personNum=body.personNum;


        try {
            const exists = await this.repository.findOne({ where: {reportDate,personNum}})
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de reportDate y personNum.'
            }

            await this.repository.delete({reportDate,personNum})
            return { 
                statusCode: HttpStatus.OK,
                message: 'Registro eliminado correctamente.',
                }
        } catch (error) {
            return  { 
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Ocurrio un error al intentar obtener los datos.",
                }
        }
    }
}  
         