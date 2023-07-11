import { HttpStatus, Injectable } from '@nestjs/common';
import { CRUDMessages } from 'src/shared/utils/message.enum';
import { Connection } from 'typeorm';
import { PbApplyDto } from './dto/pb-apply.dto';
import { CommonFilterQueryService } from 'src/shared/service/common-filter-query.service';
import { PaginationDto } from 'src/shared/dto/pagination.dto';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly entity: Connection,
    private readonly commonFilterQueryService: CommonFilterQueryService
  ) { }
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
                    limit 1`,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'OK',
        data: consulta,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
        data: [],
      };
    }
  }
  //---------------------------------------------------------------------------------------------
  async cargaCliente1(no_nombramiento: number) {
    try {
      let unique: any = [];
      const q = `
            SELECT DISTINCT CP.NO_PERSONA, CP.NOMBRE
            FROM sera.PERSONASXNOM_DEPOSITARIAS PXD, sera.CAT_PERSONAS CP 
            WHERE PXD.NO_NOMBRAMIENTO = ${no_nombramiento}
            AND PXD.NO_PERSONA::numeric = CP.NO_PERSONA;
            `;

      const q2 = `
            SELECT DISTINCT CP.NO_PERSONA, CP.NOMBRE
            FROM sera.PERSONASXNOM_DEPOSITARIAS PXD, sera.CAT_PERSONAS CP 
            WHERE PXD.NO_NOMBRAMIENTO    = ${no_nombramiento}
            AND PXD.NO_PERSONA::numeric = CP.NO_PERSONA;
            `;

      const qR = await this.entity.query(q);

      const qR2 = await this.entity.query(q2);

      unique = [...qR, ...qR2];

      if (unique.length == 0) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['Registro no encontrados'],
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: [CRUDMessages.GetSuccess],
        data: unique,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message],
      };
    }
  }
  //---------------------------------------------------------------------------------------------
  async cargaCliente2(no_nombramiento: number) {
    try {
      const q = `
        DELETE FROM SERA.PERSONASXNOM_DEPOSITARIAS PXD
        WHERE	NOT EXISTS (SELECT	1
                                FROM		SERA.NOMBRAMIENTOS_DEPOSITARIA ND
                                WHERE		ND.NO_NOMBRAMIENTO = ${no_nombramiento}
                                AND			ND.NO_PERSONA = PXD.NO_PERSONA::numeric
        )
        AND	PXD.NO_NOMBRAMIENTO = ${no_nombramiento};
        `;

      await this.entity.query(q);



      return {
        statusCode: HttpStatus.OK,
        message: [CRUDMessages.DeleteSuccess],
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.OK,
        message: [error.message],
      };
    }
  }

  async responsable(no_bien: number) {
    try {
      console.log(no_bien);
      const q = `
                  select distinct b.no_persona, b.nombre, a.no_nombramiento
                  from   sera.nombramientos_depositaria a, sera.cat_personas b
                  where  a.responsable = b.nom_persona
                  and    a.no_bien = ${no_bien}
                  order by b.no_persona
                `;

      const qr = await this.entity.query(q);

      if (qr.length == 0) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['Registro no encontrados'],
        };
      }

      return {
        statusCode: HttpStatus.OK,
        message: [CRUDMessages.GetSuccess],
        data: qr,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.OK,
        message: [error.message],
      };
    }
  }

  async appointmentNumber(goodNumber: number, pagination: PaginationDto) {

    try {
      const sql = `
      select
        NO_NOMBRAMIENTO
      from
        sera.NOMBRAMIENTOS_DEPOSITARIA
      where
        NO_BIEN = ${goodNumber}
        and REVOCACION = 'N'
      `
      return await this.commonFilterQueryService.callView(PaginationDto, sql, 1)
      return {
        statusCode: HttpStatus.OK,
        message: ['ok'],
        data: true,
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.OK,
        message: [error.message],
      };
    }
  }
}
