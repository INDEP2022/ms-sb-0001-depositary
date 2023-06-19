
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'src/core/interfaces/response.data.dto';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { Repository } from 'typeorm';
import { detrepoDepositaryIdDto } from './dto/detrepo-depositary-id.dto';
import { detrepoDepositaryDto } from './dto/detrepo-depositary.dto';
import { detrepoDepositaryEntity } from './entities/detrepo-depositary.entity';

@Injectable()
export class DetrepoDepositaryService {
   
    constructor(
        @InjectRepository(detrepoDepositaryEntity) private repository: Repository<detrepoDepositaryEntity>,

        private commonFiltersService: CommonFiltersService
    ){}

    //getAll
    async detrepoDepositary(query: PaginateQuery): Promise<ResponseDataDTO<detrepoDepositaryEntity>> {
        return this.commonFiltersService.paginateFilter<detrepoDepositaryEntity>(query,this.repository,null,'appointmentNum');
    }

     //getOne
    async detrepoDepositaryOne(body: detrepoDepositaryIdDto) {

        let appointmentNum=body.appointmentNum;
let dateRepo=body.dateRepo;
let reportKey=body.reportKey;

       
        try {
            const exists = await this.repository.findOne({ where: {appointmentNum,dateRepo,reportKey} })
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de appointmentNum, dateRepo y reportKey.'
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
      async detrepoDepositaryPost(body: detrepoDepositaryDto) {
        let appointmentNum=body.appointmentNum;
let dateRepo=body.dateRepo;
let reportKey=body.reportKey;


        try {

            const exists = await this.repository.findOne({ where: {appointmentNum,dateRepo,reportKey}})
            if(exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Existe un registro con esta combinación de appointmentNum, dateRepo y reportKey.',
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
     async detrepoDepositaryPut(body: detrepoDepositaryDto) {
        let appointmentNum=body.appointmentNum;
let dateRepo=body.dateRepo;
let reportKey=body.reportKey;



        try{
            const exists = await this.repository.findOne({ where:{appointmentNum,dateRepo,reportKey} })
            if(!exists)
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de appointmentNum, dateRepo y reportKey.'
            }

            delete body.appointmentNum;
delete body.dateRepo;
delete body.reportKey;

            const data = await this.repository.update({appointmentNum,dateRepo,reportKey},body)

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
    async detrepoDepositaryDelete(body:detrepoDepositaryIdDto) {
        
        let appointmentNum=body.appointmentNum;
let dateRepo=body.dateRepo;
let reportKey=body.reportKey;


        try {
            const exists = await this.repository.findOne({ where: {appointmentNum,dateRepo,reportKey}})
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se encontró registro para esta combinación de appointmentNum, dateRepo y reportKey.'
            }

            await this.repository.delete({appointmentNum,dateRepo,reportKey})
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
         