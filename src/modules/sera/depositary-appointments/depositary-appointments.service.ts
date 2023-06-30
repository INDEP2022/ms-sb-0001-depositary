
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'src/core/interfaces/response.data.dto';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { Repository } from 'typeorm';
import { depositaryAppointmentsIdDto } from './dto/depositary-appointments-id.dto';
import { depositaryAppointmentsDto } from './dto/depositary-appointments.dto';
import { depositaryAppointmentsEntity } from './entities/depositary-appointments.entity';

@Injectable()
export class DepositaryAppointmentsService {
   
    constructor(
        @InjectRepository(depositaryAppointmentsEntity) private repository: Repository<depositaryAppointmentsEntity>,

        private commonFiltersService: CommonFiltersService
    ){}

    //getAll
    async depositaryAppointments(query: PaginateQuery): Promise<ResponseDataDTO<depositaryAppointmentsEntity>> {
        return this.commonFiltersService.paginateFilter<depositaryAppointmentsEntity>(query,this.repository,null,'appointmentNum');
    }

     //getOne
    async depositaryAppointmentsOne(theKey: depositaryAppointmentsIdDto) {

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
      async depositaryAppointmentsPost(body: depositaryAppointmentsDto) {
        let appointmentNum=body.appointmentNum;

        try {

            // const exists = await this.repository.findOne({ where: {appointmentNum}})
            // if(exists)
            // return {
            //     statusCode: HttpStatus.BAD_REQUEST,
            //     message: 'Existe un registro con este appointmentNum',
            //     count: 0,
            //     data:[] 
            // }
            const queryUsers = await this.repository.query(`
                SELECT *
                FROM sera.SEG_USUARIOS
                WHERE usuario = '${body.representativeSera}'
            `);
            if(queryUsers.length == 0) {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `El dato representativeSera: '${body.representativeSera}' no existe en la tabla seg_usuarios.`,
                    data:[]  
                }
            }

            const queryPerson = await this.repository.query(`
                SELECT *
                FROM sera.cat_personas
                WHERE no_persona = '${body.personNum}'
            `);
            if(queryPerson.length == 0) {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `El dato personNum: '${body.personNum}' no existe en la tabla cat_personas.`,
                    data:[]  
                }
            }

            const datacreate = await this.repository.create(body)
            const data = await this.repository.save(datacreate)
            return {
                statusCode: HttpStatus.OK,
                message: 'Registro guardado correctamente.',
                count: 1,
                data:data  
            }
        } catch (error) {
            return  { 
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                }
        }
    }

     //============ PUT ============
     async depositaryAppointmentsPut(body: depositaryAppointmentsDto) {
        try{
            let appointmentNum = body.appointmentNum;

            if(!body.appointmentNum) {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'El campo appointmentNum no puede ir vacío.',
                    data:[] 
                }
            }

            const exists = await this.repository.findOne({ where:{appointmentNum} })
            if(!exists)
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `No existe un registro con este appointmentNum: ${appointmentNum}.`,
                    count: 0,
                    data:[] 
                }

                const queryUsers = await this.repository.query(`
                SELECT *
                FROM sera.SEG_USUARIOS
                WHERE usuario = '${body.representativeSera}'
            `);
            if(queryUsers.length == 0) {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `El dato representativeSera: '${body.representativeSera}' no existe en la tabla seg_usuarios.`,
                    data:[]  
                }
            }

            const queryPerson = await this.repository.query(`
                SELECT *
                FROM sera.cat_personas
                WHERE no_persona = '${body.personNum}'
            `);
            if(queryPerson.length == 0) {
                return {
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `El dato personNum: '${body.personNum}' no existe en la tabla cat_personas.`,
                    data:[]  
                }
            }

            delete body.appointmentNum;
            const { affected } = await this.repository.update({appointmentNum}, body)
            if(affected)
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
            console.log(error);
            return  { 
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error,
                }
        }
    }

    //============ delete ============
    async depositaryAppointmentsDelete(theKey:depositaryAppointmentsIdDto) {
        
        let appointmentNum = theKey.appointmentNum;

        try {
            const exists = await this.repository.findOne({ where: {appointmentNum}})
            if (!exists) return { 
                statusCode: HttpStatus.BAD_REQUEST,
                message: `No existe un registro con este appointmentNum: '${appointmentNum}'`
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
