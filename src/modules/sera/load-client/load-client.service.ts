import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonEntity } from '../depositary-appointment/entity/person.entity';

@Injectable()
export class LoadClientService {

    constructor(
        @InjectRepository(PersonEntity) private entity: Repository<PersonEntity>,
    ) { }


    async loadClient(appointmentNumber: number) {
        const query:any[] = await this.entity.query(`
            SELECT DISTINCT CP.NO_PERSONA, CP.NOMBRE
            FROM sera.CAT_PERSONAS CP, sera.NOMBRAMIENTOS_DEPOSITARIA ND
            WHERE ND.NO_NOMBRAMIENTO  = ${appointmentNumber}
            AND ND.NO_PERSONA = CP.NO_PERSONA
            EXCEPT
            SELECT DISTINCT CP.NO_PERSONA, CP.NOMBRE
            FROM sera.PERSONASXNOM_DEPOSITARIAS PXD, sera.CAT_PERSONAS CP 
            WHERE PXD.NO_NOMBRAMIENTO    = ${appointmentNumber} 
            AND PXD.NO_PERSONA    = CP.NO_PERSONA::text;
        `)
        if(query.length > 0){
            await this.entity.query(`
            DELETE	
            FROM sera.PERSONASXNOM_DEPOSITARIAS PXD 
            WHERE		NOT EXISTS (SELECT	1
                                                    FROM		sera.NOMBRAMIENTOS_DEPOSITARIA ND
                                                    WHERE		ND.NO_NOMBRAMIENTO = ${appointmentNumber} 
                                                    AND			ND.NO_PERSONA::text = PXD.NO_PERSONA
                                                    )
            AND			PXD.NO_NOMBRAMIENTO = ${appointmentNumber};
            `)
            return {
                'executionDate':new Date(),
                'process':'S',
                'sentSirsae':'N',
                'modifyStatus':'N'
            }
        }else{
            return{
                statusCode:'404',
                message:'No result found',
                error:'Not found'
            }
        }


    }

}
