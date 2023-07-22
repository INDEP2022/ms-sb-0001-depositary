import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CRUDMessages } from 'src/shared/utils/message.enum';
import { Connection } from 'typeorm';
import { CommonFilterQueryService } from 'src/shared/service/common-filter-query.service';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { VChecaPostDto } from './dto/v-checa-post.dto';
import { VChecaPostReportDto } from './dto/v-checa-post-report.dto';
import * as moment from 'moment-timezone';
import { ClientProxy } from '@nestjs/microservices';
import InternalServerErrorException from 'src/shared/exceptions/internal-server-error.exception';
import { XXSAE_INV_DISPONIBLE_OS } from 'src/core/interfaces/services/common';
import { LocalDate } from 'src/shared/utils/local-date';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly entity: Connection,
    private readonly commonFilterQueryService: CommonFilterQueryService,
    @Inject('ms-sb-0001-goodsquerydbo')
    private readonly goodsQueryDbo: ClientProxy,
  ) {
    this.goodsQueryDbo.connect();
  }

  transformObjToSqlValues(obj: any) {
    for (const field in obj) {
      const value = obj[field];
      if (!value) continue;

      if (typeof value === 'object') {
        obj[field] = LocalDate.getCustom(value, 'YYYY-MM-DD');
      }
    }

    return obj;
  }
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
      `;
      return await this.commonFilterQueryService.callView(
        PaginationDto,
        sql,
        1,
      );
    } catch (error) {
      return {
        statusCode: HttpStatus.OK,
        message: [error.message],
      };
    }
  }

  async vCheca(conceptPayKey: number, pagination: PaginationDto) {
    try {
      const sql = `
        select
          1 as V_CHECA
        from
          sera.CAT_CONCEPTO_PAGOS
        where
          CVE_CONCEPTO_PAGO = ${conceptPayKey}
      `;
      return await this.commonFilterQueryService.callView(
        PaginationDto,
        sql,
        1,
      );
    } catch (error) {
      return {
        statusCode: HttpStatus.OK,
        message: [error.message],
      };
    }
  }

  async vChecaPost(
    { appointmentNumber, conceptPayKey, payDate }: VChecaPostDto,
    pagination: PaginationDto,
  ) {
    try {
      const sql = `
          SELECT 
            1 as V_CHECA
          from
            sera.DETPAGO_DEPOSITARIAS
          where
            NO_NOMBRAMIENTO = '${appointmentNumber}'
            and FEC_PAGO = '${moment.utc(payDate).format('YYYY-MM-DD')}'
            and CVE_CONCEPTO_PAGO = '${conceptPayKey}'
      `;
      return await this.commonFilterQueryService.callView(
        PaginationDto,
        sql,
        1,
      );
    } catch (error) {
      return {
        statusCode: HttpStatus.OK,
        message: [error.message],
      };
    }
  }

  async vChecaPostReport(
    { appointmentNumber, payDate, reportKey }: VChecaPostReportDto,
    pagination: PaginationDto,
  ) {
    try {
      const sql = `
          select
            1 as V_CHECA
          from
            sera.DETREPO_DEPOSITARIAS
          where
            NO_NOMBRAMIENTO = '${appointmentNumber}'
            and FEC_REPO = '${moment.utc(payDate).format('YYYY-MM-DD')}'
            and CVE_REPORTE = ${reportKey}
      `;
      return await this.commonFilterQueryService.callView(
        PaginationDto,
        sql,
        1,
      );
    } catch (error) {
      return {
        statusCode: HttpStatus.OK,
        message: [error.message],
      };
    }
  }

  async migrateXXSaeInvDisponibleOs() {
    try {

      let page = 0,
      limit = 1000,
      data = await this.goodsQueryDbo.send({ cmd: 'selectXxsaeInvDispOs' }, { page, limit }).toPromise();

      let hasData = true

      let processed = 0;
      

      if(data.data.length == 0) {
        hasData= false
      }

      while(hasData) {
        let items = data.data;
        
        let insertIntoQuery = `INSERT INTO NSBDDB.XXSAE_INV_DISPONIBLE_OS (ORGANIZATION_ID, ORGANIZATION_CODE, INVENTORY_ITEM_ID, ITEM, NO_INVENTARIO, NO_BIEN_SIAB, NO_GESTION, SUBINVENTORY_CODE, LOCATOR_ID, LOCATOR, UOM_CODE, DESCRIPTION, DISPONIBLE, RESERVADO) VALUES`;
        
        for (let index = 0; index < items.length; index++) {
          const insertObj: XXSAE_INV_DISPONIBLE_OS = this.transformObjToSqlValues(items[index]);
          
          let insertValues = `(${insertObj.ORGANIZATION_ID}, ${insertObj.ORGANIZATION_CODE}, ${insertObj.INVENTORY_ITEM_ID}, ${insertObj.ITEM}, ${insertObj.NO_INVENTARIO}, ${insertObj.NO_BIEN_SIAB}, ${insertObj.NO_GESTION}, ${insertObj.SUBINVENTORY_CODE}, ${insertObj.LOCATOR_ID}, ${insertObj.LOCATOR}, ${insertObj.UOM_CODE}, ${insertObj.DESCRIPTION}, ${insertObj.DISPONIBLE}, ${insertObj.RESERVADO})`;

          let reachedLimit = index == limit - 1;

          if(reachedLimit) insertValues += ';';
          else insertValues += ',';

          if(reachedLimit) {
            const finalQuery = `${insertIntoQuery} ${insertValues}`;
            console.log('SQL =>', finalQuery);
            page++;
            processed += limit;
            await this.entity.query(finalQuery);
            data = await this.goodsQueryDbo.send({ cmd: 'selectXxsaeInvDispOs' }, { page, limit }).toPromise();
          }
        }
      }

      return {
        statusCode: HttpStatus.OK,
        message: ['Migracion terminada']
      }
    } catch (error) {
      return new InternalServerErrorException(error.message);
    }
  }
}
