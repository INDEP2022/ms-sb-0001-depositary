
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'src/core/interfaces/response.data.dto';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { Repository } from 'typeorm';
import { detailsDepositaryIdDto } from './dto/details-depositary-id.dto';
import { detailsDepositaryDto } from './dto/details-depositary.dto';
import { detailsDepositaryEntity } from './entities/details-depositary.entity';

@Injectable()
export class DetailsDepositaryService {
   
    constructor(
        @InjectRepository(detailsDepositaryEntity) private repository: Repository<detailsDepositaryEntity>,

        private commonFiltersService: CommonFiltersService
    ){}

    //getAll
    async detailsDepositary(query: PaginateQuery): Promise<ResponseDataDTO<detailsDepositaryEntity>> {
        return this.commonFiltersService.paginateFilter<detailsDepositaryEntity>(query,this.repository,null,'id');
    }

     //getOne
    async detailsDepositaryOne(body: detailsDepositaryIdDto) {

        let id=body.id;
let consecutive=body.consecutive;
let goodNum=body.goodNum;
let appointmentNum=body.appointmentNum;

       
        try {
            const exists = await this.repository.findOne({ where: {id,consecutive,goodNum,appointmentNum} })
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de id, consecutive, goodNum y appointmentNum.'
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
      async detailsDepositaryPost(body: detailsDepositaryDto) {
        let id=body.id;
let consecutive=body.consecutive;
let goodNum=body.goodNum;
let appointmentNum=body.appointmentNum;


        try {

            const exists = await this.repository.findOne({ where: {id,consecutive,goodNum,appointmentNum}})
            if(exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Existe un registro con esta combinación de id, consecutive, goodNum y appointmentNum.',
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
     async detailsDepositaryPut(body: detailsDepositaryDto) {
        let id=body.id;
let consecutive=body.consecutive;
let goodNum=body.goodNum;
let appointmentNum=body.appointmentNum;



        try{
            const exists = await this.repository.findOne({ where:{id,consecutive,goodNum,appointmentNum} })
            if(!exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de id, consecutive, goodNum y appointmentNum.'
            }

            delete body.id;
delete body.consecutive;
delete body.goodNum;
delete body.appointmentNum;

            const data = await this.repository.update({id,consecutive,goodNum,appointmentNum},body)

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
    async detailsDepositaryDelete(body:detailsDepositaryIdDto) {
        
        let id=body.id;
let consecutive=body.consecutive;
let goodNum=body.goodNum;
let appointmentNum=body.appointmentNum;


        try {
            const exists = await this.repository.findOne({ where: {id,consecutive,goodNum,appointmentNum}})
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de id, consecutive, goodNum y appointmentNum.'
            }

            await this.repository.delete({id,consecutive,goodNum,appointmentNum})
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
         