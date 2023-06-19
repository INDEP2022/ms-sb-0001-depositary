
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'src/core/interfaces/response.data.dto';

import { Repository } from 'typeorm';
import { destinyLegalByGoodIdDto } from './dto/destiny-legal-by-good-id.dto';
import { destinyLegalByGoodDto } from './dto/destiny-legal-by-good.dto';
import { destinyLegalByGoodEntity } from './entities/destiny-legal-by-good.entity';
import { CommonFiltersService } from 'src/shared/common-filters.service';

@Injectable()
export class DestinyLegalByGoodService {
   
    constructor(
        @InjectRepository(destinyLegalByGoodEntity) private repository: Repository<destinyLegalByGoodEntity>,

        private commonFiltersService: CommonFiltersService
    ){}

    //getAll
    async destinyLegalByGood(query: PaginateQuery): Promise<ResponseDataDTO<destinyLegalByGoodEntity>> {
        return this.commonFiltersService.paginateFilter<destinyLegalByGoodEntity>(query,this.repository,null,'goodNumber');
    }

     //getOne
    async destinyLegalByGoodOne(body: destinyLegalByGoodIdDto) {

        let goodNumber=body.goodNumber;
let dateApplication=body.dateApplication;

       
        try {
            const exists = await this.repository.findOne({ where: {goodNumber,dateApplication} })
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de goodNumber y dateApplication.'
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
      async destinyLegalByGoodPost(body: destinyLegalByGoodDto) {
        let goodNumber=body.goodNumber;
let dateApplication=body.dateApplication;


        try {

            const exists = await this.repository.findOne({ where: {goodNumber,dateApplication}})
            if(exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Existe un registro con esta combinación de goodNumber y dateApplication.',
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
     async destinyLegalByGoodPut(body: destinyLegalByGoodDto) {
        let goodNumber=body.goodNumber;
let dateApplication=body.dateApplication;



        try{
            const exists = await this.repository.findOne({ where:{goodNumber,dateApplication} })
            if(!exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de goodNumber y dateApplication.'
            }

            delete body.goodNumber;
delete body.dateApplication;

            const data = await this.repository.update({goodNumber,dateApplication},body)

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
    async destinyLegalByGoodDelete(body:destinyLegalByGoodIdDto) {
        
        let goodNumber=body.goodNumber;
let dateApplication=body.dateApplication;


        try {
            const exists = await this.repository.findOne({ where: {goodNumber,dateApplication}})
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de goodNumber y dateApplication.'
            }

            await this.repository.delete({goodNumber,dateApplication})
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
         