
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'src/core/interfaces/response.data.dto';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { Repository } from 'typeorm';
import { requestsDepositaryIdDto } from './dto/requests-depositary-id.dto';
import { requestsDepositaryDto } from './dto/requests-depositary.dto';
import { requestsDepositaryEntity } from './entities/requests-depositary.entity';

@Injectable()
export class RequestsDepositaryService {
   
    constructor(
        @InjectRepository(requestsDepositaryEntity) private repository: Repository<requestsDepositaryEntity>,

        private commonFiltersService: CommonFiltersService
    ){}

    //getAll
    async requestsDepositary(query: PaginateQuery): Promise<ResponseDataDTO<requestsDepositaryEntity>> {
        return this.commonFiltersService.paginateFilter<requestsDepositaryEntity>(query,this.repository,null,'applicationNum');
    }

     //getOne
    async requestsDepositaryOne(theKey: requestsDepositaryIdDto) {

        let applicationNum=theKey.applicationNum;
       
        try {
            const exists = await this.repository.findOne({ where: {applicationNum} })
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para este applicationNum '
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
      async requestsDepositaryPost(body: requestsDepositaryDto) {
        let applicationNum=body.applicationNum;

        try {

            const exists = await this.repository.findOne({ where: {applicationNum}})
            if(exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Existe un registro con este applicationNum',
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
     async requestsDepositaryPut(body: requestsDepositaryDto) {
        let applicationNum=body.applicationNum;


        try{
            const exists = await this.repository.findOne({ where:{applicationNum} })
            if(!exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No existe un registro con este applicationNum',
                count: 0,
                data:[] 
            }

            delete body.applicationNum;
            const data = await this.repository.update({applicationNum},body)

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
    async requestsDepositaryDelete(theKey:requestsDepositaryIdDto) {
        
        let applicationNum=theKey.applicationNum;

        try {
            const exists = await this.repository.findOne({ where: {applicationNum}})
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No existe un registro con este applicationNum'
            }

            await this.repository.delete({applicationNum})
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
