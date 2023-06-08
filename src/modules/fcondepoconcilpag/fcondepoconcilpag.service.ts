import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { cursorCl1Dto } from './dto/cursor-cl1.dto';
@Injectable()
export class FcondepoconcilpagService {
    constructor(private readonly entity: Connection) {}

    //#region carga_clientes
    async cursorCl1(dto: cursorCl1Dto) {
        try{
            let result = await this.entity.query(`
                SELECT DISTINCT CP.NO_PERSONA, CP.NOMBRE
                FROM SERA.CAT_PERSONAS CP
                INNER JOIN SERA.NOMBRAMIENTOS_DEPOSITARIA ND ON ND.NO_PERSONA = CP.NO_PERSONA
                WHERE ND.NO_NOMBRAMIENTO = ${dto.appointmentNo}
                EXCEPT
                SELECT DISTINCT CP.NO_PERSONA, CP.NOMBRE
                FROM SERA.PERSONASXNOM_DEPOSITARIAS PXD
                INNER JOIN SERA.CAT_PERSONAS CP ON PXD.NO_PERSONA = cast(CP.NO_PERSONA as varchar)
                WHERE PXD.NO_NOMBRAMIENTO = ${dto.appointmentNo};
            `);
            
            return {
                statusCode: HttpStatus.OK,
                message: ['Procedimiento ejecutado'],
                data: result,
            };
        }catch(error){
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: [],
            };
        }
    }
    //#endregion carga_clientes

    //#region DELETE	PERSONASXNOM_DEPOSITARIAS PXD
    async deleteFunction(dto: cursorCl1Dto) {
        try{
            let result = await this.entity.query(`
                DELETE FROM SERA.PERSONASXNOM_DEPOSITARIAS PXD
                WHERE NOT EXISTS (
                                        SELECT	1
                                        FROM		SERA.NOMBRAMIENTOS_DEPOSITARIA ND
                                        WHERE ND.NO_NOMBRAMIENTO = ${dto.appointmentNo}
                                        AND	ND.NO_PERSONA = cast(PXD.NO_PERSONA as int)
                                    )
                AND	PXD.NO_NOMBRAMIENTO = ${dto.appointmentNo};
            `);
            return {
                statusCode: HttpStatus.OK,
                message: ['Procedimiento ejecutado']
            };
        }catch(error){
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: [],
            };
        }
    }
    //#endregion DELETE	PERSONASXNOM_DEPOSITARIAS PXD

    //#region FUNCTION valida_estatus
    async validateStatus(dto: cursorCl1Dto) {
        try{
            let result = await this.entity.query(`
                SELECT ND.NO_BIEN
                FROM SERA.NOMBRAMIENTOS_DEPOSITARIA ND
                INNER JOIN SERA.BIEN BIE ON BIE.NO_BIEN = ND.NO_BIEN
                WHERE BIE.ESTATUS NOT IN ('DEP')
                AND EXISTS (
                    SELECT 1
                    FROM SERA.PERSONASXNOM_DEPOSITARIAS PXD
                    where PXD.NO_NOMBRAMIENTO  = ${dto.appointmentNo}
                    AND PXD.NO_PERSONA = ND.RESPONSABLE
                    AND PXD.PROCESAR = 'S'
                    AND PXD.ENVIADO_SIRSAE = 'N'
                    AND PXD.NO_NOMBRAMIENTO = ND.NO_NOMBRAMIENTO
                )
                LIMIT 1;
            `);
            return {
                statusCode: HttpStatus.OK,
                message: ['Procedimiento ejecutado'],
                data: result
            };
        }catch(error){
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: [],
            };
        }
    }
    //#endregion FUNCTION valida_estatus
    
    //#region FUNCTION VALIDA_LISTANEGRA
    async validateBlacklist(dto: cursorCl1Dto) {
        try{
            let result = await this.entity.query(`
                SELECT CP.NO_PERSONA
                FROM SERA.CAT_PERSONAS CP
                INNER JOIN SERA.PERSONASXNOM_DEPOSITARIAS PXD ON PXD.NO_PERSONA = cast(CP.NO_PERSONA as varchar)
                WHERE PXD.NO_NOMBRAMIENTO = ${dto.appointmentNo}
                AND PXD.PROCESAR = 'S'
                AND CP.LISTA_NEGRA = 'S'
                LIMIT 1;
            `);
            return {
                statusCode: HttpStatus.OK,
                message: ['Procedimiento ejecutado'],
                data: result
            };
        }catch(error){
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: [],
            };
        }
    }
    //#endregion FUNCTION VALIDA_LISTANEGRA


}
