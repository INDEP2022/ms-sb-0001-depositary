
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'src/core/interfaces/response.data.dto';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { Repository } from 'typeorm';
import { personsModDepositaryIdDto } from './dto/persons-mod-depositary-id.dto';
import { personsModDepositaryDto } from './dto/persons-mod-depositary.dto';
import { personsModDepositaryEntity } from './entities/persons-mod-depositary.entity';

@Injectable()
export class PersonsModDepositaryService {
   
    constructor(
        @InjectRepository(personsModDepositaryEntity) private repository: Repository<personsModDepositaryEntity>,

        private commonFiltersService: CommonFiltersService
    ){}

    //getAll
    async personsModDepositary(query: PaginateQuery): Promise<ResponseDataDTO<personsModDepositaryEntity>> {
        return this.commonFiltersService.paginateFilter<personsModDepositaryEntity>(query,this.repository,null,'appointmentNum');
    }

     //getOne
    async personsModDepositaryOne(theKey: personsModDepositaryIdDto) {

        let appointmentNum=theKey.appointmentNum;
       
        try {
            const exists = await this.repository.findOne({ where: {appointmentNum} })
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para este appointmentNum '
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
      async personsModDepositaryPost(body: personsModDepositaryDto) {
        let appointmentNum=body.appointmentNum;

        try {

            const exists = await this.repository.findOne({ where: {appointmentNum}})
            if(exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Existe un registro con este appointmentNum',
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
     async personsModDepositaryPut(body: personsModDepositaryDto) {
        let appointmentNum=body.appointmentNum;


        try{
            const exists = await this.repository.findOne({ where:{appointmentNum} })
            if(!exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No existe un registro con este appointmentNum',
                count: 0,
                data:[] 
            }

            delete body.appointmentNum;
            const data = await this.repository.update({appointmentNum},body)

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
    async personsModDepositaryDelete(theKey:personsModDepositaryIdDto) {
        
        let appointmentNum=theKey.appointmentNum;

        try {
            const exists = await this.repository.findOne({ where: {appointmentNum}})
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No existe un registro con este appointmentNum'
            }

            await this.repository.delete({appointmentNum})
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
