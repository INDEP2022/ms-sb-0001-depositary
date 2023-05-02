
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'sigebi-lib-common';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { Repository } from 'typeorm';
import { parametersModDepositaryIdDto } from './dto/parameters-mod-depositary-id.dto';
import { parametersModDepositaryDto } from './dto/parameters-mod-depositary.dto';
import { parametersModDepositaryEntity } from './entities/parameters-mod-depositary.entity';

@Injectable()
export class ParametersModDepositaryService {
   
    constructor(
        @InjectRepository(parametersModDepositaryEntity) private repository: Repository<parametersModDepositaryEntity>,

        private commonFiltersService: CommonFiltersService
    ){}

    //getAll
    async parametersModDepositary(query: PaginateQuery): Promise<ResponseDataDTO<parametersModDepositaryEntity>> {
        return this.commonFiltersService.paginateFilter<parametersModDepositaryEntity>(query,this.repository,null,'parameter');
    }

     //getOne
    async parametersModDepositaryOne(theKey: parametersModDepositaryIdDto) {

        let parameter=theKey.parameter;
       
        try {
            const exists = await this.repository.findOne({ where: {parameter} })
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para este parameter '
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
      async parametersModDepositaryPost(body: parametersModDepositaryDto) {
        let parameter=body.parameter;

        try {

            const exists = await this.repository.findOne({ where: {parameter}})
            if(exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Existe un registro con este parameter',
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
     async parametersModDepositaryPut(body: parametersModDepositaryDto) {
        let parameter=body.parameter;


        try{
            const exists = await this.repository.findOne({ where:{parameter} })
            if(!exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No existe un registro con este parameter',
                count: 0,
                data:[] 
            }

            delete body.parameter;
            const data = await this.repository.update({parameter},body)

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
    async parametersModDepositaryDelete(theKey:parametersModDepositaryIdDto) {
        
        let parameter=theKey.parameter;

        try {
            const exists = await this.repository.findOne({ where: {parameter}})
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No existe un registro con este parameter'
            }

            await this.repository.delete({parameter})
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
