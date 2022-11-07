import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PersonEntity } from './entity/person.entity';

@Injectable()
export class ValidBlackListService {

    constructor(
        @InjectRepository(PersonEntity) private entity: Repository<PersonEntity>,
    ) { }


    async validBlackList(appointmentNumber:number) {
        const query:any[] = await this.entity.query(`SELECT	CP.no_persona 
        FROM		sera.CAT_PERSONAS CP inner join sera.PERSONASXNOM_DEPOSITARIAS PXD on PXD.NO_PERSONA = CP.NO_PERSONA::text
        WHERE		PXD.NO_NOMBRAMIENTO   = ${appointmentNumber}
        AND			PXD.PROCESAR    = 'S'
        AND			CP.LISTA_NEGRA  = 'S' 
        limit 1`)
        return {
            personNumber:query.length> 0?query[0]['no_persona']:'XX' 
        }

    }

}
