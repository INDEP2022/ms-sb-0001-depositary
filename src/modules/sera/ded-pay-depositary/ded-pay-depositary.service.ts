
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'sigebi-lib-common';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { Repository } from 'typeorm';
import { dedPayDepositaryIdDto } from './dto/ded-pay-depositary-id.dto';
import { dedPayDepositaryDto } from './dto/ded-pay-depositary.dto';
import { dedPayDepositaryEntity } from './entities/ded-pay-depositary.entity';

@Injectable()
export class DedPayDepositaryService {
   
    constructor(
        @InjectRepository(dedPayDepositaryEntity) private repository: Repository<dedPayDepositaryEntity>,

        private commonFiltersService: CommonFiltersService
    ){}

    //getAll
    async dedPayDepositary(query: PaginateQuery): Promise<ResponseDataDTO<dedPayDepositaryEntity>> {
        return this.commonFiltersService.paginateFilter<dedPayDepositaryEntity>(query,this.repository,null,'appointmentNum');
    }

     //getOne
    async dedPayDepositaryOne(body: dedPayDepositaryIdDto) {

        let appointmentNum=body.appointmentNum;
let datePay=body.datePay;
let conceptPayKey=body.conceptPayKey;

       
        try {
            const exists = await this.repository.findOne({ where: {appointmentNum,datePay,conceptPayKey} })
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
        let appointmentNum=body.appointmentNum;
let datePay=body.datePay;
let conceptPayKey=body.conceptPayKey;


        try {

            const exists = await this.repository.findOne({ where: {appointmentNum,datePay,conceptPayKey}})
            if(exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Existe un registro con esta combinación de appointmentNum, datePay y conceptPayKey.',
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
     async dedPayDepositaryPut(body: dedPayDepositaryDto) {
        let appointmentNum=body.appointmentNum;
let datePay=body.datePay;
let conceptPayKey=body.conceptPayKey;



        try{
            const exists = await this.repository.findOne({ where:{appointmentNum,datePay,conceptPayKey} })
            if(!exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de appointmentNum, datePay y conceptPayKey.'
            }

            delete body.appointmentNum;
delete body.datePay;
delete body.conceptPayKey;

            const data = await this.repository.update({appointmentNum,datePay,conceptPayKey},body)

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
    async dedPayDepositaryDelete(body:dedPayDepositaryIdDto) {
        
        let appointmentNum=body.appointmentNum;
let datePay=body.datePay;
let conceptPayKey=body.conceptPayKey;


        try {
            const exists = await this.repository.findOne({ where: {appointmentNum,datePay,conceptPayKey}})
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de appointmentNum, datePay y conceptPayKey.'
            }

            await this.repository.delete({appointmentNum,datePay,conceptPayKey})
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
         