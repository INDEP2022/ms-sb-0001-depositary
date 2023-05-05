import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';

@Injectable()
export class ApplicationService {
    constructor(private readonly entity: Connection) { }
    //---------------------------------------------------------------------------------------------
    async validBlacklist(validBlacklist: number) {
        try {
            const consulta = await this.entity.query(
                `select
                    CP.NO_PERSONA as AUX_CLIENTE
                from
                    sera.CAT_PERSONAS CP,
                    sera.PERSONASXNOM_DEPOSITARIAS PXD
                where
                    PXD.NO_NOMBRAMIENTO = ${validBlacklist}
                    and PXD.PROCESAR = 'S'
                    and PXD.NO_PERSONA = cast(CP.NO_PERSONA as varchar)
                    and CP.LISTA_NEGRA = 'S'
                    limit 1`
            )
            return {
                statusCode: HttpStatus.OK,
                message: 'OK',
                data: consulta
            };
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: [],
            };
        }
    }
}
