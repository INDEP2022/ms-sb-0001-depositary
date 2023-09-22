import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { of } from 'rxjs';
import { Repository } from 'typeorm';
import { cli } from 'winston/lib/winston/config';
import { Asigna } from './dto/asigna.dto';
import { BlackListCurrent } from './dto/black-list.dto';
import { DISPERPENA, Dispersa } from './dto/dispersa.dto';
import { CurrentFullErase } from './dto/full-erase.dto';
import { ParametersValues } from './dto/get-parameters-values.dto';
import { LOTEXGARA } from './dto/lot-for-gara.dto';
import { Pago } from './dto/payment.dto';
import { PresencialBM } from './dto/presencial-bm.dto';
import { RealStateSale, RealStateSaleCurrent } from './dto/real-state-sale.dto';
import { ComerEventEntity } from './entity/comer-event.entity';
import { ComerLotsEntity } from './entity/comer-lots.entity';
import { ComerParameterModEntity } from './entity/comer-parameter-mod.entity';
import { LocalDate } from 'src/shared/utils/local-date';
import { UpdateCurrentGeneralStatus } from './dto/update-current-general-status.dto';
import { ACUMDETALLESOI } from './dto/prep-oi.dto';
import InternalServerErrorException from 'src/shared/exceptions/internal-server-error.exception';
import { PrepOIInmu, PrepOiInmuAct } from './dto/param.dto';

@Injectable()
export class ValidatePaymentsRefService {
  G_IVA: number;
  G_PKREFGEN: number;
  G_NUMLOTES: number;
  G_UR: string;
  G_TPOPERACION: number;
  G_TPOINGRESO: string;
  G_AREA: string;
  G_TPODOC: string;
  G_COMPRADO: number;
  G_ANEXO: string;
  G_EVENTO: number;
  GK: number;
  G_TPPENALIZA: number;
  G_PCTCHATARRA: number;
  G_TASAIVA: number;
  G_TPOINGRESOP: string;
  G_TPOINGRESOD: string;
  G_YAPENALIZO: number;

  FEHCA_DEP: Date;
  FECH_GAR: Date;
  SUMA: number;
  LIQ_I: Date;
  LIQ_EXT: Date;
  FECH_GAR2: Date;
  FECH_GS: Date;
  LIQ_2: string;
  PAG_ANT: Date;
  PARAMETRO: string;
  IDLOTE: number;
  FECHA_F: Date;
  FECHA_N: Date;
  G_TPEVENTO: number;
  G_DIRECCION: string;
  G_PORCGACUM: string;
  G_PERPAGO: string;
  G_PERGACUML: string;
  G_GARANTSERM: string;
  G_PERIODO24HRS: string;
  G_PORCGARCUM: string;
  G_PERIODOLIQUI: string;
  G_PERIODOLIQEX: string;
  G_GARANTSERI: string;
  G_PERIODO24HRSSI: string;
  G_PORGARSERI: string;
  G_PERIGARCUMSEI: string;
  G_PERIODO60LIQSEI: string;
  G_PENA10SMSEI: string;
  G_PENA5SEI: string;
  G_NUMLOTSPM: string;
  G_GARANTXLOTE: string;
  G_PERILIQSPBM: string;
  G_PERILIQEXTSPM: string;
  G_GARSERLP: string;
  G_PERGARCUMLP: string;
  G_PORCGARCUMLP: string;
  G_PERPAGANTLP: string;
  G_PORPAGANTLP: string;
  G_PERLIQLP: string;
  G_PERLIQEXTLP: string;
  G_PORGARCUMSE: string;
  G_PORCGCRM: string;
  G_PERIODOLRM: string;
  G_PENA10SMRM: string;
  G_PENA5PORCRM: string;
  G_PERIODOLERM: string;

  DISPERSION: Dispersa[] = [];

  LOTESXCLI: Asigna[] = [];
  HIJOSLOT: Asigna[] = [];
  PENASDEV: Asigna[] = [];
  DEPOSITOS: Pago[] = [];
  DETOI: ACUMDETALLESOI[] = [];
  DETAUX: ACUMDETALLESOI[] = [];
  LOTIPGAR: LOTEXGARA[] = [];
  RETIPGAR: LOTEXGARA[] = [];
  DISPERSIONPEN: DISPERPENA[] = [];
  constructor(
    @InjectRepository(ComerEventEntity)
    private entity: Repository<ComerEventEntity>,
    @InjectRepository(ComerParameterModEntity)
    private entity2: Repository<ComerParameterModEntity>,
  ) { 

  }

  /**
   *
   * @procedure LISTA_NEGRA
   * @returns
   */
  async blackList(eventId: number) {
    const LNN: any[] = await this.entity.query(`SELECT     LOT.ID_CLIENTE
                FROM    sera.COMER_PAGOSREFGENS GEN, sera.COMER_LOTES LOT
                WHERE    LOT.ID_EVENTO = ${eventId} 
                AND        GEN.ID_LOTE = LOT.ID_LOTE
                AND        GEN.TIPO = 'N'
                AND        EXISTS (SELECT    1
                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                WHERE    CXE.ID_EVENTO = ${eventId} 
                                AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND        CXE.PROCESAR = 'S'
                                )`);

    const LNS: any[] = await this.entity.query(`SELECT     LOT.ID_CLIENTE
                FROM    sera.COMER_PAGOSREFGENS GEN, sera.COMER_LOTES LOT
                WHERE    LOT.ID_EVENTO = ${eventId} 
                AND        LOT.ID_LOTE = GEN.ID_LOTE
                AND        GEN.TIPO = 'P'
                AND        EXISTS (SELECT    1
                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                WHERE    CXE.ID_EVENTO = ${eventId} 
                                AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND        CXE.PROCESAR = 'S'
                                )`);

    LNN.forEach((element) => {
      this.entity.query(` UPDATE    sera.COMER_CLIENTES
            SET     LISTA_NEGRA = 'N'
            WHERE    ID_CLIENTE = ${element.id_cliente}`);
    });

    LNS.forEach((element) => {
      this.entity.query(`  UPDATE    sera.COMER_CLIENTES
            SET     LISTA_NEGRA = 'S',
                    ID_PENALIZACION = 1 
            WHERE    ID_CLIENTE = ${element.id_cliente}`);
    });

    return `Clientes en la lista negra ${LNS.length || 0
      }, clientes sacados de la lista negra ${LNN.length || 0}`;
  }

  /**
   *
   * @procedure LISTA_NEGRA_ACT
   * @returns
   */
  async currentBlackList(data: BlackListCurrent) {
    const LNN: any[] = await this.entity.query(` SELECT     LOT.ID_CLIENTE
                        FROM    sera.COMER_PAGOSREFGENS GEN, sera.COMER_LOTES LOT
                        WHERE    LOT.ID_EVENTO = ${data.event} 
                        AND      LOT.ID_LOTE = ${data.lot} 
                        AND        GEN.ID_LOTE = LOT.ID_LOTE
                        AND        GEN.TIPO = 'N'
                        AND        EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${data.event}
                                        AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND        CXE.PROCESAR = 'S'
                );`);

    const LNS: any[] = await this.entity.query(`SELECT     LOT.ID_CLIENTE
                        FROM    sera.COMER_PAGOSREFGENS GEN, sera.COMER_LOTES LOT
                        WHERE    LOT.ID_EVENTO = ${data.event} 
                        AND      LOT.ID_LOTE = ${data.lot} 
                        AND        LOT.ID_LOTE = GEN.ID_LOTE
                        AND        GEN.TIPO = 'P'
                        AND         SUBSTR(GEN.REFERENCIA,1,1) IN ('1','2')
                        AND        EXISTS (SELECT    1
                                        FROM   sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${data.event} 
                                        AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND        CXE.PROCESAR = 'S'
                )`);

    for (var element of LNN) {
      this.entity.query(` UPDATE    sera.COMER_CLIENTES
                        SET     LISTA_NEGRA = 'N'
                        WHERE    ID_CLIENTE = ${element.id_cliente}`);
    }

    for (var element of LNS) {
      this.entity.query(`  UPDATE    sera.COMER_CLIENTES
                        SET     LISTA_NEGRA = 'S',
                                ID_PENALIZACION = 1 
                        WHERE    ID_CLIENTE = ${element.id_cliente}`);
    }
    return {
      statusCode: 200,
      message: [
        `Clientes en la lista negra ${LNS.length || 0
        }, clientes sacados de la lista negra ${LNN.length || 0}`,
      ],
    };
  }

  async getParametersValues(parameters: ParametersValues) {
    const comerEvent = await this.entity.findOne({
      where: { id: parameters.eventId },
    });

    if (comerEvent) {
      if (!comerEvent.failureDate)
        return { statusCode: 400, message: ['La fecha fallo viene vacia.'] };
      if (!comerEvent.eventTpId)
        return {
          statusCode: 400,
          message: ['No existe el parametro tipo evento.'],
        };

      this.G_TPEVENTO = comerEvent.eventTpId;
      this.G_DIRECCION = comerEvent.address || '';
      this.FECHA_F = comerEvent.failureDate;

      if (this.G_TPEVENTO == 3 && this.G_DIRECCION == 'M') {
        if (!comerEvent.notificationDate)
          return {
            statusCode: 400,
            message: ['La fecha de notificacion viene vacia.'],
          };
        this.FECHA_N = comerEvent.notificationDate;
      }
      if (this.G_TPEVENTO == 3 && this.G_DIRECCION == 'I') {
        if (!comerEvent.notificationDate)
          return {
            statusCode: 400,
            message: ['La fecha de notificacion viene vacia.'],
          };
        this.FECHA_N = comerEvent.notificationDate;
        const parameterMod = await this.entity2.findOne({
          where: {
            tpeventId: this.G_TPEVENTO,
            parameter: 'PORCGACUM',
            address: this.G_DIRECCION,
          },
        });
        if (!parameterMod)
          return {
            statusCode: 400,
            message: [
              'No se encontro el parametro de la garantia de cumplimiento ADI',
            ],
          };
        this.G_PORCGACUM = parameterMod.value;
        const parameterModPerPago = await this.entity2.findOne({
          where: {
            tpeventId: this.G_TPEVENTO,
            parameter: 'PERPAGO',
            address: this.G_DIRECCION,
          },
        });
        if (!parameterModPerPago)
          return {
            statusCode: 400,
            message: [
              'No se encontro el parametro del periodo de liquidacion ADI',
            ],
          };
        this.G_PERPAGO = parameterModPerPago.value;

        const parameterModCuml = await this.entity2.findOne({
          where: {
            tpeventId: this.G_TPEVENTO,
            parameter: 'PERGACUML',
            address: this.G_DIRECCION,
          },
        });
        if (!parameterModCuml)
          return {
            statusCode: 400,
            message: [
              'No se encontro el parametro de la garantia de cumplimiento ADI',
            ],
          };
        this.G_PERGACUML = parameterModCuml.value;
        /*
                
                                FECH_GAR: OBTENER_POST_FECHA_HABIL (FECHA_F , G_PERGACUML) ;
                                        LIQ_I : FECHA_F + G_PERPAGO;*/
      }
      if (this.G_TPEVENTO == 4 && this.G_DIRECCION == 'M') {
        const query4m = await this.entity2
          .createQueryBuilder('table')
          .where(`direccion = :address`, { address: this.G_DIRECCION })
          .andWhere(`id_tpevento= :event`, { event: this.G_TPEVENTO })
          .andWhere("parametro = 'GARANSERM'")
          .orWhere("parametro = 'PERIODO24HRS'")
          .orWhere("parametro = 'PORCGARCUM'")

          .orWhere("parametro = 'PERIODOLIQUI'")
          .orWhere("parametro = 'PERIODOLIQEXT'")
          .getMany();

        this.G_GARANTSERM =
          query4m.filter((x) => x.parameter == 'GARANSERM')[0]?.value || null;
        this.G_PERIODO24HRS =
          query4m.filter((x) => x.parameter == 'PERIODO24HRS')[0]?.value ||
          null;
        this.G_PORCGARCUM =
          query4m.filter((x) => x.parameter == 'PORCGARCUM')[0]?.value || null;
        this.G_PERIODOLIQUI =
          query4m.filter((x) => x.parameter == 'PERIODOLIQUI')[0]?.value ||
          null;
        this.G_PERIODOLIQEX =
          query4m.filter((x) => x.parameter == 'PERIODOLIQEXT')[0]?.value ||
          null;

        if (!this.G_GARANTSERM)
          return {
            statusCode: 400,
            message: ['No se encontro el dato GARANSERM'],
          };
        if (!this.G_PERIODO24HRS)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PERIODO24HRS'],
          };
        if (!this.G_PORCGARCUM)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PORCGARCUM'],
          };
        if (!this.G_PERIODOLIQUI)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PERIODOLIQUI'],
          };
        if (!this.G_PERIODOLIQEX)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PERIODOLIQEXT'],
          };

        /*
                                
                                  FECH_GAR : OBTENER_POST_FECHA_HABIL (FECHA_F ,  G_PERIODO24HRS);
                                        LIQ_I : OBTENER_POST_FECHA_HABIL (FECHA_F ,  G_PERIODOLIQUI);
                                        LIQ_EXT : OBTENER_POST_FECHA_HABIL (LIQ_I ,  G_PERIODOLIQEX);
                                */
      }

      if (this.G_TPEVENTO == 4 && this.G_DIRECCION == 'I') {
        const query4i = await this.entity2
          .createQueryBuilder('table')
          .where(`direccion = :address`, { address: this.G_DIRECCION })
          .andWhere(`id_tpevento= :event`, { event: this.G_TPEVENTO })
          .andWhere("parametro = 'GARANTSERI'")
          .orWhere("parametro = 'PERIODO24HRSI'")
          .orWhere("parametro = 'PORGARSERI'")

          .orWhere("parametro = 'PERIGARCUMSEI'")
          .orWhere("parametro = 'PORGARCUMSE'")

          .orWhere("parametro = 'PERIODO60LIQSEI'")

          .orWhere("parametro = 'PENA10SMSEI'")
          .orWhere("parametro = 'PENA%5SEI'")
          .getMany();

        this.G_GARANTSERI =
          query4i.filter((x) => x.parameter == 'GARANTSERI')[0]?.value || null;
        this.G_PERIODO24HRSSI =
          query4i.filter((x) => x.parameter == 'PERIODO24HRSI')[0]?.value ||
          null;
        this.G_PORGARSERI =
          query4i.filter((x) => x.parameter == 'PORGARSERI')[0]?.value || null;
        this.G_PERIGARCUMSEI =
          query4i.filter((x) => x.parameter == 'PERIGARCUMSEI')[0]?.value ||
          null;
        this.G_PORGARCUMSE =
          query4i.filter((x) => x.parameter == 'PORGARCUMSE')[0]?.value || null;
        this.G_PERIODO60LIQSEI =
          query4i.filter((x) => x.parameter == 'PERIODO60LIQSEI')[0]?.value ||
          null;
        this.G_PENA10SMSEI =
          query4i.filter((x) => x.parameter == 'PENA10SMSEI')[0]?.value || null;
        this.G_PENA5SEI =
          query4i.filter((x) => x.parameter == 'PENA%5SEI')[0]?.value || null;

        if (!this.G_GARANTSERI)
          return {
            statusCode: 400,
            message: ['No se encontro el dato GARANTSERI'],
          };
        if (!this.G_PERIODO24HRSSI)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PERIODO24HRSI'],
          };
        if (!this.G_PORGARSERI)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PORGARSERI'],
          };
        if (!this.G_PERIGARCUMSEI)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PERIGARCUMSEI'],
          };
        if (!this.G_PORGARCUMSE)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PORGARCUMSE'],
          };
        if (!this.G_PERIODO60LIQSEI)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PERIODO60LIQSEI'],
          };
        if (!this.G_PENA10SMSEI)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PENA10SMSEI'],
          };
        if (!this.G_PENA5SEI)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PENA%5SEI'],
          };

        /**
                                 * 
                                 * 
                                 *  FECH_GS  :   OBTENER_POST_FECHA_HABIL (FECHA_F ,  G_PERIODO24HRSSI);
                                        FECH_GAR : OBTENER_POST_FECHA_HABIL (FECHA_F ,  G_PERIGARCUMSEI);
                                        LIQ_I : OBTENER_POST_FECHA_HABIL (FECHA_F ,  G_PERIODO60LIQSEI);
                                        LIQ_EXT :   OBTENER_POST_FECHA_HABIL (LIQ_I , G_PERIGARCUMSEI);
                
                                 */
      }

      if (this.G_TPEVENTO == 1 && this.G_DIRECCION == 'M') {
        if (!comerEvent.notificationDate)
          return {
            statusCode: 400,
            message: ['La fecha de notificacion viene vacia.'],
          };
        this.FECHA_N = comerEvent.notificationDate;

        const query1m = await this.entity2
          .createQueryBuilder('table')
          .where(`direccion = :address`, { address: this.G_DIRECCION })
          .andWhere(`id_tpevento= :event`, { event: this.G_TPEVENTO })
          .andWhere("parametro = 'NUMLOTSPM'")
          .orWhere("parametro = 'GARANTXLOTE'")
          .orWhere("parametro = 'PERILIQSPBM'")
          .orWhere("parametro = 'PERILIQEXTSPM'")
          .getMany();

        this.G_NUMLOTSPM =
          query1m.filter((x) => x.parameter == 'NUMLOTSPM')[0]?.value || null;
        this.G_GARANTXLOTE =
          query1m.filter((x) => x.parameter == 'GARANTXLOTE')[0]?.value || null;
        this.G_PERILIQSPBM =
          query1m.filter((x) => x.parameter == 'PERILIQSPBM')[0]?.value || null;
        this.G_PERILIQEXTSPM =
          query1m.filter((x) => x.parameter == 'PERILIQEXTSPM')[0]?.value ||
          null;

        if (!this.G_NUMLOTSPM)
          return {
            statusCode: 400,
            message: ['No se encontro el dato NUMLOTSPM'],
          };
        if (!this.G_GARANTXLOTE)
          return {
            statusCode: 400,
            message: ['No se encontro el dato GARANTXLOTE'],
          };
        if (!this.G_PERILIQSPBM)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PERILIQSPBM'],
          };
        if (!this.G_PERILIQEXTSPM)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PERILIQEXTSPM'],
          };

        /*
                                
                                   LIQ_I : OBTENER_POST_FECHA_HABIL (FECHA_F ,  G_PERILIQSPBM);
                                        LIQ_EXT :   OBTENER_POST_FECHA_HABIL (LIQ_I , G_PERILIQEXTSPM);
                                */
      }

      if (this.G_TPEVENTO == 2 && this.G_DIRECCION == 'I') {
        if (!comerEvent.notificationDate)
          return {
            statusCode: 400,
            message: ['La fecha de notificacion viene vacia.'],
          };
        this.FECHA_N = comerEvent.notificationDate;

        const query1m = await this.entity2
          .createQueryBuilder('table')
          .where(`direccion = :address`, { address: this.G_DIRECCION })
          .andWhere(`id_tpevento= :event`, { event: this.G_TPEVENTO })
          .andWhere("parametro = 'GARSERLP'")
          .orWhere("parametro = 'PERGARCUMLP'")
          .orWhere("parametro = 'PORCGARCUMLP'")
          .orWhere("parametro = 'PERPAGANTLP'")
          .orWhere("parametro = 'PORPAGANTLP'")
          .orWhere("parametro = 'PERLIQLP'")
          .orWhere("parametro = 'PERLIQEXTLP'")
          .getMany();

        this.G_GARSERLP =
          query1m.filter((x) => x.parameter == 'GARSERLP')[0]?.value || null;
        this.G_PERGARCUMLP =
          query1m.filter((x) => x.parameter == 'PERGARCUMLP')[0]?.value || null;
        this.G_PORCGARCUMLP =
          query1m.filter((x) => x.parameter == 'PORCGARCUMLP')[0]?.value ||
          null;
        this.G_PERPAGANTLP =
          query1m.filter((x) => x.parameter == 'PERPAGANTLP')[0]?.value || null;
        this.G_PORPAGANTLP =
          query1m.filter((x) => x.parameter == 'PORPAGANTLP')[0]?.value || null;
        this.G_PERLIQLP =
          query1m.filter((x) => x.parameter == 'PERLIQLP')[0]?.value || null;
        this.G_PERLIQEXTLP =
          query1m.filter((x) => x.parameter == 'PERLIQEXTLP')[0]?.value || null;

        if (!this.G_GARSERLP)
          return {
            statusCode: 400,
            message: ['No se encontro el dato GARSERLP'],
          };
        if (!this.G_PERGARCUMLP)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PERGARCUMLP'],
          };
        if (!this.G_PORCGARCUMLP)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PORCGARCUMLP'],
          };
        if (!this.G_PERPAGANTLP)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PERPAGANTLP'],
          };
        if (!this.G_PORPAGANTLP)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PORPAGANTLP'],
          };
        if (!this.G_PERLIQLP)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PERLIQLP'],
          };
        if (!this.G_PERLIQEXTLP)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PERLIQEXTLP'],
          };

        /*
                                
                                  FECH_GAR : OBTENER_POST_FECHA_HABIL (FECHA_F ,  G_PERGARCUMLP);
                                        PAG_ANT :   OBTENER_POST_FECHA_HABIL (LIQ_I , G_PERPAGANTLP);
                                        LIQ_I : OBTENER_POST_FECHA_HABIL (FECHA_F ,  G_PERLIQLP);
                                        LIQ_EXT :   OBTENER_POST_FECHA_HABIL (LIQ_I , G_PERLIQEXTLP)
                                */
      }

      if (this.G_TPEVENTO == 12 && this.G_DIRECCION == 'M') {
        if (!comerEvent.notificationDate)
          return {
            statusCode: 400,
            message: ['La fecha de notificacion viene vacia.'],
          };
        this.FECHA_N = comerEvent.notificationDate;

        const query1m = await this.entity2
          .createQueryBuilder('table')
          .where(`direccion = :address`, { address: this.G_DIRECCION })
          .andWhere(`id_tpevento= :event`, { event: this.G_TPEVENTO })
          .andWhere("parametro = 'PORCGCRM'")
          .orWhere("parametro = 'PERIODOLRM'")
          .orWhere("parametro = 'PENA10SMRM'")
          .orWhere("parametro = 'PENA5PORCRM'")
          .orWhere("parametro = 'PERIODOLERM'")

          .getMany();

        this.G_PORCGCRM =
          query1m.filter((x) => x.parameter == 'PORCGCRM')[0]?.value || null;
        this.G_PERIODOLRM =
          query1m.filter((x) => x.parameter == 'PERIODOLRM')[0]?.value || null;
        this.G_PENA10SMRM =
          query1m.filter((x) => x.parameter == 'PENA10SMRM')[0]?.value || null;
        this.G_PENA5PORCRM =
          query1m.filter((x) => x.parameter == 'PENA5PORCRM')[0]?.value || null;
        this.G_PERIODOLERM =
          query1m.filter((x) => x.parameter == 'PERIODOLERM')[0]?.value || null;

        if (!this.G_NUMLOTSPM)
          return {
            statusCode: 400,
            message: ['No se encontro el dato NUMLOTSPM'],
          };
        if (!this.G_GARANTXLOTE)
          return {
            statusCode: 400,
            message: ['No se encontro el dato GARANTXLOTE'],
          };
        if (!this.G_PERILIQSPBM)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PERILIQSPBM'],
          };
        if (!this.G_PERILIQEXTSPM)
          return {
            statusCode: 400,
            message: ['No se encontro el dato PERILIQEXTSPM'],
          };

        //      const fecha = await this.entity.query(`select sera.OBTENER_POST_FECHA_HABIL('${this.FECHA_F}',${this.G_PERIODOLRM || 0}) as value`)

        /*
                                
                                   LIQ_I : OBTENER_POST_FECHA_HABIL (FECHA_F ,  G_PERIODOLRM);
                                        LIQ_EXT :   OBTENER_POST_FECHA_HABIL (LIQ_I , G_PERIODOLERM);
                                */
      }

      return { statusCode: 200, message: ['OK'] };
    } else {
      return { statusCode: 400, message: ['No se encontro el registro.'] };
    }
  }

  async getParameters(parameters: ParametersValues) {
    parameters.address = parameters.address.toUpperCase();

    const q1: any[] = await this.entity.query(` SELECT    VALOR 
                FROM    sera.COMER_PARAMETROSMOD PAR, sera.COMER_EVENTOS EVE
                WHERE    PAR.PARAMETRO = 'NUMLOTGARLICP'
                AND        PAR.DIRECCION = 'C'
                AND        EVE.ID_EVENTO = ${parameters.eventId} 
                AND        PAR.ID_TPEVENTO = EVE.ID_TPEVENTO`);
    if (q1.length > 0) {
      this.G_NUMLOTES = q1[0].valor;

      const unitResp = await this.entity2.findOne({
        where: { tpeventId: null, parameter: 'UR', address: 'C' },
      });
      if (!unitResp)
        return { statusCode: 400, message: ['NO EXISTE EL PARAMETRO UR'] };
      this.G_UR = unitResp.value;

      const q2 = await this.entity2.findOne({
        where: {
          tpeventId: null,
          parameter: 'TPOPERACION',
          address: parameters.address,
        },
      });
      if (!q2)
        return {
          statusCode: 400,
          message: [
            `NO EXISTE EL PARAMETRO TPOPERACION PARA LA DIRECCION ${parameters.address}`,
          ],
        };
      this.G_TPOPERACION = parseInt(q2.value);

      const q3 = await this.entity2.findOne({
        where: { parameter: 'TPOINGRESO', address: parameters.address },
      });
      if (!q3)
        return {
          statusCode: 400,
          message: [
            `NO EXISTE EL PARAMETRO TPOPERACION PARA LA DIRECCION ${parameters.address}`,
          ],
        };
      this.G_TPOINGRESO = q3.value;

      const q4 = await this.entity2.findOne({
        where: {
          tpeventId: null,
          parameter: 'AREA',
          address: parameters.address,
        },
      });
      if (!q4)
        return {
          statusCode: 400,
          message: [
            `NO EXISTE EL PARAMETRO TPOPERACION PARA LA DIRECCION ${parameters.address}`,
          ],
        };
      this.G_AREA = q4.value;

      const q5 = await this.entity2.findOne({
        where: { parameter: 'TPODOCUMENTO', address: 'C' },
      });
      if (!q5)
        return {
          statusCode: 400,
          message: [`NO EXISTE EL PARAMETRO TPODOCUMENTO`],
        };
      this.G_TPODOC = q5.value;

      const q6 = await this.entity2.findOne({
        where: { parameter: 'ANEXO', address: 'C' },
      });
      if (!q6)
        return { statusCode: 400, message: [`NO EXISTE EL PARAMETRO ANEXO`] };
      this.G_ANEXO = q6.value;

      const q7 = await this.entity2.findOne({
        where: { parameter: 'RETXCHATARRA', address: 'M' },
      });
      if (!q7)
        return {
          statusCode: 400,
          message: [`NO EXISTE EL PARAMETRO RETXCHATARRA`],
        };
      this.G_PCTCHATARRA = parseInt(q7.value);

      const q8 = await this.entity2.findOne({
        where: { parameter: 'IVA', address: 'C' },
      });
      if (!q8)
        return { statusCode: 400, message: [`NO EXISTE EL PARAMETRO IVA`] };
      this.G_IVA = (1 + parseInt(q8.value)) / 100;
      this.G_TASAIVA = parseInt(q8.value);

      const q9 = await this.entity2.findOne({
        where: { parameter: 'TPOINGRESOP', address: parameters.address },
      });
      if (!q9)
        return {
          statusCode: 400,
          message: [
            `NO EXISTE EL PARAMETRO TPOPERACION PARA LA DIRECCION ${parameters.address}`,
          ],
        };
      this.G_TPOINGRESOP = q9.value;

      const q0 = await this.entity2.findOne({
        where: { parameter: 'TPOINGRESOD', address: parameters.address },
      });
      if (!q0)
        return {
          statusCode: 400,
          message: [
            `NO EXISTE EL PARAMETRO TPOPERACION PARA LA DIRECCION ${parameters.address}`,
          ],
        };
      this.G_TPOINGRESOD = q0.value;

      return { statusCode: 200, message: ['OK'], data: [] };
    }

    return {
      statusCode: 400,
      message: ['NO EXISTE EL PARAMETRO NUMLOTGARLICP PARA EL TIPO DE EVENTO'],
      data: null,
    };
  }

  async presencialBM(params: PresencialBM) {
    var V_ID_CLIENTE = 0;

    var C_MONTOIVA = 0;
    var C_IVA = 0;
    var C_NOMONIVA = 0;
    var V3_ID_LOTE = 0;
    var V3_ANTICIPO = 0;

    var V3_MANDA = 0;
    var V3_PCIVA = 0;

    var TMP_IDPAGO = 0;
    var TMP_REFE = '';
    var TMP_MONTO = 0;
    var TMP_MONTO_INI = 0;
    var TMP_MONTO_FIN = 0;
    var TMP_MONTO_2 = 0;
    var TMP_MONTO_3 = 0;
    var TMP_MONTO_4 = 0;
    var TMP_MONTO_5 = 0;
    var TMP_MONTO_6 = 0;
    var TMP_MONTO_7 = 0;
    var TMP_MONTO_8 = 0;
    var TMP_MONTO_9 = 0;
    var TMP_MONTO_10 = 0;
    var TMP_MONTO_11 = 0;
    var TMP_MONTO_12 = 0;
    var TMP_MONTO_13 = 0;
    var TMP_MONTO_14 = 0;
    var TMP_MONTO_15 = 0;
    var TMP_MONTO_16 = 0;
    var TMP_MONTO_17 = 0;
    var TMP_MONTO_18 = 0;
    var TMP_MONTO_19 = 0;
    var TMP_MONTO_20 = 0;
    var TMP_MONTO_21 = 0;
    var TMP_ABONO = 0;
    var NEW_ABONO = 0;
    var DEBEPAGAR = 0;
    var YAPAGO = 0;
    var MONTO_DEV = 0;
    var TMP_PAGOACT = 0;
    var TMP_PAGOACT1 = 0;

    const dateNow = LocalDate.getNow();

    this.G_EVENTO = params.eventId;

    const SPBM_CLIENTE: any[] = await this.entity
      .query(`SELECT  DISTINCT(LOT_1.ID_CLIENTE) 
                        FROM  sera.COMER_LOTES LOT_1
                WHERE  LOT_1.ID_EVENTO = ${params.eventId} 
                        AND  EXISTS (SELECT  1
                                        FROM  sera.COMER_CLIENTESXEVENTO CXE
                                WHERE  CXE.ID_EVENTO = ${params.eventId} 
                                        AND  CXE.ID_CLIENTE = LOT_1.ID_CLIENTE
                                        AND  CXE.PROCESAR = 'S'
                                        )
                        AND  LOT_1.PRECIO_FINAL > 0
                        AND  LOT_1.VALIDO_SISTEMA IS NULL
                ORDER  BY LOT_1.ID_CLIENTE`);

    const SPBM_PAGOS = async (client: number) => {
      return await this.entity.query(`SELECT ID_PAGO, REFERENCIA, MONTO
                                FROM sera.COMER_PAGOREF PAG 
                                WHERE ID_LOTE IN (
                                SELECT LOTPAG.ID_LOTE
                                FROM sera.COMER_LOTES LOTPAG
                                WHERE LOTPAG.ID_EVENTO = ${params.eventId} 
                                AND LOTPAG.ID_CLIENTE = ${client} 
                                AND EXISTS (SELECT * 
                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE CXE.ID_EVENTO = ${params.eventId} 
                                                AND CXE.ID_CLIENTE = LOTPAG.ID_CLIENTE
                                                AND CXE.PROCESAR = 'S'
                                                )
                                AND LOTPAG.PRECIO_FINAL > 0
                                )
                                AND PAG.VALIDO_SISTEMA = 'A'
                                AND PAG.FECHA <= '${params.date}'
                                AND PAG.IDORDENINGRESO IS NULL
                                AND PAG.REFERENCIA LIKE '1%'
                        ORDER BY 1`);
    };

    const SPBM_DATOS_LOTE = async (client: number) => {
      return await this.entity.query(` SELECT  LOT_3.LOTE_PUBLICO,
                                LOT_3.ID_LOTE,
                                        LOT_3.ANTICIPO,
                                        LOT_3.MONTO_LIQ,
                                        LOT_3.PRECIO_FINAL,
                                        LOT_3.ID_CLIENTE,
                                        LOT_3.NO_TRANSFERENTE,
                                        LOT_3.PORC_APP_IVA as pciva,
                                        LOT_3.PORC_NOAPP_IVA
                                FROM  sera.COMER_LOTES LOT_3
                                WHERE  LOT_3.ID_EVENTO = ${params.eventId} 
                                AND  LOT_3.ID_CLIENTE = ${V_ID_CLIENTE} 
                                AND  EXISTS (SELECT  1
                                                FROM  sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE  CXE.ID_EVENTO = ${params.eventId} 
                                                AND  CXE.ID_CLIENTE = LOT_3.ID_CLIENTE
                                                AND  CXE.PROCESAR = 'S'
                                                )
                                AND  LOT_3.ID_ESTATUSVTA IN ('VEN')
                                AND  LOT_3.PRECIO_FINAL > 0
                                AND  LOT_3.VALIDO_SISTEMA IS NULL
                                ORDER  BY LOT_3.LOTE_PUBLICO`);
    };

    const L_PARAMETROS = await this.getParameters({
      eventId: params.eventId,
      address: 'M',
    });

    if (!params.lot) {
      if (params.phase == 1) {
        await this.actEstLotesMue(params.eventId);
        await this.borraMuebles(params.eventId, null, null);
        this.G_PKREFGEN = 0;

        for (const element of SPBM_CLIENTE) {
          V_ID_CLIENTE = element.id_cliente;
          const SPBM_PAGOS_R: any[] = await SPBM_PAGOS(V_ID_CLIENTE);
          for (const element2 of SPBM_PAGOS_R) {
            await this.entity.query(`
                                                        INSERT INTO sera.TMP_PAGOSGENS_DEP(ID_PAGOGENS,  ID_PAGO,           REFERENCIA,    MONTO,      NO_NOMBRAMIENTO, ABONO, STATUS)
                                                        VALUES (${V_ID_CLIENTE}, ${element2.id_pago},'${element2.referencia}' , ${element2.monto}, ${V_ID_CLIENTE},     0,         'A');
                                                `);
          }
          const SPBM_DATOS_LOTE_R: any[] = await SPBM_DATOS_LOTE(V_ID_CLIENTE);
          for (const element2 of SPBM_DATOS_LOTE_R) {
            V3_MANDA = element2.no_transferente;
            V3_PCIVA = element2.pciva;
            V3_ID_LOTE = element2.id_lote;
            V3_ANTICIPO = element2.anticipo;
            V3_MANDA = element2.no_transferente;
            V3_PCIVA = element2.pciva;
            var r: any[] = await this.entity
              .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                        FROM sera.TMP_PAGOSGENS_DEP
                                                WHERE ABONO >= 0
                                                        AND STATUS = 'A'
                                                        limit 1`);
            if (r.length == 0)
              return {
                statusCode: 400,
                message: ['ERROR AL OBTENER DATOS DE LA TEMPORAL...'],
              };

            TMP_IDPAGO = r[0].id_pago;
            TMP_REFE = r[0].referencia;
            TMP_MONTO_INI = r[0].monto;
            TMP_ABONO = r[0].abono;

            if (TMP_ABONO > 0) {
              TMP_MONTO = TMP_MONTO_INI - TMP_ABONO;
            } else {
              TMP_MONTO = TMP_MONTO_INI;
            }

            if (TMP_MONTO < V3_ANTICIPO) {
              NEW_ABONO = TMP_MONTO;
              DEBEPAGAR = V3_ANTICIPO;

              await this.iniDGenRef(params.eventId);

              C_MONTOIVA = parseFloat(
                ((TMP_MONTO * V3_PCIVA) / this.G_IVA).toFixed(2),
              );

              C_IVA = parseFloat(
                (TMP_MONTO * V3_PCIVA - C_MONTOIVA).toFixed(2),
              );

              C_NOMONIVA = TMP_MONTO - TMP_MONTO;

              this.G_PKREFGEN = this.G_PKREFGEN + 1;

              if (TMP_MONTO > 0) {
                await this.entity.query(`
                                                                INSERT INTO sera.COMER_PAGOSREFGENS
                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                 MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                )
                                                                VALUES
                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                 ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                )`);
              }
              if (NEW_ABONO == TMP_MONTO) {
                await this.entity.query(`
                                                                        UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                SET ABONO = ${NEW_ABONO},
                                                                                STATUS = 'S'
                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                AND REFERENCIA = ${TMP_REFE}
                                                                `);
              } else {
                await this.entity.query(` UPDATE TMP_PAGOSGENS_DEP
                                                                                SET ABONO = ${NEW_ABONO},
                                                                                STATUS = 'A'
                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                AND REFERENCIA = ${TMP_REFE}`);
              }
              YAPAGO = TMP_MONTO;

              const payment: any[] = await this.entity.query(`
                                                                SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                FROM sera.TMP_PAGOSGENS_DEP
                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                AND ABONO >= 0 
                                                                AND STATUS = 'A' 
                                                                limit 1
                                                        `);
              if (payment.length > 0) {
                TMP_IDPAGO = payment[0].id_pago;
                TMP_REFE = payment[0].referencia;
                TMP_MONTO = payment[0].monto;
                TMP_ABONO = payment[0].abono;
              }
              TMP_MONTO_2 = TMP_MONTO + YAPAGO;

              if (TMP_MONTO_2 < DEBEPAGAR) {
                NEW_ABONO = TMP_MONTO;

                await this.iniDGenRef(params.eventId);

                C_MONTOIVA = parseFloat(
                  ((TMP_MONTO * V3_PCIVA) / this.G_IVA).toFixed(2),
                );
                C_IVA = parseFloat(
                  (TMP_MONTO * V3_PCIVA - C_MONTOIVA).toFixed(2),
                );
                C_NOMONIVA = TMP_MONTO - TMP_MONTO;
                this.G_PKREFGEN = this.G_PKREFGEN + 1;
                if (TMP_MONTO > 0) {
                  await this.entity.query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                         MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                        )
                                                                        VALUES
                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                         ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE))`);
                }
                if (NEW_ABONO == TMP_MONTO) {
                  await this.entity.query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                        SET ABONO = ${NEW_ABONO},
                                                                            STATUS = 'S'
                                                                      WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                        AND REFERENCIA = ${TMP_REFE};`);
                } else {
                  await this.entity.query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                        SET ABONO = ${NEW_ABONO},
                                                                            STATUS = 'A'
                                                                      WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                        AND REFERENCIA = ${TMP_REFE};`);
                }

                YAPAGO = TMP_MONTO_2;

                const payment3: any[] = await this.entity
                  .query(`SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                FROM sera.TMP_PAGOSGENS_DEP
                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                AND ABONO >= 0
                                                                                AND STATUS = 'A'
                                                                                limit 1`);

                if (payment3.length > 0) {
                  TMP_IDPAGO = payment3[0].id_pago;
                  TMP_REFE = payment3[0].referencia;
                  TMP_MONTO = payment3[0].monto;
                  TMP_ABONO = payment3[0].abono;
                }
                TMP_MONTO_3 = TMP_MONTO + YAPAGO;

                if (TMP_MONTO_3 < DEBEPAGAR) {
                  NEW_ABONO = TMP_MONTO;
                  await this.iniDGenRef(params.eventId);
                  C_MONTOIVA = parseFloat(
                    ((TMP_MONTO * V3_PCIVA) / this.G_IVA).toFixed(2),
                  );
                  C_IVA = parseFloat(
                    (TMP_MONTO * V3_PCIVA - C_MONTOIVA).toFixed(2),
                  );
                  C_NOMONIVA = TMP_MONTO - TMP_MONTO;
                  this.G_PKREFGEN = this.G_PKREFGEN + 1;

                  if (TMP_MONTO > 0) {
                    await this.entity
                      .query(` INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                 MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                )
                                                                                VALUES
                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                 ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                )`);
                  }

                  if (NEW_ABONO == TMP_MONTO) {
                    await this.entity.query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                SET ABONO = ${NEW_ABONO},
                                                                                    STATUS = 'S'
                                                                              WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                AND REFERENCIA = ${TMP_REFE}`);
                  } else {
                    await this.entity.query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                SET ABONO = ${NEW_ABONO},
                                                                                    STATUS = 'A'
                                                                              WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                AND REFERENCIA = ${TMP_REFE}`);
                  }
                  YAPAGO = TMP_MONTO_3;

                  const payment4 = await this.entity
                    .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                FROM sera.TMP_PAGOSGENS_DEP
                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                AND ABONO >= 0
                                                                                AND STATUS = 'A' 
                                                                                limit 1`);
                  if (payment4.length > 0) {
                    TMP_IDPAGO = payment4[0].id_pago;
                    TMP_REFE = payment4[0].referencia;
                    TMP_MONTO = payment4[0].monto;
                    TMP_ABONO = payment4[0].abono;
                  }
                  TMP_MONTO_4 = TMP_MONTO + YAPAGO;
                  if (TMP_MONTO_4 < DEBEPAGAR) {
                    NEW_ABONO = TMP_MONTO;
                    await this.iniDGenRef(params.eventId);

                    C_MONTOIVA = parseFloat(
                      ((TMP_MONTO * V3_PCIVA) / this.G_IVA).toFixed(2),
                    );
                    C_IVA = parseFloat(
                      (TMP_MONTO * V3_PCIVA - C_MONTOIVA).toFixed(2),
                    );
                    C_NOMONIVA = TMP_MONTO - TMP_MONTO;
                    this.G_PKREFGEN = this.G_PKREFGEN + 1;

                    if (TMP_MONTO > 0) {
                      await this.entity
                        .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                         MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                        )
                                                                                        VALUES
                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                         ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                        )`);
                    }
                    if (NEW_ABONO == TMP_MONTO) {
                      await this.entity.query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                            STATUS = 'S'
                                                                                      WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                    } else {
                      await this.entity.query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                            STATUS = 'A'
                                                                                      WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                    }
                    YAPAGO = TMP_MONTO_4;

                    const payment5 = await this.entity
                      .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                FROM sera.TMP_PAGOSGENS_DEP
                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                AND ABONO >= 0
                                                                                AND STATUS = 'A' 
                                                                                limit 1`);
                    if (payment5.length > 0) {
                      TMP_IDPAGO = payment5[0].id_pago;
                      TMP_REFE = payment5[0].referencia;
                      TMP_MONTO = payment5[0].monto;
                      TMP_ABONO = payment5[0].abono;
                    }

                    TMP_MONTO_5 = TMP_MONTO + YAPAGO;

                    if (TMP_MONTO_5 < DEBEPAGAR) {
                      NEW_ABONO = TMP_MONTO;
                      await this.iniDGenRef(params.eventId);

                      C_MONTOIVA = parseFloat(
                        ((TMP_MONTO * V3_PCIVA) / this.G_IVA).toFixed(2),
                      );
                      C_IVA = parseFloat(
                        (TMP_MONTO * V3_PCIVA - C_MONTOIVA).toFixed(2),
                      );
                      C_NOMONIVA = TMP_MONTO - TMP_MONTO;
                      this.G_PKREFGEN = this.G_PKREFGEN + 1;

                      if (TMP_MONTO > 0) {
                        await this.entity
                          .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                 MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                )
                                                                                                VALUES
                                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                 ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                )`);
                      }
                      if (NEW_ABONO == TMP_MONTO) {
                        await this.entity.query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                    STATUS = 'S'
                                                                                              WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                AND REFERENCIA = ${TMP_REFE}`);
                      } else {
                        await this.entity.query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                    STATUS = 'A'
                                                                                              WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                AND REFERENCIA = ${TMP_REFE};`);
                      }
                      YAPAGO = TMP_MONTO_5;

                      const payment6 = await this.entity
                        .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                        FROM sera.TMP_PAGOSGENS_DEP
                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                        AND ABONO >= 0
                                                                                        AND STATUS = 'A' 
                                                                                        limit 1`);
                      if (payment6.length > 0) {
                        TMP_IDPAGO = payment6[0].id_pago;
                        TMP_REFE = payment6[0].referencia;
                        TMP_MONTO = payment6[0].monto;
                        TMP_ABONO = payment6[0].abono;
                      }
                      TMP_MONTO_6 = TMP_MONTO + YAPAGO;
                      if (TMP_MONTO_6 < DEBEPAGAR) {
                        NEW_ABONO = TMP_MONTO;

                        await this.iniDGenRef(params.eventId);

                        C_MONTOIVA = parseFloat(
                          ((TMP_MONTO * V3_PCIVA) / this.G_IVA).toFixed(2),
                        );
                        C_IVA = parseFloat(
                          (TMP_MONTO * V3_PCIVA - C_MONTOIVA).toFixed(2),
                        );
                        C_NOMONIVA = TMP_MONTO - TMP_MONTO;
                        this.G_PKREFGEN = this.G_PKREFGEN + 1;

                        if (TMP_MONTO > 0) {
                          await this.entity
                            .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                         MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                        )
                                                                                                        VALUES
                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                         ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                        )`);
                        }
                        if (NEW_ABONO == TMP_MONTO) {
                          await this.entity.query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                            STATUS = 'S'
                                                                                                      WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                        } else {
                          await this.entity
                            .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                            STATUS = 'A'
                                                                                                      WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                        }
                        YAPAGO = TMP_MONTO_6;

                        const payment7 = await this.entity
                          .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                                FROM sera.TMP_PAGOSGENS_DEP
                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                AND ABONO >= 0
                                                                                                AND STATUS = 'A' 
                                                                                                limit 1`);
                        if (payment7.length > 0) {
                          TMP_IDPAGO = payment7[0].id_pago;
                          TMP_REFE = payment7[0].referencia;
                          TMP_MONTO = payment7[0].monto;
                          TMP_ABONO = payment7[0].abono;
                        }
                        TMP_MONTO_7 = TMP_MONTO + YAPAGO;
                        if (TMP_MONTO_7 < DEBEPAGAR) {
                          NEW_ABONO = TMP_MONTO;

                          await this.iniDGenRef(params.eventId);

                          C_MONTOIVA = parseFloat(
                            ((TMP_MONTO * V3_PCIVA) / this.G_IVA).toFixed(2),
                          );
                          C_IVA = parseFloat(
                            (TMP_MONTO * V3_PCIVA - C_MONTOIVA).toFixed(2),
                          );
                          C_NOMONIVA = TMP_MONTO - TMP_MONTO;
                          this.G_PKREFGEN = this.G_PKREFGEN + 1;

                          if (TMP_MONTO > 0) {
                            await this.entity
                              .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                               (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                               )
                                                                                                               VALUES
                                                                                                               (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                               )`);
                          }
                          if (NEW_ABONO == TMP_MONTO) {
                            await this.entity
                              .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                               SET ABONO = ${NEW_ABONO},
                                                                                                                   STATUS = 'S'
                                                                                                             WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                               AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                               AND REFERENCIA = ${TMP_REFE}`);
                          } else {
                            await this.entity
                              .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                               SET ABONO = ${NEW_ABONO},
                                                                                                                   STATUS = 'A'
                                                                                                             WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                               AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                               AND REFERENCIA = ${TMP_REFE};`);
                          }
                          YAPAGO = TMP_MONTO_7;

                          const payment8 = await this.entity
                            .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                                       FROM sera.TMP_PAGOSGENS_DEP
                                                                                                       WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                       AND ABONO >= 0
                                                                                                       AND STATUS = 'A' 
                                                                                                       limit 1`);
                          if (payment8.length > 0) {
                            TMP_IDPAGO = payment8[0].id_pago;
                            TMP_REFE = payment8[0].referencia;
                            TMP_MONTO = payment8[0].monto;
                            TMP_ABONO = payment8[0].abono;
                          }
                          TMP_MONTO_8 = TMP_MONTO + YAPAGO;

                          if (TMP_MONTO_8 < DEBEPAGAR) {
                            NEW_ABONO = TMP_MONTO;
                            await this.iniDGenRef(params.eventId);
                            C_MONTOIVA = parseFloat(
                              ((TMP_MONTO * V3_PCIVA) / this.G_IVA).toFixed(2),
                            );
                            C_IVA = parseFloat(
                              (TMP_MONTO * V3_PCIVA - C_MONTOIVA).toFixed(2),
                            );
                            C_NOMONIVA = TMP_MONTO - TMP_MONTO;
                            this.G_PKREFGEN = this.G_PKREFGEN + 1;

                            if (TMP_MONTO > 0) {
                              await this.entity
                                .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                        )
                                                                                                                        VALUES
                                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                        )`);
                            }
                            if (NEW_ABONO == TMP_MONTO) {
                              await this.entity
                                .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                        STATUS = 'S'
                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                            } else {
                              await this.entity
                                .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                        STATUS = 'A'
                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                            }
                            YAPAGO = TMP_MONTO_8;

                            const payment9 = await this.entity
                              .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                                                FROM sera.TMP_PAGOSGENS_DEP
                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                AND ABONO >= 0
                                                                                                                AND STATUS = 'A' 
                                                                                                                limit 1`);
                            if (payment9.length > 0) {
                              TMP_IDPAGO = payment9[0].id_pago;
                              TMP_REFE = payment9[0].referencia;
                              TMP_MONTO = payment9[0].monto;
                              TMP_ABONO = payment9[0].abono;
                            }
                            TMP_MONTO_9 = TMP_MONTO + YAPAGO;

                            if (TMP_MONTO_9 < DEBEPAGAR) {
                              NEW_ABONO = TMP_MONTO;
                              await this.iniDGenRef(params.eventId);
                              C_MONTOIVA = parseFloat(
                                ((TMP_MONTO * V3_PCIVA) / this.G_IVA).toFixed(
                                  2,
                                ),
                              );
                              C_IVA = parseFloat(
                                (TMP_MONTO * V3_PCIVA - C_MONTOIVA).toFixed(2),
                              );
                              C_NOMONIVA = TMP_MONTO - TMP_MONTO;
                              this.G_PKREFGEN = this.G_PKREFGEN + 1;

                              if (TMP_MONTO > 0) {
                                await this.entity
                                  .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                )
                                                                                                                                VALUES
                                                                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                )`);
                              }
                              if (NEW_ABONO == TMP_MONTO) {
                                await this.entity
                                  .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                STATUS = 'S'
                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                AND REFERENCIA = ${TMP_REFE}`);
                              } else {
                                await this.entity
                                  .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                STATUS = 'A'
                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                AND REFERENCIA = ${TMP_REFE};`);
                              }
                              YAPAGO = TMP_MONTO_9;

                              const payment10 = await this.entity
                                .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                                                        FROM sera.TMP_PAGOSGENS_DEP
                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                        AND ABONO >= 0
                                                                                                                        AND STATUS = 'A' 
                                                                                                                        limit 1`);
                              if (payment10.length > 0) {
                                TMP_IDPAGO = payment10[0].id_pago;
                                TMP_REFE = payment10[0].referencia;
                                TMP_MONTO = payment10[0].monto;
                                TMP_ABONO = payment10[0].abono;
                              }
                              TMP_MONTO_10 = TMP_MONTO + YAPAGO;
                              if (TMP_MONTO_10 < DEBEPAGAR) {
                                NEW_ABONO = TMP_MONTO;
                                await this.iniDGenRef(params.eventId);
                                C_MONTOIVA = parseFloat(
                                  ((TMP_MONTO * V3_PCIVA) / this.G_IVA).toFixed(
                                    2,
                                  ),
                                );
                                C_IVA = parseFloat(
                                  (TMP_MONTO * V3_PCIVA - C_MONTOIVA).toFixed(
                                    2,
                                  ),
                                );
                                C_NOMONIVA = TMP_MONTO - TMP_MONTO;
                                this.G_PKREFGEN = this.G_PKREFGEN + 1;

                                if (TMP_MONTO > 0) {
                                  await this.entity
                                    .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                        )
                                                                                                                                        VALUES
                                                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                        )`);
                                }
                                if (NEW_ABONO == TMP_MONTO) {
                                  await this.entity
                                    .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                        STATUS = 'S'
                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                                } else {
                                  await this.entity
                                    .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                        STATUS = 'A'
                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                                }
                                YAPAGO = TMP_MONTO_10;

                                const payment11 = await this.entity
                                  .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                                                                FROM sera.TMP_PAGOSGENS_DEP
                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                AND ABONO >= 0
                                                                                                                                AND STATUS = 'A' 
                                                                                                                                limit 1`);
                                if (payment11.length > 0) {
                                  TMP_IDPAGO = payment11[0].id_pago;
                                  TMP_REFE = payment11[0].referencia;
                                  TMP_MONTO = payment11[0].monto;
                                  TMP_ABONO = payment11[0].abono;
                                }
                                TMP_MONTO_11 = TMP_MONTO + YAPAGO;
                                if (TMP_MONTO_11 < DEBEPAGAR) {
                                  NEW_ABONO = TMP_MONTO;
                                  await this.iniDGenRef(params.eventId);
                                  C_MONTOIVA = parseFloat(
                                    (
                                      (TMP_MONTO * V3_PCIVA) /
                                      this.G_IVA
                                    ).toFixed(2),
                                  );
                                  C_IVA = parseFloat(
                                    (TMP_MONTO * V3_PCIVA - C_MONTOIVA).toFixed(
                                      2,
                                    ),
                                  );
                                  C_NOMONIVA = TMP_MONTO - TMP_MONTO;
                                  this.G_PKREFGEN = this.G_PKREFGEN + 1;

                                  if (TMP_MONTO > 0) {
                                    await this.entity
                                      .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                )
                                                                                                                                                VALUES
                                                                                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                )`);
                                  }
                                  if (NEW_ABONO == TMP_MONTO) {
                                    await this.entity
                                      .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                STATUS = 'S'
                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                AND REFERENCIA = ${TMP_REFE}`);
                                  } else {
                                    await this.entity
                                      .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                STATUS = 'A'
                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                AND REFERENCIA = ${TMP_REFE};`);
                                  }
                                  YAPAGO = TMP_MONTO_11;

                                  const payment12 = await this.entity
                                    .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                                                                        FROM sera.TMP_PAGOSGENS_DEP
                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                        AND ABONO >= 0
                                                                                                                                        AND STATUS = 'A' 
                                                                                                                                        limit 1`);
                                  if (payment12.length > 0) {
                                    TMP_IDPAGO = payment12[0].id_pago;
                                    TMP_REFE = payment12[0].referencia;
                                    TMP_MONTO = payment12[0].monto;
                                    TMP_ABONO = payment12[0].abono;
                                  }
                                  TMP_MONTO_12 = TMP_MONTO + YAPAGO;

                                  if (TMP_MONTO_12 < DEBEPAGAR) {
                                    NEW_ABONO = TMP_MONTO;
                                    await this.iniDGenRef(params.eventId);
                                    C_MONTOIVA = parseFloat(
                                      (
                                        (TMP_MONTO * V3_PCIVA) /
                                        this.G_IVA
                                      ).toFixed(2),
                                    );
                                    C_IVA = parseFloat(
                                      (
                                        TMP_MONTO * V3_PCIVA -
                                        C_MONTOIVA
                                      ).toFixed(2),
                                    );
                                    C_NOMONIVA = TMP_MONTO - TMP_MONTO;
                                    this.G_PKREFGEN = this.G_PKREFGEN + 1;

                                    if (TMP_MONTO > 0) {
                                      await this.entity
                                        .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                        )
                                                                                                                                                        VALUES
                                                                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                        )`);
                                    }
                                    if (NEW_ABONO == TMP_MONTO) {
                                      await this.entity
                                        .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                        STATUS = 'S'
                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                                    } else {
                                      await this.entity
                                        .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                        STATUS = 'A'
                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                                    }
                                    YAPAGO = TMP_MONTO_12;

                                    const payment13 = await this.entity
                                      .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                                                                                FROM sera.TMP_PAGOSGENS_DEP
                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                AND ABONO >= 0
                                                                                                                                                AND STATUS = 'A' 
                                                                                                                                                limit 1`);
                                    if (payment13.length > 0) {
                                      TMP_IDPAGO = payment13[0].id_pago;
                                      TMP_REFE = payment13[0].referencia;
                                      TMP_MONTO = payment13[0].monto;
                                      TMP_ABONO = payment13[0].abono;
                                    }
                                    TMP_MONTO_13 = TMP_MONTO + YAPAGO;

                                    if (TMP_MONTO_13 < DEBEPAGAR) {
                                      NEW_ABONO = TMP_MONTO;
                                      await this.iniDGenRef(params.eventId);
                                      C_MONTOIVA = parseFloat(
                                        (
                                          (TMP_MONTO * V3_PCIVA) /
                                          this.G_IVA
                                        ).toFixed(2),
                                      );
                                      C_IVA = parseFloat(
                                        (
                                          TMP_MONTO * V3_PCIVA -
                                          C_MONTOIVA
                                        ).toFixed(2),
                                      );
                                      C_NOMONIVA = TMP_MONTO - TMP_MONTO;
                                      this.G_PKREFGEN = this.G_PKREFGEN + 1;

                                      if (TMP_MONTO > 0) {
                                        await this.entity
                                          .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                )
                                                                                                                                                                VALUES
                                                                                                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                )`);
                                      }
                                      if (NEW_ABONO == TMP_MONTO) {
                                        await this.entity
                                          .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                STATUS = 'S'
                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                AND REFERENCIA = ${TMP_REFE}`);
                                      } else {
                                        await this.entity
                                          .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                STATUS = 'A'
                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                AND REFERENCIA = ${TMP_REFE};`);
                                      }
                                      YAPAGO = TMP_MONTO_13;

                                      const payment14 = await this.entity
                                        .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                                                                                        FROM sera.TMP_PAGOSGENS_DEP
                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                        AND ABONO >= 0
                                                                                                                                                        AND STATUS = 'A' 
                                                                                                                                                        limit 1`);
                                      if (payment14.length > 0) {
                                        TMP_IDPAGO = payment14[0].id_pago;
                                        TMP_REFE = payment14[0].referencia;
                                        TMP_MONTO = payment14[0].monto;
                                        TMP_ABONO = payment14[0].abono;
                                      }
                                      TMP_MONTO_14 = TMP_MONTO + YAPAGO;
                                      if (TMP_MONTO_14 < DEBEPAGAR) {
                                        NEW_ABONO = TMP_MONTO;
                                        await this.iniDGenRef(params.eventId);
                                        C_MONTOIVA = parseFloat(
                                          (
                                            (TMP_MONTO * V3_PCIVA) /
                                            this.G_IVA
                                          ).toFixed(2),
                                        );
                                        C_IVA = parseFloat(
                                          (
                                            TMP_MONTO * V3_PCIVA -
                                            C_MONTOIVA
                                          ).toFixed(2),
                                        );
                                        C_NOMONIVA = TMP_MONTO - TMP_MONTO;
                                        this.G_PKREFGEN = this.G_PKREFGEN + 1;

                                        if (TMP_MONTO > 0) {
                                          await this.entity
                                            .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                        )
                                                                                                                                                                        VALUES
                                                                                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                        )`);
                                        }
                                        if (NEW_ABONO == TMP_MONTO) {
                                          await this.entity
                                            .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                        STATUS = 'S'
                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                                        } else {
                                          await this.entity
                                            .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                        STATUS = 'A'
                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                                        }
                                        YAPAGO = TMP_MONTO_14;

                                        const payment15 = await this.entity
                                          .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                                                                                                FROM sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                AND ABONO >= 0
                                                                                                                                                                AND STATUS = 'A' 
                                                                                                                                                                limit 1`);
                                        if (payment15.length > 0) {
                                          TMP_IDPAGO = payment15[0].id_pago;
                                          TMP_REFE = payment15[0].referencia;
                                          TMP_MONTO = payment15[0].monto;
                                          TMP_ABONO = payment15[0].abono;
                                        }
                                        TMP_MONTO_15 = TMP_MONTO + YAPAGO;

                                        if (TMP_MONTO_15 < DEBEPAGAR) {
                                          NEW_ABONO = TMP_MONTO;
                                          await this.iniDGenRef(params.eventId);
                                          C_MONTOIVA = parseFloat(
                                            (
                                              (TMP_MONTO * V3_PCIVA) /
                                              this.G_IVA
                                            ).toFixed(2),
                                          );
                                          C_IVA = parseFloat(
                                            (
                                              TMP_MONTO * V3_PCIVA -
                                              C_MONTOIVA
                                            ).toFixed(2),
                                          );
                                          C_NOMONIVA = TMP_MONTO - TMP_MONTO;
                                          this.G_PKREFGEN = this.G_PKREFGEN + 1;

                                          if (TMP_MONTO > 0) {
                                            await this.entity
                                              .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                                )
                                                                                                                                                                                VALUES
                                                                                                                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                                                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                                )`);
                                          }
                                          if (NEW_ABONO == TMP_MONTO) {
                                            await this.entity
                                              .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                STATUS = 'S'
                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                AND REFERENCIA = ${TMP_REFE}`);
                                          } else {
                                            await this.entity
                                              .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                STATUS = 'A'
                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                AND REFERENCIA = ${TMP_REFE};`);
                                          }
                                          YAPAGO = TMP_MONTO_15;

                                          const payment16 = await this.entity
                                            .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                                                                                                        FROM sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                        AND ABONO >= 0
                                                                                                                                                                        AND STATUS = 'A' 
                                                                                                                                                                        limit 1`);
                                          if (payment16.length > 0) {
                                            TMP_IDPAGO = payment16[0].id_pago;
                                            TMP_REFE = payment16[0].referencia;
                                            TMP_MONTO = payment16[0].monto;
                                            TMP_ABONO = payment16[0].abono;
                                          }
                                          TMP_MONTO_16 = TMP_MONTO + YAPAGO;

                                          if (TMP_MONTO_16 < DEBEPAGAR) {
                                            NEW_ABONO = TMP_MONTO;
                                            await this.iniDGenRef(
                                              params.eventId,
                                            );
                                            C_MONTOIVA = parseFloat(
                                              (
                                                (TMP_MONTO * V3_PCIVA) /
                                                this.G_IVA
                                              ).toFixed(2),
                                            );
                                            C_IVA = parseFloat(
                                              (
                                                TMP_MONTO * V3_PCIVA -
                                                C_MONTOIVA
                                              ).toFixed(2),
                                            );
                                            C_NOMONIVA = TMP_MONTO - TMP_MONTO;
                                            this.G_PKREFGEN =
                                              this.G_PKREFGEN + 1;

                                            if (TMP_MONTO > 0) {
                                              await this.entity
                                                .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                                        )
                                                                                                                                                                                        VALUES
                                                                                                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                                                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                                        )`);
                                            }
                                            if (NEW_ABONO == TMP_MONTO) {
                                              await this.entity
                                                .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                        STATUS = 'S'
                                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                                            } else {
                                              await this.entity
                                                .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                        STATUS = 'A'
                                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                                            }
                                            YAPAGO = TMP_MONTO_16;

                                            const payment17 = await this.entity
                                              .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                                                                                                                FROM sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                AND ABONO >= 0
                                                                                                                                                                                AND STATUS = 'A' 
                                                                                                                                                                                limit 1`);
                                            if (payment17.length > 0) {
                                              TMP_IDPAGO = payment17[0].id_pago;
                                              TMP_REFE =
                                                payment17[0].referencia;
                                              TMP_MONTO = payment17[0].monto;
                                              TMP_ABONO = payment17[0].abono;
                                            }
                                            TMP_MONTO_17 = TMP_MONTO + YAPAGO;
                                            if (TMP_MONTO_17 < DEBEPAGAR) {
                                              NEW_ABONO = TMP_MONTO;
                                              await this.iniDGenRef(
                                                params.eventId,
                                              );
                                              C_MONTOIVA = parseFloat(
                                                (
                                                  (TMP_MONTO * V3_PCIVA) /
                                                  this.G_IVA
                                                ).toFixed(2),
                                              );
                                              C_IVA = parseFloat(
                                                (
                                                  TMP_MONTO * V3_PCIVA -
                                                  C_MONTOIVA
                                                ).toFixed(2),
                                              );
                                              C_NOMONIVA =
                                                TMP_MONTO - TMP_MONTO;
                                              this.G_PKREFGEN =
                                                this.G_PKREFGEN + 1;

                                              if (TMP_MONTO > 0) {
                                                await this.entity
                                                  .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                                                )
                                                                                                                                                                                                VALUES
                                                                                                                                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                                                                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                                                )`);
                                              }
                                              if (NEW_ABONO == TMP_MONTO) {
                                                await this.entity
                                                  .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                STATUS = 'S'
                                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                AND REFERENCIA = ${TMP_REFE}`);
                                              } else {
                                                await this.entity
                                                  .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                STATUS = 'A'
                                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                AND REFERENCIA = ${TMP_REFE};`);
                                              }
                                              YAPAGO = TMP_MONTO_17;

                                              const payment18 = await this
                                                .entity
                                                .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                                                                                                                        FROM sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                        AND ABONO >= 0
                                                                                                                                                                                        AND STATUS = 'A' 
                                                                                                                                                                                        limit 1`);
                                              if (payment18.length > 0) {
                                                TMP_IDPAGO =
                                                  payment18[0].id_pago;
                                                TMP_REFE =
                                                  payment18[0].referencia;
                                                TMP_MONTO = payment18[0].monto;
                                                TMP_ABONO = payment18[0].abono;
                                              }
                                              TMP_MONTO_18 = TMP_MONTO + YAPAGO;

                                              if (TMP_MONTO_18 < DEBEPAGAR) {
                                                NEW_ABONO = TMP_MONTO;
                                                await this.iniDGenRef(
                                                  params.eventId,
                                                );
                                                C_MONTOIVA = parseFloat(
                                                  (
                                                    (TMP_MONTO * V3_PCIVA) /
                                                    this.G_IVA
                                                  ).toFixed(2),
                                                );
                                                C_IVA = parseFloat(
                                                  (
                                                    TMP_MONTO * V3_PCIVA -
                                                    C_MONTOIVA
                                                  ).toFixed(2),
                                                );
                                                C_NOMONIVA =
                                                  TMP_MONTO - TMP_MONTO;
                                                this.G_PKREFGEN =
                                                  this.G_PKREFGEN + 1;

                                                if (TMP_MONTO > 0) {
                                                  await this.entity
                                                    .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                                                        )
                                                                                                                                                                                                        VALUES
                                                                                                                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                                                                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                                                        )`);
                                                }
                                                if (NEW_ABONO == TMP_MONTO) {
                                                  await this.entity
                                                    .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                        STATUS = 'S'
                                                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                                                } else {
                                                  await this.entity
                                                    .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                        STATUS = 'A'
                                                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                                                }
                                                YAPAGO = TMP_MONTO_18;

                                                const payment19 = await this
                                                  .entity
                                                  .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                                                                                                                                FROM sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                AND ABONO >= 0
                                                                                                                                                                                                AND STATUS = 'A' 
                                                                                                                                                                                                limit 1`);
                                                if (payment19.length > 0) {
                                                  TMP_IDPAGO =
                                                    payment19[0].id_pago;
                                                  TMP_REFE =
                                                    payment19[0].referencia;
                                                  TMP_MONTO =
                                                    payment19[0].monto;
                                                  TMP_ABONO =
                                                    payment19[0].abono;
                                                }
                                                TMP_MONTO_19 =
                                                  TMP_MONTO + YAPAGO;
                                                if (TMP_MONTO_19 < DEBEPAGAR) {
                                                  NEW_ABONO = TMP_MONTO;
                                                  await this.iniDGenRef(
                                                    params.eventId,
                                                  );
                                                  C_MONTOIVA = parseFloat(
                                                    (
                                                      (TMP_MONTO * V3_PCIVA) /
                                                      this.G_IVA
                                                    ).toFixed(2),
                                                  );
                                                  C_IVA = parseFloat(
                                                    (
                                                      TMP_MONTO * V3_PCIVA -
                                                      C_MONTOIVA
                                                    ).toFixed(2),
                                                  );
                                                  C_NOMONIVA =
                                                    TMP_MONTO - TMP_MONTO;
                                                  this.G_PKREFGEN =
                                                    this.G_PKREFGEN + 1;

                                                  if (TMP_MONTO > 0) {
                                                    await this.entity
                                                      .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                                                                )
                                                                                                                                                                                                                VALUES
                                                                                                                                                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                                                                                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                                                                )`);
                                                  }
                                                  if (NEW_ABONO == TMP_MONTO) {
                                                    await this.entity
                                                      .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                                STATUS = 'S'
                                                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                                AND REFERENCIA = ${TMP_REFE}`);
                                                  } else {
                                                    await this.entity
                                                      .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                                STATUS = 'A'
                                                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                                AND REFERENCIA = ${TMP_REFE};`);
                                                  }
                                                  YAPAGO = TMP_MONTO_19;

                                                  const payment20 = await this
                                                    .entity
                                                    .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                                                                                                                                        FROM sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                        AND ABONO >= 0
                                                                                                                                                                                                        AND STATUS = 'A' 
                                                                                                                                                                                                        limit 1`);
                                                  if (payment20.length > 0) {
                                                    TMP_IDPAGO =
                                                      payment20[0].id_pago;
                                                    TMP_REFE =
                                                      payment20[0].referencia;
                                                    TMP_MONTO =
                                                      payment20[0].monto;
                                                    TMP_ABONO =
                                                      payment20[0].abono;
                                                  }
                                                  TMP_MONTO_20 =
                                                    TMP_MONTO + YAPAGO;

                                                  if (
                                                    TMP_MONTO_20 < DEBEPAGAR
                                                  ) {
                                                    NEW_ABONO = TMP_MONTO;
                                                    await this.iniDGenRef(
                                                      params.eventId,
                                                    );
                                                    C_MONTOIVA = parseFloat(
                                                      (
                                                        (TMP_MONTO * V3_PCIVA) /
                                                        this.G_IVA
                                                      ).toFixed(2),
                                                    );
                                                    C_IVA = parseFloat(
                                                      (
                                                        TMP_MONTO * V3_PCIVA -
                                                        C_MONTOIVA
                                                      ).toFixed(2),
                                                    );
                                                    C_NOMONIVA =
                                                      TMP_MONTO - TMP_MONTO;
                                                    this.G_PKREFGEN =
                                                      this.G_PKREFGEN + 1;

                                                    if (TMP_MONTO > 0) {
                                                      await this.entity
                                                        .query(`  INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                                                                        )
                                                                                                                                                                                                                        VALUES
                                                                                                                                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                                                                                                                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                                                                        )`);
                                                    }
                                                    if (
                                                      NEW_ABONO == TMP_MONTO
                                                    ) {
                                                      await this.entity
                                                        .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                                        STATUS = 'S'
                                                                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                                                    } else {
                                                      await this.entity
                                                        .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                                        STATUS = 'A'
                                                                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                                                    }
                                                    YAPAGO = TMP_MONTO_20;

                                                    const payment21 = await this
                                                      .entity
                                                      .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                                                                                                                                                                                FROM sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                                AND ABONO >= 0
                                                                                                                                                                                                                AND STATUS = 'A' 
                                                                                                                                                                                                                limit 1`);
                                                    if (payment21.length > 0) {
                                                      TMP_IDPAGO =
                                                        payment21[0].id_pago;
                                                      TMP_REFE =
                                                        payment21[0].referencia;
                                                      TMP_MONTO =
                                                        payment21[0].monto;
                                                      TMP_ABONO =
                                                        payment21[0].abono;
                                                    }
                                                    TMP_MONTO_21 =
                                                      TMP_MONTO + YAPAGO;
                                                  } else {
                                                    // YA ALCANZA A PAGAR CON EL QUINTO, SOLO SE INSERTA EL PAGO
                                                    TMP_MONTO_FIN =
                                                      DEBEPAGAR - YAPAGO;
                                                    NEW_ABONO =
                                                      TMP_ABONO + TMP_MONTO_FIN;
                                                    await this.iniDGenRef(
                                                      params.eventId,
                                                    );

                                                    C_MONTOIVA = parseFloat(
                                                      (
                                                        (TMP_MONTO_FIN *
                                                          V3_PCIVA) /
                                                        this.G_IVA
                                                      ).toFixed(2),
                                                    );
                                                    C_IVA = parseFloat(
                                                      (
                                                        TMP_MONTO_FIN *
                                                        V3_PCIVA -
                                                        C_MONTOIVA
                                                      ).toFixed(2),
                                                    );
                                                    C_NOMONIVA =
                                                      TMP_MONTO_FIN -
                                                      TMP_MONTO_FIN;
                                                    this.G_PKREFGEN =
                                                      this.G_PKREFGEN + 1;
                                                    if (TMP_MONTO_FIN > 0) {
                                                      await this.entity
                                                        .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                                                                         MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                                                                        )
                                                                                                                                                                                                                        VALUES
                                                                                                                                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                                                                                                                                         ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                                                                        )`);
                                                    }
                                                    if (
                                                      NEW_ABONO == TMP_MONTO
                                                    ) {
                                                      await this.entity
                                                        .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                                        STATUS = 'S'
                                                                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                                                    } else {
                                                      await this.entity
                                                        .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                                        STATUS = 'A'
                                                                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                                                    }
                                                  }
                                                } else {
                                                  TMP_MONTO_FIN =
                                                    DEBEPAGAR - YAPAGO;
                                                  NEW_ABONO =
                                                    TMP_ABONO + TMP_MONTO_FIN;
                                                  await this.iniDGenRef(
                                                    params.eventId,
                                                  );

                                                  C_MONTOIVA = parseFloat(
                                                    (
                                                      (TMP_MONTO_FIN *
                                                        V3_PCIVA) /
                                                      this.G_IVA
                                                    ).toFixed(2),
                                                  );
                                                  C_IVA = parseFloat(
                                                    (
                                                      TMP_MONTO_FIN * V3_PCIVA -
                                                      C_MONTOIVA
                                                    ).toFixed(2),
                                                  );
                                                  C_NOMONIVA =
                                                    TMP_MONTO_FIN -
                                                    TMP_MONTO_FIN;
                                                  this.G_PKREFGEN =
                                                    this.G_PKREFGEN + 1;

                                                  if (TMP_MONTO_FIN > 0) {
                                                    await this.entity
                                                      .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                                                                 MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                                                                )
                                                                                                                                                                                                                VALUES
                                                                                                                                                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                                                                                                                                 ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                                                                )`);
                                                  }
                                                  if (NEW_ABONO == TMP_MONTO) {
                                                    await this.entity
                                                      .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                                STATUS = 'S'
                                                                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                                AND REFERENCIA = ${TMP_REFE}`);
                                                  } else {
                                                    await this.entity
                                                      .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                                STATUS = 'A'
                                                                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                                AND REFERENCIA = ${TMP_REFE};`);
                                                  }
                                                }
                                              } else {
                                                TMP_MONTO_FIN =
                                                  DEBEPAGAR - YAPAGO;
                                                NEW_ABONO =
                                                  TMP_ABONO + TMP_MONTO_FIN;
                                                await this.iniDGenRef(
                                                  params.eventId,
                                                );

                                                C_MONTOIVA = parseFloat(
                                                  (
                                                    (TMP_MONTO_FIN * V3_PCIVA) /
                                                    this.G_IVA
                                                  ).toFixed(2),
                                                );
                                                C_IVA = parseFloat(
                                                  (
                                                    TMP_MONTO_FIN * V3_PCIVA -
                                                    C_MONTOIVA
                                                  ).toFixed(2),
                                                );
                                                C_NOMONIVA =
                                                  TMP_MONTO_FIN - TMP_MONTO_FIN;
                                                this.G_PKREFGEN =
                                                  this.G_PKREFGEN + 1;

                                                if (TMP_MONTO_FIN > 0) {
                                                  await this.entity
                                                    .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                                                        )
                                                                                                                                                                                                        VALUES
                                                                                                                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                                                                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                                                        )`);
                                                }
                                                if (NEW_ABONO == TMP_MONTO) {
                                                  await this.entity
                                                    .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                        STATUS = 'S'
                                                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                                                } else {
                                                  await this.entity
                                                    .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                        STATUS = 'A'
                                                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                                                }
                                              }
                                            } else {
                                              TMP_MONTO_FIN =
                                                DEBEPAGAR - YAPAGO;
                                              NEW_ABONO =
                                                TMP_ABONO + TMP_MONTO_FIN;
                                              await this.iniDGenRef(
                                                params.eventId,
                                              );

                                              C_MONTOIVA = parseFloat(
                                                (
                                                  (TMP_MONTO_FIN * V3_PCIVA) /
                                                  this.G_IVA
                                                ).toFixed(2),
                                              );
                                              C_IVA = parseFloat(
                                                (
                                                  TMP_MONTO_FIN * V3_PCIVA -
                                                  C_MONTOIVA
                                                ).toFixed(2),
                                              );
                                              C_NOMONIVA =
                                                TMP_MONTO_FIN - TMP_MONTO_FIN;
                                              this.G_PKREFGEN =
                                                this.G_PKREFGEN + 1;

                                              if (TMP_MONTO_FIN > 0) {
                                                await this.entity
                                                  .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                                                )
                                                                                                                                                                                                VALUES
                                                                                                                                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                                                                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                                                )`);
                                              }
                                              if (NEW_ABONO == TMP_MONTO) {
                                                await this.entity
                                                  .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                STATUS = 'S'
                                                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                AND REFERENCIA = ${TMP_REFE}`);
                                              } else {
                                                await this.entity
                                                  .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                                STATUS = 'A'
                                                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                                AND REFERENCIA = ${TMP_REFE};`);
                                              }
                                            }
                                          } else {
                                            TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
                                            NEW_ABONO =
                                              TMP_ABONO + TMP_MONTO_FIN;
                                            await this.iniDGenRef(
                                              params.eventId,
                                            );

                                            C_MONTOIVA = parseFloat(
                                              (
                                                (TMP_MONTO_FIN * V3_PCIVA) /
                                                this.G_IVA
                                              ).toFixed(2),
                                            );
                                            C_IVA = parseFloat(
                                              (
                                                TMP_MONTO_FIN * V3_PCIVA -
                                                C_MONTOIVA
                                              ).toFixed(2),
                                            );
                                            C_NOMONIVA =
                                              TMP_MONTO_FIN - TMP_MONTO_FIN;
                                            this.G_PKREFGEN =
                                              this.G_PKREFGEN + 1;

                                            if (TMP_MONTO_FIN > 0) {
                                              await this.entity
                                                .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                                        )
                                                                                                                                                                                        VALUES
                                                                                                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                                                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                                        )`);
                                            }
                                            if (NEW_ABONO == TMP_MONTO) {
                                              await this.entity
                                                .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                        STATUS = 'S'
                                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                                            } else {
                                              await this.entity
                                                .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                        STATUS = 'A'
                                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                                            }
                                          }
                                        } else {
                                          TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
                                          NEW_ABONO = TMP_ABONO + TMP_MONTO_FIN;
                                          await this.iniDGenRef(params.eventId);

                                          C_MONTOIVA = parseFloat(
                                            (
                                              (TMP_MONTO_FIN * V3_PCIVA) /
                                              this.G_IVA
                                            ).toFixed(2),
                                          );
                                          C_IVA = parseFloat(
                                            (
                                              TMP_MONTO_FIN * V3_PCIVA -
                                              C_MONTOIVA
                                            ).toFixed(2),
                                          );
                                          C_NOMONIVA =
                                            TMP_MONTO_FIN - TMP_MONTO_FIN;
                                          this.G_PKREFGEN = this.G_PKREFGEN + 1;

                                          if (TMP_MONTO_FIN > 0) {
                                            await this.entity
                                              .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                                )
                                                                                                                                                                                VALUES
                                                                                                                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                                                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                                )`);
                                          }
                                          if (NEW_ABONO == TMP_MONTO) {
                                            await this.entity
                                              .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                STATUS = 'S'
                                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                AND REFERENCIA = ${TMP_REFE}`);
                                          } else {
                                            await this.entity
                                              .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                                STATUS = 'A'
                                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                                AND REFERENCIA = ${TMP_REFE};`);
                                          }
                                        }
                                      } else {
                                        TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
                                        NEW_ABONO = TMP_ABONO + TMP_MONTO_FIN;
                                        await this.iniDGenRef(params.eventId);

                                        C_MONTOIVA = parseFloat(
                                          (
                                            (TMP_MONTO_FIN * V3_PCIVA) /
                                            this.G_IVA
                                          ).toFixed(2),
                                        );
                                        C_IVA = parseFloat(
                                          (
                                            TMP_MONTO_FIN * V3_PCIVA -
                                            C_MONTOIVA
                                          ).toFixed(2),
                                        );
                                        C_NOMONIVA =
                                          TMP_MONTO_FIN - TMP_MONTO_FIN;
                                        this.G_PKREFGEN = this.G_PKREFGEN + 1;

                                        if (TMP_MONTO_FIN > 0) {
                                          await this.entity
                                            .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                        )
                                                                                                                                                                        VALUES
                                                                                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                        )`);
                                        }
                                        if (NEW_ABONO == TMP_MONTO) {
                                          await this.entity
                                            .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                        STATUS = 'S'
                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                                        } else {
                                          await this.entity
                                            .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                                        STATUS = 'A'
                                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                                        }
                                      }
                                    } else {
                                      TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
                                      NEW_ABONO = TMP_ABONO + TMP_MONTO_FIN;
                                      await this.iniDGenRef(params.eventId);

                                      C_MONTOIVA = parseFloat(
                                        (
                                          (TMP_MONTO_FIN * V3_PCIVA) /
                                          this.G_IVA
                                        ).toFixed(2),
                                      );
                                      C_IVA = parseFloat(
                                        (
                                          TMP_MONTO_FIN * V3_PCIVA -
                                          C_MONTOIVA
                                        ).toFixed(2),
                                      );
                                      C_NOMONIVA =
                                        TMP_MONTO_FIN - TMP_MONTO_FIN;
                                      this.G_PKREFGEN = this.G_PKREFGEN + 1;

                                      if (TMP_MONTO_FIN > 0) {
                                        await this.entity
                                          .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                                )
                                                                                                                                                                VALUES
                                                                                                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                                )`);
                                      }
                                      if (NEW_ABONO == TMP_MONTO) {
                                        await this.entity
                                          .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                STATUS = 'S'
                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                AND REFERENCIA = ${TMP_REFE}`);
                                      } else {
                                        await this.entity
                                          .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                                STATUS = 'A'
                                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                                AND REFERENCIA = ${TMP_REFE};`);
                                      }
                                    }
                                  } else {
                                    TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
                                    NEW_ABONO = TMP_ABONO + TMP_MONTO_FIN;
                                    await this.iniDGenRef(params.eventId);

                                    C_MONTOIVA = parseFloat(
                                      (
                                        (TMP_MONTO_FIN * V3_PCIVA) /
                                        this.G_IVA
                                      ).toFixed(2),
                                    );
                                    C_IVA = parseFloat(
                                      (
                                        TMP_MONTO_FIN * V3_PCIVA -
                                        C_MONTOIVA
                                      ).toFixed(2),
                                    );
                                    C_NOMONIVA = TMP_MONTO_FIN - TMP_MONTO_FIN;
                                    this.G_PKREFGEN = this.G_PKREFGEN + 1;

                                    if (TMP_MONTO_FIN > 0) {
                                      await this.entity
                                        .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                        )
                                                                                                                                                        VALUES
                                                                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                        )`);
                                    }
                                    if (NEW_ABONO == TMP_MONTO) {
                                      await this.entity
                                        .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                        STATUS = 'S'
                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                                    } else {
                                      await this.entity
                                        .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                                        STATUS = 'A'
                                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                                    }
                                  }
                                } else {
                                  TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
                                  NEW_ABONO = TMP_ABONO + TMP_MONTO_FIN;
                                  await this.iniDGenRef(params.eventId);

                                  C_MONTOIVA = parseFloat(
                                    (
                                      (TMP_MONTO_FIN * V3_PCIVA) /
                                      this.G_IVA
                                    ).toFixed(2),
                                  );
                                  C_IVA = parseFloat(
                                    (
                                      TMP_MONTO_FIN * V3_PCIVA -
                                      C_MONTOIVA
                                    ).toFixed(2),
                                  );
                                  C_NOMONIVA = TMP_MONTO_FIN - TMP_MONTO_FIN;
                                  this.G_PKREFGEN = this.G_PKREFGEN + 1;

                                  if (TMP_MONTO_FIN > 0) {
                                    await this.entity
                                      .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                                )
                                                                                                                                                VALUES
                                                                                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                                )`);
                                  }
                                  if (NEW_ABONO == TMP_MONTO) {
                                    await this.entity
                                      .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                STATUS = 'S'
                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                AND REFERENCIA = ${TMP_REFE}`);
                                  } else {
                                    await this.entity
                                      .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                                STATUS = 'A'
                                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                                AND REFERENCIA = ${TMP_REFE};`);
                                  }
                                }
                              } else {
                                TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
                                NEW_ABONO = TMP_ABONO + TMP_MONTO_FIN;
                                await this.iniDGenRef(params.eventId);

                                C_MONTOIVA = parseFloat(
                                  (
                                    (TMP_MONTO_FIN * V3_PCIVA) /
                                    this.G_IVA
                                  ).toFixed(2),
                                );
                                C_IVA = parseFloat(
                                  (
                                    TMP_MONTO_FIN * V3_PCIVA -
                                    C_MONTOIVA
                                  ).toFixed(2),
                                );
                                C_NOMONIVA = TMP_MONTO_FIN - TMP_MONTO_FIN;
                                this.G_PKREFGEN = this.G_PKREFGEN + 1;

                                if (TMP_MONTO_FIN > 0) {
                                  await this.entity
                                    .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                        )
                                                                                                                                        VALUES
                                                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                        )`);
                                }
                                if (NEW_ABONO == TMP_MONTO) {
                                  await this.entity
                                    .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                        STATUS = 'S'
                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                                } else {
                                  await this.entity
                                    .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                                        STATUS = 'A'
                                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                                }
                              }
                            } else {
                              TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
                              NEW_ABONO = TMP_ABONO + TMP_MONTO_FIN;
                              await this.iniDGenRef(params.eventId);

                              C_MONTOIVA = parseFloat(
                                (
                                  (TMP_MONTO_FIN * V3_PCIVA) /
                                  this.G_IVA
                                ).toFixed(2),
                              );
                              C_IVA = parseFloat(
                                (TMP_MONTO_FIN * V3_PCIVA - C_MONTOIVA).toFixed(
                                  2,
                                ),
                              );
                              C_NOMONIVA = TMP_MONTO_FIN - TMP_MONTO_FIN;
                              this.G_PKREFGEN = this.G_PKREFGEN + 1;

                              if (TMP_MONTO_FIN > 0) {
                                await this.entity
                                  .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                                )
                                                                                                                                VALUES
                                                                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                                )`);
                              }
                              if (NEW_ABONO == TMP_MONTO) {
                                await this.entity
                                  .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                STATUS = 'S'
                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                AND REFERENCIA = ${TMP_REFE}`);
                              } else {
                                await this.entity
                                  .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                                STATUS = 'A'
                                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                                AND REFERENCIA = ${TMP_REFE};`);
                              }
                            }
                          } else {
                            TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
                            NEW_ABONO = TMP_ABONO + TMP_MONTO_FIN;
                            await this.iniDGenRef(params.eventId);

                            C_MONTOIVA = parseFloat(
                              ((TMP_MONTO_FIN * V3_PCIVA) / this.G_IVA).toFixed(
                                2,
                              ),
                            );
                            C_IVA = parseFloat(
                              (TMP_MONTO_FIN * V3_PCIVA - C_MONTOIVA).toFixed(
                                2,
                              ),
                            );
                            C_NOMONIVA = TMP_MONTO_FIN - TMP_MONTO_FIN;
                            this.G_PKREFGEN = this.G_PKREFGEN + 1;

                            if (TMP_MONTO_FIN > 0) {
                              await this.entity
                                .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                        )
                                                                                                                        VALUES
                                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                        )`);
                            }
                            if (NEW_ABONO == TMP_MONTO) {
                              await this.entity
                                .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                        STATUS = 'S'
                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                            } else {
                              await this.entity
                                .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                                        STATUS = 'A'
                                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                            }
                          }
                        } else {
                          TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
                          NEW_ABONO = TMP_ABONO + TMP_MONTO_FIN;
                          await this.iniDGenRef(params.eventId);

                          C_MONTOIVA = parseFloat(
                            ((TMP_MONTO_FIN * V3_PCIVA) / this.G_IVA).toFixed(
                              2,
                            ),
                          );
                          C_IVA = parseFloat(
                            (TMP_MONTO_FIN * V3_PCIVA - C_MONTOIVA).toFixed(2),
                          );
                          C_NOMONIVA = TMP_MONTO_FIN - TMP_MONTO_FIN;
                          this.G_PKREFGEN = this.G_PKREFGEN + 1;

                          if (TMP_MONTO_FIN > 0) {
                            await this.entity
                              .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                                )
                                                                                                                VALUES
                                                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                                )`);
                          }
                          if (NEW_ABONO == TMP_MONTO) {
                            await this.entity
                              .query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                STATUS = 'S'
                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                AND REFERENCIA = ${TMP_REFE}`);
                          } else {
                            await this.entity
                              .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                                STATUS = 'A'
                                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                                AND REFERENCIA = ${TMP_REFE};`);
                          }
                        }
                      } else {
                        TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
                        NEW_ABONO = TMP_ABONO + TMP_MONTO_FIN;
                        await this.iniDGenRef(params.eventId);

                        C_MONTOIVA = parseFloat(
                          ((TMP_MONTO_FIN * V3_PCIVA) / this.G_IVA).toFixed(2),
                        );
                        C_IVA = parseFloat(
                          (TMP_MONTO_FIN * V3_PCIVA - C_MONTOIVA).toFixed(2),
                        );
                        C_NOMONIVA = TMP_MONTO_FIN - TMP_MONTO_FIN;
                        this.G_PKREFGEN = this.G_PKREFGEN + 1;

                        if (TMP_MONTO_FIN > 0) {
                          await this.entity
                            .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                        )
                                                                                                        VALUES
                                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                        )`);
                        }
                        if (NEW_ABONO == TMP_MONTO) {
                          await this.entity.query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                        STATUS = 'S'
                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                        } else {
                          await this.entity
                            .query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                                        STATUS = 'A'
                                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                        }
                      }
                    } else {
                      TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
                      NEW_ABONO = TMP_ABONO + TMP_MONTO_FIN;
                      await this.iniDGenRef(params.eventId);

                      C_MONTOIVA = parseFloat(
                        ((TMP_MONTO_FIN * V3_PCIVA) / this.G_IVA).toFixed(2),
                      );
                      C_IVA = parseFloat(
                        (TMP_MONTO_FIN * V3_PCIVA - C_MONTOIVA).toFixed(2),
                      );
                      C_NOMONIVA = TMP_MONTO_FIN - TMP_MONTO_FIN;
                      this.G_PKREFGEN = this.G_PKREFGEN + 1;

                      if (TMP_MONTO_FIN > 0) {
                        await this.entity
                          .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                                )
                                                                                                VALUES
                                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                                )`);
                      }
                      if (NEW_ABONO == TMP_MONTO) {
                        await this.entity.query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                STATUS = 'S'
                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                AND REFERENCIA = ${TMP_REFE}`);
                      } else {
                        await this.entity.query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                                SET ABONO = ${NEW_ABONO},
                                                                                                STATUS = 'A'
                                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                                AND REFERENCIA = ${TMP_REFE};`);
                      }
                    }
                  } else {
                    TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
                    NEW_ABONO = TMP_ABONO + TMP_MONTO_FIN;
                    await this.iniDGenRef(params.eventId);

                    C_MONTOIVA = parseFloat(
                      ((TMP_MONTO_FIN * V3_PCIVA) / this.G_IVA).toFixed(2),
                    );
                    C_IVA = parseFloat(
                      (TMP_MONTO_FIN * V3_PCIVA - C_MONTOIVA).toFixed(2),
                    );
                    C_NOMONIVA = TMP_MONTO_FIN - TMP_MONTO_FIN;
                    this.G_PKREFGEN = this.G_PKREFGEN + 1;

                    if (TMP_MONTO_FIN > 0) {
                      await this.entity
                        .query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                        )
                                                                                        VALUES
                                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                        )`);
                    }
                    if (NEW_ABONO == TMP_MONTO) {
                      await this.entity.query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                        STATUS = 'S'
                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                        AND REFERENCIA = ${TMP_REFE}`);
                    } else {
                      await this.entity.query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                        SET ABONO = ${NEW_ABONO},
                                                                                        STATUS = 'A'
                                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                                        AND REFERENCIA = ${TMP_REFE};`);
                    }
                  }
                } else {
                  TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
                  NEW_ABONO = TMP_ABONO + TMP_MONTO_FIN;
                  await this.iniDGenRef(params.eventId);

                  C_MONTOIVA = parseFloat(
                    ((TMP_MONTO_FIN * V3_PCIVA) / this.G_IVA).toFixed(2),
                  );
                  C_IVA = parseFloat(
                    (TMP_MONTO_FIN * V3_PCIVA - C_MONTOIVA).toFixed(2),
                  );
                  C_NOMONIVA = TMP_MONTO_FIN - TMP_MONTO_FIN;
                  this.G_PKREFGEN = this.G_PKREFGEN + 1;

                  if (TMP_MONTO_FIN > 0) {
                    await this.entity.query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                                )
                                                                                VALUES
                                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                                )`);
                  }
                  if (NEW_ABONO == TMP_MONTO) {
                    await this.entity.query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                SET ABONO = ${NEW_ABONO},
                                                                                STATUS = 'S'
                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                AND REFERENCIA = ${TMP_REFE}`);
                  } else {
                    await this.entity.query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                                SET ABONO = ${NEW_ABONO},
                                                                                STATUS = 'A'
                                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                                AND REFERENCIA = ${TMP_REFE};`);
                  }
                }
              } else {
                TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
                NEW_ABONO = TMP_ABONO + TMP_MONTO_FIN;
                await this.iniDGenRef(params.eventId);

                C_MONTOIVA = parseFloat(
                  ((TMP_MONTO_FIN * V3_PCIVA) / this.G_IVA).toFixed(2),
                );
                C_IVA = parseFloat(
                  (TMP_MONTO_FIN * V3_PCIVA - C_MONTOIVA).toFixed(2),
                );
                C_NOMONIVA = TMP_MONTO_FIN - TMP_MONTO_FIN;
                this.G_PKREFGEN = this.G_PKREFGEN + 1;

                if (TMP_MONTO_FIN > 0) {
                  await this.entity.query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                        )
                                                                        VALUES
                                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                        )`);
                }
                if (NEW_ABONO == TMP_MONTO) {
                  await this.entity.query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                        SET ABONO = ${NEW_ABONO},
                                                                        STATUS = 'S'
                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                        AND REFERENCIA = ${TMP_REFE}`);
                } else {
                  await this.entity.query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                        SET ABONO = ${NEW_ABONO},
                                                                        STATUS = 'A'
                                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                                        AND REFERENCIA = ${TMP_REFE};`);
                }
              }
            } else {
              TMP_MONTO_FIN = DEBEPAGAR - YAPAGO;
              NEW_ABONO = TMP_ABONO + TMP_MONTO_FIN;
              await this.iniDGenRef(params.eventId);

              C_MONTOIVA = parseFloat(
                ((TMP_MONTO_FIN * V3_PCIVA) / this.G_IVA).toFixed(2),
              );
              C_IVA = parseFloat(
                (TMP_MONTO_FIN * V3_PCIVA - C_MONTOIVA).toFixed(2),
              );
              C_NOMONIVA = TMP_MONTO_FIN - TMP_MONTO_FIN;
              this.G_PKREFGEN = this.G_PKREFGEN + 1;

              if (TMP_MONTO_FIN > 0) {
                await this.entity.query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                )
                                                                VALUES
                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO_FIN},    ${V3_MANDA},
                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'N', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                )`);
              }
              if (NEW_ABONO == TMP_MONTO) {
                await this.entity.query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                                SET ABONO = ${NEW_ABONO},
                                                                STATUS = 'S'
                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                AND REFERENCIA = ${TMP_REFE}`);
              } else {
                await this.entity.query(` UPDATE sera.TMP_PAGOSGENS_DEP
                                                                SET ABONO = ${NEW_ABONO},
                                                                STATUS = 'A'
                                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                AND ID_PAGO = ${TMP_IDPAGO}
                                                                AND REFERENCIA = ${TMP_REFE};`);
              }
            }
          } //loop

          const qtmp: any[] = await this.entity
            .query(` SELECT COUNT(0) as total 
                                                FROM sera.TMP_PAGOSGENS_DEP
                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                        AND ABONO >= 0
                                                        AND STATUS = 'A'`);

          TMP_PAGOACT = qtmp[0].total || 0;

          if (TMP_PAGOACT > 0) {
            const payment = await this.entity
              .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                FROM sera.TMP_PAGOSGENS_DEP
                                                WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                AND ABONO >= 0
                                                AND STATUS = 'A' 
                                                limit 1`);
            if (payment.length > 0) {
              TMP_IDPAGO = payment[0].id_pago;
              TMP_REFE = payment[0].referencia;
              TMP_MONTO = payment[0].monto;
              TMP_ABONO = payment[0].abono;
            }

            MONTO_DEV = TMP_MONTO - TMP_ABONO;

            await this.iniDGenRef(params.eventId);

            C_MONTOIVA = TMP_MONTO - (MONTO_DEV + TMP_ABONO);
            C_IVA = TMP_MONTO - (MONTO_DEV + TMP_ABONO);
            C_NOMONIVA = MONTO_DEV;
            --V3_ANTICIPO - V3_ANTICIPO;
            this.G_PKREFGEN = this.G_PKREFGEN + 1;
            if (MONTO_DEV > 0) {
              await this.entity.query(` INSERT INTO sera.COMER_PAGOSREFGENS
                                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                         MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                        )
                                                        VALUES
                                                        (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${MONTO_DEV},    ${V3_MANDA},
                                                         ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'D', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                        )`);
            }
            NEW_ABONO = MONTO_DEV;
            await this.entity.query(`UPDATE sera.TMP_PAGOSGENS_DEP
                                                        SET ABONO = ${NEW_ABONO},
                                                        STATUS = 'S'
                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                        AND ID_PAGO = ${TMP_IDPAGO}
                                                        AND REFERENCIA = ${TMP_REFE}`);
          }
          const qtmp1: any[] = await this.entity
            .query(` SELECT COUNT(0) as total 
                                        FROM sera.TMP_PAGOSGENS_DEP
                                        WHERE ID_PAGOGENS = $   ${V_ID_CLIENTE}
                                                AND ABONO >= 0
                                                AND STATUS = 'A'`);

          TMP_PAGOACT1 = qtmp1[0].total || 0;
          if (TMP_PAGOACT1 > 0) {
            const OBT_INC: any[] = await this.entity
              .query(`SELECT  ID_PAGO, REFERENCIA, MONTO, ABONO
                                                        FROM  TMP_PAGOSGENS_DEP
                                                        WHERE  ID_PAGOGENS = ${V_ID_CLIENTE}
                                                        AND  ABONO = 0
                                                        AND  STATUS = 'A'`);
            OBT_INC.forEach(async (element) => {
              const payment = await this.entity
                .query(` SELECT ID_PAGO, REFERENCIA, MONTO, ABONO
                                                        FROM sera.TMP_PAGOSGENS_DEP
                                                        WHERE ID_PAGOGENS = ${V_ID_CLIENTE}
                                                        AND ID_PAGO =${element.id_pago}`);
              if (payment.length > 0) {
                TMP_IDPAGO = payment[0].id_pago;
                TMP_REFE = payment[0].referencia;
                TMP_MONTO = payment[0].monto;
                TMP_ABONO = payment[0].abono;
              }
              await this.iniDGenRef(params.eventId);
              this.G_PKREFGEN = this.G_PKREFGEN + 1;
              C_NOMONIVA = TMP_MONTO;
              C_MONTOIVA = TMP_MONTO - C_NOMONIVA;
              C_IVA = TMP_MONTO - C_NOMONIVA;
              await this.entity.query(` INSERT INTO sera.COMER_PAGOSREFGENS
                                                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                                                )
                                                                VALUES
                                                                (${this.G_PKREFGEN},        ${TMP_IDPAGO},        ${V3_ID_LOTE},        ${TMP_MONTO},    ${V3_MANDA},
                                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${TMP_REFE},        'D', ${params.eventId}, CAST('${dateNow}' AS DATE)
                                                                );`);
              await this.entity.query(`
                                                                UPDATE  sera.TMP_PAGOSGENS_DEP
                                                                SET  ABONO = ${NEW_ABONO},
                                                                        STATUS = 'S'
                                                                WHERE  ID_PAGOGENS = ${V_ID_CLIENTE}
                                                                AND   ID_PAGO = ${TMP_IDPAGO}
                                                                AND   REFERENCIA = ${TMP_REFE};`);
            });
          }
        }
      }
    }

    await this.actPagosMue(params.eventId);
    await this.actPagosMue(params.eventId);
    return { statusCode: 200, message: ['OK'], data: [] };
  }

  async iniDGenRef(event: number) {
    if (this.G_PKREFGEN == 0) {
      const result: any[] = await this.entity
        .query(`SELECT    coalesce(MAX(ID_PAGOREFGENS),0) as id_pago 
                        FROM    sera.COMER_PAGOSREFGENS limit 12 
                        WHERE    ID_EVENTO = ${event}`);
      this.G_PKREFGEN = result[0].id_pago;
      return true;
    }
    return false;
  }

  async actPagosMue(event: number) {
    const result = await this.entity.query(`UPDATE  sera.COMER_PAGOREF CPR
                SET  VALIDO_SISTEMA = 'S'
              WHERE  EXISTS (SELECT  LOT.ID_LOTE
                             FROM    sera.COMER_LOTES LOT
                             WHERE   LOT.ID_EVENTO = ${event} 
                             AND     LOT.LOTE_PUBLICO != 0
                             AND     LOT.ID_CLIENTE IS NOT NULL
                             AND     EXISTS (SELECT  1
                                             FROM    sera.COMER_CLIENTESXEVENTO CXE
                                             WHERE   CXE.ID_EVENTO = ${event} 
                                             AND     CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                             AND     CXE.PROCESAR = 'S'
                                             AND     CXE.ENVIADO_SIRSAE = 'N'
                                             )
                             )
                AND  EXISTS (SELECT  GEN.ID_LOTE
                             FROM    sera.COMER_PAGOSREFGENS GEN
                             WHERE   GEN.ID_EVENTO = ${event} 
                             AND     GEN.ID_PAGO = CPR.ID_PAGO
                             )
                AND  VALIDO_SISTEMA = 'A'`);
    return result;
  }

  async actEstLotesMue(event: number) {
    const result = await this.entity.query(`UPDATE    sera.COMER_LOTES LOT  
                SET    IDESTATUSVTANT = ID_ESTATUSVTA
                WHERE    ID_EVENTO = ${event} 
                AND        EXISTS (SELECT    1 
                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                WHERE    CXE.ID_EVENTO =${event}
                                AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE 
                                AND        CXE.PROCESAR = 'S'
                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                )
                AND        IDESTATUSVTANT IS NULL`);
    return result;
  }

  async borraMuebles(event: number, lot: number, phase: number) {
    var BM_ACUMULADO = 0;

    // const result = await this.entity.query(`DELETE from sera.COMER_PAGOSREFGENS
    //         WHERE    EXISTS (SELECT    1
    //                         FROM     sera.COMER_LOTES
    //                         WHERE    LOT.ID_EVENTO = ${event}
    //                         AND        LOT.ID_EVENTO = sera.COMER_PAGOSREFGENS.ID_EVENTO
    //                         AND        LOT.ID_LOTE = coalesce(${lot}, LOT.ID_LOTE)
    //                         AND        LOT.ID_LOTE = sera.COMER_PAGOSREFGENS.ID_LOTE
    //                         AND        EXISTS (SELECT    1
    //                                         FROM    sera.COMER_CLIENTESXEVENTO
    //                                         WHERE    sera.COMER_CLIENTESXEVENTO.ID_EVENTO = ${event}
    //                                         AND        sera.COMER_CLIENTESXEVENTO.ID_CLIENTE = LOT.ID_CLIENTE
    //                                         AND        sera.COMER_CLIENTESXEVENTO.PROCESAR = 'S'
    //                                         )
    //                         )
    //         AND        EXISTS (SELECT    1
    //                         FROM    sera.COMER_PAGOREF PAG
    //                         WHERE    CPR.ID_PAGO = sera.COMER_PAGOSREFGENS.ID_PAGO
    //                         AND        CPR.IDORDENINGRESO IS NULL
    //                         )`);

    const result = await this.entity.query(`
                                        delete
                                        from
                                                sera.comer_pagosrefgens GEN
                                        where
                                                exists (
                                                select
                                                        1
                                                from
                                                        sera.comer_lotes LOT
                                                where
                                                        LOT.id_evento = ${event}
                                                        and LOT.id_evento = GEN.id_evento
                                                        and LOT.id_lote = coalesce(${lot},
                                                        LOT.id_lote)
                                                                and LOT.id_lote =GEN.id_lote
                                                                and exists (
                                                                select
                                                                        1
                                                                from
                                                                        sera.comer_clientesxevento CXE
                                                                where
                                                                CXE.id_evento = ${event}
                                                                        and CXE.id_cliente = LOT.id_cliente
                                                                        and CXE.procesar = 'S'
                                                                                    )
                                                                                )
                                                and exists (
                                                select
                                                        1
                                                from
                                                        sera.comer_pagoref pag
                                                where
                                                        pag.id_pago = GEN.id_pago
                                                        and pag.idordeningreso is null
                                                                                );
                                        `);
    const result2 = await this.entity.query(` UPDATE    sera.COMER_PAGOREF CPR
                        SET    VALIDO_SISTEMA = 'A'
                        WHERE    EXISTS (SELECT    1
                                        FROM     sera.COMER_LOTES LOT
                                        WHERE    LOT.ID_EVENTO = ${event}
                                        AND        LOT.LOTE_PUBLICO != 0
                                        AND        LOT.ID_LOTE = CPR.ID_LOTE
                                        AND        LOT.ID_LOTE      = coalesce(${lot}, LOT.ID_LOTE)
                                        AND        EXISTS (SELECT    1
                                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                        WHERE    CXE.ID_EVENTO    = ${event}
                                                        AND       CXE.ID_CLIENTE    = LOT.ID_CLIENTE
                                                        AND       CXE.PROCESAR    = 'S'
                                                        )
                                        )
                        AND        CPR.VALIDO_SISTEMA = 'S'
                        AND        CPR.IDORDENINGRESO IS NULL;
                
                        
                               `);
    const result3: any[] = await this.entity
      .query(`select coalesce(SUM(coalesce(MONTO_NOAPP_IVA,0)+coalesce(IVA,0)+coalesce(MONTO_APP_IVA,0)),0.0) as total 
                FROM    sera.COMER_PAGOSREFGENS CPRG
                WHERE    ID_EVENTO =${event}
                AND        ID_LOTE = coalesce(${lot}, ID_LOTE)
                AND        1             = case coalesce(${phase},0) when 1 then 0 when 2 then 1 when 3 then 1 when 0 then 0 end
                AND        EXISTS (SELECT    1
                                FROM    sera.COMER_PAGOREF CPR
                                WHERE    CPR.ID_PAGO = CPRG.ID_PAGO
                                AND        CPR.IDORDENINGRESO IS NOT NULL
                                )`);
    BM_ACUMULADO = result3[0].total || 0.0;

    const result4: any[] = await this.entity
      .query(`   UPDATE    sera.COMER_LOTES  LOT
                                SET    ID_ESTATUSVTA = case coalesce(${phase},1) when 1 then 'VEN' when 2 then 'GARA' end, VALIDO_SISTEMA = case  LOT.ID_ESTATUSVTA when 'GARA' then 'G' end,
                                ACUMULADO = ${BM_ACUMULADO}
                        WHERE    ID_EVENTO = ${event}
                        AND        LOT.LOTE_PUBLICO != 0
                        AND        LOT.ID_LOTE = coalesce(${lot}, LOT.ID_LOTE)
                        AND        EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CCE
                                        WHERE    CCE.ID_EVENTO = ${event}
                                        AND       CCE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND        CCE.PROCESAR = 'S'
                                        )
                        AND        EXISTS (SELECT    1
                                        FROM    sera.COMER_PAGOREF CPR
                                        WHERE    CPR.ID_LOTE = LOT.ID_LOTE
                                        AND        CPR.IDORDENINGRESO IS NULL
                                        );
                
                        `);
    const result5 = await this.entity
      .query(`DELETE  from  sera.COMER_BIENESRECHAZADOS 
                WHERE    ID_EVENTO = ${event}`);
    return result5;
  }

  async currentRealStateSale(params: RealStateSaleCurrent) {
    var L_CLIENTE = 0;
    var M_LOTE = 0;
    var j = 0;
    var I = 0;
    var k = 0;
    var t = 0;
    var COMPRA_TOT = 0;
    var PAGADO_TOT = 0;

    var L7_ACT = await this.entity.query(`SELECT  LOT.ID_CLIENTE, LOT.ID_LOTE
                        FROM  sera.COMER_LOTES LOT
                        WHERE  LOT.ID_EVENTO = ${params.event}
                        AND  EXISTS (SELECT  PRF.ID_LOTE
                                        FROM  sera.COMER_PAGOREF PRF
                                WHERE  PRF.ID_LOTE = LOT.ID_LOTE
                                        AND  PRF.VALIDO_SISTEMA = 'A'
                                        AND  PRF.FECHA <= '${params.date}'
                                        )
                        AND  EXISTS (SELECT  1
                                        FROM  sera.COMER_CLIENTESXEVENTO CXE
                                WHERE  CXE.ID_EVENTO = ${params.event}
                                        AND  CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND  CXE.PROCESAR = 'S'
                                        )
                        AND  LOT.PRECIO_FINAL > 0
                        AND  LOT.VALIDO_SISTEMA IS NULL`);

    var L_PARAMETROS = await this.getParameters({
      eventId: params.event,
      address: 'I',
    });
    this.G_EVENTO = params.event;
    await this.prepareLot(params.event, 'I');

    if (!params.lot) {
      if (params.phase == 1) {
        await this.actEstLotesMue(params.event);
        await this.borraMuebles(params.event, null, null);
        this.G_PKREFGEN = 0;
        await this.ventaInmu1Act(
          params.event,
          params.date,
          null,
          params.phase,
          params.address,
        );
        var L7_ACT_F1: any[] = await this.entity
          .query(`SELECT  LOT.ID_CLIENTE, LOT.ID_LOTE
                                        FROM  sera.COMER_LOTES LOT
                                        WHERE  LOT.ID_EVENTO = ${params.event}
                                        AND  EXISTS (SELECT  PRF.ID_LOTE
                                                        FROM  sera.COMER_PAGOREF PRF
                                                WHERE  PRF.ID_LOTE = LOT.ID_LOTE
                                                        AND  PRF.VALIDO_SISTEMA = 'A'
                                                        AND  PRF.FECHA <= ${params.date}
                                                        AND  PRF.REFERENCIA LIKE '1%'
                                                        )
                                        AND  EXISTS (SELECT  1
                                                        FROM  sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE  CXE.ID_EVENTO = ${params.event}
                                                        AND  CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                        AND  CXE.PROCESAR = 'S'
                                                        )
                                        AND  LOT.PRECIO_FINAL > 0
                                        AND  LOT.VALIDO_SISTEMA IS NULL`);
        L7_ACT_F1.forEach(async (element) => {
          this.DISPERSION = [];
          COMPRA_TOT = await this.llenaLotesAct(
            params.event,
            element.id_cliente,
            element.id_lote,
            params.phase,
          );
          PAGADO_TOT = await this.llenaPagosAct(
            params.event,
            element.id_cliente,
            params.date,
            params.phase,
            params.lot,
          );
          await this.penalizaInmuAct(
            COMPRA_TOT,
            PAGADO_TOT,
            element.id_cliente,
            1,
          );

          this.dispDevol(params.event, element.id_cliente);
          this.insDispBm(element.id_cliente, 6, params.event);
          this.actClienteProc(element.id_cliente, params.event);
        });
      } else if (params.phase == 2) {
        await this.actEstLotesMue(params.event);
        this.G_PKREFGEN = 0;
        await this.ventaInmu1Act(
          params.event,
          params.date,
          null,
          params.phase,
          params.address,
        );
        var L7_ACT_F2: any[] = await this.entity
          .query(`SELECT  LOT.ID_CLIENTE, LOT.ID_LOTE
                                FROM sera.COMER_LOTES LOT
                                WHERE  LOT.ID_EVENTO = ${params.event}
                                AND  EXISTS (SELECT  PRF.ID_LOTE
                                                FROM sera.COMER_PAGOREF PRF
                                        WHERE  PRF.ID_LOTE = LOT.ID_LOTE
                                                AND  PRF.VALIDO_SISTEMA = 'A'
                                                AND  PRF.FECHA <= '${params.date}'
                                                AND  PRF.REFERENCIA LIKE '2%'
                                                )
                                AND  EXISTS (SELECT  1
                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE  CXE.ID_EVENTO = ${params.event}
                                                AND  CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND  CXE.PROCESAR = 'S'
                                                )
                                AND  LOT.PRECIO_FINAL > 0
                                AND  (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = 'G')`);
        L7_ACT_F2.forEach(async (element) => {
          this.DISPERSION = [];
          COMPRA_TOT = await this.llenaLotesAct(
            params.event,
            element.id_cliente,
            element.id_lote,
            params.phase,
          );
          PAGADO_TOT = await this.llenaPagosAct(
            params.event,
            element.id_cliente,
            params.date,
            params.phase,
            params.lot,
          );
          await this.penalizaInmuAct(
            COMPRA_TOT,
            PAGADO_TOT,
            element.id_cliente,
            2,
          );
          this.pagoLoteAct(element.id_cliente, null, 2); //5437
          this.dispDevol(params.event, element.id_cliente);
          this.insDispBm(element.id_cliente, 6, params.event);
          this.actClienteProc(element.id_cliente, params.event);
        });
      } else if (params.phase == 7) {
        await this.actEstLotesMue(params.event);
        this.G_PKREFGEN = 0;
        await this.ventaInmu1Act(
          params.event,
          params.date,
          null,
          params.phase,
          params.address,
        );
        var L7_ACT_F7: any[] = await this.entity
          .query(`SELECT  LOT.ID_CLIENTE, LOT.ID_LOTE
                                        FROM  sera.COMER_LOTES LOT
                                        WHERE  LOT.ID_EVENTO = ${params.event}
                                        AND  EXISTS (SELECT  PRF.ID_LOTE
                                                        FROM  sera.COMER_PAGOREF PRF
                                                WHERE  PRF.ID_LOTE = LOT.ID_LOTE
                                                        AND  PRF.VALIDO_SISTEMA = 'A'
                                                        AND  PRF.FECHA <= '${params.date}'
                                                        AND  PRF.REFERENCIA LIKE '7%'
                                                        )
                                        AND  EXISTS (SELECT  1
                                                        FROM  sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE  CXE.ID_EVENTO = ${params.event}
                                                        AND  CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                        AND  CXE.PROCESAR = 'S'
                                                        )
                                        AND  LOT.PRECIO_FINAL > 0
                                        AND  (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = 'G')`);
        L7_ACT_F7.forEach(async (element) => {
          this.DISPERSION = [];
          COMPRA_TOT = await this.llenaLotesAct(
            params.event,
            element.id_cliente,
            element.id_lote,
            params.phase,
          );
          PAGADO_TOT = await this.llenaPagosAct(
            params.event,
            element.id_cliente,
            params.date,
            params.phase,
            params.lot,
          );
          await this.penalizaInmuAct(
            COMPRA_TOT,
            PAGADO_TOT,
            element.id_cliente,
            7,
          );
          this.dispDevol(params.event, element.id_cliente);
          this.insDispBm(element.id_cliente, 6, params.event);
          this.actClienteProc(element.id_cliente, params.event);
        });
      } else if (params.phase == 3) {
        await this.actEstLotesMue(params.event);
        this.G_PKREFGEN = 0;
        await this.ventaInmu1Act(
          params.event,
          params.date,
          null,
          params.phase,
          params.address,
        );
        var L7_ACT_F3: any[] = await this.entity
          .query(` SELECT  LOT.ID_CLIENTE, LOT.ID_LOTE
                                FROM  sera.COMER_LOTES LOT
                                WHERE  LOT.ID_EVENTO = ${params.event}
                                AND  EXISTS (SELECT  PRF.ID_LOTE
                                                FROM  sera.COMER_PAGOREF PRF
                                        WHERE  PRF.ID_LOTE = LOT.ID_LOTE
                                                AND  PRF.VALIDO_SISTEMA = 'A'
                                                AND  PRF.FECHA <= '${params.date}'
                                                AND  PRF.REFERENCIA LIKE '3%'
                                                )
                                AND  EXISTS (SELECT  1
                                                FROM  sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE  CXE.ID_EVENTO = ${params.event}
                                                AND  CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND  CXE.PROCESAR = 'S'
                                                )
                                AND  LOT.PRECIO_FINAL > 0
                                AND  (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = 'G')`);
        L7_ACT_F3.forEach(async (element) => {
          this.DISPERSION = [];
          COMPRA_TOT = await this.llenaLotesAct(
            params.event,
            element.id_cliente,
            element.id_lote,
            params.phase,
          );
          PAGADO_TOT = await this.llenaPagosAct(
            params.event,
            element.id_cliente,
            params.date,
            params.phase,
            params.lot,
          );
          await this.penalizaInmuAct(
            COMPRA_TOT,
            PAGADO_TOT,
            element.id_cliente,
            3,
          );
          this.insDispBm(element.id_cliente, 6, params.event);
          this.actClienteProc(element.id_cliente, params.event);
        });
      } else if (params.phase == 4) {
        await this.actEstLotesMue(params.event);
        this.G_PKREFGEN = 0;
        await this.ventaInmu1Act(
          params.event,
          params.date,
          null,
          params.phase,
          params.address,
        );
        var L7_ACT_F4: any[] = await this.entity
          .query(`SELECT  LOT.ID_CLIENTE, LOT.ID_LOTE
                                FROM  sera.COMER_LOTES LOT
                                WHERE  LOT.ID_EVENTO = ${params.event}
                                AND  EXISTS (SELECT  PRF.ID_LOTE
                                                FROM  sera.COMER_PAGOREF PRF
                                        WHERE  PRF.ID_LOTE = LOT.ID_LOTE
                                                AND  PRF.VALIDO_SISTEMA = 'A'
                                                AND  PRF.FECHA <= '${params.date}'
                                                AND  PRF.REFERENCIA LIKE '4%'
                                                )
                                AND  EXISTS (SELECT  1
                                                FROM  sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE  CXE.ID_EVENTO = ${params.event}
                                                AND  CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND  CXE.PROCESAR = 'S'
                                                )
                                AND  LOT.PRECIO_FINAL > 0
                                AND  (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = 'G')`);
        L7_ACT_F4.forEach(async (element) => {
          this.DISPERSION = [];
          COMPRA_TOT = await this.llenaLotesAct(
            params.event,
            element.id_cliente,
            element.id_lote,
            params.phase,
          );
          PAGADO_TOT = await this.llenaPagosAct(
            params.event,
            element.id_cliente,
            params.date,
            params.phase,
            params.lot,
          );
          await this.penalizaInmuAct(
            COMPRA_TOT,
            PAGADO_TOT,
            element.id_cliente,
            4,
          );
          this.dispDevol(params.event, element.id_cliente);
          this.insDispBm(element.id_cliente, 6, params.event);
          this.actClienteProc(element.id_cliente, params.event);
        });
      } else if (params.phase == 5) {
        await this.actEstLotesMue(params.event);
        this.G_PKREFGEN = 0;
        await this.ventaInmu1Act(
          params.event,
          params.date,
          null,
          params.phase,
          params.address,
        );
        var L7_ACT_F5: any[] = await this.entity
          .query(`SELECT  LOT.ID_CLIENTE, LOT.ID_LOTE
                                FROM sera.COMER_LOTES LOT
                                WHERE  LOT.ID_EVENTO = ${params.event}
                                AND  EXISTS (SELECT  PRF.ID_LOTE
                                                FROM sera.COMER_PAGOREF PRF
                                        WHERE  PRF.ID_LOTE = LOT.ID_LOTE
                                                AND  PRF.VALIDO_SISTEMA = 'A'
                                                AND  PRF.FECHA <= '${params.date}'
                                                AND  PRF.REFERENCIA LIKE '5%'
                                                )
                                AND  EXISTS (SELECT  1
                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE  CXE.ID_EVENTO = ${params.event}
                                                AND  CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND  CXE.PROCESAR = 'S'
                                                )
                                AND  LOT.PRECIO_FINAL > 0
                                AND  LOT.VALIDO_SISTEMA IS NULL`);
        L7_ACT_F5.forEach(async (element) => {
          this.DISPERSION = [];
          COMPRA_TOT = await this.llenaLotesAct(
            params.event,
            element.id_cliente,
            element.id_lote,
            params.phase,
          );
          PAGADO_TOT = await this.llenaPagosAct(
            params.event,
            element.id_cliente,
            params.date,
            params.phase,
            params.lot,
          );
          await this.penalizaInmuAct(
            COMPRA_TOT,
            PAGADO_TOT,
            element.id_cliente,
            3,
          );
          this.pagoLoteAct(element.id_cliente, null, 3);
          this.insDispBm(element.id_cliente, 6, params.event);
          this.actClienteProc(element.id_cliente, params.event);
        });
      } else if (params.phase == 6) {
        await this.actEstLotesMue(params.event);
        this.G_PKREFGEN = 0;
        await this.ventaInmu1Act(
          params.event,
          params.date,
          null,
          params.phase,
          params.address,
        );
        var L7_ACT_F6: any[] = await this.entity
          .query(`SELECT  LOT.ID_CLIENTE, LOT.ID_LOTE
                                FROM  sera.COMER_LOTES LOT
                                WHERE  LOT.ID_EVENTO = ${params.event}
                                AND  EXISTS (SELECT  PRF.ID_LOTE
                                                FROM  sera.COMER_PAGOREF PRF
                                        WHERE  PRF.ID_LOTE = LOT.ID_LOTE
                                                AND  PRF.VALIDO_SISTEMA = 'A'
                                                AND  PRF.FECHA <= '${params.date}'
                                                AND  PRF.REFERENCIA LIKE '6%'
                                                )
                                AND  EXISTS (SELECT  1
                                                FROM  sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE  CXE.ID_EVENTO = ${params.event}
                                                AND  CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND  CXE.PROCESAR = 'S'
                                                )
                                AND  LOT.PRECIO_FINAL > 0
                                AND  LOT.VALIDO_SISTEMA IS NULL`);
        L7_ACT_F6.forEach(async (element) => {
          this.DISPERSION = [];
          COMPRA_TOT = await this.llenaLotesAct(
            params.event,
            element.id_cliente,
            element.id_lote,
            params.phase,
          );
          PAGADO_TOT = await this.llenaPagosAct(
            params.event,
            element.id_cliente,
            params.date,
            params.phase,
            params.lot,
          );
          await this.penalizaInmuAct(
            COMPRA_TOT,
            PAGADO_TOT,
            element.id_cliente,
            3,
          );
          this.pagoLoteAct(element.id_cliente, null, 3);
          this.insDispBm(element.id_cliente, 6, params.event);
          this.actClienteProc(element.id_cliente, params.event);
        });
      } else {
        await this.actEstLotesMue(params.event);
        await this.borraMuebles(params.event, null, null);
        this.G_PKREFGEN = 0;
        await this.ventaInmu1Act(
          params.event,
          params.date,
          null,
          params.phase,
          params.address,
        );
        const L7: any[] = await this.entity
          .query(` SELECT    DISTINCT LOT.ID_CLIENTE 
                                FROM    sera.COMER_LOTES LOT
                                WHERE    LOT.ID_EVENTO = ${params.event}
                                AND        LOT.ID_LOTE        = coalesce(${params.lot}, LOT.ID_LOTE)
                                AND        EXISTS (SELECT    PRF.ID_LOTE
                                                FROM    sera.COMER_PAGOREF PRF
                                                WHERE    PRF.ID_LOTE = LOT.ID_LOTE
                                                AND        PRF.VALIDO_SISTEMA = 'A'
                                                AND        PRF.FECHA <= '${params.date}'
                                                )
                                AND        EXISTS (SELECT    1
                                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE    CXE.ID_EVENTO = ${params.event}
                                                AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND        CXE.PROCESAR = 'S'
                                                )
                                AND        LOT.PRECIO_FINAL > 0
                                AND        (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = case ${params.phase} when 1 then '1' when 2 then 'G' when 3 then 'G' end  )`);
        L7.forEach(async (element) => {
          this.DISPERSION = [];
          COMPRA_TOT = await this.llenaLotesAct(
            params.event,
            element.id_cliente,
            element.id_lote,
            params.phase,
          );
          PAGADO_TOT = await this.llenaPagosAct(
            params.event,
            element.id_cliente,
            params.date,
            params.phase,
            params.lot,
          );
          await this.penalizaInmuAct(
            COMPRA_TOT,
            PAGADO_TOT,
            element.id_cliente,
            3,
          );
          this.pagoLoteAct(element.id_cliente, null, 3);
          this.insDispBm(element.id_cliente, 6, params.event);
          this.actClienteProc(element.id_cliente, params.event);
        });
      }
    } else {
      if (params.phase == 1) {
        await this.actEstLotesMue(params.event);
        await this.borraMuebles(params.event, null, null);
        this.G_PKREFGEN = 0;
        await this.ventaInmu1Act(
          params.event,
          params.date,
          null,
          params.phase,
          params.address,
        );

        const result = await this.entity.query(` SELECT DISTINCT LOT.ID_CLIENTE 
                                        FROM sera.COMER_LOTES LOT
                                        WHERE LOT.ID_EVENTO = ${params.event}
                                        AND LOT.ID_LOTE =${params.lot}`);
        L_CLIENTE = result[0].id_cliente;
        this.DISPERSION = [];
        COMPRA_TOT = await this.llenaLotesAct(
          params.event,
          L_CLIENTE,
          params.lot,
          params.phase,
        );
        PAGADO_TOT = await this.llenaPagosAct(
          params.event,
          L_CLIENTE,
          params.date,
          params.phase,
          params.lot,
        );
        await this.penalizaInmuAct(COMPRA_TOT, PAGADO_TOT, L_CLIENTE, 1);
        this.dispDevol(params.event, L_CLIENTE);
        this.insDispBm(L_CLIENTE, 6, params.event);
        this.actClienteProc(L_CLIENTE, params.event);
      } else if (params.phase == 2) {
        await this.actEstLotesMue(params.event);
        await this.borraMuebles(params.event, null, null);
        this.G_PKREFGEN = 0;
        await this.ventaInmu1Act(
          params.event,
          params.date,
          null,
          params.phase,
          params.address,
        );

        const result = await this.entity.query(` SELECT DISTINCT LOT.ID_CLIENTE 
                                        FROM sera.COMER_LOTES LOT
                                        WHERE LOT.ID_EVENTO = ${params.event}
                                        AND LOT.ID_LOTE =${params.lot}`);
        L_CLIENTE = result[0].id_cliente;
        this.DISPERSION = [];
        COMPRA_TOT = await this.llenaLotesAct(
          params.event,
          L_CLIENTE,
          params.lot,
          params.phase,
        );
        PAGADO_TOT = await this.llenaPagosAct(
          params.event,
          L_CLIENTE,
          params.date,
          params.phase,
          params.lot,
        );
        await this.penalizaInmuAct(
          COMPRA_TOT,
          PAGADO_TOT,
          L_CLIENTE,
          params.phase,
        );
        this.pagoLoteAct(L_CLIENTE, null, params.phase);
        this.insDispBm(L_CLIENTE, 6, params.event);
        this.actClienteProc(L_CLIENTE, params.event);
      } else if (params.phase == 3) {
        await this.actEstLotesMue(params.event);
        await this.borraMuebles(params.event, null, null);
        this.G_PKREFGEN = 0;
        await this.ventaInmu1Act(
          params.event,
          params.date,
          null,
          params.phase,
          params.address,
        );

        const result = await this.entity.query(` SELECT DISTINCT LOT.ID_CLIENTE 
                                        FROM sera.COMER_LOTES LOT
                                        WHERE LOT.ID_EVENTO = ${params.event}
                                        AND LOT.ID_LOTE =${params.lot}`);
        L_CLIENTE = result[0].id_cliente;
        this.DISPERSION = [];
        COMPRA_TOT = await this.llenaLotesAct(
          params.event,
          L_CLIENTE,
          params.lot,
          params.phase,
        );
        PAGADO_TOT = await this.llenaPagosAct(
          params.event,
          L_CLIENTE,
          params.date,
          params.phase,
          params.lot,
        );
        await this.penalizaInmuAct(
          COMPRA_TOT,
          PAGADO_TOT,
          L_CLIENTE,
          params.phase,
        );
        this.pagoLoteAct(L_CLIENTE, null, params.phase);
        this.insDispBm(L_CLIENTE, 6, params.event);
        this.actClienteProc(L_CLIENTE, params.event);
      } else if (params.phase == 4) {
        await this.actEstLotesMue(params.event);
        await this.borraMuebles(params.event, null, null);
        this.G_PKREFGEN = 0;
        await this.ventaInmu1Act(
          params.event,
          params.date,
          null,
          params.phase,
          params.address,
        );

        const result = await this.entity.query(` SELECT DISTINCT LOT.ID_CLIENTE 
                                        FROM sera.COMER_LOTES LOT
                                        WHERE LOT.ID_EVENTO = ${params.event}
                                        AND LOT.ID_LOTE =${params.lot}`);
        L_CLIENTE = result[0].id_cliente;
        this.DISPERSION = [];
        COMPRA_TOT = await this.llenaLotesAct(
          params.event,
          L_CLIENTE,
          params.lot,
          params.phase,
        );
        PAGADO_TOT = await this.llenaPagosAct(
          params.event,
          L_CLIENTE,
          params.date,
          params.phase,
          params.lot,
        );
        await this.penalizaInmuAct(
          COMPRA_TOT,
          PAGADO_TOT,
          L_CLIENTE,
          params.phase,
        );
        this.pagoLoteAct(L_CLIENTE, null, params.phase);
        this.insDispBm(L_CLIENTE, 6, params.event);
        this.actClienteProc(L_CLIENTE, params.event);
      } else if (params.phase == 7) {
        await this.actEstLotesMue(params.event);
        await this.borraMuebles(params.event, null, null);
        this.G_PKREFGEN = 0;
        await this.ventaInmu1Act(
          params.event,
          params.date,
          null,
          params.phase,
          params.address,
        );

        const result = await this.entity.query(` SELECT DISTINCT LOT.ID_CLIENTE 
                                        FROM sera.COMER_LOTES LOT
                                        WHERE LOT.ID_EVENTO = ${params.event}
                                        AND LOT.ID_LOTE =${params.lot}`);
        L_CLIENTE = result[0].id_cliente;
        this.DISPERSION = [];
        COMPRA_TOT = await this.llenaLotesAct(
          params.event,
          L_CLIENTE,
          params.lot,
          params.phase,
        );
        PAGADO_TOT = await this.llenaPagosAct(
          params.event,
          L_CLIENTE,
          params.date,
          params.phase,
          params.lot,
        );
        await this.penalizaInmuAct(COMPRA_TOT, PAGADO_TOT, L_CLIENTE, 1);
        this.dispDevol(params.event, L_CLIENTE);
        this.insDispBm(L_CLIENTE, 6, params.event);
        this.actClienteProc(L_CLIENTE, params.event);
      } else {
        await this.actEstLotesMue(params.event);
        await this.borraMuebles(params.event, null, null);
        this.G_PKREFGEN = 0;
        await this.ventaInmu1Act(
          params.event,
          params.date,
          null,
          params.phase,
          params.address,
        );

        const result = await this.entity.query(` SELECT DISTINCT LOT.ID_CLIENTE 
                                        FROM sera.COMER_LOTES LOT
                                        WHERE LOT.ID_EVENTO = ${params.event}
                                        AND LOT.ID_LOTE =${params.lot}`);
        L_CLIENTE = result[0].id_cliente;
        this.DISPERSION = [];
        COMPRA_TOT = await this.llenaLotesAct(
          params.event,
          L_CLIENTE,
          params.lot,
          params.phase,
        );
        PAGADO_TOT = await this.llenaPagosAct(
          params.event,
          L_CLIENTE,
          params.date,
          params.phase,
          params.lot,
        );
        await this.penalizaInmuAct(
          COMPRA_TOT,
          PAGADO_TOT,
          L_CLIENTE,
          params.phase,
        );
        this.pagoLoteAct(L_CLIENTE, null, params.phase);
        this.insDispBm(L_CLIENTE, 6, params.event);
        this.actClienteProc(L_CLIENTE, params.event);
      }
    }

    await this.actPagos(params.event, 'I', params.phase, params.lot);
    await this.actRefesAct(params.event, params.lot, params.phase);
    return { statusCode: 200, message: ['OK'], data: [] };
  }
  async realStateSate(data:RealStateSale){
    var COMPRA_TOT       = 0.0;
    var     PAGADO_TOT        = 0.0;

    var L7 = await this.entity.query(`
    SELECT DISTINCT LOT.ID_CLIENTE
    FROM sera.COMER_LOTES LOT
    WHERE LOT.ID_EVENTO = ${data.event}
      AND LOT.ID_LOTE = COALESCE(${data.lot}, LOT.ID_LOTE)
      AND EXISTS (
        SELECT PRF.ID_LOTE
        FROM sera.COMER_PAGOREF PRF
        WHERE PRF.ID_LOTE = LOT.ID_LOTE
          AND PRF.VALIDO_SISTEMA = 'A'
          AND PRF.FECHA <= '${LocalDate.getNextDay(data.date)}'
      )
      AND EXISTS (
        SELECT 1
        FROM sera.COMER_CLIENTESXEVENTO CXE
        WHERE CXE.ID_EVENTO = ${data.event}
          AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
          AND CXE.PROCESAR = 'S'
      )
      AND LOT.PRECIO_FINAL > 0
      AND (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = CASE FASE WHEN 1 THEN '1' WHEN 2 THEN 'G' WHEN 3 THEN 'G' END);
    
    `)
    var Parametros = await this.getParameters({eventId:data.event,address:'I'})
    this.G_EVENTO = data.event
    if(data.phase == 1){
      await this.actLotes(data.event)
      await this.prepareLot(data.lot,'I')
    }
    if(data.phase == 1){
      await this.borraMuebles(data.event,null,data.phase)
    }else if([2,3].includes(data.phase)){
      await this.borraMuebles(data.event,data.lot,data.phase)

    }
    await this.realStateSale1(data)
    if(data.phase != 3){
      for (const iterator of L7) {
        this.DISPERSION = []
        COMPRA_TOT = await this.llenaLotes(data.event,iterator.id_cliente,data.lot,data.phase)
        PAGADO_TOT = await this.llenaPagos(data.event,iterator.id_cliente,data.date,data.phase)
        await this.penalizaInmu(COMPRA_TOT,PAGADO_TOT,iterator.id_cliente,data.phase)
        await this.pagoALote(iterator.id_cliente,data.lot,data.phase)
        await this.insDispBm(iterator.id_cliente,6,data.event)
        await this.actClienteProc(iterator.id_cliente,data.event)
        
      }
    }
    await this.actPagos(data.event,'I',data.phase,data.lot)
    await this.actRefes(data.event,data.lot,data.phase)
    return {
      statusCode:200,
      message:["OK"]
    }
  }

  async realStateSale1(params: RealStateSale) {
    var P1: any[] = await this.entity
      .query(` SELECT    LOT.ID_LOTE, LOT.PRECIO_FINAL, SUM(PAG.MONTO) as pagado, coalesce(LOT.ACUMULADO,0) as acum, LOT.ANTICIPO, LOT.ID_CLIENTE
                        FROM    sera.COMER_LOTES LOT, sera.COMER_PAGOREF PAG 
                        WHERE    LOT.ID_EVENTO = ${params.event}
                        AND        PAG.VALIDO_SISTEMA = 'A'
                        AND        LOT.ID_LOTE = coalesce(${params.lot}, LOT.ID_LOTE)
                        AND        LOT.ID_LOTE = PAG.ID_LOTE
                        AND        PAG.FECHA          <= '${params.date}'
                        AND        coalesce(LOT.ESASIGNADO,'S') != 'N'
                        AND        EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${params.event}
                                        AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND        CXE.PROCESAR = 'S'
                                        AND        CXE.ENVIADO_SIRSAE = 'N'
                                        )
                        GROUP BY LOT.ID_LOTE, LOT.PRECIO_FINAL, LOT.ACUMULADO, LOT.ANTICIPO, LOT.ID_CLIENTE`);
    P1.forEach(async (element) => {
      switch (params.phase) {
        case 1:
          if (
            element.precio_final == element.pagado ||
            element.anticipo == element.pagado
          ) {
            await this.insertAreFGens(
              element.id_lote,
              params.date,
              params.event,
              params.phase,
            );
          }
          break;
        case 2:
          if (element.precio_final - element.acum == element.pagado) {
            await this.insertAreFGens(
              element.id_lote,
              params.date,
              params.event,
              params.phase,
            );
          }

          break;
        case 3:
          await this.insertAreFGens(
            element.id_lote,
            params.date,
            params.event,
            params.phase,
          );

          break;

        default:
          await this.actClienteProc(element.id_cliente, params.event);
          break;
      }
    });
    return { statusCode: 200, message: ['ok'], data: [] };
  }

  async actRefesAct(event: number, lot: number, phase: number) {
    if (phase == 2 || phase == 4 || phase == 3 || phase == 7) {
      await this.entity.query(` UPDATE    sera.COMER_PAGOSREFGENS  CPR
                        SET    REFERENCIA = (    SELECT    coalesce(REFERENCIAORI,REFERENCIA)
                                    FROM    sera.COMER_PAGOREF REF
                                    WHERE    REF.ID_PAGO = CPR.ID_PAGO
                                  )
                        WHERE    EXISTS (SELECT    1
                                FROM    sera.COMER_LOTES LOT
                                WHERE    LOT.ID_EVENTO = ${event}
                                AND    LOT.ID_EVENTO = CPR.ID_EVENTO
                                AND    LOT.ID_LOTE = CPR.ID_LOTE
                                AND    LOT.ID_LOTE = coalesce(${lot}, LOT.ID_LOTE)
                                )`);
    } else if (phase == 1) {
      await this.entity.query(` UPDATE    sera.COMER_PAGOSREFGENS CPR
                        SET    REFERENCIA = (    SELECT    coalesce(REFERENCIAORI,REFERENCIA)
                                    FROM    sera.COMER_PAGOREF REF
                                    WHERE    REF.ID_PAGO = CPR.ID_PAGO
                                  )
                        WHERE    EXISTS (SELECT    1
                                FROM    sera.COMER_LOTES LOT
                                WHERE    LOT.ID_EVENTO = ${event}
                                AND    LOT.ID_EVENTO = CPR.ID_EVENTO
                                AND    LOT.ID_LOTE = CPR.ID_LOTE
                                AND    EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${event}
                                        AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND    CXE.PROCESAR = 'S'
                                        AND     CXE.ENVIADO_SIRSAE = 'N'
                                        )
                                )`);
    }
  }

  async actPagos(event: number, type: string, phase: number, lot: number) {
    return await this.entity.query(`UPDATE    sera.COMER_PAGOREF CPR
                SET    VALIDO_SISTEMA = 'S'
                WHERE    EXISTS (SELECT    GEN.ID_LOTE
                        FROM    sera.COMER_PAGOSREFGENS GEN
                        WHERE    GEN.ID_EVENTO = ${event}
                        AND    GEN.ID_PAGO = CPR.ID_PAGO
                        AND    EXISTS (SELECT    1
                                FROM    sera.COMER_LOTES LOT
                                WHERE    LOT.ID_EVENTO = ${event}
                                AND    LOT.ID_LOTE = coalesce(${lot}, LOT.ID_LOTE)
                                AND    LOT.ID_LOTE = GEN.ID_LOTE
                                AND    EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${event}
                                        AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND    CXE.PROCESAR = 'S'
                                        )
                                )
                        )
                AND    VALIDO_SISTEMA = 'A'
                AND    CONCILIADO IS NULL`);
  }

  pagoLoteAct(client: number, lot: number, phase: number) {
    var SALDO = 0;
    var PRIMERA = 1;

    this.DISPERSION = [];
    this.DEPOSITOS.forEach((deposito) => {
      if (deposito.RESTA > 0) {
        this.LOTESXCLI.forEach((lote) => {
          if (phase == 1 && PRIMERA == 1) {
            lote.MEFALTA = lote.ANTICIPO;
          } else if (phase == 2 && PRIMERA == 1) {
            lote.MEFALTA = lote.MEFALTA - lote.ACUM;
          } else if (phase == 7 && PRIMERA == 1) {
            lote.MEFALTA = lote.MEFALTA - lote.ACUM;
          } else if (phase == 3 && PRIMERA == 1) {
            lote.MEFALTA = lote.MEFALTA - lote.ACUM;
          } else if (phase == 4 && PRIMERA == 1) {
            lote.MEFALTA = lote.MEFALTA - lote.ACUM;
          }
          PRIMERA = PRIMERA + 1;
          var dispersion: Dispersa = {};
          if (
            lote.PAGADO == 'N' &&
            lote.MEFALTA > 0 &&
            (lote.MARCPENA || 'N') != 'S'
          ) {
            if (deposito.RESTA < lote.MEFALTA) {
              this.GK++;
              dispersion.CLIENTE = lote.CLIENTE;
              dispersion.LOTE = lote.LOTE;
              dispersion.MANDATO = lote.MANDATO;
              dispersion.PRECIO = lote.PRECIO;
              dispersion.ID_PAGO = deposito.ID_PAGO;
              dispersion.ABONADO = (deposito.RESTA * lote.PORCIVA) / this.G_IVA;
              dispersion.IVA =
                deposito.RESTA * lote.PORCIVA - dispersion.ABONADO;
              dispersion.MONSIVA =
                deposito.RESTA - (dispersion.ABONADO + dispersion.IVA);
              dispersion.GARATIA = lote.GARATIA;
              lote.MEFALTA = lote.MEFALTA - deposito.RESTA;
              dispersion.TIPO = 'N';
              deposito.RESTA = 0;
              lote.PAGADO = 'N';
            } else if (deposito.RESTA >= lote.MEFALTA) {
              this.GK++;
              dispersion.CLIENTE = lote.CLIENTE;
              dispersion.LOTE = lote.LOTE;
              dispersion.MANDATO = lote.MANDATO;
              dispersion.PRECIO = lote.PRECIO;
              dispersion.ID_PAGO = deposito.ID_PAGO;
              dispersion.ABONADO = (lote.MEFALTA * lote.PORCIVA) / this.G_IVA;
              dispersion.IVA = lote.MEFALTA * lote.PORCIVA - dispersion.ABONADO;
              dispersion.MONSIVA =
                lote.MEFALTA - (dispersion.ABONADO + dispersion.IVA);
              dispersion.GARATIA = lote.GARATIA;
              deposito.RESTA = deposito.RESTA - lote.MEFALTA;
              lote.MEFALTA = 0;
              dispersion.TIPO = 'N';
              lote.PAGADO = 'S';
            }
          }
          this.DISPERSION.push(dispersion);
        });
      }
    });

    if (phase == 1) {
      this.DEPOSITOS.forEach((deposito) => {
        if (deposito.RESTA > 0) {
          this.LOTESXCLI.forEach((lote) => {
            var dispersion: Dispersa = {};
            if (lote.LOTE == deposito.LOTE && (lote.MARCPENA || 'N') != 'S') {
              dispersion.CLIENTE = lote.CLIENTE;
              dispersion.LOTE = lote.LOTE;
              dispersion.MANDATO = lote.MANDATO;
              dispersion.PRECIO = lote.PRECIO;
              dispersion.ID_PAGO = deposito.ID_PAGO;
              dispersion.ABONADO = (deposito.RESTA * lote.PORCIVA) / this.G_IVA;
              dispersion.IVA =
                deposito.RESTA * lote.PORCIVA - dispersion.ABONADO;
              dispersion.MONSIVA =
                deposito.RESTA - (dispersion.ABONADO + dispersion.IVA);
              dispersion.GARATIA = lote.GARATIA;
              deposito.RESTA = 0;
              dispersion.TIPO = 'N';
            }
            this.DISPERSION.push(dispersion);
          });
        }
      });
    } else if (phase == 2) {
      this.DEPOSITOS.forEach((deposito) => {
        if (deposito.RESTA > 0) {
          this.LOTESXCLI.forEach((lote) => {
            var dispersion: Dispersa = {};
            if (lote.LOTE == deposito.LOTE && (lote.MARCPENA || 'N') != 'S') {
              dispersion.CLIENTE = lote.CLIENTE;
              dispersion.LOTE = lote.LOTE;
              dispersion.MANDATO = lote.MANDATO;
              dispersion.PRECIO = lote.PRECIO;
              dispersion.ID_PAGO = deposito.ID_PAGO;
              dispersion.ABONADO = (deposito.RESTA * lote.PORCIVA) / this.G_IVA;
              dispersion.IVA =
                deposito.RESTA * lote.PORCIVA - dispersion.ABONADO;
              dispersion.MONSIVA =
                deposito.RESTA - (dispersion.ABONADO + dispersion.IVA);
              dispersion.GARATIA = lote.GARATIA;
              deposito.RESTA = 0;
              dispersion.TIPO = 'N';
            }
            this.DISPERSION.push(dispersion);
          });
        }
      });
    } else if (phase == 7) {
      this.DEPOSITOS.forEach((deposito) => {
        if (deposito.RESTA > 0) {
          this.LOTESXCLI.forEach((lote) => {
            var dispersion: Dispersa = {};
            if (lote.LOTE == deposito.LOTE && (lote.MARCPENA || 'N') != 'S') {
              dispersion.CLIENTE = lote.CLIENTE;
              dispersion.LOTE = lote.LOTE;
              dispersion.MANDATO = lote.MANDATO;
              dispersion.PRECIO = lote.PRECIO;
              dispersion.ID_PAGO = deposito.ID_PAGO;
              dispersion.ABONADO = (deposito.RESTA * lote.PORCIVA) / this.G_IVA;
              dispersion.IVA =
                deposito.RESTA * lote.PORCIVA - dispersion.ABONADO;
              dispersion.MONSIVA =
                deposito.RESTA - (dispersion.ABONADO + dispersion.IVA);
              dispersion.GARATIA = lote.GARATIA;
              deposito.RESTA = 0;
              dispersion.TIPO = 'N';
            }
            this.DISPERSION.push(dispersion);
          });
        }
      });
    } else if (phase == 3) {
      this.DEPOSITOS.forEach((deposito) => {
        if (deposito.RESTA > 0) {
          this.LOTESXCLI.forEach((lote) => {
            var dispersion: Dispersa = {};
            if (lote.LOTE == deposito.LOTE && (lote.MARCPENA || 'N') != 'S') {
              dispersion.CLIENTE = lote.CLIENTE;
              dispersion.LOTE = lote.LOTE;
              dispersion.MANDATO = lote.MANDATO;
              dispersion.PRECIO = lote.PRECIO;
              dispersion.ID_PAGO = deposito.ID_PAGO;
              dispersion.ABONADO = (deposito.RESTA * lote.PORCIVA) / this.G_IVA;
              dispersion.IVA =
                deposito.RESTA * lote.PORCIVA - dispersion.ABONADO;
              dispersion.MONSIVA =
                deposito.RESTA - (dispersion.ABONADO + dispersion.IVA);
              dispersion.GARATIA = lote.GARATIA;
              deposito.RESTA = 0;
              dispersion.TIPO = 'N';
            }
            this.DISPERSION.push(dispersion);
          });
        }
      });
    } else if (phase == 4) {
      this.DEPOSITOS.forEach((deposito) => {
        if (deposito.RESTA > 0) {
          this.LOTESXCLI.forEach((lote) => {
            var dispersion: Dispersa = {};
            if (lote.LOTE == deposito.LOTE && (lote.MARCPENA || 'N') != 'S') {
              dispersion.CLIENTE = lote.CLIENTE;
              dispersion.LOTE = lote.LOTE;
              dispersion.MANDATO = lote.MANDATO;
              dispersion.PRECIO = lote.PRECIO;
              dispersion.ID_PAGO = deposito.ID_PAGO;
              dispersion.ABONADO = (deposito.RESTA * lote.PORCIVA) / this.G_IVA;
              dispersion.IVA =
                deposito.RESTA * lote.PORCIVA - dispersion.ABONADO;
              dispersion.MONSIVA =
                deposito.RESTA - (dispersion.ABONADO + dispersion.IVA);
              dispersion.GARATIA = lote.GARATIA;
              deposito.RESTA = 0;
              dispersion.TIPO = 'N';
            }
            this.DISPERSION.push(dispersion);
          });
        } else {
          this.LOTESXCLI.forEach((lote) => {
            var dispersion: Dispersa = {};
            if (lote.LOTE == deposito.LOTE && (lote.MARCPENA || 'N') != 'S') {
              dispersion.CLIENTE = lote.CLIENTE;
              dispersion.LOTE = lote.LOTE;
              dispersion.MANDATO = lote.MANDATO;
              dispersion.PRECIO = lote.PRECIO;
              dispersion.ID_PAGO = deposito.ID_PAGO;
              dispersion.ABONADO = (deposito.RESTA * lote.PORCIVA) / this.G_IVA;
              dispersion.IVA =
                deposito.RESTA * lote.PORCIVA - dispersion.ABONADO;
              dispersion.MONSIVA =
                deposito.RESTA - (dispersion.ABONADO + dispersion.IVA);
              dispersion.GARATIA = lote.GARATIA;
              deposito.RESTA = 0;
              dispersion.TIPO = 'P';
            }
            this.DISPERSION.push(dispersion);
          });
        }
      });
    }

    this.DEPOSITOS.forEach((deposito) => {
      var dispersion: Dispersa = {};
      if (deposito.RESTA > 0) {
        dispersion.CLIENTE = client;
        dispersion.MANDATO = deposito.MANDATO;
        dispersion.PRECIO = deposito.RESTA;
        dispersion.ID_PAGO = deposito.ID_PAGO;
        dispersion.ABONADO = deposito.RESTA;
        dispersion.GARATIA = deposito.RESTA;
        dispersion.TIPO = 'D';
        dispersion.LOTE = deposito.LOTE;
        deposito.RESTA = 0;
      }
      this.DISPERSION.push(dispersion);
    });

    return true;
  }

  async insDispBm(client: number, quien: number, event: number) {
    const dateNow = LocalDate.getNow();

    var I_SUMA = 0;

    if (quien == 6) {
      this.iniDGenRef(event);
      for (const dispersion of this.DISPERSION) {
        I_SUMA = dispersion.MONSIVA + dispersion.ABONADO + dispersion.IVA;
        if (I_SUMA > 0) {
          this.G_PKREFGEN++;
          await this.entity.query(` INSERT INTO sera.COMER_PAGOSREFGENS
                                        (    ID_EVENTO,                ID_PAGOREFGENS,            ID_PAGO,                ID_LOTE,         MONTO,
                                        NO_TRANSFERENTE,         MONTO_NOAPP_IVA,        MONTO_APP_IVA,            IVA,             TIPO,
                                        MONTO_CHATARRA,            FECHA_PROCESO
                                        )
                                        VALUES
                                        (    ${event},                ${this.G_PKREFGEN},              ${dispersion.ID_PAGO},    ${dispersion.LOTE}, ${I_SUMA},
                                                ${dispersion.MANDATO},    ${dispersion.MONSIVA},   ${dispersion.ABONADO},    ${dispersion.IVA}, ${dispersion.TIPO},
                                                ${dispersion.MONCHATA},    CAST('${dateNow}' AS DATE)
                                        );`);
        }
      }
    }
    return;
  }

  async dispDevol(event: number, client: number) {
    var PROP_IVA_CHAT = 0.0;
    var PROP_ISR_CHAT = 0.0;
    this.DEPOSITOS.forEach((deposito, index) => {
      if (deposito.RESTA > 0) {
        this.LOTESXCLI.forEach((lote, li) => {
          if (
            lote.PAGADO == 'N' &&
            deposito.RESTA > 0 &&
            lote.ASIGNADO == 'S' &&
            lote.MEFALTA > 0
          ) {
            var dispersion: Dispersa = {};

            if (deposito.RESTA == lote.MEFALTA && deposito.RESTA > 0) {
              this.GK++;
              dispersion.CLIENTE = client;
              dispersion.LOTE = lote.LOTE;
              dispersion.MANDATO = lote.MANDATO;
              dispersion.PRECIO = lote.MEFALTA;
              dispersion.ID_PAGO = deposito.ID_PAGO;
              if (lote.ESCHATA == 'S') {
                dispersion.MONCHATA =
                  (lote.MEFALTA * lote.PORCIVA * (this.G_PCTCHATARRA / 100), 2);
                PROP_ISR_CHAT = (dispersion.MONCHATA / this.G_IVA, 2);
                PROP_IVA_CHAT = (dispersion.MONCHATA - PROP_ISR_CHAT, 2);
                dispersion.ABONADO =
                  ((lote.MEFALTA * lote.PORCIVA) / this.G_IVA, 2);
                dispersion.IVA =
                  (lote.MEFALTA * lote.PORCIVA, 2) -
                  dispersion.ABONADO +
                  PROP_IVA_CHAT;
                dispersion.ABONADO = dispersion.ABONADO + PROP_ISR_CHAT;
                dispersion.MONSIVA = (lote.MEFALTA * lote.PORNIVA, 2);
              } else {
                dispersion.ABONADO =
                  ((lote.MEFALTA * lote.PORCIVA) / this.G_IVA, 2);
                dispersion.IVA =
                  (lote.MEFALTA * lote.PORCIVA, 2) - dispersion.ABONADO;
                dispersion.MONSIVA = (lote.MEFALTA * lote.PORNIVA, 2);
              }
              dispersion.GARATIA = lote.GARATIA;
              lote.MEFALTA = 0;
              dispersion.TIPO = 'N';
              lote.PAGADO = 'S';
              deposito.RESTA = 0;
              this.DISPERSION.push(dispersion);
            } else if (deposito.RESTA < lote.MEFALTA && deposito.RESTA > 0) {
              dispersion.CLIENTE = client;
              dispersion.LOTE = lote.LOTE;
              dispersion.MANDATO = lote.MANDATO;
              dispersion.PRECIO = lote.PRECIO;
              dispersion.ID_PAGO = deposito.ID_PAGO;
              if (lote.ESCHATA == 'S') {
                dispersion.MONCHATA =
                  (deposito.RESTA * lote.PORCIVA * (this.G_PCTCHATARRA / 100),
                    2);
                PROP_ISR_CHAT = (dispersion.MONCHATA / this.G_IVA, 2);
                PROP_IVA_CHAT = (dispersion.MONCHATA - PROP_ISR_CHAT, 2);
                dispersion.ABONADO =
                  ((deposito.RESTA * lote.PORCIVA) / this.G_IVA, 2);
                dispersion.IVA =
                  (deposito.RESTA * lote.PORCIVA, 2) -
                  dispersion.ABONADO +
                  PROP_IVA_CHAT;
                dispersion.MONSIVA = (deposito.RESTA * lote.PORNIVA, 2);
                dispersion.ABONADO = dispersion.ABONADO + PROP_ISR_CHAT;
              } else {
                dispersion.ABONADO =
                  ((deposito.RESTA * lote.PORCIVA) / this.G_IVA, 2);
                dispersion.IVA =
                  (deposito.RESTA * lote.PORCIVA, 2) - dispersion.ABONADO;
                dispersion.MONSIVA = (deposito.RESTA * lote.PORNIVA, 2);
              }
              dispersion.GARATIA = lote.GARATIA;
              lote.MEFALTA = lote.MEFALTA - deposito.RESTA;
              dispersion.TIPO = 'N';
              deposito.RESTA = 0;
              lote.PAGADO = 'N';
            } else if (deposito.RESTA > lote.MEFALTA && deposito.RESTA > 0) {
              this.GK++;
              dispersion.CLIENTE = client;
              dispersion.LOTE = lote.LOTE;
              dispersion.MANDATO = lote.MANDATO;
              dispersion.PRECIO = lote.PRECIO;
              dispersion.ID_PAGO = deposito.ID_PAGO;
              if (lote.ESCHATA == 'S') {
                dispersion.MONCHATA =
                  (lote.MEFALTA * lote.PORCIVA * (this.G_PCTCHATARRA / 100), 2);
                PROP_ISR_CHAT = (dispersion.MONCHATA / this.G_IVA, 2);
                PROP_IVA_CHAT = (dispersion.MONCHATA - PROP_ISR_CHAT, 2);
                dispersion.ABONADO =
                  ((lote.MEFALTA * lote.PORCIVA) / this.G_IVA, 2);
                dispersion.IVA =
                  (lote.MEFALTA * lote.PORCIVA, 2) -
                  dispersion.ABONADO +
                  PROP_IVA_CHAT;
                dispersion.MONSIVA = (lote.MEFALTA * lote.PORNIVA, 2);
                dispersion.ABONADO = dispersion.ABONADO + PROP_ISR_CHAT;
              } else {
                dispersion.ABONADO =
                  ((lote.MEFALTA * lote.PORCIVA) / this.G_IVA, 2);
                dispersion.IVA =
                  (lote.MEFALTA * lote.PORCIVA, 2) - dispersion.ABONADO;
                dispersion.MONSIVA = (lote.MEFALTA * lote.PORNIVA, 2);
              }
              dispersion.GARATIA = lote.GARATIA;
              deposito.RESTA = deposito.RESTA - lote.MEFALTA;
              lote.MEFALTA = 0;
              dispersion.TIPO = 'N';
              lote.PAGADO = 'S';
            }

            this.DISPERSION.push(dispersion);
          }
        });
      }
    });
    this.DEPOSITOS.forEach((element) => {
      if (element.RESTA > 0) {
        this.GK++;
        var dispersion: Dispersa = {};
        dispersion.CLIENTE = client;
        dispersion.MANDATO = element.MANDATO;
        dispersion.PRECIO = element.RESTA;
        dispersion.ID_PAGO = element.ID_PAGO;
        dispersion.MONSIVA = element.RESTA;
        dispersion.GARATIA = element.RESTA;
        dispersion.TIPO = 'D';
        dispersion.LOTE = element.LOTE;
        this.DISPERSION.push(dispersion);
      }
    });
  }

  async prepareLot(event: number, type: string) {
    var V_TPEVENTO = 0;
    var result = await this.entity.query(
      `SELECT ID_TPEVENTO FROM sera.COMER_EVENTOS WHERE ID_EVENTO = ${event}`,
    );
    V_TPEVENTO = result[0].id_tpevento || 0;
    if (V_TPEVENTO != 2 && V_TPEVENTO != 3) {
      if (type == 'M') {
        // await this.entity.query(` UPDATE    sera.COMER_LOTES
        // SET        (MONTO_APP_IVA,     MONTO_NOAPP_IVA,      PORC_APP_IVA,
        //      IVA_LOTE,         MONTO_SIN_IVA,     PORC_NOAPP_IVA) =
        // (SELECT    SUM(BXL.PRECIO_FINAL), SUM(BXL.MONTO_NOAPP_IVA), ( SUM(BXL.PRECIO_FINAL)/LOT.PRECIO_FINAL, 2),
        //     SUM(BXL.IVA_FINAL),     SUM(BXL.PRECIO_SIN_IVA), ( SUM(BXL.MONTO_NOAPP_IVA)/LOT.PRECIO_FINAL ,2)
        //   FROM    sera.COMER_BIENESXLOTE BXL
        //      WHERE    BXL.ID_LOTE = LOT.ID_LOTE
        // AND    BXL.PRECIO_FINAL > 0
        // )
        // WHERE    ID_EVENTO = ${event}
        // AND    LOTE_PUBLICO != 0
        // AND    (PRECIO_FINAL > 0 OR PRECIO_FINAL IS NOT NULL)
        // AND    ID_CLIENTE IS NOT NULL`)

        await this.entity.query(`
                                update
                                sera.COMER_LOTES
                        set
                                (MONTO_APP_IVA,
                                MONTO_NOAPP_IVA,
                                PORC_APP_IVA,
                                IVA_LOTE,
                                MONTO_SIN_IVA,
                                PORC_NOAPP_IVA) =
                                                        (
                        SELECT
                            SUM(BXL.PRECIO_FINAL),
                            SUM(BXL.MONTO_NOAPP_IVA),
                            ROUND(SUM(BXL.PRECIO_FINAL) / LOT.PRECIO_FINAL, 2) AS computed_value_1,
                            SUM(BXL.IVA_FINAL),
                            SUM(BXL.PRECIO_SIN_IVA),
                            ROUND(SUM(BXL.MONTO_NOAPP_IVA) / LOT.PRECIO_FINAL, 2) AS computed_value_2
                        FROM
                            sera.COMER_BIENESXLOTE BXL
                        JOIN
                            sera.COMER_LOTES ON BXL.ID_LOTE = LOT.ID_LOTE
                        WHERE
                            BXL.PRECIO_FINAL > 0
                        GROUP BY
                            LOT.PRECIO_FINAL limit 1
                        
                                                        )
                        where
                                ID_EVENTO =13
                                and LOTE_PUBLICO != 0
                                and (PRECIO_FINAL > 0
                                        or PRECIO_FINAL is not null)
                                and ID_CLIENTE is not null
                                `);
      } else if (type == 'I') {
        await this.entity.query(`UPDATE    sera.COMER_LOTES LOT
                                SET        (MONTO_APP_IVA,     MONTO_NOAPP_IVA,      PORC_APP_IVA,
                                     IVA_LOTE,         MONTO_SIN_IVA,     PORC_NOAPP_IVA) =
                                     (SELECT       SUM(BXL.MONTO_APP_IVA),     SUM(BXL.MONTO_NOAPP_IVA), (SUM(BXL.MONTO_APP_IVA+BXL.IVA_FINAL)/LOT.PRECIO_FINAL),
                                      SUM(BXL.IVA_FINAL),        SUM(BXL.PRECIO_SIN_IVA),        (SUM(BXL.MONTO_NOAPP_IVA)/LOT.PRECIO_FINAL)
                                    FROM    sera.COMER_BIENESXLOTE BXL
                                    WHERE    BXL.ID_LOTE = LOT.ID_LOTE
                                    AND    BXL.PRECIO_FINAL > 0
                                )
                                WHERE    ID_EVENTO = ${event}
                                AND    LOTE_PUBLICO != 0
                                AND    (PRECIO_FINAL > 0 OR PRECIO_FINAL IS NOT NULL)
                                AND    ID_CLIENTE IS NOT NULL;`);
      }
    }
    return true;
  }

  async ventaInmu1Act(
    event: number,
    date: Date,
    lot: number = 0,
    phase: number,
    address: string,
  ) {
    var VI1_MONTO = 0.0;
    var VI1_LOTE = 0;
    var VI1_PRECFINAL = 0.0;
    var VI1_PAGADO = 0.0;
    var VI1_ACUM = 0.0;
    var VI1_ANTICIPO = 0.0;
    var VI1_CLIENTE = 0;

    if (phase == 1) {
      var P1_F1 = await this.entity
        .query(`SELECT    LOT.ID_LOTE, LOT.PRECIO_FINAL, SUM(PAG.MONTO) as pagado, coalesce(LOT.ACUMULADO,0) as acum as acum, LOT.ANTICIPO, LOT.ID_CLIENTE
                        FROM    sera.COMER_LOTES LOT, sera.COMER_PAGOREF PAG, sera.COMER_REF_GARANTIAS CRG
                        WHERE    LOT.ID_EVENTO = ${event} 
                        AND        PAG.VALIDO_SISTEMA = 'A'
                        AND        LOT.ID_LOTE = coalesce(${lot}, LOT.ID_LOTE)
                        AND        LOT.ID_LOTE = PAG.ID_LOTE
                        AND        PAG.FECHA          <= '${date}'
                        AND        coalesce(LOT.ESASIGNADO,'S') != 'N'
                        AND        LOT.ID_EVENTO = CRG.ID_EVENTO
                        AND        LOT.ID_LOTE = CRG.ID_LOTE
                        AND        LOT.ID_CLIENTE = CRG.ID_CLIENTE
                        AND        PAG.REFERENCIA = CRG.REF_GSAE||CRG.REF_GBANCO
                        GROUP BY LOT.ID_LOTE, LOT.PRECIO_FINAL, LOT.ACUMULADO, LOT.ANTICIPO, LOT.ID_CLIENTE
                `);
      P1_F1.forEach(async (element) => {
        if (address == 'I') {
          if (element.precio_final == element.pagado) {
            await this.insertAreFGensAct(element.id_lote, date, event, phase);
          }
        } else {
          if (
            element.precio_final == element.pagado ||
            element.anticipo == element.pagado
          ) {
            await this.insertAreFGensAct(element.id_lote, date, event, phase);
          }
        }

        await this.actClienteProc(element.id_cliente, event);
      });
    } else if (phase == 2) {
      var P1_F2 = await this.entity
        .query(`SELECT    LOT.ID_LOTE, LOT.PRECIO_FINAL, SUM(PAG.MONTO) as pagado, coalesce(LOT.ACUMULADO,0) as acum, LOT.ANTICIPO, LOT.ID_CLIENTE
                        FROM    sera.COMER_LOTES LOT, sera.COMER_PAGOREF PAG
                        WHERE    LOT.ID_EVENTO = ${event}
                        AND        PAG.VALIDO_SISTEMA = 'A'
                        AND        LOT.ID_LOTE = coalesce(${lot}, LOT.ID_LOTE)
                        AND        LOT.ID_LOTE = PAG.ID_LOTE
                        AND        PAG.FECHA          <= '${date}'
                        AND        coalesce(LOT.ESASIGNADO,'S') != 'N'
                        AND        PAG.REFERENCIA LIKE '2%'
                        AND        EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${event}
                                        AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND        CXE.PROCESAR = 'S'
                                        AND        CXE.ENVIADO_SIRSAE = 'N'
                                        )
                        GROUP BY LOT.ID_LOTE, LOT.PRECIO_FINAL, LOT.ACUMULADO, LOT.ANTICIPO, LOT.ID_CLIENTE
                `);
      P1_F2.forEach(async (element) => {
        if (
          element.precio_final == element.pagado ||
          element.anticipo == element.pagado
        ) {
          if (address == 'I') {
            await this.insertAreFGensAct(element.id_lote, date, event, phase);
          } else {
            await this.insertAreFGens(element.id_lote, date, event, phase);
          }
        }

        await this.actClienteProc(element.id_cliente, event);
      });
    } else if (phase == 7) {
      var P1_F7 = await this.entity
        .query(`SELECT    LOT.ID_LOTE, LOT.PRECIO_FINAL, SUM(PAG.MONTO) as pagado, coalesce(LOT.ACUMULADO,0) as acum, LOT.ANTICIPO, LOT.ID_CLIENTE
                        FROM    sera.COMER_LOTES LOT, sera.COMER_PAGOREF PAG
                        WHERE    LOT.ID_EVENTO = ${event}
                        AND        PAG.VALIDO_SISTEMA = 'A'
                        AND        LOT.ID_LOTE = coalesce(${lot}, LOT.ID_LOTE)
                        AND        LOT.ID_LOTE = PAG.ID_LOTE
                        AND        PAG.FECHA          <= '${date}'
                        AND        coalesce(LOT.ESASIGNADO,'S') != 'N'
                        AND        PAG.REFERENCIA LIKE '7%'
                        AND        EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${event}
                                        AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND        CXE.PROCESAR = 'S'
                                        AND        CXE.ENVIADO_SIRSAE = 'N'
                                        )
                        GROUP BY LOT.ID_LOTE, LOT.PRECIO_FINAL, LOT.ACUMULADO, LOT.ANTICIPO, LOT.ID_CLIENTE`);
      P1_F7.forEach(async (element) => {
        if (address == 'I') {
          if (element.precio_final / 4 - element.aticipo > element.pagado) {
            await this.insertAreFGensAct(element.id_lote, date, event, phase);
          }
        } else {
          if (
            element.precio_final == element.pagado ||
            element.anticipo == element.pagado
          ) {
            await this.insertAreFGens(element.id_lote, date, event, phase);
          }
        }

        await this.actClienteProc(element.id_cliente, event);
      });
    } else if (phase == 3) {
      var P1_F3 = await this.entity
        .query(`SELECT    LOT.ID_LOTE, LOT.PRECIO_FINAL, SUM(PAG.MONTO) as pagado, coalesce(LOT.ACUMULADO,0) as acum, LOT.ANTICIPO, LOT.ID_CLIENTE
                        FROM    sera.COMER_LOTES LOT, sera.COMER_PAGOREF PAG
                        WHERE    LOT.ID_EVENTO = ${event}
                        AND        PAG.VALIDO_SISTEMA = 'A'
                        AND        LOT.ID_LOTE = coalesce(${lot}, LOT.ID_LOTE)
                        AND        LOT.ID_LOTE = PAG.ID_LOTE
                        AND        PAG.FECHA          <= '${date}'
                        AND        coalesce(LOT.ESASIGNADO,'S') != 'N'
                        AND        PAG.REFERENCIA LIKE '3%'
                        AND        EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${event}
                                        AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND        CXE.PROCESAR = 'S'
                                        AND        CXE.ENVIADO_SIRSAE = 'N'
                                        )
                        GROUP BY LOT.ID_LOTE, LOT.PRECIO_FINAL, LOT.ACUMULADO, LOT.ANTICIPO, LOT.ID_CLIENTE
                `);

      P1_F3.forEach(async (element) => {
        if (element.precio_final - element.acum == element.pagado) {
          if (address == 'I') {
            await this.insertAreFGensAct(element.id_lote, date, event, phase);
          } else {
            await this.insertAreFGens(element.id_lote, date, event, phase);
          }
        }

        await this.actClienteProc(element.id_cliente, event);
      });
    } else if (phase == 4) {
      var P1_F4 = await this.entity
        .query(`SELECT    LOT.ID_LOTE, LOT.PRECIO_FINAL, SUM(PAG.MONTO) as pagado, coalesce(LOT.ACUMULADO,0) as acum, LOT.ANTICIPO, LOT.ID_CLIENTE
                        FROM    sera.COMER_LOTES LOT, sera.COMER_PAGOREF PAG
                        WHERE    LOT.ID_EVENTO = ${event}
                        AND        PAG.VALIDO_SISTEMA = 'A'
                        AND        LOT.ID_LOTE = coalesce(${lot}, LOT.ID_LOTE)
                        AND        LOT.ID_LOTE = PAG.ID_LOTE
                        AND        PAG.FECHA          <= '${date}'
                        AND        coalesce(LOT.ESASIGNADO,'S') != 'N'
                        AND        PAG.REFERENCIA LIKE '4%'
                        AND        EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${event}
                                        AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND        CXE.PROCESAR = 'S'
                                        AND        CXE.ENVIADO_SIRSAE = 'N'
                                        )
                        GROUP BY LOT.ID_LOTE, LOT.PRECIO_FINAL, LOT.ACUMULADO, LOT.ANTICIPO, LOT.ID_CLIENTE
                `);
      P1_F4.forEach(async (element) => {
        if (element.precio_final - element.acum == element.pagado) {
          if (address == 'I') {
            await this.insertAreFGensAct(element.id_lote, date, event, phase);
          } else {
            await this.insertAreFGens(element.id_lote, date, event, phase);
          }
        }

        await this.actClienteProc(element.id_cliente, event);
      });
    } else {
      var P1 = await this.entity
        .query(`SELECT    LOT.ID_LOTE, LOT.PRECIO_FINAL, SUM(PAG.MONTO) as pagado, coalesce(LOT.ACUMULADO,0) as acum, LOT.ANTICIPO, LOT.ID_CLIENTE
                        FROM    sera.COMER_LOTES LOT, sera.COMER_PAGOREF PAG
                        WHERE    LOT.ID_EVENTO = ${event}
                        AND        PAG.VALIDO_SISTEMA = 'A'
                        AND        LOT.ID_LOTE = coalesce(${lot}, LOT.ID_LOTE)
                        AND        LOT.ID_LOTE = PAG.ID_LOTE
                        AND        PAG.FECHA          <= '${date}'
                        AND        coalesce(LOT.ESASIGNADO,'S') != 'N'
                        AND        PAG.REFERENCIA LIKE '2%'
                        AND        EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${event}
                                        AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND        CXE.PROCESAR = 'S'
                                        AND        CXE.ENVIADO_SIRSAE = 'N'
                                        )
                        GROUP BY LOT.ID_LOTE, LOT.PRECIO_FINAL, LOT.ACUMULADO, LOT.ANTICIPO, LOT.ID_CLIENTE`);
      P1.forEach(async (element) => {
        if (element.precio_final - element.acum == element.pagado) {
          if (address == 'I') {
            await this.insertAreFGensAct(element.id_lote, date, event, phase);
          } else {
            await this.insertAreFGens(element.id_lote, date, event, phase);
          }
        }

        await this.actClienteProc(element.id_cliente, event);
      });
    }
    return true;
  }

  async insertAreFGensAct(
    lot: number,
    date: Date,
    event: number,
    phase: number,
  ) {
    var V_LOTE = 0;
    var V_IDPAGO = 0;
    var V_MANDA = 0;
    var V_MONTO = 0.0;
    var V_REFE = '';
    var V_DIRECCION = '';
    var V_PCIVA = 0.0;
    var V_PCSIVA = 0.0;
    var C_MONTOIVA = 0.0;
    var C_IVA = 0.0;
    var C_NOMONIVA = 0.0;
    const dateNow = LocalDate.getNow();

    await this.iniDGenRef(event);
    var resultAddress = await this.entity.query(
      `SELECT DIRECCION  FROM sera.COMER_EVENTOS WHERE ID_EVENTO = ${event}`,
    );
    V_DIRECCION = resultAddress[0].direccion || '';
    if (phase == 1) {
      var I1_F1 = await this.entity
        .query(`SELECT PAG.ID_LOTE, PAG.ID_PAGO, PAG.MONTO, PAG.REFERENCIA, LOT.NO_TRANSFERENTE, LOT.PORC_APP_IVA as pciva, LOT.PORC_NOAPP_IVA
                                FROM sera.COMER_PAGOREF PAG, sera.COMER_LOTES LOT, sera.COMER_REF_GARANTIAS CRG
                                WHERE LOT.ID_LOTE          = ${lot}
                                AND PAG.VALIDO_SISTEMA   = 'A'
                                AND LOT.ID_LOTE          = PAG.ID_LOTE
                                AND PAG.FECHA            <= '${date}'
                                AND PAG.IDORDENINGRESO   IS NULL
                                AND LOT.ID_LOTE          = CRG.ID_LOTE
                                AND LOT.ID_CLIENTE       = CRG.ID_CLIENTE
                                AND PAG.REFERENCIA       = CRG.REF_GSAE||CRG.REF_GBANCO
                                ORDER BY PAG.MONTO DESC`);
      I1_F1.forEach(async (element) => {
        C_MONTOIVA = ((element.monto * element.pciva) / this.G_IVA, 2);
        C_IVA = (element.monto * element.pciva, 2) - C_MONTOIVA;
        C_NOMONIVA = element.monto - ((C_MONTOIVA || 0) + (C_IVA || 0));
        this.G_PKREFGEN = this.G_PKREFGEN + 1;
        await this.entity.query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                 MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                )
                                VALUES
                                (${this.G_PKREFGEN},        ${element.id_pago},        ${element.id_lote},        ${element.monto},    ${element.no_transferente},
                                 ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${element.referencia},        'N', ${event}, CAST('${dateNow}' AS DATE)
                                )`);
        await this.regularPay(
          element.id_lote,
          V_DIRECCION,
          phase,
          element.monto,
          element.id_pago,
        );
      });
    } else if (phase == 7) {
      var I1_F7 = await this.entity
        .query(` SELECT PAG.ID_LOTE, PAG.ID_PAGO, PAG.MONTO, PAG.REFERENCIA, LOT.NO_TRANSFERENTE, LOT.PORC_APP_IVA as pciva, LOT.PORC_NOAPP_IVA
                                FROM sera.COMER_PAGOREF PAG, sera.COMER_LOTES LOT
                                WHERE LOT.ID_LOTE          = ${lot}
                                AND PAG.VALIDO_SISTEMA   = 'A'
                                AND LOT.ID_LOTE          = PAG.ID_LOTE
                                AND PAG.FECHA            <= '${date}'
                                AND PAG.IDORDENINGRESO IS NULL
                                AND PAG.REFERENCIA LIKE '7%'
                                AND EXISTS ( SELECT 1
                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE CXE.ID_EVENTO = ${event}
                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND CXE.PROCESAR = 'S'
                                                AND CXE.ENVIADO_SIRSAE = 'N' )
                                ORDER BY PAG.MONTO DESC`);

      I1_F7.forEach(async (element) => {
        C_MONTOIVA = ((element.monto * element.pciva) / this.G_IVA, 2);
        C_IVA = (element.monto * element.pciva, 2) - C_MONTOIVA;
        C_NOMONIVA = element.monto - ((C_MONTOIVA || 0) + (C_IVA || 0));
        this.G_PKREFGEN = this.G_PKREFGEN + 1;
        await this.entity.query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                )
                                VALUES
                                (${this.G_PKREFGEN},        ${element.id_pago},        ${element.id_lote},        ${element.monto},    ${element.no_transferente},
                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${element.referencia},        'N', ${event}, CAST('${dateNow}' AS DATE)
                                )`);
        await this.regularPay(
          element.id_lote,
          V_DIRECCION,
          phase,
          element.monto,
          element.id_pago,
        );
      });
    } else if (phase == 3) {
      var I1_F3 = await this.entity
        .query(`SELECT PAG.ID_LOTE, PAG.ID_PAGO, PAG.MONTO, PAG.REFERENCIA, LOT.NO_TRANSFERENTE, LOT.PORC_APP_IVA, LOT.PORC_NOAPP_IVA
                                FROMsera.COMER_PAGOREF PAG, sera.COMER_LOTES LOT
                                WHERE LOT.ID_LOTE          = ${lot}
                                AND PAG.VALIDO_SISTEMA   = 'A'
                                AND LOT.ID_LOTE          = PAG.ID_LOTE
                                AND PAG.FECHA            <= '${date}'
                                AND PAG.IDORDENINGRESO IS NULL
                                AND PAG.REFERENCIA LIKE '3%'
                                AND EXISTS ( SELECT 1
                                                FROMsera.COMER_CLIENTESXEVENTO CXE
                                        WHERE CXE.ID_EVENTO = ${event}
                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND CXE.PROCESAR = 'S'
                                                AND CXE.ENVIADO_SIRSAE = 'N' )
                                ORDER BY PAG.MONTO DESC`);

      I1_F3.forEach(async (element) => {
        C_MONTOIVA = ((element.monto * element.pciva) / this.G_IVA, 2);
        C_IVA = (element.monto * element.pciva, 2) - C_MONTOIVA;
        C_NOMONIVA = element.monto - ((C_MONTOIVA || 0) + (C_IVA || 0));
        this.G_PKREFGEN = this.G_PKREFGEN + 1;
        await this.entity.query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                )
                                VALUES
                                (${this.G_PKREFGEN},        ${element.id_pago},        ${element.id_lote},        ${element.monto},    ${element.no_transferente},
                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${element.referencia},        'N', ${event}, CAST('${dateNow}' AS DATE)
                                )`);
        await this.regularPay(
          element.id_lote,
          V_DIRECCION,
          phase,
          element.monto,
          element.id_pago,
        );
      });
    } else if (phase == 4) {
      var I1_F4 = await this.entity
        .query(`SELECT PAG.ID_LOTE, PAG.ID_PAGO, PAG.MONTO, PAG.REFERENCIA, LOT.NO_TRANSFERENTE, LOT.PORC_APP_IVA as pciva, LOT.PORC_NOAPP_IVA
                                FROM sera.COMER_PAGOREF PAG, sera.COMER_LOTES LOT
                                WHERE LOT.ID_LOTE          = ${lot}
                                AND PAG.VALIDO_SISTEMA   = 'A'
                                AND LOT.ID_LOTE          = PAG.ID_LOTE
                                AND PAG.FECHA            <= '${date}'
                                AND PAG.IDORDENINGRESO IS NULL
                                AND PAG.REFERENCIA LIKE '4%'
                                AND EXISTS ( SELECT 1
                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE CXE.ID_EVENTO = ${event}
                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND CXE.PROCESAR = 'S'
                                                AND CXE.ENVIADO_SIRSAE = 'N' )
                                ORDER BY PAG.MONTO DESC`);

      I1_F4.forEach(async (element) => {
        C_MONTOIVA = ((element.monto * element.pciva) / this.G_IVA, 2);
        C_IVA = (element.monto * element.pciva, 2) - C_MONTOIVA;
        C_NOMONIVA = element.monto - ((C_MONTOIVA || 0) + (C_IVA || 0));
        this.G_PKREFGEN = this.G_PKREFGEN + 1;
        await this.entity.query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                        MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                )
                                VALUES
                                (${this.G_PKREFGEN},        ${element.id_pago},        ${element.id_lote},        ${element.monto},    ${element.no_transferente},
                                        ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${element.referencia},        'N', ${event}, CAST('${dateNow}' AS DATE)
                                )`);
        await this.regularPay(
          element.id_lote,
          V_DIRECCION,
          phase,
          element.monto,
          element.id_pago,
        );
      });
    } else {
      var I1 = await this.entity
        .query(` SELECT PAG.ID_LOTE, PAG.ID_PAGO, PAG.MONTO, PAG.REFERENCIA, LOT.NO_TRANSFERENTE, LOT.PORC_APP_IVA as pciva, LOT.PORC_NOAPP_IVA
                                FROM sera.COMER_PAGOREF PAG, sera.COMER_LOTES LOT
                                WHERE LOT.ID_LOTE          = ${lot}
                                AND PAG.VALIDO_SISTEMA   = 'A'
                                AND LOT.ID_LOTE          = PAG.ID_LOTE
                                AND PAG.FECHA            <= '${date}'
                                AND PAG.IDORDENINGRESO IS NULL
                                ORDER BY PAG.MONTO DESC`);
      I1.forEach(async (element) => {
        C_MONTOIVA = ((element.monto * element.pciva) / this.G_IVA, 2);
        C_IVA = (element.monto * element.pciva, 2) - C_MONTOIVA;
        C_NOMONIVA = element.monto - ((C_MONTOIVA || 0) + (C_IVA || 0));
        this.G_PKREFGEN = this.G_PKREFGEN + 1;
        await this.entity.query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                        (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                        )
                                        VALUES
                                        (${this.G_PKREFGEN},        ${element.id_pago},        ${element.id_lote},        ${element.monto},    ${element.no_transferente},
                                                ${C_NOMONIVA},        ${C_MONTOIVA},        ${C_IVA},        ${element.referencia},        'N', ${event}, CAST('${dateNow}' AS DATE)
                                        )`);
        await this.regularPay(
          element.id_lote,
          V_DIRECCION,
          phase,
          element.monto,
          element.id_pago,
        );
      });
    }
  }
  async insertAreFGens(lot: number, date: Date, event: number, phase: number) {
    var V_LOTE = 0;
    var V_IDPAGO = 0;
    var V_MANDA = 0;
    var V_MONTO = 0.0;
    var V_REFE = '';
    var V_PCIVA = 0.0;
    var V_PCSIVA = 0.0;
    var C_MONTOIVA = 0.0;
    var C_IVA = 0.0;
    var C_NOMONIVA = 0.0;
    const dateNow = LocalDate.getNow();

    await this.iniDGenRef(event);

    var I1: any[] = await this.entity
      .query(`SELECT    PAG.ID_LOTE, PAG.ID_PAGO, PAG.MONTO, PAG.REFERENCIA, LOT.NO_TRANSFERENTE as manda, LOT.PORC_APP_IVA as pciva, LOT.PORC_NOAPP_IVA
                        FROM    sera.COMER_PAGOREF PAG, sera.COMER_LOTES LOT
                        WHERE    LOT.ID_LOTE = ${lot}
                        AND        PAG.VALIDO_SISTEMA = 'A'
                        AND        LOT.ID_LOTE = PAG.ID_LOTE
                        AND        PAG.FECHA          <= '${date}'
                        AND        PAG.IDORDENINGRESO IS NULL
                        ORDER BY PAG.MONTO DESC`);

    I1.forEach(async (element) => {
      this.G_PKREFGEN = this.G_PKREFGEN + 1;
      C_MONTOIVA = parseFloat(
        ((element.monto * element.pciva) / this.G_IVA).toFixed(2),
      );
      C_IVA = parseFloat(
        (element.monto * element.pciva - C_MONTOIVA).toFixed(2),
      );
      C_NOMONIVA = element.monto - (C_MONTOIVA || 0 + C_IVA || 0);

      await this.entity.query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                (ID_PAGOREFGENS,    ID_PAGO,        ID_LOTE,    MONTO,        NO_TRANSFERENTE,
                                MONTO_NOAPP_IVA,    MONTO_APP_IVA,    IVA,        REFERENCIA,    TIPO, ID_EVENTO, FECHA_PROCESO
                                )
                                VALUES
                                (${this.G_PKREFGEN},        ${element.idpago},        ${element.id_lote},        ${element.monto},    ${V_MANDA},
                                ${C_NOMONIVA},        ${C_NOMONIVA},        ${C_IVA},        ${element.referencia},        'N', ${event},CAST('${dateNow}' AS DATE)
                        )`);
    });
  }

  async actClienteProc(client: number, event: number) {
    const dateNow = LocalDate.getNow();
    return await this.entity.query(` UPDATE    sera.COMER_CLIENTESXEVENTO
                        SET    PROCESADO = 'S', FECHA_EJECUCION = CAST('${dateNow}' AS DATE)
                        WHERE    ID_EVENTO = ${event}
                        AND    ID_CLIENTE = ${client}
                `);
  }

  async regularPay(
    lot: number,
    type: string,
    phase: number,
    amount: number,
    payment: number,
  ) {
    await this.entity.query(` UPDATE    sera.COMER_PAGOREF 
                        SET    VALIDO_SISTEMA = 'S'
                        WHERE    ID_PAGO = ${payment}`);
    if (type == 'I' && (phase == 1 || phase == 2 || phase == 7)) {
      await this.entity.query(`  UPDATE    sera.COMER_LOTES
                        SET    VALIDO_SISTEMA = 'G',
                               ACUMULADO = coalesce(ACUMULADO,0) + MONTO
                      WHERE    ID_LOTE = ${lot}`);
    } else if (type == 'I' && (phase == 3 || phase == 4)) {
      await this.entity.query(`UPDATE    sera.COMER_LOTES
                                SET    VALIDO_SISTEMA = 'S'
                                WHERE    ID_LOTE = ${lot}`);
    }
    return true;
  }

  async llenaLotesAct(
    event: number,
    client: number,
    lot: number,
    phase: number,
  ): Promise<number> {
    var L_2LOTE = 0;
    var L_2SUMA = 0;
    var L_MANDATO = 0;
    var L_PORIVA = 0;
    var L_POCNIVA = 0;
    var L_MONTOSIVA = 0;
    var J = 0;
    var L_MONAPPIVA = 0;
    var L_GARANTIA = 0;
    var L_REFE = '';
    var L_ASIGNADO = '';
    var L_COMPRADO = 0;
    var L_CHATARRA = '';
    var L_IVA = 0;
    var L_MONTOLIB = 0;
    var L_RFC = 0;
    var L_ANTICIPO = 0;
    var L_ACUMULADO = 0;
    this.LOTESXCLI = [];
    if (!lot) {
      var L5 = await this.entity
        .query(`SELECT    LOT.ID_LOTE, coalesce(LOT.PRECIO_FINAL,0) as p_final,    LOT.NO_TRANSFERENTE, coalesce(LOT.PORC_APP_IVA,0) as por_iva,
                                coalesce(LOT.PORC_NOAPP_IVA,0) as pc_iva,
                                LOT.MONTO_SIN_IVA, 
                                LOT.MONTO_APP_IVA, 
                                LOT.PRECIO_GARANTIA,
                                LOT.REFERENCIAL, coalesce(LOT.ESASIGNADO,'S') as asignado,
                                coalesce(LOT.ESCHATARRA,'N') as chatarra, 
                                LOT.IVA_LOTE, 
                                (ASCII(SUBSTR(CLI.RFC,4,1))) as rfc, 
                                coalesce(LOT.ACUMULADO,0) as acum, 
                                coalesce(LOT.ANTICIPO,0) as anticipo
                                FROM    sera.COMER_LOTES LOT, sera.COMER_CLIENTES CLI
                                WHERE    LOT.ID_EVENTO = ${event}
                                AND        LOT.ID_CLIENTE = ${client}
                                AND        LOT.LOTE_PUBLICO != 0
                                AND        LOT.PRECIO_FINAL > 0
                                AND        LOT.ID_CLIENTE = CLI.ID_CLIENTE
                                AND        LOT.ID_LOTE     = LOT.ID_LOTE
                                AND        (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = case ${phase} when 1 then '1' when 2 then 'G' when 7 then 'G' when 3 then 'G' when 4 then 'G' when 5 then 'G' when 9 then 'G' end)
                                ORDER BY LOT.PRECIO_FINAL DESC, LOT.PRECIO_GARANTIA DESC`);
      L5.forEach((element) => {
        J++;
        var asigna: Asigna = {};
        if (element.chatarra == 'N') {
          asigna.LOTE = element.id_lote;
          asigna.PRECIO = element.p_final;
          asigna.CLIENTE = client;
          asigna.ABOIVA = 0;
          asigna.ABONIVA = 0;
          asigna.MANDATO = element.no_transferente;
          asigna.PORCIVA = element.por_iva;
          asigna.PORNIVA = element.pc_iva;
          asigna.ABONADO = 0;
          asigna.MONSIVA = element.monto_sin_iva;
          asigna.MONAPPI = element.monto_app_iva;
          asigna.IVA = 0.0;
          asigna.MEFALTA = element.p_final;
          asigna.GARATIA = element.precio_garantia;
          asigna.REFER = element.referencial;
          asigna.ASIGNADO = element.asignado;
          asigna.PAGADO = 'N';
          asigna.APROBADO = 'X';
          asigna.CHATARRA = 0;
          asigna.ANTICIPO = element.anticipo;
          asigna.ACUM = element.acum;
          this.LOTESXCLI.push(asigna);
          L_COMPRADO = L_COMPRADO + element.p_final;
        } else if (element.chatarra == 'S') {
          L_MONTOLIB = element.p_final - element.iva_lote;
          L_MONTOLIB = L_MONTOLIB * (this.G_PCTCHATARRA / 100);

          asigna.LOTE = element.id_lote;
          asigna.PRECIO = element.p_final - L_MONTOLIB;
          asigna.ABOIVA = 0;
          asigna.ABONIVA = 0;
          asigna.MANDATO = element.no_transferente;
          asigna.PORCIVA = element.por_iva;
          asigna.PORNIVA = element.pc_iva;
          asigna.ABONADO = 0;
          asigna.MONSIVA = element.monto_sin_iva;
          asigna.MONAPPI = element.monto_app_iva;
          -L_MONTOLIB;
          asigna.IVA = 0.0;
          asigna.MEFALTA = element.p_final - L_MONTOLIB;
          asigna.GARATIA = element.precio_garantia;
          asigna.REFER = element.referencial;
          asigna.ASIGNADO = element.asignado;
          asigna.PAGADO = 'N';
          asigna.APROBADO = 'X';
          asigna.CHATARRA = L_MONTOLIB;
          asigna.ESCHATA = 'S';
          asigna.CLIENTE = client;
          this.LOTESXCLI.push(asigna);
          L_COMPRADO = L_COMPRADO + (L_2SUMA - L_MONTOLIB);
        }
      });
    } else {
      var L6: any[] = await this.entity
        .query(`SELECT    LOT.ID_LOTE, coalesce(LOT.PRECIO_FINAL,0) as p_final,    LOT.NO_TRANSFERENTE, coalesce(LOT.PORC_APP_IVA,0) as por_iva,
                                coalesce(LOT.PORC_NOAPP_IVA,0) as pc_iva,
                                LOT.MONTO_SIN_IVA, 
                                LOT.MONTO_APP_IVA, 
                                LOT.PRECIO_GARANTIA,
                                LOT.REFERENCIAL, coalesce(LOT.ESASIGNADO,'S') as asignado,
                                coalesce(LOT.ESCHATARRA,'N') as chatarra, 
                                LOT.IVA_LOTE, 
                                (ASCII(SUBSTR(CLI.RFC,4,1))) as rfc, 
                                coalesce(LOT.ACUMULADO,0) as acum, 
                                coalesce(LOT.ANTICIPO,0) as anticipo
                                FROM    sera.COMER_LOTES LOT, sera.COMER_CLIENTES CLI
                                WHERE    LOT.ID_EVENTO = ${event}
                                AND        LOT.LOTE_PUBLICO != 0
                                AND        LOT.PRECIO_FINAL > 0
                                AND        LOT.ID_CLIENTE = CLI.ID_CLIENTE
                                AND        LOT.ID_LOTE     = LOT.ID_LOTE
                                AND        (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = case ${phase} when 1 then '1' when 2 then 'G' when 7 then 'G' when 3 then 'G' when 4 then 'G' when 5 then 'G' when 9 then 'G' end)
                                ORDER BY LOT.PRECIO_FINAL DESC, LOT.PRECIO_GARANTIA DESC`);
      L6.forEach((element) => {
        J++;
        var asigna: Asigna = {};
        if (element.chatarra == 'N') {
          asigna.LOTE = element.id_lote;
          asigna.PRECIO = element.p_final;
          asigna.CLIENTE = client;
          asigna.ABOIVA = 0;
          asigna.ABONIVA = 0;
          asigna.MANDATO = element.no_transferente;
          asigna.PORCIVA = element.por_iva;
          asigna.PORNIVA = element.pc_iva;
          asigna.ABONADO = 0;
          asigna.MONSIVA = element.monto_sin_iva;
          asigna.MONAPPI = element.monto_app_iva;
          asigna.IVA = 0.0;
          asigna.MEFALTA = element.p_final;
          asigna.GARATIA = element.precio_garantia;
          asigna.REFER = element.referencial;
          asigna.ASIGNADO = element.asignado;
          asigna.PAGADO = 'N';
          asigna.APROBADO = 'X';
          asigna.CHATARRA = 0;
          asigna.ANTICIPO = element.anticipo;
          asigna.ACUM = element.acum;
          this.LOTESXCLI.push(asigna);
          L_COMPRADO = L_COMPRADO + element.p_final;
        } else if (element.chatarra == 'S') {
          L_MONTOLIB = element.p_final - element.iva_lote;
          L_MONTOLIB = L_MONTOLIB * (this.G_PCTCHATARRA / 100);

          asigna.LOTE = element.id_lote;
          asigna.PRECIO = element.p_final - L_MONTOLIB;
          asigna.ABOIVA = 0;
          asigna.ABONIVA = 0;
          asigna.MANDATO = element.no_transferente;
          asigna.PORCIVA = element.por_iva;
          asigna.PORNIVA = element.pc_iva;
          asigna.ABONADO = 0;
          asigna.MONSIVA = element.monto_sin_iva;
          asigna.MONAPPI = element.monto_app_iva;
          -L_MONTOLIB;
          asigna.IVA = 0.0;
          asigna.MEFALTA = element.p_final - L_MONTOLIB;
          asigna.GARATIA = element.precio_garantia;
          asigna.REFER = element.referencial;
          asigna.ASIGNADO = element.asignado;
          asigna.PAGADO = 'N';
          asigna.APROBADO = 'X';
          asigna.CHATARRA = L_MONTOLIB;
          asigna.ESCHATA = 'S';
          asigna.CLIENTE = client;
          this.LOTESXCLI.push(asigna);
          L_COMPRADO = L_COMPRADO + (L_2SUMA - L_MONTOLIB);
        }
      });
    }

    return L_COMPRADO;
  }
  async llenaLotes(
    event: number,
    client: number,
    lot: number,
    phase: number,
  ): Promise<number> {
    var L_2LOTE = 0;
    var L_2SUMA = 0;
    var L_MANDATO = 0;
    var L_PORIVA = 0;
    var L_POCNIVA = 0;
    var L_MONTOSIVA = 0;
    var J = 0;
    var L_MONAPPIVA = 0;
    var L_GARANTIA = 0;
    var L_REFE = '';
    var L_ASIGNADO = '';
    var L_COMPRADO = 0;
    var L_CHATARRA = '';
    var L_IVA = 0;
    var L_MONTOLIB = 0;
    var L_RFC = 0;
    var L_ANTICIPO = 0;
    var L_ACUMULADO = 0;
    this.LOTESXCLI = [];
    var L5 = await this.entity
      .query(`SELECT    LOT.ID_LOTE, coalesce(LOT.PRECIO_FINAL,0) as p_final,    LOT.NO_TRANSFERENTE, coalesce(LOT.PORC_APP_IVA,0) as por_iva,
                                coalesce(LOT.PORC_NOAPP_IVA,0) as pc_iva,
                                LOT.MONTO_SIN_IVA, 
                                LOT.MONTO_APP_IVA, 
                                LOT.PRECIO_GARANTIA,
                                LOT.REFERENCIAL, coalesce(LOT.ESASIGNADO,'S') as asignado,
                                coalesce(LOT.ESCHATARRA,'N') as chatarra, 
                                LOT.IVA_LOTE, 
                                (ASCII(SUBSTR(CLI.RFC,4,1))) as rfc, 
                                coalesce(LOT.ACUMULADO,0) as acum, 
                                coalesce(LOT.ANTICIPO,0) as anticipo
                                FROM    sera.COMER_LOTES LOT, sera.COMER_CLIENTES CLI
                                WHERE    LOT.ID_EVENTO = ${event}
                                AND        LOT.ID_CLIENTE = ${client}
                                AND        LOT.LOTE_PUBLICO != 0
                                AND        LOT.PRECIO_FINAL > 0
                                AND        LOT.ID_CLIENTE = CLI.ID_CLIENTE
                                AND        LOT.ID_LOTE     = coalesce(${lot},LOT.ID_LOTE)
                                AND        (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = case ${phase} when 1 then '1' when 2 then 'G' when 3 then 'G' end)
                                ORDER BY LOT.PRECIO_FINAL DESC, LOT.PRECIO_GARANTIA DESC`);
    L5.forEach((element) => {
      J++;
      var asigna: Asigna = {};
      if (element.chatarra == 'N') {
        asigna.LOTE = element.id_lote;
        asigna.PRECIO = element.p_final;
        asigna.CLIENTE = client;
        asigna.ABOIVA = 0;
        asigna.ABONIVA = 0;
        asigna.MANDATO = element.no_transferente;
        asigna.PORCIVA = element.por_iva;
        asigna.PORNIVA = element.pc_iva;
        asigna.ABONADO = 0;
        asigna.MONSIVA = element.monto_sin_iva;
        asigna.MONAPPI = element.monto_app_iva;
        asigna.IVA = 0.0;
        asigna.MEFALTA = element.p_final;
        asigna.GARATIA = element.precio_garantia;
        asigna.REFER = element.referencial;
        asigna.ASIGNADO = element.asignado;
        asigna.PAGADO = 'N';
        asigna.APROBADO = 'X';
        asigna.CHATARRA = 0;
        asigna.ANTICIPO = element.anticipo;
        asigna.ACUM = element.acum;
        this.LOTESXCLI.push(asigna);
        L_COMPRADO = L_COMPRADO + element.p_final;
      } else if (element.chatarra == 'S') {
        L_MONTOLIB = element.p_final - element.iva_lote;
        L_MONTOLIB = L_MONTOLIB * (this.G_PCTCHATARRA / 100);

        asigna.LOTE = element.id_lote;
        asigna.PRECIO = element.p_final - L_MONTOLIB;
        asigna.ABOIVA = 0;
        asigna.ABONIVA = 0;
        asigna.MANDATO = element.no_transferente;
        asigna.PORCIVA = element.por_iva;
        asigna.PORNIVA = element.pc_iva;
        asigna.ABONADO = 0;
        asigna.MONSIVA = element.monto_sin_iva;
        asigna.MONAPPI = element.monto_app_iva;
        -L_MONTOLIB;
        asigna.IVA = 0.0;
        asigna.MEFALTA = element.p_final - L_MONTOLIB;
        asigna.GARATIA = element.precio_garantia;
        asigna.REFER = element.referencial;
        asigna.ASIGNADO = element.asignado;
        asigna.PAGADO = 'N';
        asigna.APROBADO = 'X';
        asigna.CHATARRA = L_MONTOLIB;
        asigna.ESCHATA = 'S';
        asigna.CLIENTE = client;
        this.LOTESXCLI.push(asigna);
        L_COMPRADO = L_COMPRADO + (L_2SUMA - L_MONTOLIB);
      }
    });

    return L_COMPRADO;
  }
  async llenaPagosAct(
    event: number,
    client: number,
    date: Date,
    phase: number,
    lot: number,
  ): Promise<number> {
    var j = 0;
    var deposito: Pago = {};
    var L_DEPTOT = 0;

    if (!lot) {
      var L8: any[] = await this.entity
        .query(`  SELECT    PRF.ID_PAGO, PRF.MONTO, LOT.NO_TRANSFERENTE, PRF.ID_LOTE
                                FROM    sera.COMER_PAGOREF PRF, sera.COMER_LOTES LOT
                                WHERE    PRF.FECHA <= '${date}'
                                AND        PRF.VALIDO_SISTEMA = 'A'
                                AND        PRF.ID_LOTE = LOT.ID_LOTE 
                                AND        LOT.ID_EVENTO = ${event} 
                                AND        LOT.ID_CLIENTE = ${client} 
                                AND        PRF.IDORDENINGRESO IS NULL
                                AND        (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = case ${phase} when 1 then '1' when 2 then 'G' when 7 then 'G'  when 3 then 'L'  when 4 then 'L' end)
                                AND        LOT.PRECIO_FINAL > 0
                                ORDER BY PRF.MONTO DESC`);
      L8.forEach((element) => {
        j++;
        deposito.PAGADO = element.monto;
        deposito.ID_PAGO = element.id_pago;
        deposito.RESTA = element.monto;
        deposito.MANDATO = element.no_transferente;
        deposito.LOTE = element.id_lote;
        this.DEPOSITOS.push(deposito);
        L_DEPTOT = L_DEPTOT + element.monto;
      });
    } else {
      if (phase == 1) {
        var C2_F1: any[] = await this.entity
          .query(` SELECT     PRF.ID_PAGO, PRF.MONTO, LOT.NO_TRANSFERENTE, PRF.ID_LOTE
                                FROM       sera.COMER_PAGOREF PRF, sera.COMER_LOTES LOT, sera.COMER_REF_GARANTIAS CRG
                                WHERE      PRF.FECHA <= '${date}'
                                AND        PRF.VALIDO_SISTEMA = 'A'
                                AND        PRF.ID_LOTE = LOT.ID_LOTE
                                AND        LOT.ID_EVENTO = ${event}
                                AND        LOT.ID_LOTE = ${lot}
                                AND        PRF.IDORDENINGRESO IS NULL
                                AND        (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA =case ${phase} when 1 then '1' when 2 then 'G' when 7 then 'G'  when 3 then 'G'   end )
                                AND        LOT.PRECIO_FINAL > 0
                                AND        LOT.ID_EVENTO = CRG.ID_EVENTO
                                AND        LOT.ID_LOTE = CRG.ID_LOTE
                                AND        LOT.ID_CLIENTE = CRG.ID_CLIENTE
                                AND        PRF.REFERENCIA = CRG.REF_GSAE||CRG.REF_GBANCO
                                ORDER BY PRF.MONTO DESC `);
        C2_F1.forEach((element) => {
          j++;
          deposito.PAGADO = element.monto;
          deposito.ID_PAGO = element.id_pago;
          deposito.RESTA = element.monto;
          deposito.MANDATO = element.no_transferente;
          deposito.LOTE = element.id_lote;
          this.DEPOSITOS.push(deposito);
          L_DEPTOT = L_DEPTOT + element.monto;
        });
      } else if (phase == 2) {
        var C2_F2: any[] = await this.entity
          .query(`SELECT    PRF.ID_PAGO, PRF.MONTO, LOT.NO_TRANSFERENTE, PRF.ID_LOTE
                                        FROM    sera.COMER_PAGOREF PRF, sera.COMER_LOTES LOT
                                        WHERE    PRF.FECHA <= '${date}'
                                        AND        PRF.VALIDO_SISTEMA = 'A'
                                        AND        PRF.ID_LOTE = LOT.ID_LOTE
                                        AND        LOT.ID_EVENTO = ${event}
                                        AND        LOT.ID_LOTE = ${lot}
                                        AND        PRF.IDORDENINGRESO IS NULL
                                        AND        PRF.REFERENCIA LIKE '2%'
                                        AND        (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = case ${phase} when 1 then '1' when 2 then 'G' when 7 then 'G'  when 3 then 'G'  when 4 then 'G'   end )
                                        AND        LOT.PRECIO_FINAL > 0
                                        ORDER BY PRF.MONTO DESC`);
        C2_F2.forEach((element) => {
          j++;
          deposito.PAGADO = element.monto;
          deposito.ID_PAGO = element.id_pago;
          deposito.RESTA = element.monto;
          deposito.MANDATO = element.no_transferente;
          deposito.LOTE = element.id_lote;
          this.DEPOSITOS.push(deposito);
          L_DEPTOT = L_DEPTOT + element.monto;
        });
      } else if (phase == 7) {
        var C2_F7: any[] = await this.entity
          .query(` SELECT    PRF.ID_PAGO, PRF.MONTO, LOT.NO_TRANSFERENTE, PRF.ID_LOTE
                               
                                            FROM    sera.COMER_PAGOREF PRF, sera.COMER_LOTES LOT
                                            WHERE    PRF.FECHA <= '${date}'
                                            AND        PRF.VALIDO_SISTEMA = 'A'
                                            AND        PRF.ID_LOTE = LOT.ID_LOTE
                                            AND        LOT.ID_EVENTO = ${event}
                                            AND        LOT.ID_LOTE = ${lot}
                                            AND        PRF.IDORDENINGRESO IS NULL
                                            AND        PRF.REFERENCIA LIKE '7%'
                                            AND        (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = case ${phase} when 1 then '1' when 2 then 'G' when 7 then 'G'  when 3 then 'G'  when 4 then 'G'   end )
                                            AND        LOT.PRECIO_FINAL > 0
                                            ORDER BY PRF.MONTO DESC`);
        C2_F7.forEach((element) => {
          j++;
          deposito.PAGADO = element.monto;
          deposito.ID_PAGO = element.id_pago;
          deposito.RESTA = element.monto;
          deposito.MANDATO = element.no_transferente;
          deposito.LOTE = element.id_lote;
          this.DEPOSITOS.push(deposito);
          L_DEPTOT = L_DEPTOT + element.monto;
        });
      } else if (phase == 3) {
        var C2_F3: any[] = await this.entity
          .query(` SELECT    PRF.ID_PAGO, PRF.MONTO, LOT.NO_TRANSFERENTE, PRF.ID_LOTE
                                FROM    sera.COMER_PAGOREF PRF, sera.COMER_LOTES LOT
                                WHERE    PRF.FECHA <= '${date}'
                                AND        PRF.VALIDO_SISTEMA = 'A'
                                AND        PRF.ID_LOTE = LOT.ID_LOTE
                                AND        LOT.ID_EVENTO = ${event}
                                AND        LOT.ID_LOTE = ${lot}
                                AND        PRF.IDORDENINGRESO IS NULL
                                AND        PRF.REFERENCIA LIKE '3%'
                                AND        (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = case ${phase} when 1 then '1' when 2 then 'G' when 7 then 'G'  when 3 then 'G'  when 4 then 'G'   end )
                                AND        LOT.PRECIO_FINAL > 0
                                ORDER BY PRF.MONTO DESC`);
        C2_F3.forEach((element) => {
          j++;
          deposito.PAGADO = element.monto;
          deposito.ID_PAGO = element.id_pago;
          deposito.RESTA = element.monto;
          deposito.MANDATO = element.no_transferente;
          deposito.LOTE = element.id_lote;
          this.DEPOSITOS.push(deposito);
          L_DEPTOT = L_DEPTOT + element.monto;
        });
      } else if (phase == 4) {
        var C2_F4: any[] = await this.entity
          .query(` SELECT    PRF.ID_PAGO, PRF.MONTO, LOT.NO_TRANSFERENTE, PRF.ID_LOTE
                                FROM    sera.COMER_PAGOREF PRF, sera.COMER_LOTES LOT
                                WHERE    PRF.FECHA <= '${date}'
                                AND        PRF.VALIDO_SISTEMA = 'A'
                                AND        PRF.ID_LOTE = LOT.ID_LOTE
                                AND        LOT.ID_EVENTO = ${event}
                                AND        LOT.ID_LOTE = ${lot}
                                AND        PRF.IDORDENINGRESO IS NULL
                                AND        PRF.REFERENCIA LIKE '4%'
                                AND        (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = case ${phase} when 1 then '1' when 2 then 'G' when 7 then 'G'  when 3 then 'G'  when 4 then 'G'   end )
                                AND        LOT.PRECIO_FINAL > 0
                                ORDER BY PRF.MONTO DESC`);
        C2_F4.forEach((element) => {
          j++;
          deposito.PAGADO = element.monto;
          deposito.ID_PAGO = element.id_pago;
          deposito.RESTA = element.monto;
          deposito.MANDATO = element.no_transferente;
          deposito.LOTE = element.id_lote;
          this.DEPOSITOS.push(deposito);
          L_DEPTOT = L_DEPTOT + element.monto;
        });
      } else {
        var C2: any[] = await this.entity
          .query(` SELECT    PRF.ID_PAGO, PRF.MONTO, LOT.NO_TRANSFERENTE, PRF.ID_LOTE
                                FROM    sera.COMER_PAGOREF PRF, sera.COMER_LOTES LOT
                                WHERE    PRF.FECHA <= '${date}'
                                AND        PRF.VALIDO_SISTEMA = 'A'
                                AND        PRF.ID_LOTE = LOT.ID_LOTE
                                AND        LOT.ID_EVENTO = ${event}
                                AND        LOT.ID_LOTE = ${lot}
                                AND        PRF.IDORDENINGRESO IS NULL
                                AND        (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = case ${phase} when 1 then '1' when 2 then 'G' when 7 then 'G'  when 3 then 'G'  when 4 then 'G'   end )
                                AND        LOT.PRECIO_FINAL > 0
                                ORDER BY PRF.MONTO DESC`);
        C2.forEach((element) => {
          j++;
          deposito.PAGADO = element.monto;
          deposito.ID_PAGO = element.id_pago;
          deposito.RESTA = element.monto;
          deposito.MANDATO = element.no_transferente;
          deposito.LOTE = element.id_lote;
          this.DEPOSITOS.push(deposito);
          L_DEPTOT = L_DEPTOT + element.monto;
        });
      }
    }

    return L_DEPTOT;
  }

  async penalizaInmuAct(
    buy: number,
    payment: number,
    client: number,
    phase: number,
  ) {
    var DBPAGAR = 0;
    this.GK = 0;
    this.G_YAPENALIZO = 0;
    for (const iterator of this.LOTESXCLI) {
      DBPAGAR = this.apagarAct(phase);
      if (DBPAGAR > payment) {
        this.penInmuDefUsu(client, phase);
        this.penInmuMenor(client, phase);
      } else {
        if (phase == 7) {
          this.penInmuDefUsu(client, phase);
          this.penInmuMenor(client, phase);
        } else if (phase == 4) {
          this.penInmuDefUsu(client, phase);
          this.penInmuMenor(client, phase);
        }
      }
    }
    return {
      statusCode: 200,
      message: ['OK'],
    };
  }
  async penalizaInmu(
    buy: number,
    payment: number,
    client: number,
    phase: number,
  ) {
    var DBPAGAR = 0;
    this.GK = 0;
    this.G_YAPENALIZO = 0;
    for (const iterator of this.LOTESXCLI) {
      DBPAGAR = this.apagar(phase);
      if (DBPAGAR > payment) {
        await this.penInmuDefUsu(client, phase);
        await this.penInmuMenor(client, phase);
      } else {
        return;
      }
    }
    return {
      statusCode: 200,
      message: ['OK'],
    };
  }
  apagarAct(phase: number) {
    var AP_PAGAR = 0;
    this.LOTESXCLI.forEach((element) => {
      if ((element.MARCPENA || 'M') != 'S') {
        switch (phase) {
          case 1:
            AP_PAGAR = AP_PAGAR + element.ANTICIPO;
            break;
          case 2:
            AP_PAGAR = AP_PAGAR + element.ANTICIPO;
            break;
          case 3:
            AP_PAGAR = AP_PAGAR + element.ANTICIPO;
            break;
          case 4:
            AP_PAGAR = AP_PAGAR + element.PRECIO - element.ACUM;
            break;
          case 7:
            AP_PAGAR = AP_PAGAR + element.PRECIO - element.ACUM;
            break;

          default:
            break;
        }
      }
    });
    return AP_PAGAR;
  }
  apagar(phase: number) {
    var AP_PAGAR = 0;
    this.LOTESXCLI.forEach((element) => {
      if ((element.MARCPENA || 'M') != 'S') {
        switch (phase) {
          case 1:
            AP_PAGAR = AP_PAGAR + element.ANTICIPO;
            break;
          case 2:
            AP_PAGAR = AP_PAGAR + element.PRECIO - element.ACUM;
            break;
          default:
            break;
        }
      }
    });
    return AP_PAGAR;
  }

  penInmuDefUsu(client: number, phase: number) {
    var L_MONTOAPP = 0.0;
    this.LOTESXCLI.forEach((element, index) => {
      if (element.ASIGNADO == 'N') {
        L_MONTOAPP = element.GARATIA;
        this.ejecutaPen(index, L_MONTOAPP);
        this.G_YAPENALIZO = 1;
      }
    });
    return true;
  }

  ejecutaPen(position: number, amount: number) {
    var MONTOPENA = amount;
    this.DISPERSION = [];
    this.DEPOSITOS.forEach((element, index) => {
      var dispersion: Dispersa = {};
      if (MONTOPENA > 0 && element.RESTA > 0) {
        if (element.RESTA >= MONTOPENA) {
          dispersion.CLIENTE = this.LOTESXCLI[position].CLIENTE;
          dispersion.LOTE = this.LOTESXCLI[position].LOTE;
          dispersion.MANDATO = this.LOTESXCLI[position].MANDATO;
          dispersion.PRECIO = this.LOTESXCLI[position].GARATIA;
          dispersion.ID_PAGO = element.ID_PAGO;
          dispersion.ABONADO = (MONTOPENA / this.G_IVA, 2);
          dispersion.IVA = MONTOPENA - dispersion.ABONADO;
          dispersion.GARATIA = MONTOPENA;
          dispersion.TIPO = 'P';
          this.DISPERSION.push(dispersion);
          this.LOTESXCLI[position].MARCPENA = 'S';
          element.RESTA = element.RESTA - MONTOPENA;
          MONTOPENA = 0;
          return true;
        } else {
          MONTOPENA = MONTOPENA - element.RESTA;
          dispersion.CLIENTE = this.LOTESXCLI[position].CLIENTE;
          dispersion.LOTE = this.LOTESXCLI[position].LOTE;
          dispersion.MANDATO = this.LOTESXCLI[position].MANDATO;
          dispersion.PRECIO = this.LOTESXCLI[position].GARATIA;
          dispersion.ID_PAGO = element.ID_PAGO;
          dispersion.ABONADO = (element.RESTA / this.G_IVA, 2);
          dispersion.IVA = (element.RESTA - dispersion.ABONADO, 2);
          dispersion.GARATIA = MONTOPENA;
          dispersion.TIPO = 'P';
          element.RESTA = 0;
          this.DISPERSION.push(dispersion);
        }
      }
    });
  }
  penInmuMenor(client: number, phase: number) {
    var PEN_LOTE = 0;
    var VALPENA = 0;

    if (this.G_YAPENALIZO != 1) {
      PEN_LOTE = this.findLotMenor();
      this.LOTESXCLI.forEach((element, index) => {
        if (element.LOTE == PEN_LOTE) {
          if (phase == 7) {
            // VALPENA = SERA.OBTENPENA_F7(lote.LOTE, lote.PRECIO);
            this.ejecutaPen(index, VALPENA);
          } else if (phase == 4) {
            // VALPENA = SERA.OBTENPENA(lote.LOTE, lote.PRECIO);
            this.ejecutaPen(index, VALPENA);
          } else {
            // VALPENA = SERA.OBTENPENA(lote.LOTE, lote.PRECIO);
            this.ejecutaPen(index, VALPENA);
          }
        }
      });
    }
    return true;
  }
  findLotMenor(): number {
    var POSICION = 0;
    var CONT = 0;

    POSICION = this.LOTESXCLI.length - 1;
    for (const element of this.LOTESXCLI) {
      if ((element.MARCPENA || 'N') != 'S') {
        CONT = element.LOTE;
        break;
      }
    }

    return CONT;
  }

  /**
   * @procedure BORRA_COMPLETO_ACT
   * @param params
   * @returns
   */
  async currentFullErase(params: CurrentFullErase) {
    var BR_IDLOTE = 0;
    var BR_IDBXL = 0;
    var BR_IDBXL2 = 0;
    var BR_ACUMULADO = 0;
    var V_ID_LOTE = 0;
    var V_ID_TPEVENTO = 0;
    const dateNow = LocalDate.getNow();
    try {
      const result: any[] = await this.entity.query(
        `SELECT ID_TPEVENTO FROM sera.COMER_EVENTOS WHERE ID_EVENTO = ${params.event}`,
      );
      V_ID_TPEVENTO = result[0].id_tpevento;

      if (V_ID_TPEVENTO == 1) {
        const LOTBRSP: any[] = await this.entity.query(` 
                                SELECT DISTINCT CLOT.ID_LOTE
                                FROM sera.COMER_LOTES CLOT, sera.COMER_PAGOREF CPAG
                                WHERE CLOT.ID_EVENTO = ${params.event}
                                AND CLOT.ID_LOTE = CPAG.ID_LOTE
                                AND CLOT.ID_CLIENTE IS NOT NULL
                                AND CLOT.ID_LOTE = coalesce(${params.lot}, CLOT.ID_LOTE)
                                AND CPAG.CONCILIADO IS NULL
                                AND CPAG.IDORDENINGRESO IS NULL
                                AND EXISTS (SELECT 1
                                                FROM sera.COMER_BIENESXLOTE CBXL, sera.bien BNS
                                                WHERE CBXL.ID_LOTE = CLOT.ID_LOTE
                                                AND CBXL.NO_BIEN = BNS.NO_BIEN
                                                AND BNS.ESTATUS IN ('VEN','VPP','VPT','CXR','VTR') )
                                        AND EXISTS (SELECT 1
                                                        FROM sera.COMER_PAGOSREFGENS CGEN
                                                        WHERE CGEN.ID_LOTE = CLOT.ID_LOTE )
                                        AND EXISTS (SELECT 1
                                                FROM sera.COMER_CLIENTESXEVENTO CCXE
                                                WHERE CCXE.ID_EVENTO = ${params.event}
                                                AND CCXE.ID_CLIENTE = CLOT.ID_CLIENTE
                                                AND CCXE.PROCESAR = 'S'
                                        )`);
        if (LOTBRSP.length > 0) {
          V_ID_LOTE = LOTBRSP[0].id_lote;
        } else {
          V_ID_LOTE = null
        }
        LOTBRSP.forEach(async (element) => {
          await this.entity.query(` UPDATE sera.COMER_PAGOREF 
                                        SET VALIDO_SISTEMA = 'A'
                                        WHERE EXISTS (SELECT 1
                                                FROM sera.COMER_LOTES LOT
                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                AND EXISTS (SELECT 1
                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                WHERE CXE.ID_EVENTO  = ${params.event}
                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                AND CXE.PROCESAR   = 'S'
                                                                )
                                                )
                                        AND VALIDO_SISTEMA = 'S'
                                        AND IDORDENINGRESO IS  NULL`);
          await this.entity.query(`INSERT INTO sera.HISTORICO_ESTATUS_BIEN
                                        SELECT NO_BIEN, ESTATUS, CAST('${dateNow}' AS DATE)+1/1440/60, 'USER', 'FCOMER612', 'CAMBIO POR REVERSO DE DISPERSION DE PAGOS ACT',(select last_value+1 from  sera.SEQ_BITACORA),PROCESO_EXT_DOM
                                        FROM sera.bien BIE
                                        WHERE ESTATUS IN ('VPP','VPT')
                                        AND EXISTS (SELECT 1 FROM sera.COMER_BIENESXLOTE BXL
                                                        WHERE BXL.NO_BIEN = BIE.NO_BIEN
                                                        AND BXL.ID_LOTE = coalesce(${V_ID_LOTE},BXL.ID_LOTE)
                                                        AND EXISTS (SELECT 1 FROM sera.COMER_LOTES LOT
                                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                                        AND LOT.ID_LOTE   = BXL.ID_LOTE
                                                                        AND LOT.ID_LOTE   = coalesce(${V_ID_LOTE},BXL.ID_LOTE)
                                                                        AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO   = ${params.event}
                                                                                        AND CXE.ID_CLIENTE  = LOT.ID_CLIENTE
                                                                                        AND CXE.PROCESAR    = 'S'
                                                                                )
                                                                )
                                                )`);

          await this.entity.query(`UPDATE sera.bien BIE
                                        SET ESTATUS = 'VEN'
                                        WHERE ESTATUS IN ('VPP','VPT')
                                        AND EXISTS (SELECT 1
                                                        FROM sera.COMER_BIENESXLOTE BXL
                                                        WHERE BXL.NO_BIEN = BIE.NO_BIEN
                                                        AND BXL.ID_LOTE = ${V_ID_LOTE}
                                                        AND EXISTS (SELECT 1
                                                                        FROM sera.COMER_LOTES LOT
                                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                                        AND LOT.ID_LOTE = BXL.ID_LOTE
                                                                        AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                                        AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                        WHERE CXE.ID_EVENTO   = ${params.event}
                                                                                        AND CXE.ID_CLIENTE  = LOT.ID_CLIENTE
                                                                                        AND CXE.PROCESAR    = 'S'
                                                                        )
                                                         )
                                          )
                                `);
          await this.entity.query(`INSERT INTO sera.HISTORICO_ESTATUS_BIEN
                                        SELECT NO_BIEN, ESTATUS, SYSDATE+1/1440/60, 'USER', 'FCOMER612', 'CAMBIO POR REVERSO DE DISPERSION DE PAGOS ACT',(select last_value+1 from  sera.SEQ_BITACORA),PROCESO_EXT_DOM
                                        FROM sera.bien BIE
                                        WHERE ESTATUS IN ('VTR')
                                        AND EXISTS (SELECT 1 FROM sera.COMER_BIENESXLOTE BXL
                                                        WHERE BXL.NO_BIEN = BIE.NO_BIEN
                                                        AND BXL.ID_LOTE =${V_ID_LOTE}
                                                        AND EXISTS (SELECT 1 FROM sera.COMER_LOTES LOT
                                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                                        AND LOT.ID_LOTE   = BXL.ID_LOTE
                                                                        AND LOT.ID_LOTE   = ${V_ID_LOTE}
                                                                        AND EXISTS (SELECT 1 FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO   = ${params.event}
                                                                                        AND CXE.ID_CLIENTE  = LOT.ID_CLIENTE
                                                                                        AND CXE.PROCESAR    = 'S'
                                                                                )
                                                                )
                                                );
                                `);

          await this.entity.query(`UPDATE sera.bien BIE
                                        SET ESTATUS = 'CXR'
                                        WHERE ESTATUS IN ('VTR')
                                        AND EXISTS (SELECT 1
                                                FROM sera.COMER_BIENESXLOTE BXL
                                                WHERE BXL.NO_BIEN = BIE.NO_BIEN
                                                AND BXL.ID_LOTE = ${V_ID_LOTE}
                                                AND EXISTS (SELECT 1
                                                                FROM sera.COMER_LOTES LOT
                                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                                AND LOT.ID_LOTE = BXL.ID_LOTE
                                                                AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                                AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO   = ${params.event}
                                                                                AND CXE.ID_CLIENTE  = LOT.ID_CLIENTE
                                                                                AND CXE.PROCESAR    = 'S'
                                                                                )
                                                          )
                                           )`);
          await this.entity.query(`UPDATE sera.COMER_BIENESXLOTE
                                SET ESTATUS_ANT = 'ADM',
                                    ESTATUS_COMER = 'VEN',
                                    ID_LOTE_COMER = NULL,
                                    ID_EVENTO_COMER = NULL
                              WHERE ID_LOTE = ${V_ID_LOTE}
                                AND EXISTS (SELECT 1
                                              FROM sera.COMER_BIENESXLOTE BXL
                                             WHERE BXL.ID_LOTE = ${V_ID_LOTE}
                                               AND EXISTS (SELECT 1
                                                             FROM sera.COMER_LOTES LOT
                                                            WHERE LOT.ID_EVENTO = ${params.event}
                                                              AND LOT.ID_LOTE = BXL.ID_LOTE
                                                              AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                              AND EXISTS (SELECT 1
                                                                            FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                           WHERE CXE.ID_EVENTO   = ${params.event}
                                                                             AND CXE.ID_CLIENTE  = LOT.ID_CLIENTE
                                                                             AND CXE.PROCESAR    = 'S'
                                                                         )
                                                          )
                                           );`);
          var dPhase = (params.phase || 1) == 1 ? null : 'G';
          await this.entity.query(` UPDATE sera.COMER_LOTES LOT
                                                SET ID_ESTATUSVTA  =  case coalesce(${params.phase}, 1) when 1 then 'VEN' when 2 then 'VEN' when 3 then 'GARA' when 4 then 'GARA' when 5 then 'PAG' when 9 then 'PAGE' end,
                                                VALIDO_SISTEMA = '${dPhase}',
                                                ACUMULADO = (SELECT SUM(coalesce(RGE.MONTO_NOAPP_IVA,0) + coalesce(RGE.IVA,0) + coalesce(RGE.MONTO_APP_IVA,0) )
                                                                FROM sera.COMER_PAGOSREFGENS RGE, sera.COMER_LOTES LOT2
                                                                WHERE LOT2.ID_EVENTO = ${params.event}
                                                                AND LOT2.ID_LOTE = LOT.ID_LOTE
                                                                AND LOT2.ID_LOTE = RGE.ID_LOTE
                                                                AND RGE.TIPO = 'N'
                                                                AND LOT2.ID_LOTE = ${V_ID_LOTE}
                                                                AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO = ${params.event}
                                                                                AND CXE.ID_CLIENTE = LOT2.ID_CLIENTE
                                                                                AND CXE.PROCESAR = 'S'
                                                                        )
                                                                )
                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                AND EXISTS (SELECT 1
                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                        AND CXE.PROCESAR = 'S'
                                                        )`);

          await this.entity.query(` DELETE FROM sera.COMER_PAGOSREFGENS CPRG
                                WHERE ID_LOTE = ${V_ID_LOTE}
                                  AND EXISTS (SELECT 1
                                                FROM sera.COMER_LOTES LOT
                                               WHERE LOT.ID_EVENTO = ${params.event}
                                                 AND LOT.ID_EVENTO = CPRG.ID_EVENTO
                                                 AND LOT.ID_LOTE = CPRG.ID_LOTE
                                                 AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                 AND EXISTS (SELECT 1
                                                               FROM sera.COMER_CLIENTESXEVENTO CXE
                                                              WHERE CXE.ID_EVENTO  = ${params.event}
                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                AND CXE.PROCESAR   = 'S'
                                                            )
                                             )
                                  AND NOT EXISTS (SELECT 1
                                                    FROM sera.COMER_PAGOREF PRE
                                                   WHERE PRE.ID_PAGO = CPRG.ID_PAGO
                                                     AND PRE.IDORDENINGRESO IS NOT NULL
                                                 );`);
        });
      } else {
        const LOTBR: any[] = await this.entity.query(`
                                SELECT DISTINCT CLOT.ID_LOTE as id_lote 
                                FROM sera.COMER_LOTES CLOT, sera.COMER_PAGOREF CPAG
                                WHERE CLOT.ID_EVENTO = ${params.event}
                                AND CLOT.ID_LOTE = CPAG.ID_LOTE
                                AND CLOT.ID_CLIENTE IS NOT NULL
                                AND CLOT.ID_LOTE = coalesce(${params.lot}, CLOT.ID_LOTE)
                                AND CPAG.VALIDO_SISTEMA = 'S'
                                AND CPAG.CONCILIADO IS NULL
                                AND CPAG.IDORDENINGRESO IS NULL
                                AND EXISTS (SELECT 1
                                                FROM sera.COMER_BIENESXLOTE CBXL, sera.bien BNS
                                                WHERE CBXL.ID_LOTE = CLOT.ID_LOTE
                                                AND CBXL.NO_BIEN = BNS.NO_BIEN
                                                
                                                AND BNS.ESTATUS IN ('VEN','VPP','VPT','CXR','VTR') )
                                AND EXISTS (SELECT 1
                                                FROM sera.COMER_PAGOSREFGENS CGEN
                                                WHERE CGEN.ID_LOTE = CLOT.ID_LOTE )
                                AND EXISTS (SELECT 1
                                                FROM sera.COMER_CLIENTESXEVENTO CCXE
                                                WHERE CCXE.ID_EVENTO = ${params.event}
                                                AND CCXE.ID_CLIENTE = CLOT.ID_CLIENTE
                                                AND CCXE.PROCESAR = 'S'
                                        )`);
        V_ID_LOTE = LOTBR[0]?.id_lote || 0;
        LOTBR.forEach(async (element) => {
          await this.entity.query(` UPDATE sera.COMER_PAGOREF 
                                        SET VALIDO_SISTEMA = 'A'
                                        WHERE EXISTS (SELECT 1
                                                FROM sera.COMER_LOTES LOT
                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                AND EXISTS (SELECT 1
                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                WHERE CXE.ID_EVENTO  = ${params.event}
                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                AND CXE.PROCESAR   = 'S'
                                                                )
                                                )
                                        AND VALIDO_SISTEMA = 'S'
                                        AND IDORDENINGRESO IS  NULL`);
          await this.entity.query(`INSERT INTO sera.HISTORICO_ESTATUS_BIEN
                                        SELECT NO_BIEN, ESTATUS, CAST('${dateNow}' AS DATE)+1/1440/60, 'USER', 'FCOMER612', 'CAMBIO POR REVERSO DE DISPERSION DE PAGOS ACT',(select last_value+1 from  sera.SEQ_BITACORA),PROCESO_EXT_DOM
                                        FROM sera.bien BIE
                                        WHERE ESTATUS IN ('VPP','VPT')
                                        AND EXISTS (SELECT 1 FROM sera.COMER_BIENESXLOTE BXL
                                                        WHERE BXL.NO_BIEN = BIE.NO_BIEN
                                                        AND BXL.ID_LOTE = coalesce(${V_ID_LOTE},BXL.ID_LOTE)
                                                        AND EXISTS (SELECT 1 FROM sera.COMER_LOTES LOT
                                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                                        AND LOT.ID_LOTE   = BXL.ID_LOTE
                                                                        AND LOT.ID_LOTE   = coalesce(${V_ID_LOTE},BXL.ID_LOTE)
                                                                        AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO   = ${params.event}
                                                                                        AND CXE.ID_CLIENTE  = LOT.ID_CLIENTE
                                                                                        AND CXE.PROCESAR    = 'S'
                                                                                )
                                                                )
                                                )`);

          await this.entity.query(`UPDATE sera.bien BIE
                                        SET ESTATUS = 'VEN'
                                        WHERE ESTATUS IN ('VPP','VPT')
                                        AND EXISTS (SELECT 1
                                                        FROM sera.COMER_BIENESXLOTE BXL
                                                        WHERE BXL.NO_BIEN = BIE.NO_BIEN
                                                        AND BXL.ID_LOTE = ${V_ID_LOTE}
                                                        AND EXISTS (SELECT 1
                                                                        FROM sera.COMER_LOTES LOT
                                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                                        AND LOT.ID_LOTE = BXL.ID_LOTE
                                                                        AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                                        AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                        WHERE CXE.ID_EVENTO   = ${params.event}
                                                                                        AND CXE.ID_CLIENTE  = LOT.ID_CLIENTE
                                                                                        AND CXE.PROCESAR    = 'S'
                                                                        )
                                                                )
                                                )
                                        `);

          await this.entity.query(`INSERT INTO sera.HISTORICO_ESTATUS_BIEN
                                        SELECT NO_BIEN, ESTATUS, SYSDATE+1/1440/60, 'USER', 'FCOMER612', 'CAMBIO POR REVERSO DE DISPERSION DE PAGOS ACT',(select last_value+1 from  sera.SEQ_BITACORA),PROCESO_EXT_DOM
                                        FROM sera.bien BIE
                                        WHERE ESTATUS IN ('VTR')
                                        AND EXISTS (SELECT 1 FROM sera.COMER_BIENESXLOTE BXL
                                                        WHERE BXL.NO_BIEN = BIE.NO_BIEN
                                                        AND BXL.ID_LOTE =${V_ID_LOTE}
                                                        AND EXISTS (SELECT 1 FROM sera.COMER_LOTES LOT
                                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                                        AND LOT.ID_LOTE   = BXL.ID_LOTE
                                                                        AND LOT.ID_LOTE   = ${V_ID_LOTE}
                                                                        AND EXISTS (SELECT 1 FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO   = ${params.event}
                                                                                        AND CXE.ID_CLIENTE  = LOT.ID_CLIENTE
                                                                                        AND CXE.PROCESAR    = 'S'
                                                                                )
                                                                )
                                                );
                                `);

          await this.entity.query(`UPDATE sera.bien BIE
                                        SET ESTATUS = 'CXR'
                                        WHERE ESTATUS IN ('VTR')
                                        AND EXISTS (SELECT 1
                                                FROM sera.COMER_BIENESXLOTE BXL
                                                WHERE BXL.NO_BIEN = BIE.NO_BIEN
                                                AND BXL.ID_LOTE = ${V_ID_LOTE}
                                                AND EXISTS (SELECT 1
                                                                FROM sera.COMER_LOTES LOT
                                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                                AND LOT.ID_LOTE = BXL.ID_LOTE
                                                                AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                                AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO   = ${params.event}
                                                                                AND CXE.ID_CLIENTE  = LOT.ID_CLIENTE
                                                                                AND CXE.PROCESAR    = 'S'
                                                                                )
                                                        )
                                        )`);
          await this.entity.query(`UPDATE sera.COMER_BIENESXLOTE
                                        SET ESTATUS_ANT = 'ADM',
                                            ESTATUS_COMER = 'VEN',
                                            ID_LOTE_COMER = NULL,
                                            ID_EVENTO_COMER = NULL
                                      WHERE ID_LOTE = ${V_ID_LOTE}
                                        AND EXISTS (SELECT 1
                                                      FROM sera.COMER_BIENESXLOTE BXL
                                                     WHERE BXL.ID_LOTE = ${V_ID_LOTE}
                                                       AND EXISTS (SELECT 1
                                                                     FROM sera.COMER_LOTES LOT
                                                                    WHERE LOT.ID_EVENTO = ${params.event}
                                                                      AND LOT.ID_LOTE = BXL.ID_LOTE
                                                                      AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                                      AND EXISTS (SELECT 1
                                                                                    FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                   WHERE CXE.ID_EVENTO   = ${params.event}
                                                                                     AND CXE.ID_CLIENTE  = LOT.ID_CLIENTE
                                                                                     AND CXE.PROCESAR    = 'S'
                                                                                 )
                                                                  )
                                                   );`);
          var dPhase = (params.phase || 1) == 1 ? null : 'G';
          await this.entity.query(` UPDATE sera.COMER_LOTES
                                                   SET ID_ESTATUSVTA  =  case coalesce(${params.phase}, 1) when 1 then 'VEN' when 2 then 'VEN' when 3 then 'GARA' when 4 then 'GARA' when 5 then 'PAG' when 9 then 'PAGE' end,
                                                   VALIDO_SISTEMA = '${dPhase}',
                                                   ACUMULADO = (SELECT SUM(coalesce(RGE.MONTO_NOAPP_IVA,0) + coalesce(RGE.IVA,0) + coalesce(RGE.MONTO_APP_IVA,0) )
                                                                   FROM sera.COMER_PAGOSREFGENS RGE, sera.COMER_LOTES LOT2
                                                                   WHERE LOT2.ID_EVENTO = ${params.event}
                                                                   AND LOT2.ID_LOTE = LOT.ID_LOTE
                                                                   AND LOT2.ID_LOTE = RGE.ID_LOTE
                                                                   AND RGE.TIPO = 'N'
                                                                   AND LOT2.ID_LOTE = ${V_ID_LOTE}
                                                                   AND EXISTS (SELECT 1
                                                                                   FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                   WHERE CXE.ID_EVENTO = ${params.event}
                                                                                   AND CXE.ID_CLIENTE = LOT2.ID_CLIENTE
                                                                                   AND CXE.PROCESAR = 'S'
                                                                           )
                                                                   )
                                           WHERE LOT.ID_EVENTO = ${params.event}
                                                   AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                   AND EXISTS (SELECT 1
                                                           FROM sera.COMER_CLIENTESXEVENTO CXE
                                                           WHERE CXE.ID_EVENTO = ${params.event}
                                                           AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                           AND CXE.PROCESAR = 'S'
                                                           )`);
          await this.entity.query(` DELETE FROM sera.COMER_PAGOSREFGENS CPRG
                                        WHERE ID_LOTE = ${V_ID_LOTE}
                                        AND EXISTS (SELECT 1
                                                        FROM sera.COMER_LOTES LOT
                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                        AND LOT.ID_EVENTO = CPRG.ID_EVENTO
                                                        AND LOT.ID_LOTE = CPRG.ID_LOTE
                                                        AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                        AND EXISTS (SELECT 1
                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                        WHERE CXE.ID_EVENTO  = ${params.event}
                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                        AND CXE.PROCESAR   = 'S'
                                                                )
                                                )
                                        AND NOT EXISTS (SELECT 1
                                                        FROM sera.COMER_PAGOREF PRE
                                                        WHERE PRE.ID_PAGO = CPRG.ID_PAGO
                                                        AND PRE.IDORDENINGRESO IS NOT NULL
                                                        );`);
        });
      }

      await this.entity.query(` UPDATE  sera.COMER_CLIENTESXEVENTO
                        SET  PROCESADO=NULL
                WHERE  ID_EVENTO =${params.event}
                AND  ENVIADO_SIRSAE ='N'`);
      await this.entity.query(` DELETE FROM   sera.COMER_BIENESRECHAZADOS 
                WHERE    ID_EVENTO = ${params.event}`);

      await this.entity.query(` UPDATE sera.COMER_CLIENTES
                SET LISTA_NEGRA = 'N'
                WHERE ID_CLIENTE IN (
                    SELECT DISTINCT ID_CLIENTE
                      FROM sera.COMER_CLIENTESXEVENTO CXE
                     WHERE CXE.ID_EVENTO = ${params.event})
                AND EXISTS (SELECT 1
                              FROM sera.COMER_CLIENTESXEVENTO CXE
                             WHERE CXE.ID_EVENTO = ${params.event}
                               AND CXE.PROCESAR = 'S'
                             );`);
      return {
        statusCode: HttpStatus.OK,
        message: ['OK'],
        data: true
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message]
      }
    }
  }
  /**
   * @procedure BORRA_COMPLETO
   * @param params
   * @returns
   */
  async fullErase(params: CurrentFullErase) {
    var BR_IDLOTE = 0;
    var BR_IDBXL = 0;
    var BR_IDBXL2 = 0;
    var BR_ACUMULADO = 0;
    var V_ID_LOTE = 0;
    var V_ID_TPEVENTO = 0;
    const dateNow = LocalDate.getNow();
    try {
      const result: any[] = await this.entity.query(
        `SELECT ID_TPEVENTO FROM sera.COMER_EVENTOS WHERE ID_EVENTO = ${params.event}`,
      );
      V_ID_TPEVENTO = result[0].id_tpevento;

      const LOTBRSP: any[] = await this.entity.query(` 
                                SELECT DISTINCT CLOT.ID_LOTE
                                FROM sera.COMER_LOTES CLOT, sera.COMER_PAGOREF CPAG
                                WHERE CLOT.ID_EVENTO = ${params.event}
                                AND CLOT.ID_LOTE = CPAG.ID_LOTE
                                AND CLOT.ID_CLIENTE IS NOT NULL
                                AND CLOT.ID_LOTE = coalesce(${params.lot}, CLOT.ID_LOTE)
                                AND CPAG.CONCILIADO IS NULL
                                AND CPAG.IDORDENINGRESO IS NULL
                                AND EXISTS (SELECT 1
                                                FROM sera.COMER_BIENESXLOTE CBXL, sera.bien BNS
                                                WHERE CBXL.ID_LOTE = CLOT.ID_LOTE
                                                AND CBXL.NO_BIEN = BNS.NO_BIEN
                                                AND BNS.ESTATUS IN ('VEN','VPP','VPT','CXR','VTR') )
                                        AND EXISTS (SELECT 1
                                                        FROM sera.COMER_PAGOSREFGENS CGEN
                                                        WHERE CGEN.ID_LOTE = CLOT.ID_LOTE )
                                        AND EXISTS (SELECT 1
                                                FROM sera.COMER_CLIENTESXEVENTO CCXE
                                                WHERE CCXE.ID_EVENTO = ${params.event}
                                                AND CCXE.ID_CLIENTE = CLOT.ID_CLIENTE
                                                AND CCXE.PROCESAR = 'S'
                                        )`);
      if (LOTBRSP.length > 0) {
        V_ID_LOTE = LOTBRSP[0].id_lote;
      } else {
        V_ID_LOTE = null
      }
      for (var item of LOTBRSP) {
        await this.entity.query(` UPDATE sera.COMER_PAGOREF 
                                        SET VALIDO_SISTEMA = 'A'
                                        WHERE EXISTS (SELECT 1
                                                FROM sera.COMER_LOTES LOT
                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                AND EXISTS (SELECT 1
                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                WHERE CXE.ID_EVENTO  = ${params.event}
                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                AND CXE.PROCESAR   = 'S'
                                                                )
                                                )
                                        AND VALIDO_SISTEMA = 'S'
                                        AND IDORDENINGRESO IS  NULL`);
        await this.entity.query(`INSERT INTO sera.HISTORICO_ESTATUS_BIEN
                                        SELECT NO_BIEN, ESTATUS, CAST('${dateNow}' AS DATE)+1/1440/60, 'USER', 'FCOMER612', 'CAMBIO POR REVERSO DE DISPERSION DE PAGOS ACT',(select last_value+1 from  sera.SEQ_BITACORA),PROCESO_EXT_DOM
                                        FROM sera.bien BIE
                                        WHERE ESTATUS IN ('VPP','VPT')
                                        AND EXISTS (SELECT 1 FROM sera.COMER_BIENESXLOTE BXL
                                                        WHERE BXL.NO_BIEN = BIE.NO_BIEN
                                                        AND BXL.ID_LOTE = coalesce(${V_ID_LOTE},BXL.ID_LOTE)
                                                        AND EXISTS (SELECT 1 FROM sera.COMER_LOTES LOT
                                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                                        AND LOT.ID_LOTE   = BXL.ID_LOTE
                                                                        AND LOT.ID_LOTE   = coalesce(${V_ID_LOTE},BXL.ID_LOTE)
                                                                        AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO   = ${params.event}
                                                                                        AND CXE.ID_CLIENTE  = LOT.ID_CLIENTE
                                                                                        AND CXE.PROCESAR    = 'S'
                                                                                )
                                                                )
                                                )`);

        await this.entity.query(`UPDATE sera.bien BIE
                                        SET ESTATUS = 'VEN'
                                        WHERE ESTATUS IN ('VPP','VPT')
                                        AND EXISTS (SELECT 1
                                                        FROM sera.COMER_BIENESXLOTE BXL
                                                        WHERE BXL.NO_BIEN = BIE.NO_BIEN
                                                        AND BXL.ID_LOTE = ${V_ID_LOTE}
                                                        AND EXISTS (SELECT 1
                                                                        FROM sera.COMER_LOTES LOT
                                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                                        AND LOT.ID_LOTE = BXL.ID_LOTE
                                                                        AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                                        AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                        WHERE CXE.ID_EVENTO   = ${params.event}
                                                                                        AND CXE.ID_CLIENTE  = LOT.ID_CLIENTE
                                                                                        AND CXE.PROCESAR    = 'S'
                                                                        )
                                                         )
                                          )
                                `);
        await this.entity.query(`INSERT INTO sera.HISTORICO_ESTATUS_BIEN
                                        SELECT NO_BIEN, ESTATUS, SYSDATE+1/1440/60, 'USER', 'FCOMER612', 'CAMBIO POR REVERSO DE DISPERSION DE PAGOS ACT',(select last_value+1 from  sera.SEQ_BITACORA),PROCESO_EXT_DOM
                                        FROM sera.bien BIE
                                        WHERE ESTATUS IN ('VTR')
                                        AND EXISTS (SELECT 1 FROM sera.COMER_BIENESXLOTE BXL
                                                        WHERE BXL.NO_BIEN = BIE.NO_BIEN
                                                        AND BXL.ID_LOTE =${V_ID_LOTE}
                                                        AND EXISTS (SELECT 1 FROM sera.COMER_LOTES LOT
                                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                                        AND LOT.ID_LOTE   = BXL.ID_LOTE
                                                                        AND LOT.ID_LOTE   = ${V_ID_LOTE}
                                                                        AND EXISTS (SELECT 1 FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO   = ${params.event}
                                                                                        AND CXE.ID_CLIENTE  = LOT.ID_CLIENTE
                                                                                        AND CXE.PROCESAR    = 'S'
                                                                                )
                                                                )
                                                );
                                `);

        await this.entity.query(`UPDATE sera.bien BIE
                                        SET ESTATUS = 'CXR'
                                        WHERE ESTATUS IN ('VTR')
                                        AND EXISTS (SELECT 1
                                                FROM sera.COMER_BIENESXLOTE BXL
                                                WHERE BXL.NO_BIEN = BIE.NO_BIEN
                                                AND BXL.ID_LOTE = ${V_ID_LOTE}
                                                AND EXISTS (SELECT 1
                                                                FROM sera.COMER_LOTES LOT
                                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                                AND LOT.ID_LOTE = BXL.ID_LOTE
                                                                AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                                AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO   = ${params.event}
                                                                                AND CXE.ID_CLIENTE  = LOT.ID_CLIENTE
                                                                                AND CXE.PROCESAR    = 'S'
                                                                                )
                                                          )
                                           )`);
        await this.entity.query(`UPDATE sera.COMER_BIENESXLOTE
                                SET ESTATUS_ANT = 'ADM',
                                    ESTATUS_COMER = 'VEN',
                                    ID_LOTE_COMER = NULL,
                                    ID_EVENTO_COMER = NULL
                              WHERE ID_LOTE = ${V_ID_LOTE}
                                AND EXISTS (SELECT 1
                                              FROM sera.COMER_BIENESXLOTE BXL
                                             WHERE BXL.ID_LOTE = ${V_ID_LOTE}
                                               AND EXISTS (SELECT 1
                                                             FROM sera.COMER_LOTES LOT
                                                            WHERE LOT.ID_EVENTO = ${params.event}
                                                              AND LOT.ID_LOTE = BXL.ID_LOTE
                                                              AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                              AND EXISTS (SELECT 1
                                                                            FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                           WHERE CXE.ID_EVENTO   = ${params.event}
                                                                             AND CXE.ID_CLIENTE  = LOT.ID_CLIENTE
                                                                             AND CXE.PROCESAR    = 'S'
                                                                         )
                                                          )
                                           );`);
        var dPhase = (params.phase || 1) == 1 ? null : 'G';
        await this.entity.query(` UPDATE sera.COMER_LOTES
                                                SET ID_ESTATUSVTA  =  case coalesce(${params.phase}, 1) when 1 then 'VEN' when 2 then 'VEN' when 3 then 'GARA' when 4 then 'GARA' when 5 then 'PAG' when 9 then 'PAGE' end,
                                                VALIDO_SISTEMA = '${dPhase}',
                                                ACUMULADO = (SELECT SUM(coalesce(RGE.MONTO_NOAPP_IVA,0) + coalesce(RGE.IVA,0) + coalesce(RGE.MONTO_APP_IVA,0) )
                                                                FROM sera.COMER_PAGOSREFGENS RGE, sera.COMER_LOTES LOT2
                                                                WHERE LOT2.ID_EVENTO = ${params.event}
                                                                AND LOT2.ID_LOTE = LOT.ID_LOTE
                                                                AND LOT2.ID_LOTE = RGE.ID_LOTE
                                                                AND RGE.TIPO = 'N'
                                                                AND LOT2.ID_LOTE = ${V_ID_LOTE}
                                                                AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO = ${params.event}
                                                                                AND CXE.ID_CLIENTE = LOT2.ID_CLIENTE
                                                                                AND CXE.PROCESAR = 'S'
                                                                        )
                                                                )
                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                AND EXISTS (SELECT 1
                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                        AND CXE.PROCESAR = 'S'
                                                        )`);

        await this.entity.query(` DELETE FROM sera.COMER_PAGOSREFGENS CPR
                                WHERE ID_LOTE = ${V_ID_LOTE}
                                  AND EXISTS (SELECT 1
                                                FROM sera.COMER_LOTES LOT
                                               WHERE LOT.ID_EVENTO = ${params.event}
                                                 AND LOT.ID_EVENTO = CPR.ID_EVENTO
                                                 AND LOT.ID_LOTE = CPR.ID_LOTE
                                                 AND LOT.ID_LOTE = ${V_ID_LOTE}
                                                 AND EXISTS (SELECT 1
                                                               FROM sera.COMER_CLIENTESXEVENTO CXE
                                                              WHERE CXE.ID_EVENTO  = ${params.event}
                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                AND CXE.PROCESAR   = 'S'
                                                            )
                                             )
                                  AND NOT EXISTS (SELECT 1
                                                    FROM sera.COMER_PAGOREF PRE
                                                   WHERE PRE.ID_PAGO = CPR.ID_PAGO
                                                     AND PRE.IDORDENINGRESO IS NOT NULL
                                                 );`);
      }

      await this.entity.query(` UPDATE  sera.COMER_CLIENTESXEVENTO
                        SET  PROCESADO=NULL
                WHERE  ID_EVENTO =${params.event}
                AND  ENVIADO_SIRSAE ='N'`);
      await this.entity.query(` DELETE FROM sera.COMER_BIENESRECHAZADOS 
                WHERE    ID_EVENTO = ${params.event}`);

      await this.entity.query(` UPDATE sera.COMER_CLIENTES
                SET LISTA_NEGRA = 'N'
                WHERE ID_CLIENTE IN (
                    SELECT DISTINCT ID_CLIENTE
                      FROM sera.COMER_CLIENTESXEVENTO CXE
                     WHERE CXE.ID_EVENTO = ${params.event})
                AND EXISTS (SELECT 1
                              FROM sera.COMER_CLIENTESXEVENTO CXE
                             WHERE CXE.ID_EVENTO = ${params.event}
                               AND CXE.PROCESAR = 'S'
                             );`);
      return {
        statusCode: HttpStatus.OK,
        message: ['OK'],
        data: true
      }
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message]
      }
    }
  }
  /**
   *
   * @procedure ACT_LOTES_ACT
   * @returns
   */
  async actLotAct(params: UpdateCurrentGeneralStatus) {
    var V_PRECIO_FINAL = 0;
    var V_MONTO = 0;
    var V_ID_ESTATUSVTA = '';
    var V_TPEVENTO = 0;

    const res: any[] = await this.entity.query(`SELECT ID_TPEVENTO
                FROM sera.COMER_EVENTOS
                 WHERE ID_EVENTO = ${params.event}`);
    if (res.length > 0) {
      V_TPEVENTO = res[0].id_tpevento;

      if (V_TPEVENTO == 1) {
        if (params.phase == 1) {
          var C_GARS_SPBM: any[] = await this.entity
            .query(` SELECT ID_ESTATUSVTA, PRECIO_FINAL, SUM(GENS.MONTO) MONTO
                                        FROM sera.COMER_LOTES CLOT, sera.COMER_PAGOSREFGENS GENS
                                       WHERE CLOT.ID_LOTE = GENS.ID_LOTE
                                         AND CLOT.NO_TRANSFERENTE = GENS.NO_TRANSFERENTE
                                         AND CLOT.ID_EVENTO = ${params.event} 
                                         AND CLOT.ID_LOTE = ${params.lot} 
                                         AND CLOT.ID_ESTATUSVTA NOT IN ('PAG')
                                         AND GENS.REFERENCIA LIKE('1%')
                                       GROUP BY ID_ESTATUSVTA, PRECIO_FINAL`);
          for (var element of C_GARS_SPBM) {
            V_ID_ESTATUSVTA = element.id_estatusvta;
            V_PRECIO_FINAL = element.precio_final;
            V_MONTO = element.monto;
            if (V_MONTO >= V_PRECIO_FINAL) {
              await this.entity.query(`UPDATE    sera.COMER_LOTES LOT
                                                        SET    VALIDO_SISTEMA = 'S',
                                                               ID_ESTATUSVTA = 'PAG'
                                                      WHERE    ID_EVENTO = ${params.event}
                                                        AND    ID_LOTE = coalesce(${params.lot}, ID_LOTE)
                                                        AND    EXISTS (SELECT 1
                                                                         FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                          AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                          AND CXE.PROCESAR = 'S'
                                                                          AND CXE.ENVIADO_SIRSAE = 'N'
                                                                      )
                                                        AND     VALIDO_SISTEMA IS NULL
                                                        AND     LOTE_PUBLICO != 0
                                                        AND     EXISTS (SELECT 1
                                                                          FROM sera.COMER_PAGOSREFGENS GEN
                                                                         WHERE GEN.ID_EVENTO = ${params.event}
                                                                           AND GEN.TIPO = 'N'
                                                                           AND GEN.ID_LOTE = LOT.ID_LOTE
                                                                       )`);
              await this.entity.query(` UPDATE    sera.bien BIE
                                                        SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                                                 FROM sera.ESTATUS_X_PANTALLA ESP
                                                                                WHERE CVE_PANTALLA = 'VTAMUETOT'
                                                                                  AND ESP.ESTATUS = BIE.ESTATUS
                                                                                  AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                                             )
                                                      WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                         FROM sera.COMER_BIENESXLOTE BXL
                                                                        WHERE EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                       WHERE LOT.ID_EVENTO = ${params.event}
                                                                                         AND LOT.ID_LOTE = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                         AND LOT.ID_ESTATUSVTA = 'PAG'
                                                                                         AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                                         AND EXISTS (SELECT 1
                                                                                                       FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                      WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                     )
                                                                                     )
                                                                          AND BXL.NO_BIEN = BIE.NO_BIEN
                                                                      )
                                                        `);
              await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL
                                                        SET    ID_EVENTO_COMER   = ${params.event},
                                                               ID_LOTE_COMER     = ${params.publicLot},
                                                               VENDIDO           = 'S',
                                                               SELECCIONADO      = 'S',
                                                               ESTATUS_ANT       = 'VEN',
                                                               ESTATUS_COMER     = 'VPT'
                                                      WHERE    EXISTS (SELECT 1
                                                                         FROM sera.COMER_BIENESXLOTE BXL2
                                                                        WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                          AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                       WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                         AND LOT.ID_LOTE         = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                         AND LOT.ID_ESTATUSVTA   = 'PAG'
                                                                                         AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                         AND EXISTS (SELECT 1
                                                                                                       FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                      WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                    )
                                                                                     )
                                                                      )`);
            } else if (V_MONTO >= V_PRECIO_FINAL / 2) {
              await this.entity.query(` UPDATE    sera.COMER_LOTES LOT
                                                        SET    ID_ESTATUSVTA = 'GARA'
                                                      WHERE    ID_EVENTO = ${params.event}
                                                        AND    ID_LOTE = coalesce(${params.lot}, ID_LOTE)
                                                        AND    EXISTS (SELECT 1
                                                                         FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                          AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                          AND CXE.PROCESAR = 'S'
                                                                          AND CXE.ENVIADO_SIRSAE = 'N'
                                                                      )
                                                        AND     VALIDO_SISTEMA IS NULL
                                                        AND     LOTE_PUBLICO != 0
                                                        AND     EXISTS (SELECT 1
                                                                          FROM sera;COMER_PAGOSREFGENS GEN
                                                                         WHERE GEN.ID_EVENTO = ${params.event}
                                                                           AND GEN.TIPO = 'N'
                                                                           AND GEN.ID_LOTE = LOT.ID_LOTE
                                                                       )`);
              await this.entity.query(` UPDATE    sera.bien BIE
                                                                SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                                                        FROM sera.ESTATUS_X_PANTALLA ESP
                                                                                        WHERE CVE_PANTALLA = 'VTAMUEPAR'
                                                                                                AND ESP.ESTATUS = BIE.ESTATUS
                                                                                                AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                                                        )
                                                                WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                                FROM sera.COMER_BIENESXLOTE BXL
                                                                                WHERE EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                                                        AND LOT.ID_LOTE = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                        AND LOT.ID_ESTATUSVTA = 'GARA'
                                                                                        AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                                        AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                                AND BXL.NO_BIEN = BIE.NO_BIEN
                                                                        )
                                                        `);

              await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL
                                                        SET    ID_EVENTO_COMER   = ${params.event},
                                                               ID_LOTE_COMER     = ${params.publicLot},
                                                               VENDIDO           = 'S',
                                                               SELECCIONADO      = 'S',
                                                               ESTATUS_ANT       = 'VEN',
                                                               ESTATUS_COMER     = 'VPP'
                                                      WHERE    EXISTS (SELECT 1
                                                                         FROM sera.COMER_BIENESXLOTE BXL2
                                                                        WHERE BXL2.NO_BIEN =CBXL.NO_BIEN
                                                                          AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                       WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                         AND LOT.ID_LOTE         = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                         AND LOT.ID_ESTATUSVTA   = 'GARA'
                                                                                         AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                         AND EXISTS (SELECT 1
                                                                                                       FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                      WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                    )
                                                                                     )
                                                                      )`);
            }
          }
        } else if (params.phase == 3) {
          const C_LIQN_SPBM: any[] = await this.entity
            .query(` SELECT ID_ESTATUSVTA, PRECIO_FINAL, SUM(GENS.MONTO) MONTO
                                                FROM sera.COMER_LOTES CLOT, sera.COMER_PAGOSREFGENS GENS
                                                WHERE CLOT.ID_LOTE = GENS.ID_LOTE
                                                AND CLOT.NO_TRANSFERENTE = GENS.NO_TRANSFERENTE
                                                AND CLOT.ID_EVENTO = ${params.event} 
                                                AND CLOT.ID_LOTE = ${params.lot}
                                                AND CLOT.ID_ESTATUSVTA NOT IN ('PAG')
                                                AND (GENS.REFERENCIA LIKE('1%') OR GENS.REFERENCIA LIKE('3%'))
                                                GROUP BY ID_ESTATUSVTA, PRECIO_FINAL`);
          for (var element of C_LIQN_SPBM) {
            V_ID_ESTATUSVTA = element.id_estatusvta;
            V_PRECIO_FINAL = element.precio_final;
            V_MONTO = element.monto;
            if (
              V_MONTO >= V_PRECIO_FINAL &&
              (V_ID_ESTATUSVTA == 'VEN' || V_ID_ESTATUSVTA == 'GARA')
            ) {
              await this.entity.query(`UPDATE    sera.COMER_LOTES LOT
                                                        SET    VALIDO_SISTEMA = 'S',
                                                                ID_ESTATUSVTA = 'PAG'
                                                        WHERE    ID_EVENTO = ${params.event}
                                                        AND    ID_LOTE = coalesce(${params.lot}, ID_LOTE)
                                                        AND    EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                AND CXE.PROCESAR = 'S'
                                                                                AND CXE.ENVIADO_SIRSAE = 'N'
                                                                        )
                                                        AND     VALIDO_SISTEMA IS NULL
                                                        AND     LOTE_PUBLICO != 0
                                                        AND     EXISTS (SELECT 1
                                                                                FROM sera.COMER_PAGOSREFGENS GEN
                                                                                WHERE GEN.ID_EVENTO = ${params.event}
                                                                                AND GEN.TIPO = 'N'
                                                                                AND GEN.ID_LOTE = LOT.ID_LOTE
                                                                        )`);
              await this.entity.query(` UPDATE    sera.bien BIE
                                                        SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                                                        FROM sera.ESTATUS_X_PANTALLA ESP
                                                                                WHERE CVE_PANTALLA = 'VTAMUETOT'
                                                                                        AND ESP.ESTATUS = BIE.ESTATUS
                                                                                        AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                                                )
                                                        WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                                FROM sera.COMER_BIENESXLOTE BXL
                                                                        WHERE EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                                                                AND LOT.ID_LOTE = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                                AND LOT.ID_ESTATUSVTA = 'PAG'
                                                                                                AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                                                AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                                AND BXL.NO_BIEN = BIE.NO_BIEN
                                                                        )
                                                        `);
              await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL
                                                        SET    ID_EVENTO_COMER   = ${params.event},
                                                                ID_LOTE_COMER     = ${params.publicLot},
                                                                VENDIDO           = 'S',
                                                                SELECCIONADO      = 'S',
                                                                ESTATUS_ANT       = 'VEN',
                                                                ESTATUS_COMER     = 'VPT'
                                                        WHERE    EXISTS (SELECT 1
                                                                                FROM sera.COMER_BIENESXLOTE BXL2
                                                                        WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                                AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                                AND LOT.ID_LOTE         = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                                AND LOT.ID_ESTATUSVTA   = 'PAG'
                                                                                                AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                                AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                        )`);
            }
          }
        } else if (params.phase == 4) {
          const C_LIQE_SPBM: any[] = await this.entity
            .query(`SELECT ID_ESTATUSVTA, PRECIO_FINAL, SUM(GENS.MONTO) MONTO
                                        FROM sera.COMER_LOTES CLOT, sera.COMER_PAGOSREFGENS GENS
                                       WHERE CLOT.ID_LOTE = GENS.ID_LOTE
                                         AND CLOT.NO_TRANSFERENTE = GENS.NO_TRANSFERENTE
                                         AND CLOT.ID_EVENTO = L_EVENTO
                                         AND CLOT.ID_LOTE = L_LOTE
                                         AND CLOT.ID_ESTATUSVTA NOT IN ('PAG')
                                         AND (GENS.REFERENCIA LIKE('1%') OR GENS.REFERENCIA LIKE('4%'))
                                       GROUP BY ID_ESTATUSVTA, PRECIO_FINAL`);
          for (var element of C_LIQE_SPBM) {
            V_ID_ESTATUSVTA = element.id_estatusvta;
            V_PRECIO_FINAL = element.precio_final;
            V_MONTO = element.monto;
            if (
              V_MONTO >= V_PRECIO_FINAL &&
              (V_ID_ESTATUSVTA == 'VEN' || V_ID_ESTATUSVTA == 'GARA')
            ) {
              await this.entity.query(`UPDATE    sera.COMER_LOTES LOT
                                                        SET    VALIDO_SISTEMA = 'S',
                                                                ID_ESTATUSVTA = 'PAGE'
                                                        WHERE    ID_EVENTO = ${params.event}
                                                        AND    ID_LOTE = coalesce(${params.lot}, ID_LOTE)
                                                        AND    EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                AND CXE.PROCESAR = 'S'
                                                                                AND CXE.ENVIADO_SIRSAE = 'N'
                                                                        )
                                                        AND     VALIDO_SISTEMA IS NULL
                                                        AND     LOTE_PUBLICO != 0
                                                        AND     EXISTS (SELECT 1
                                                                                FROM sera.COMER_PAGOSREFGENS GEN
                                                                                WHERE GEN.ID_EVENTO = ${params.event}
                                                                                AND GEN.TIPO = 'N'
                                                                                AND GEN.ID_LOTE = LOT.ID_LOTE
                                                                        )`);
              await this.entity.query(` UPDATE    sera.bien BIE
                                                        SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                                                        FROM sera.ESTATUS_X_PANTALLA ESP
                                                                                WHERE CVE_PANTALLA = 'VTAMUETOT'
                                                                                        AND ESP.ESTATUS =BIE.ESTATUS
                                                                                        AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                                                )
                                                        WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                                FROM sera.COMER_BIENESXLOTE BXL
                                                                        WHERE EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                                                                AND LOT.ID_LOTE = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                                AND LOT.ID_ESTATUSVTA = 'PAGE'
                                                                                                AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                                                AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                                AND BXL.NO_BIEN = BIE.NO_BIEN
                                                                        )
                                                        `);
              await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL
                                                        SET    ID_EVENTO_COMER   = ${params.event},
                                                                ID_LOTE_COMER     = ${params.publicLot},
                                                                VENDIDO           = 'S',
                                                                SELECCIONADO      = 'S',
                                                                ESTATUS_ANT       = 'VEN',
                                                                ESTATUS_COMER     = 'VPT'
                                                        WHERE    EXISTS (SELECT 1
                                                                                FROM sera.COMER_BIENESXLOTE BXL2
                                                                        WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                                AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                                AND LOT.ID_LOTE         = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                                AND LOT.ID_ESTATUSVTA   = 'PAGE'
                                                                                                AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                                AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                        )`);
            } else if (V_MONTO < V_PRECIO_FINAL && V_ID_ESTATUSVTA == 'CAN') {
              await this.entity.query(` UPDATE    sera.bien BIE
                                                        SET    ESTATUS = 'CPV'
                                                        WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                         FROM sera.COMER_BIENESXLOTE BXL
                                                                        WHERE EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                       WHERE LOT.ID_EVENTO = ${params.event}
                                                                                         AND LOT.ID_LOTE = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                         AND LOT.ID_ESTATUSVTA = 'CAN'
                                                                                         AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                                         AND EXISTS (SELECT 1
                                                                                                       FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                      WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                     )
                                                                                     )
                                                                          AND BXL.NO_BIEN = BIE.NO_BIEN
                                                                      )
                                                        `);
              await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL
                                                        SET    ID_EVENTO_COMER   = ${params.event},
                                                                ID_LOTE_COMER     = ${params.publicLot},
                                                                VENDIDO           = 'N',
                                                                SELECCIONADO      = null,
                                                                ESTATUS_ANT       = 'VEN',
                                                                ESTATUS_COMER     = 'VEN'
                                                        WHERE    EXISTS (SELECT 1
                                                                                FROM sera.COMER_BIENESXLOTE BXL2
                                                                        WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                                AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                                AND LOT.ID_LOTE         = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                                AND LOT.ID_ESTATUSVTA   = 'CAn'
                                                                                                AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                                AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                        )`);
            }
          }
        }
      } else {
        if (params.phase == 1) {
          var C_GARS: any[] = await this.entity
            .query(` SELECT ID_ESTATUSVTA, PRECIO_FINAL, SUM(MONTO) as  MONTO 
                                        FROM (
                                        SELECT CLOT.ID_ESTATUSVTA,
                                               CLOT.PRECIO_FINAL,
                                               CP.MONTO MONTO
                                          FROM sera.COMER_PAGOREF CP,  sera.COMER_REF_GARANTIAS CRG, sera.COMER_EVENTOS CE, sera.COMER_LOTES CLOT
                                         WHERE CLOT.ID_EVENTO = CE.ID_EVENTO
                                           AND CLOT.ID_LOTE = CP.ID_LOTE
                                           AND CLOT.ID_LOTE = CRG.ID_LOTE
                                           AND CLOT.ID_EVENTO = CRG.ID_EVENTO
                                           AND CLOT.ID_CLIENTE = CRG.ID_CLIENTE
                                           AND CP.REFERENCIA = CRG.REF_GSAE||CRG.REF_GBANCO
                                           AND CP.REFERENCIA LIKE('1%')
                                           AND CE.ID_EVENTO = ${params.event}
                                           AND CLOT.ID_LOTE = ${params.lot}
                                           AND CLOT.ID_ESTATUSVTA NOT IN ('PAG')
                                           AND CP.VALIDO_SISTEMA = 'S') as C
                                         GROUP BY C.ID_ESTATUSVTA, C.PRECIO_FINAL`);
          for (var element of C_GARS) {
            V_ID_ESTATUSVTA = element.id_estatusvta;
            V_PRECIO_FINAL = element.precio_final;
            V_MONTO = element.monto;
            if (V_PRECIO_FINAL <= V_MONTO) {
              await this.entity.query(`UPDATE    sera.COMER_LOTES LOT
                                                        SET    VALIDO_SISTEMA = 'S',
                                                               ID_ESTATUSVTA = 'PAG'
                                                      WHERE    ID_EVENTO = ${params.event}
                                                        AND    ID_LOTE = coalesce(${params.lot}, ID_LOTE)
                                                        AND    EXISTS (SELECT 1
                                                                         FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                          AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                          AND CXE.PROCESAR = 'S'
                                                                          AND CXE.ENVIADO_SIRSAE = 'N'
                                                                      )
                                                        AND     VALIDO_SISTEMA IS NULL
                                                        AND     LOTE_PUBLICO != 0
                                                        AND     EXISTS (SELECT 1
                                                                          FROM sera.COMER_PAGOSREFGENS GEN
                                                                         WHERE GEN.ID_EVENTO = ${params.event}
                                                                           AND GEN.TIPO = 'N'
                                                                           AND GEN.ID_LOTE = LOT.ID_LOTE
                                                                       )`);
              await this.entity.query(` UPDATE    sera.bien BIE
                                                        SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                                                 FROM sera.ESTATUS_X_PANTALLA ESP
                                                                                WHERE CVE_PANTALLA = 'VTAMUETOT'
                                                                                  AND ESP.ESTATUS = BIE.ESTATUS
                                                                                  AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                                             )
                                                      WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                         FROM sera.COMER_BIENESXLOTE BXL
                                                                        WHERE EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                       WHERE LOT.ID_EVENTO = ${params.event}
                                                                                         AND LOT.ID_LOTE = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                         AND LOT.ID_ESTATUSVTA = 'PAG'
                                                                                         AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                                         AND EXISTS (SELECT 1
                                                                                                       FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                      WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                     )
                                                                                     )
                                                                          AND BXL.NO_BIEN = BIE.NO_BIEN
                                                                      )
                                                        `);
              await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL
                                                        SET    ID_EVENTO_COMER   = ${params.event},
                                                               ID_LOTE_COMER     = ${params.publicLot},
                                                               VENDIDO           = 'S',
                                                               SELECCIONADO      = 'S',
                                                               ESTATUS_ANT       = 'VEN',
                                                               ESTATUS_COMER     = 'VPT'
                                                      WHERE    EXISTS (SELECT 1
                                                                         FROM sera.COMER_BIENESXLOTE BXL2
                                                                        WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                          AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                       WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                         AND LOT.ID_LOTE         = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                         AND LOT.ID_ESTATUSVTA   = 'PAG'
                                                                                         AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                         AND EXISTS (SELECT 1
                                                                                                       FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                      WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                    )
                                                                                     )
                                                                      )`);
            } else if (V_MONTO >= V_PRECIO_FINAL / 2) {
              await this.entity.query(` UPDATE    sera.COMER_LOTES LOT
                                                        SET    ID_ESTATUSVTA = 'GARA'
                                                      WHERE    ID_EVENTO = ${params.event}
                                                        AND    ID_LOTE = coalesce(${params.lot}, ID_LOTE)
                                                        AND    EXISTS (SELECT 1
                                                                         FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                          AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                          AND CXE.PROCESAR = 'S'
                                                                          AND CXE.ENVIADO_SIRSAE = 'N'
                                                                      )
                                                        AND     VALIDO_SISTEMA IS NULL
                                                        AND     LOTE_PUBLICO != 0
                                                        AND     EXISTS (SELECT 1
                                                                          FROM sera;COMER_PAGOSREFGENS GEN
                                                                         WHERE GEN.ID_EVENTO = ${params.event}
                                                                           AND GEN.TIPO = 'N'
                                                                           AND GEN.ID_LOTE =LOT.ID_LOTE
                                                                       )`);
              await this.entity.query(` UPDATE    sera.bien BIE
                                                                SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                                                        FROM sera.ESTATUS_X_PANTALLA ESP
                                                                                        WHERE CVE_PANTALLA = 'VTAMUEPAR'
                                                                                                AND ESP.ESTATUS = BIE.ESTATUS
                                                                                                AND ESP.PROCESO_EXT_DOM =BIE.PROCESO_EXT_DOM
                                                                                        )
                                                                WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                                FROM sera.COMER_BIENESXLOTE BXL
                                                                                WHERE EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                                                        AND LOT.ID_LOTE = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                        AND LOT.ID_ESTATUSVTA = 'GARA'
                                                                                        AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                                        AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                                AND BXL.NO_BIEN = BIE.NO_BIEN
                                                                        )
                                                        `);

              await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL
                                                        SET    ID_EVENTO_COMER   = ${params.event},
                                                               ID_LOTE_COMER     = ${params.publicLot},
                                                               VENDIDO           = 'S',
                                                               SELECCIONADO      = 'S',
                                                               ESTATUS_ANT       = 'VEN',
                                                               ESTATUS_COMER     = 'VPP'
                                                      WHERE    EXISTS (SELECT 1
                                                                         FROM sera.COMER_BIENESXLOTE BXL2
                                                                        WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                          AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                       WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                         AND LOT.ID_LOTE         = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                         AND LOT.ID_ESTATUSVTA   = 'GARA'
                                                                                         AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                         AND EXISTS (SELECT 1
                                                                                                       FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                      WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                    )
                                                                                     )
                                                                      )`);
            }
          }
        } else if (params.phase == 2) {
          const C_GARC: any[] = await this.entity
            .query(` SELECT ID_ESTATUSVTA, PRECIO_FINAL, SUM(MONTO) MONTO FROM (
                                                SELECT CLOT.ID_ESTATUSVTA,
                                                CLOT.PRECIO_FINAL,
                                                CP.MONTO MONTO
                                                FROM sera.COMER_PAGOREF CP,  sera.COMER_REF_GARANTIAS CRG, sera.COMER_EVENTOS CE, sera.COMER_LOTES CLOT
                                                WHERE CLOT.ID_EVENTO = CE.ID_EVENTO
                                                AND CLOT.ID_LOTE = CP.ID_LOTE
                                                AND CLOT.ID_LOTE = CRG.ID_LOTE
                                                AND CLOT.ID_EVENTO = CRG.ID_EVENTO
                                                AND CLOT.ID_CLIENTE = CRG.ID_CLIENTE
                                                AND CP.REFERENCIA = CRG.REF_GSAE||CRG.REF_GBANCO
                                                AND CP.REFERENCIA LIKE('1%')
                                                AND CE.ID_EVENTO = ${params.event}
                                                AND CLOT.ID_LOTE = ${params.lot}
                                                AND CLOT.ID_ESTATUSVTA NOT IN ('PAG')
                                                AND CP.VALIDO_SISTEMA = 'S'
                                                UNION
                                                SELECT CLOT.ID_ESTATUSVTA,
                                                CLOT.PRECIO_FINAL,
                                                CP.MONTO MONTO
                                                FROM sera.COMER_PAGOREF CP, sera.COMER_LC CL, sera.COMER_EVENTOS CE, sera.COMER_LOTES CLOT
                                                WHERE CP.ID_LOTE = CL.ID_LOTE
                                                AND CLOT.ID_LOTE = CL.ID_LOTE
                                                AND CL.ID_EVENTO = CE.ID_EVENTO
                                                AND CP.REFERENCIA LIKE('2%')
                                                AND CE.ID_EVENTO = ${params.event}
                                                AND CL.ID_LOTE = ${params.lot}
                                                AND CLOT.ID_ESTATUSVTA NOT IN ('PAG')
                                                AND CP.VALIDO_SISTEMA = 'S'  )  as query
                                                GROUP BY ID_ESTATUSVTA, PRECIO_FINAL`);
          for (var element of C_GARC) {
            V_ID_ESTATUSVTA = element.id_estatusvta;
            V_PRECIO_FINAL = element.precio_final;
            V_MONTO = element.monto;
            if (V_MONTO >= V_PRECIO_FINAL / 2) {
              await this.entity.query(`UPDATE    sera.COMER_LOTES LOT
                                                        SET    VALIDO_SISTEMA = 'S',
                                                                ID_ESTATUSVTA = 'GARA'
                                                        WHERE    ID_EVENTO = ${params.event}
                                                        AND    ID_LOTE = coalesce(${params.lot}, ID_LOTE)
                                                        AND    EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                AND CXE.PROCESAR = 'S'
                                                                                AND CXE.ENVIADO_SIRSAE = 'N'
                                                                        )
                                                        AND     VALIDO_SISTEMA IS NULL
                                                        AND     LOTE_PUBLICO != 0
                                                        AND     EXISTS (SELECT 1
                                                                                FROM sera.COMER_PAGOSREFGENS GEN
                                                                                WHERE GEN.ID_EVENTO = ${params.event}
                                                                                AND GEN.TIPO = 'N'
                                                                                AND GEN.ID_LOTE = LOT.ID_LOTE
                                                                        )`);
              await this.entity.query(` UPDATE    sera.bien BIE
                                                        SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                                                        FROM sera.ESTATUS_X_PANTALLA ESP
                                                                                WHERE CVE_PANTALLA = 'VTAMUEPAR'
                                                                                        AND ESP.ESTATUS = BIE.ESTATUS
                                                                                        AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                                                )
                                                        WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                                FROM sera.COMER_BIENESXLOTE BXL
                                                                        WHERE EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                                                                AND LOT.ID_LOTE = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                                AND LOT.ID_ESTATUSVTA = 'GARA'
                                                                                                AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                                                AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                                AND BXL.NO_BIEN = BIE.NO_BIEN
                                                                        )
                                                        `);
              await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL
                                                        SET    ID_EVENTO_COMER   = ${params.event},
                                                                ID_LOTE_COMER     = ${params.publicLot},
                                                                VENDIDO           = 'S',
                                                                SELECCIONADO      = 'S',
                                                                ESTATUS_ANT       = 'VEN',
                                                                ESTATUS_COMER     = 'VPP'
                                                        WHERE    EXISTS (SELECT 1
                                                                                FROM sera.COMER_BIENESXLOTE BXL2
                                                                        WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                                AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                                AND LOT.ID_LOTE         = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                                AND LOT.ID_ESTATUSVTA   = 'GARA'
                                                                                                AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                                AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                        )`);
            }
          }
        } else if (params.phase == 7) {
          const C_GARCE: any[] = await this.entity
            .query(` SELECT ID_ESTATUSVTA, PRECIO_FINAL, SUM(MONTO) MONTO FROM (
                                                SELECT CLOT.ID_ESTATUSVTA,
                                                       CLOT.PRECIO_FINAL,
                                                       CP.MONTO MONTO
                                                  FROM sera.COMER_PAGOREF CP,  sera.COMER_REF_GARANTIAS CRG, sera.COMER_EVENTOS CE, sera.COMER_LOTES CLOT
                                                 WHERE CLOT.ID_EVENTO = CE.ID_EVENTO
                                                   AND CLOT.ID_LOTE = CP.ID_LOTE
                                                   AND CLOT.ID_LOTE = CRG.ID_LOTE
                                                   AND CLOT.ID_EVENTO = CRG.ID_EVENTO
                                                   AND CLOT.ID_CLIENTE = CRG.ID_CLIENTE
                                                   AND CP.REFERENCIA = CRG.REF_GSAE||CRG.REF_GBANCO
                                                   AND CP.REFERENCIA LIKE('1%')
                                                   AND CE.ID_EVENTO = ${params.event}
                                                   AND CLOT.ID_LOTE = ${params.lot}
                                                   AND CLOT.ID_ESTATUSVTA NOT IN ('PAG')
                                                   AND CP.VALIDO_SISTEMA = 'S'
                                                 UNION
                                                SELECT CLOT.ID_ESTATUSVTA,
                                                       CLOT.PRECIO_FINAL,
                                                       CP.MONTO MONTO
                                                  FROM sera.COMER_PAGOREF CP, sera.COMER_LC CL, sera.COMER_EVENTOS CE, sera.COMER_LOTES CLOT
                                                 WHERE CP.ID_LOTE = CL.ID_LOTE
                                                   AND CLOT.ID_LOTE = CL.ID_LOTE
                                                   AND CL.ID_EVENTO = CE.ID_EVENTO
                                                   AND CP.REFERENCIA LIKE('7%')
                                                   AND CE.ID_EVENTO = ${params.event}
                                                   AND CL.ID_LOTE = ${params.lot}
                                                   AND CLOT.ID_ESTATUSVTA NOT IN ('PAG')
                                                   AND CP.VALIDO_SISTEMA = 'S'  )
                                                 GROUP BY ID_ESTATUSVTA, PRECIO_FINAL`);
          for (var element of C_GARCE) {
            V_ID_ESTATUSVTA = element.id_estatusvta;
            V_PRECIO_FINAL = element.precio_final;
            V_MONTO = element.monto;
            if (V_MONTO >= V_PRECIO_FINAL / 2) {
              await this.entity.query(`UPDATE    sera.COMER_LOTES LOT
                                                        SET    
                                                                ID_ESTATUSVTA = 'GARA'
                                                        WHERE    ID_EVENTO = ${params.event}
                                                        AND    ID_LOTE = coalesce(${params.lot}, ID_LOTE)
                                                        AND    EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                AND CXE.PROCESAR = 'S'
                                                                                AND CXE.ENVIADO_SIRSAE = 'N'
                                                                        )
                                                        AND     VALIDO_SISTEMA IS NULL
                                                        AND     LOTE_PUBLICO != 0
                                                        AND     EXISTS (SELECT 1
                                                                                FROM sera.COMER_PAGOSREFGENS GEN
                                                                                WHERE GEN.ID_EVENTO = ${params.event}
                                                                                AND GEN.TIPO = 'N'
                                                                                AND GEN.ID_LOTE = LOT.ID_LOTE
                                                                        )`);
              await this.entity.query(` UPDATE    sera.bien BIE
                                                        SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                                                        FROM sera.ESTATUS_X_PANTALLA ESP
                                                                                WHERE CVE_PANTALLA = 'VTAMUEPAR'
                                                                                        AND ESP.ESTATUS = BIE.ESTATUS
                                                                                        AND ESP.PROCESO_EXT_DOM =BIE.PROCESO_EXT_DOM
                                                                                )
                                                        WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                                FROM sera.COMER_BIENESXLOTE BXL
                                                                        WHERE EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                                                                AND LOT.ID_LOTE = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                                AND LOT.ID_ESTATUSVTA = 'GARA'
                                                                                                AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                                                AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                                AND BXL.NO_BIEN = BIE.NO_BIEN
                                                                        )
                                                        `);
              await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL
                                                        SET    ID_EVENTO_COMER   = ${params.event},
                                                                ID_LOTE_COMER     = ${params.publicLot},
                                                                VENDIDO           = 'S',
                                                                SELECCIONADO      = 'S',
                                                                ESTATUS_ANT       = 'VEN',
                                                                ESTATUS_COMER     = 'VPP'
                                                        WHERE    EXISTS (SELECT 1
                                                                                FROM sera.COMER_BIENESXLOTE BXL2
                                                                        WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                                AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                                AND LOT.ID_LOTE         = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                                AND LOT.ID_ESTATUSVTA   = 'GARA'
                                                                                                AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                                AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                        )`);
            }
          }
        } else if (params.phase == 3) {
          const C_LIQN: any[] = await this.entity
            .query(` SELECT ID_ESTATUSVTA, PRECIO_FINAL, SUM(MONTO) MONTO FROM (
                                                SELECT CLOT.ID_ESTATUSVTA,
                                                       CLOT.PRECIO_FINAL,
                                                       CP.MONTO MONTO
                                                  FROM sera.COMER_PAGOREF CP,  sera.COMER_REF_GARANTIAS CRG, sera.COMER_EVENTOS CE, sera.COMER_LOTES CLOT
                                                 WHERE CLOT.ID_EVENTO = CE.ID_EVENTO
                                                   AND CLOT.ID_LOTE = CP.ID_LOTE
                                                   AND CLOT.ID_LOTE = CRG.ID_LOTE
                                                   AND CLOT.ID_EVENTO = CRG.ID_EVENTO
                                                   AND CLOT.ID_CLIENTE = CRG.ID_CLIENTE
                                                   AND CP.REFERENCIA = CRG.REF_GSAE||CRG.REF_GBANCO
                                                   AND CP.REFERENCIA LIKE('1%')
                                                   AND CE.ID_EVENTO = ${params.event}
                                                   AND CLOT.ID_LOTE = ${params.lot}
                                                   AND CLOT.ID_ESTATUSVTA NOT IN ('PAG')
                                                   AND CP.VALIDO_SISTEMA = 'S'
                                                 UNION
                                                SELECT CLOT.ID_ESTATUSVTA,
                                                       CLOT.PRECIO_FINAL,
                                                       CP.MONTO MONTO
                                                  FROM sera.COMER_PAGOREF CP, sera.COMER_LC CL, sera.COMER_EVENTOS CE, sera.COMER_LOTES CLOT
                                                 WHERE CP.ID_LOTE = CL.ID_LOTE
                                                   AND CLOT.ID_LOTE = CL.ID_LOTE
                                                   AND CL.ID_EVENTO = CE.ID_EVENTO
                                                   AND (CP.REFERENCIA LIKE('2%') OR CP.REFERENCIA LIKE('7%') OR CP.REFERENCIA LIKE('3%'))
                                                   AND CE.ID_EVENTO = ${params.event}
                                                   AND CL.ID_LOTE = ${params.lot}
                                                   AND CLOT.ID_ESTATUSVTA NOT IN ('PAG')
                                                   AND CP.VALIDO_SISTEMA = 'S')
                                                 GROUP BY ID_ESTATUSVTA, PRECIO_FINAL`);
          for (var element of C_LIQN) {
            V_ID_ESTATUSVTA = element.id_estatusvta;
            V_PRECIO_FINAL = element.precio_final;
            V_MONTO = element.monto;
            if (V_MONTO >= V_PRECIO_FINAL && V_ID_ESTATUSVTA == 'GARA') {
              await this.entity.query(`UPDATE    sera.COMER_LOTES LOT
                                                        SET    VALIDO_SISTEMA = 'S',
                                                                ID_ESTATUSVTA = 'PAG'
                                                        WHERE    ID_EVENTO = ${params.event}
                                                        AND    ID_LOTE = coalesce(${params.lot}, ID_LOTE)
                                                        AND    EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                        WHERE CXE.ID_EVENTO = ${event}
                                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                AND CXE.PROCESAR = 'S'
                                                                                AND CXE.ENVIADO_SIRSAE = 'N'
                                                                        )
                                                        AND     VALIDO_SISTEMA IS NULL
                                                        AND     LOTE_PUBLICO != 0
                                                        AND     EXISTS (SELECT 1
                                                                                FROM sera.COMER_PAGOSREFGENS GEN
                                                                                WHERE GEN.ID_EVENTO = ${params.event}
                                                                                AND GEN.TIPO = 'N'
                                                                                AND GEN.ID_LOTE = LOT.ID_LOTE
                                                                        )`);
              await this.entity.query(` UPDATE    sera.bien BIE
                                                        SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                                                        FROM sera.ESTATUS_X_PANTALLA ESP
                                                                                WHERE CVE_PANTALLA = 'VTAMUEPAR'
                                                                                        AND ESP.ESTATUS = BIE.ESTATUS
                                                                                        AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                                                )
                                                        WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                                FROM sera.COMER_BIENESXLOTE BXL
                                                                        WHERE EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                                                                AND LOT.ID_LOTE = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                                AND LOT.ID_ESTATUSVTA = 'PAG'
                                                                                                AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                                                AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                                AND BXL.NO_BIEN = BIE.NO_BIEN
                                                                        )
                                                        `);
              await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL
                                                        SET    ID_EVENTO_COMER   = ${params.event},
                                                                ID_LOTE_COMER     = ${params.publicLot},
                                                                VENDIDO           = 'S',
                                                                SELECCIONADO      = 'S',
                                                                ESTATUS_ANT       = 'VPP',
                                                                ESTATUS_COMER     = 'VPT'
                                                        WHERE    EXISTS (SELECT 1
                                                                                FROM sera.COMER_BIENESXLOTE BXL2
                                                                        WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                                AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                                AND LOT.ID_LOTE         = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                                AND LOT.ID_ESTATUSVTA   = 'PAG'
                                                                                                AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                                AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                        )`);
            }
          }
        } else if (params.phase == 4) {
          const C_LIQE: any[] = await this.entity
            .query(`SELECT ID_ESTATUSVTA, PRECIO_FINAL, SUM(MONTO) MONTO FROM (
                                                SELECT CLOT.ID_ESTATUSVTA,
                                                       CLOT.PRECIO_FINAL,
                                                       CP.MONTO MONTO
                                                  FROM sera.COMER_PAGOREF CP,  sera.COMER_REF_GARANTIAS CRG, sera.COMER_EVENTOS CE, sera.COMER_LOTES CLOT
                                                 WHERE CLOT.ID_EVENTO = CE.ID_EVENTO
                                                   AND CLOT.ID_LOTE = CP.ID_LOTE
                                                   AND CLOT.ID_LOTE = CRG.ID_LOTE
                                                   AND CLOT.ID_EVENTO = CRG.ID_EVENTO
                                                   AND CLOT.ID_CLIENTE = CRG.ID_CLIENTE
                                                   AND CP.REFERENCIA = CRG.REF_GSAE||CRG.REF_GBANCO
                                                   AND CP.REFERENCIA LIKE('1%')
                                                   AND CE.ID_EVENTO = ${params.event}
                                                   AND CLOT.ID_LOTE = ${params.lot}
                                                   AND CLOT.ID_ESTATUSVTA NOT IN ('PAG')
                                                   AND CP.VALIDO_SISTEMA = 'S'
                                                 UNION
                                                SELECT CLOT.ID_ESTATUSVTA,
                                                       CLOT.PRECIO_FINAL,
                                                       CP.MONTO MONTO
                                                  FROM sera.COMER_PAGOREF CP, sera.COMER_LC CL, sera.COMER_EVENTOS CE, sera.COMER_LOTES CLOT
                                                 WHERE CP.ID_LOTE = CL.ID_LOTE
                                                   AND CLOT.ID_LOTE = CL.ID_LOTE
                                                   AND CL.ID_EVENTO = CE.ID_EVENTO
                                                   AND (CP.REFERENCIA LIKE('2%') OR CP.REFERENCIA LIKE('7%') OR CP.REFERENCIA LIKE('4%'))
                                                   AND CE.ID_EVENTO = ${params.event}
                                                   AND CL.ID_LOTE = ${params.lot}
                                                   AND CLOT.ID_ESTATUSVTA NOT IN ('PAG')
                                                   AND CP.VALIDO_SISTEMA = 'S')
                                                 GROUP BY ID_ESTATUSVTA, PRECIO_FINAL`);
          for (var element of C_LIQE) {
            V_ID_ESTATUSVTA = element.id_estatusvta;
            V_PRECIO_FINAL = element.precio_final;
            V_MONTO = element.monto;
            if (V_MONTO > V_PRECIO_FINAL && V_ID_ESTATUSVTA == 'GARA') {
              await this.entity.query(`UPDATE    sera.COMER_LOTES LOT
                                                        SET    VALIDO_SISTEMA = 'S',
                                                                ID_ESTATUSVTA = 'PAGE'
                                                        WHERE    ID_EVENTO = ${params.event}
                                                        AND    ID_LOTE = coalesce(${params.lot}, ID_LOTE)
                                                        AND    EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                AND CXE.PROCESAR = 'S'
                                                                                AND CXE.ENVIADO_SIRSAE = 'N'
                                                                        )
                                                        AND     VALIDO_SISTEMA IS NULL
                                                        AND     LOTE_PUBLICO != 0
                                                        AND     EXISTS (SELECT 1
                                                                                FROM sera.COMER_PAGOSREFGENS GEN
                                                                                WHERE GEN.ID_EVENTO = ${params.event}
                                                                                AND GEN.TIPO = 'N'
                                                                                AND GEN.ID_LOTE = LOT.ID_LOTE
                                                                        )`);
              await this.entity.query(` UPDATE    sera.bien BIE
                                                        SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                                                        FROM sera.ESTATUS_X_PANTALLA ESP
                                                                                WHERE CVE_PANTALLA = 'VTAMUEPAR'
                                                                                        AND ESP.ESTATUS = BIE.ESTATUS
                                                                                        AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                                                )
                                                        WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                                FROM sera.COMER_BIENESXLOTE BXL
                                                                        WHERE EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                                                                AND LOT.ID_LOTE = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                                AND LOT.ID_ESTATUSVTA = 'PAGE'
                                                                                                AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                                                AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                                AND BXL.NO_BIEN = BIE.NO_BIEN
                                                                        )
                                                        `);
              await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL
                                                        SET    ID_EVENTO_COMER   = ${params.event},
                                                                ID_LOTE_COMER     = ${params.publicLot},
                                                                VENDIDO           = 'S',
                                                                SELECCIONADO      = 'S',
                                                                ESTATUS_ANT       = 'VPP',
                                                                ESTATUS_COMER     = 'VPT'
                                                        WHERE    EXISTS (SELECT 1
                                                                                FROM sera.COMER_BIENESXLOTE BXL2
                                                                        WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                                AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                                AND LOT.ID_LOTE         = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                                AND LOT.ID_ESTATUSVTA   = 'PAGE'
                                                                                                AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                                AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                        )`);
            } else if (V_MONTO < V_PRECIO_FINAL && V_ID_ESTATUSVTA == 'CAN') {
              await this.entity.query(` UPDATE    sera.bien BIE
                                                        SET    ESTATUS = 'CPV'
                                                        WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                         FROM sera.COMER_BIENESXLOTE BXL
                                                                        WHERE EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                       WHERE LOT.ID_EVENTO = ${params.event}
                                                                                         AND LOT.ID_LOTE = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                         AND LOT.ID_ESTATUSVTA = 'CAN'
                                                                                         AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                                         AND EXISTS (SELECT 1
                                                                                                       FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                      WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                     )
                                                                                     )
                                                                          AND BXL.NO_BIEN = BIE.NO_BIEN
                                                                      )
                                                        `);
              await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL
                                                        SET    ID_EVENTO_COMER   = ${params.event},
                                                                ID_LOTE_COMER     = ${params.publicLot},
                                                                VENDIDO           = 'N',
                                                                SELECCIONADO      = null,
                                                                ESTATUS_ANT       = 'CPV',
                                                                ESTATUS_COMER     = 'CPV'
                                                        WHERE    EXISTS (SELECT 1
                                                                                FROM sera.COMER_BIENESXLOTE BXL2
                                                                        WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                                AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_LOTES LOT
                                                                                        WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                                AND LOT.ID_LOTE         = coalesce(${params.lot},LOT.ID_LOTE)
                                                                                                AND LOT.ID_ESTATUSVTA   = 'CAN'
                                                                                                AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                                AND EXISTS (SELECT 1
                                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                        AND CXE.PROCESAR = 'S'
                                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                                        )
                                                                                        )
                                                                        )`);
            }
          }
        }
      }
      return { statusCode: 200, message: ['OK'], data: [] };
    } else {
      return { statusCode: 400, message: ['No se encontro el evento.'] };
    }
  }

  async actLotesInmuAct(params: {
    event: number;
    phase: number;
    publicLot: number;
    lot: number;
  }) {
    var A_LOTE = 0;
    var A_FINAL = 0;
    var A_ACUMULADO = 0;
    var ACUMULADO_ANT = 0;

    if (params.phase == 1) {
      const HL_F1: any[] = await this.entity.query(` SELECT RGE.ID_LOTE,
                                LOT.PRECIO_FINAL,
                                SUM(coalesce(RGE.MONTO_NOAPP_IVA,0) + coalesce(RGE.IVA,0) + coalesce(RGE.MONTO_APP_IVA,0) ) as monto,
                                coalesce(LOT.ACUMULADO,0) as acum
                                FROM sera.COMER_PAGOSREFGENS RGE, sera.COMER_LOTES LOT
                                WHERE LOT.ID_EVENTO        = ${params.event}
                                AND RGE.ID_EVENTO        = ${params.event}
                                AND LOT.ID_LOTE          = ${params.lot}
                                AND LOT.ID_LOTE          = RGE.ID_LOTE
                                AND RGE.REFERENCIA       LIKE '1%'
                                AND RGE.TIPO             = 'N'
                                AND EXISTS (SELECT 1
                                                FROM sera.COMER_PAGOREF REF
                                                WHERE REF.ID_PAGO = RGE.ID_PAGO
                                                AND REF.VALIDO_SISTEMA IN ('A','S')
                                                AND LOT.ID_LOTE = REF.ID_LOTE )
                                GROUP BY RGE.ID_LOTE, LOT.PRECIO_FINAL, LOT.ACUMULADO`);
      HL_F1.forEach(async (element) => {
        A_ACUMULADO = element.monto;
        A_FINAL = element.precio_final;
        if (A_ACUMULADO >= A_FINAL) {
          await this.entity.query(` UPDATE sera.COMER_LOTES LOT
                                                SET VALIDO_SISTEMA = 'S',
                                                IDESTATUSVTANT = ID_ESTATUSVTA,
                                                ID_ESTATUSVTA = 'PAG',
                                                ACUMULADO = ${A_ACUMULADO}
                                                WHERE ID_EVENTO = ${params.event}
                                                AND ID_LOTE = coalesce(${element.id_lote}, ID_LOTE)
                                                AND (VALIDO_SISTEMA NOT IN ('S') OR VALIDO_SISTEMA IS NULL )
                                                AND LOTE_PUBLICO != 0
                                                AND EXISTS (SELECT 1
                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                        AND CXE.PROCESAR = 'S'
                                                        AND CXE.ENVIADO_SIRSAE = 'N' )
                                                AND EXISTS (SELECT 1
                                                        FROM sera.COMER_PAGOSREFGENS GEN
                                                        WHERE GEN.ID_EVENTO = ${params.event}
                                                        AND GEN.TIPO = 'N'
                                                        AND GEN.ID_LOTE = LOT.ID_LOTE )`);
          await this.entity.query(`UPDATE    sera.bien  BIE
                                                        SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                                FROM sera.ESTATUS_X_PANTALLA ESP
                                                                WHERE CVE_PANTALLA = 'VTAINMUTOT'
                                                                AND ESP.ESTATUS = BIE.ESTATUS
                                                                AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                        )
                                                        WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                FROM  sera.COMER_BIENESXLOTE BXL
                                                                WHERE EXISTS (SELECT 1
                                                                        FROM sera.COMER_LOTES LOT
                                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                                        AND LOT.ID_LOTE = coalesce(${element.id_lote},LOT.ID_LOTE)
                                                                        AND LOT.ID_ESTATUSVTA = 'PAG'
                                                                        AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                        AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO = ${params.event}
                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                        AND CXE.PROCESAR = 'S'
                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                )
                                                                )
                                                        AND BXL.NO_BIEN = BIE.NO_BIEN
                                                )`);
          await this.entity.query(`  UPDATE     sera.COMER_BIENESXLOTE CBXL
                                                SET    ID_EVENTO_COMER   = ${params.event},
                                                ID_LOTE_COMER     = ${params.publicLot},
                                                VENDIDO           = 'S',
                                                SELECCIONADO      = 'S',
                                                ESTATUS_ANT       = 'VEN',
                                                ESTATUS_COMER     = 'VPT'
                                                WHERE    EXISTS (SELECT 1
                                                                FROM  sera.COMER_BIENESXLOTE BXL2
                                                                WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_LOTES LOT
                                                                        WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                AND LOT.ID_LOTE         = coalesce(${element.id_lote},LOT.ID_LOTE)
                                                                                AND LOT.ID_ESTATUSVTA   = 'PAG'
                                                                                AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                AND CXE.PROCESAR = 'S'
                                                                                                AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                        )
                                                                        )
                                                        );`);
        } else if (A_ACUMULADO >= A_FINAL / 4) {
          await this.entity.query(` UPDATE sera.COMER_LOTES LOT
                                        SET VALIDO_SISTEMA = 'G',
                                        IDESTATUSVTANT = ID_ESTATUSVTA,
                                        ID_ESTATUSVTA = 'GARA',
                                        ACUMULADO = ${A_ACUMULADO}
                                        WHERE LOT.ID_EVENTO = ${params.event}
                                        AND ID_LOTE = coalesce(${element.id_lote}, ID_LOTE)
                                        AND (VALIDO_SISTEMA NOT IN ('S') OR VALIDO_SISTEMA IS NULL )
                                        AND LOTE_PUBLICO != 0
                                        AND EXISTS (SELECT 1
                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE CXE.ID_EVENTO = ${params.event}
                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND CXE.PROCESAR = 'S'
                                                AND CXE.ENVIADO_SIRSAE = 'N' )
                                        AND EXISTS (SELECT 1
                                                FROM sera.COMER_PAGOSREFGENS GEN
                                                WHERE GEN.ID_EVENTO = ${params.event}
                                                AND GEN.TIPO = 'N'
                                                AND GEN.ID_LOTE = LOT.ID_LOTE )`);
          await this.entity.query(`UPDATE    sera.bien  BIE
                                                SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                        FROM sera.ESTATUS_X_PANTALLA ESP
                                                        WHERE CVE_PANTALLA = 'VTAINMUGARA'
                                                        AND ESP.ESTATUS = BIE.ESTATUS
                                                        AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                )
                                                WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                        FROM  sera.COMER_BIENESXLOTE BXL
                                                        WHERE EXISTS (SELECT 1
                                                                FROM sera.COMER_LOTES LOT
                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                                AND LOT.ID_LOTE = coalesce(${element.id_lote},LOT.ID_LOTE)
                                                                AND LOT.ID_ESTATUSVTA = 'GARA'
                                                                AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                AND EXISTS (SELECT 1
                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                AND CXE.PROCESAR = 'S'
                                                                                AND CXE.ENVIADO_SIRSAE = 'N'
                                                                        )
                                                        )
                                                AND BXL.NO_BIEN = BIE.NO_BIEN
                                        )`);
          await this.entity.query(`  UPDATE     sera.COMER_BIENESXLOTE CBXL
                                        SET    ID_EVENTO_COMER   = ${params.event},
                                        ID_LOTE_COMER     = ${params.publicLot},
                                        VENDIDO           = 'S',
                                        SELECCIONADO      = 'S',
                                        ESTATUS_ANT       = 'VEN',
                                        ESTATUS_COMER     = 'VPP'
                                        WHERE    EXISTS (SELECT 1
                                                        FROM  sera.COMER_BIENESXLOTE BXL2
                                                        WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                        AND EXISTS (SELECT 1
                                                                        FROM sera.COMER_LOTES LOT
                                                                WHERE LOT.ID_EVENTO       = ${params.event}
                                                                        AND LOT.ID_LOTE         = coalesce(${element.id_lote},LOT.ID_LOTE)
                                                                        AND LOT.ID_ESTATUSVTA   = 'GARA'
                                                                        AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                        AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO = ${params.event}
                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                        AND CXE.PROCESAR = 'S'
                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                )
                                                                )
                                                );`);
        }
      });
    } else if (params.phase == 2) {
      const HL_F2: any[] = await this.entity.query(` SELECT RGE.ID_LOTE,
                        LOT.PRECIO_FINAL,
                        SUM(coalesce(RGE.MONTO_NOAPP_IVA,0) + coalesce(RGE.IVA,0) + coalesce(RGE.MONTO_APP_IVA,0) ) as monto,
                                coalesce(LOT.ACUMULADO,0) as acum
                        FROM sera.COMER_PAGOSREFGENS RGE, sera.COMER_LOTES LOT
                        WHERE LOT.ID_EVENTO        = ${params.event}
                        AND RGE.ID_EVENTO        = ${params.event}
                        AND LOT.ID_LOTE          = ${params.lot}
                        AND LOT.ID_LOTE          = RGE.ID_LOTE
                        AND (RGE.REFERENCIA LIKE '1%' OR RGE.REFERENCIA LIKE '2%')
                        AND LOT.ID_ESTATUSVTA    NOT IN ('GARA', 'PAG')
                        AND RGE.TIPO             = 'N'
                        AND EXISTS (SELECT 1
                                        FROM sera.COMER_PAGOREF REF
                                        WHERE REF.ID_PAGO = RGE.ID_PAGO
                                        AND REF.VALIDO_SISTEMA IN ('A','S')
                                        AND LOT.ID_LOTE = REF.ID_LOTE )
                        GROUP BY RGE.ID_LOTE, LOT.PRECIO_FINAL, LOT.ACUMULADO`);
      HL_F2.forEach(async (element) => {
        A_ACUMULADO = element.monto;
        A_FINAL = element.precio_final;
        if (A_ACUMULADO >= A_FINAL / 4) {
          await this.entity.query(` UPDATE sera.COMER_LOTES
                                                SET VALIDO_SISTEMA = 'G',
                                                IDESTATUSVTANT = ID_ESTATUSVTA,
                                                ID_ESTATUSVTA = 'GARA',
                                                ACUMULADO = ${A_ACUMULADO}
                                                WHERE ID_EVENTO = ${params.event}
                                                AND ID_LOTE = coalesce(${element.id_lote}, ID_LOTE)
                                                AND (VALIDO_SISTEMA NOT IN ('S') OR VALIDO_SISTEMA IS NULL )
                                                AND LOTE_PUBLICO != 0
                                                AND EXISTS (SELECT 1
                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                        AND CXE.PROCESAR = 'S'
                                                        AND CXE.ENVIADO_SIRSAE = 'N' )
                                                AND EXISTS (SELECT 1
                                                        FROM sera.COMER_PAGOSREFGENS GEN
                                                        WHERE GEN.ID_EVENTO = ${params.event}
                                                        AND GEN.TIPO = 'N'
                                                        AND GEN.ID_LOTE = LOT.ID_LOTE )`);
          await this.entity.query(`UPDATE    sera.bien  BIE
                                                        SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                                FROM sera.ESTATUS_X_PANTALLA ESP
                                                                WHERE CVE_PANTALLA = 'VTAINMUGARA'
                                                                AND ESP.ESTATUS = BIE.ESTATUS
                                                                AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                        )
                                                        WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                FROM  sera.COMER_BIENESXLOTE BXL
                                                                WHERE EXISTS (SELECT 1
                                                                        FROM sera.COMER_LOTES LOT
                                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                                        AND LOT.ID_LOTE = coalesce(${element.id_lote},LOT.ID_LOTE)
                                                                        AND LOT.ID_ESTATUSVTA = 'GARA'
                                                                        AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                        AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO = ${params.event}
                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                        AND CXE.PROCESAR = 'S'
                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                )
                                                                )
                                                        AND BXL.NO_BIEN = BIE.NO_BIEN
                                                        
                                                )AND    ESTATUS NOT IN ('VPP')`);
          await this.entity.query(`  UPDATE     sera.COMER_BIENESXLOTE 
                                                SET    ID_EVENTO_COMER   = ${params.event},
                                                ID_LOTE_COMER     = ${params.publicLot},
                                                VENDIDO           = 'S',
                                                SELECCIONADO      = 'S',
                                                ESTATUS_ANT       = 'VEN',
                                                ESTATUS_COMER     = 'VPP'
                                                WHERE    EXISTS (SELECT 1
                                                                FROM  sera.COMER_BIENESXLOTE BXL2
                                                                WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_LOTES LOT
                                                                        WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                AND LOT.ID_LOTE         = coalesce(${element.id_lote},LOT.ID_LOTE)
                                                                                AND LOT.ID_ESTATUSVTA   = 'GARA'
                                                                                AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                AND CXE.PROCESAR = 'S'
                                                                                                AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                        )
                                                                        )
                                                        );`);
        }
      });
    } else if (params.phase == 7) {
      const HL_F7: any[] = await this.entity.query(` SELECT RGE.ID_LOTE,
                        LOT.PRECIO_FINAL,
                        SUM(coalesce(RGE.MONTO_NOAPP_IVA,0) + coalesce(RGE.IVA,0) + coalesce(RGE.MONTO_APP_IVA,0) ) as monto,
                        coalesce(LOT.ACUMULADO,0) as acum 
                                FROM sera.COMER_PAGOSREFGENS RGE, sera.COMER_LOTES LOT
                                WHERE LOT.ID_EVENTO        = ${params.event}
                                AND RGE.ID_EVENTO        = ${params.event}
                                AND LOT.ID_LOTE          = ${params.lot}
                                AND LOT.ID_LOTE          = RGE.ID_LOTE
                                AND (RGE.REFERENCIA LIKE '1%' OR RGE.REFERENCIA LIKE '2%' OR RGE.REFERENCIA LIKE '7%')
                                AND LOT.ID_ESTATUSVTA    NOT IN ('GARA', 'PAG')
                                AND RGE.TIPO             = 'N'
                        AND EXISTS (SELECT 1
                                   FROM sera.COMER_PAGOREF REF
                                 WHERE REF.ID_PAGO = RGE.ID_PAGO
                                   AND REF.VALIDO_SISTEMA IN ('A','S')
                                   AND LOT.ID_LOTE = REF.ID_LOTE )
                  GROUP BY RGE.ID_LOTE, LOT.PRECIO_FINAL, LOT.ACUMULADO`);
      HL_F7.forEach(async (element) => {
        A_ACUMULADO = element.monto;
        A_FINAL = element.precio_final;
        if (A_ACUMULADO >= A_FINAL / 4) {
          await this.entity.query(` UPDATE sera.COMER_LOTES
                                                SET VALIDO_SISTEMA = 'G',
                                                IDESTATUSVTANT = ID_ESTATUSVTA,
                                                ID_ESTATUSVTA = 'GARA',
                                                ACUMULADO = ${A_ACUMULADO}
                                                WHERE ID_EVENTO = ${params.event}
                                                AND ID_LOTE = coalesce(${element.id_lote}, ID_LOTE)
                                                AND (VALIDO_SISTEMA NOT IN ('S') OR VALIDO_SISTEMA IS NULL )
                                                AND LOTE_PUBLICO != 0
                                                AND EXISTS (SELECT 1
                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                        AND CXE.PROCESAR = 'S'
                                                        AND CXE.ENVIADO_SIRSAE = 'N' )
                                                AND EXISTS (SELECT 1
                                                        FROM sera.COMER_PAGOSREFGENS GEN
                                                        WHERE GEN.ID_EVENTO = ${params.event}
                                                        AND GEN.TIPO = 'N'
                                                        AND GEN.ID_LOTE = LOT.ID_LOTE )`);
          await this.entity.query(`UPDATE    sera.bien  BIE
                                                        SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                                FROM sera.ESTATUS_X_PANTALLA ESP
                                                                WHERE CVE_PANTALLA = 'VTAINMUGARA'
                                                                AND ESP.ESTATUS = BIE.ESTATUS
                                                                AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                        )
                                                        WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                FROM  sera.COMER_BIENESXLOTE BXL
                                                                WHERE EXISTS (SELECT 1
                                                                        FROM sera.COMER_LOTES LOT
                                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                                        AND LOT.ID_LOTE = coalesce(${element.id_lote},LOT.ID_LOTE)
                                                                        AND LOT.ID_ESTATUSVTA = 'GARA'
                                                                        AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                        AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO = ${params.event}
                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                        AND CXE.PROCESAR = 'S'
                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                )
                                                                )
                                                        AND BXL.NO_BIEN = BIE.NO_BIEN
                                                        
                                                )AND   ESTATUS NOT IN ('VPP')`);
          await this.entity.query(`  UPDATE     sera.COMER_BIENESXLOTE 
                                                SET    ID_EVENTO_COMER   = ${params.event},
                                                ID_LOTE_COMER     = ${params.publicLot},
                                                VENDIDO           = 'S',
                                                SELECCIONADO      = 'S',
                                                ESTATUS_ANT       = 'VEN',
                                                ESTATUS_COMER     = 'VPP'
                                                WHERE    EXISTS (SELECT 1
                                                                FROM  sera.COMER_BIENESXLOTE BXL2
                                                                WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_LOTES LOT
                                                                        WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                AND LOT.ID_LOTE         = coalesce(${element.id_lote},LOT.ID_LOTE)
                                                                                AND LOT.ID_ESTATUSVTA   = 'GARA'
                                                                                AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                AND CXE.PROCESAR = 'S'
                                                                                                AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                        )
                                                                        )
                                                        );`);
        }
      });
    } else if (params.phase == 3) {
      const HL_F3: any[] = await this.entity.query(`  SELECT RGE.ID_LOTE,
                                        LOT.PRECIO_FINAL,
                                        SUM(coalesce(RGE.MONTO_NOAPP_IVA,0) + coalesce(RGE.IVA,0) + coalesce(RGE.MONTO_APP_IVA,0) ) as monto,
                                        coalesce(LOT.ACUMULADO,0) as acum
                                FROM sera.COMER_PAGOSREFGENS RGE, sera.COMER_LOTES LOT
                                WHERE LOT.ID_EVENTO        = ${params.event}
                                AND RGE.ID_EVENTO        = ${params.event}
                                AND LOT.ID_LOTE          = ${params.lot}
                                AND LOT.ID_LOTE          = RGE.ID_LOTE
                                AND (RGE.REFERENCIA LIKE '1%' OR RGE.REFERENCIA LIKE '2%' OR RGE.REFERENCIA LIKE '7%' OR RGE.REFERENCIA LIKE '3%')
                                AND LOT.ID_ESTATUSVTA    IN ('GARA')
                                AND RGE.TIPO             = 'N'
                                AND EXISTS (SELECT 1
                                                FROM sera.COMER_PAGOREF REF
                                                WHERE REF.ID_PAGO = RGE.ID_PAGO
                                                AND REF.VALIDO_SISTEMA IN ('A','S')
                                                AND LOT.ID_LOTE = REF.ID_LOTE )
                                GROUP BY RGE.ID_LOTE, LOT.PRECIO_FINAL, LOT.ACUMULADO`);
      HL_F3.forEach(async (element) => {
        A_ACUMULADO = element.monto;
        A_FINAL = element.precio_final;
        if (A_ACUMULADO >= A_FINAL) {
          await this.entity.query(` UPDATE sera.COMER_LOTES
                                                SET VALIDO_SISTEMA = 'S',
                                                IDESTATUSVTANT = ID_ESTATUSVTA,
                                                ID_ESTATUSVTA = 'PAG',
                                                ACUMULADO = ${A_ACUMULADO}
                                                WHERE ID_EVENTO = ${params.event}
                                                AND ID_LOTE = coalesce(${element.id_lote}, ID_LOTE)
                                                AND (VALIDO_SISTEMA  IN ('S','G') OR VALIDO_SISTEMA IS NULL )
                                                AND LOTE_PUBLICO != 0
                                                AND ID_ESTATUSVTA = 'GARA'
                                                AND EXISTS (SELECT 1
                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                        AND CXE.PROCESAR = 'S'
                                                        AND CXE.ENVIADO_SIRSAE = 'N' )
                                                AND EXISTS (SELECT 1
                                                        FROM sera.COMER_PAGOSREFGENS GEN
                                                        WHERE GEN.ID_EVENTO = ${params.event}
                                                        AND GEN.TIPO = 'N'
                                                        AND GEN.ID_LOTE = LOT.ID_LOTE )`);
          await this.entity.query(`UPDATE    sera.bien  BIE
                                                        SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                                FROM sera.ESTATUS_X_PANTALLA ESP
                                                                WHERE CVE_PANTALLA = 'VTAINMUTOT'
                                                                AND ESP.ESTATUS = BIE.ESTATUS
                                                                AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                        )
                                                        WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                FROM  sera.COMER_BIENESXLOTE BXL
                                                                WHERE EXISTS (SELECT 1
                                                                        FROM sera.COMER_LOTES LOT
                                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                                        AND LOT.ID_LOTE = coalesce(${element.id_lote},LOT.ID_LOTE)
                                                                        AND LOT.ID_ESTATUSVTA = 'PAG'
                                                                        AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                        AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO = ${params.event}
                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                        AND CXE.PROCESAR = 'S'
                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                )
                                                                )
                                                        AND BXL.NO_BIEN = BIE.NO_BIEN
                                                )`);
          await this.entity.query(`  UPDATE     sera.COMER_BIENESXLOTE 
                                                SET    ID_EVENTO_COMER   = ${params.event},
                                                ID_LOTE_COMER     = ${params.publicLot},
                                                VENDIDO           = 'S',
                                                SELECCIONADO      = 'S',
                                                ESTATUS_ANT       = 'VPP',
                                                ESTATUS_COMER     = 'VPT'
                                                WHERE    EXISTS (SELECT 1
                                                                FROM  sera.COMER_BIENESXLOTE BXL2
                                                                WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_LOTES LOT
                                                                        WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                AND LOT.ID_LOTE         = coalesce(${element.id_lote},LOT.ID_LOTE)
                                                                                AND LOT.ID_ESTATUSVTA   = 'PAG'
                                                                                AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                AND CXE.PROCESAR = 'S'
                                                                                                AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                        )
                                                                        )
                                                        );`);
        }
      });
    } else if (params.phase == 4) {
      const HL_F4: any[] = await this.entity.query(`  SELECT RGE.ID_LOTE,
                        LOT.PRECIO_FINAL,
                        SUM(coalesce(RGE.MONTO_NOAPP_IVA,0) + coalesce(RGE.IVA,0) + coalesce(RGE.MONTO_APP_IVA,0) ) as monto,
                                coalesce(LOT.ACUMULADO,0) as acum
                        FROM sera.COMER_PAGOSREFGENS RGE, sera.COMER_LOTES LOT
                        WHERE LOT.ID_EVENTO        = ${params.event}
                        AND RGE.ID_EVENTO        = ${params.event}
                        AND LOT.ID_LOTE          = ${params.lot}
                        AND LOT.ID_LOTE          = RGE.ID_LOTE
                        AND (RGE.REFERENCIA LIKE '1%' OR RGE.REFERENCIA LIKE '2%' OR RGE.REFERENCIA LIKE '7%' OR RGE.REFERENCIA LIKE '4%')
                        AND RGE.TIPO             = 'N'
                        AND EXISTS (SELECT 1
                                        FROM sera.COMER_PAGOREF REF
                                        WHERE REF.ID_PAGO = RGE.ID_PAGO
                                        AND REF.VALIDO_SISTEMA IN ('A','S')
                                        AND LOT.ID_LOTE = REF.ID_LOTE )
                        GROUP BY RGE.ID_LOTE, LOT.PRECIO_FINAL, LOT.ACUMULADO`);
      HL_F4.forEach(async (element) => {
        A_ACUMULADO = element.monto;
        A_FINAL = element.precio_final;
        if (A_ACUMULADO > A_FINAL) {
          await this.entity.query(` UPDATE sera.COMER_LOTES
                                                SET VALIDO_SISTEMA = 'S',
                                                IDESTATUSVTANT = ID_ESTATUSVTA,
                                                ID_ESTATUSVTA = 'PAGE',
                                                ACUMULADO = ${A_ACUMULADO}
                                                WHERE ID_EVENTO = ${params.event}
                                                AND ID_LOTE = coalesce(${element.id_lote}, ID_LOTE)
                                                AND (VALIDO_SISTEMA NOT IN ('S') OR VALIDO_SISTEMA IS NULL )
                                                AND LOTE_PUBLICO != 0
                                                AND ID_ESTATUSVTA = 'GARA'
                                                AND EXISTS (SELECT 1
                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                        AND CXE.PROCESAR = 'S'
                                                        AND CXE.ENVIADO_SIRSAE = 'N' )
                                                AND EXISTS (SELECT 1
                                                        FROM sera.COMER_PAGOSREFGENS GEN
                                                        WHERE GEN.ID_EVENTO = ${params.event}
                                                        AND GEN.TIPO = 'N'
                                                        AND GEN.ID_LOTE = LOT.ID_LOTE )`);
          await this.entity.query(`UPDATE    sera.bien  BIE
                                                        SET    ESTATUS = ( SELECT ESP.ESTATUS_FINAL
                                                                FROM sera.ESTATUS_X_PANTALLA ESP
                                                                WHERE CVE_PANTALLA = 'VTAINMUGARA'
                                                                AND ESP.ESTATUS = BIE.ESTATUS
                                                                AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                        )
                                                        WHERE    EXISTS (SELECT BXL.NO_BIEN
                                                                FROM  sera.COMER_BIENESXLOTE BXL
                                                                WHERE EXISTS (SELECT 1
                                                                        FROM sera.COMER_LOTES LOT
                                                                WHERE LOT.ID_EVENTO = ${params.event}
                                                                        AND LOT.ID_LOTE = coalesce(${element.id_lote},LOT.ID_LOTE)
                                                                        AND LOT.ID_ESTATUSVTA = 'PAGE'
                                                                        AND BXL.ID_LOTE = LOT.ID_LOTE
                                                                        AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE CXE.ID_EVENTO = ${params.event}
                                                                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                        AND CXE.PROCESAR = 'S'
                                                                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                )
                                                                )
                                                        AND BXL.NO_BIEN = BIE.NO_BIEN
                                                )`);
          await this.entity.query(`  UPDATE     sera.COMER_BIENESXLOTE 
                                                SET    ID_EVENTO_COMER   = ${params.event},
                                                ID_LOTE_COMER     = ${params.publicLot},
                                                VENDIDO           = 'S',
                                                SELECCIONADO      = 'S',
                                                ESTATUS_ANT       = 'VPP',
                                                ESTATUS_COMER     = 'VPT'
                                                WHERE    EXISTS (SELECT 1
                                                                FROM  sera.COMER_BIENESXLOTE BXL2
                                                                WHERE BXL2.NO_BIEN = CBXL.NO_BIEN
                                                                AND EXISTS (SELECT 1
                                                                                FROM sera.COMER_LOTES LOT
                                                                        WHERE LOT.ID_EVENTO       = ${params.event}
                                                                                AND LOT.ID_LOTE         = coalesce(${element.id_lote},LOT.ID_LOTE)
                                                                                AND LOT.ID_ESTATUSVTA   = 'PAGE'
                                                                                AND BXL2.ID_LOTE        = LOT.ID_LOTE
                                                                                AND EXISTS (SELECT 1
                                                                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                                                                        WHERE CXE.ID_EVENTO = ${params.event}
                                                                                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                                AND CXE.PROCESAR = 'S'
                                                                                                AND CXE.ENVIADO_SIRSAE = 'N'
                                                                                        )
                                                                        )
                                                        );`);
        }
      });
    }
  }
  async actLotesInmu(params: { event: number; phase: number; lot: number }) {
    var A_LOTE = 0;
    var A_FINAL = 0;
    var A_ACUMULADO = 0;
    var ACUMULADO_ANT = 0;

    if (params.phase == 1 || params.phase == 3) {
      const HL: any[] = await this.entity
        .query(`SELECT  RGE.ID_LOTE, LOT.PRECIO_FINAL, SUM(coalesce(RGE.MONTO_NOAPP_IVA,0) + coalesce(RGE.IVA,0) + coalesce(RGE.MONTO_APP_IVA,0) ) as monto
                                FROM    sera.COMER_PAGOSREFGENS RGE, sera.COMER_LOTES LOT
                                WHERE    LOT.ID_EVENTO = ${params.event}
                                AND        RGE.ID_EVENTO = ${params.event}
                                AND        LOT.ID_LOTE = coalesce(${params.lot},LOT.ID_LOTE)
                                AND        LOT.ID_LOTE = RGE.ID_LOTE
                                AND        (LOT.VALIDO_SISTEMA = 'G' OR LOT.VALIDO_SISTEMA = 'S' OR LOT.VALIDO_SISTEMA IS NULL)
                                AND        RGE.TIPO = 'N'
                                AND    EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${params.event}
                                        AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND        CXE.PROCESAR = 'S'
                                        )
                                GROUP BY RGE.ID_LOTE, LOT.PRECIO_FINAL`);
      HL.forEach(async (element) => {
        A_ACUMULADO = element.monto;
        A_LOTE = element.id_lote;
        A_FINAL = element.precio_final;
        if (A_ACUMULADO >= A_FINAL && params.phase != 3) {
          await this.entity.query(` UPDATE sera.COMER_LOTES
                                                SET VALIDO_SISTEMA = 'S',
                                                IDESTATUSVTANT = ID_ESTATUSVTA,
                                                ID_ESTATUSVTA = 'PAG',
                                                ACUMULADO = ${A_ACUMULADO}
                                                WHERE ID_LOTE = ${A_LOTE}
                                               `);
          await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL 
                                                SET    ESTATUS_COMER = (    SELECT    BIE.ESTATUS
                                                                        FROM    sera.bien BIE
                                                                        WHERE    BIE.NO_BIEN = CBXL.NO_BIEN
                                                                        )
                                                WHERE    EXISTS (SELECT    1
                                                    FROM    sera.COMER_LOTES LOT
                                                    WHERE    LOT.ID_LOTE = ${A_LOTE}
                                                    AND        LOT.ID_LOTE = CBXL.ID_LOTE
                                                    )`);
          await this.entity.query(`UPDATE    sera.bien 
                                                SET    ESTATUS =     (SELECT    ESP.ESTATUS_FINAL
                                                                        FROM    sera.ESTATUS_X_PANTALLA ESP
                                                                        WHERE    CVE_PANTALLA = 'VTAINMUTOT'
                                                                        AND    ESP.ESTATUS = BIE.ESTATUS
                                                                        AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                                        )
                                                WHERE    EXISTS (SELECT    1
                                                                FROM    sera.COMER_BIENESXLOTE BXL
                                                                WHERE    BXL.ID_LOTE = ${A_LOTE}
                                                                AND        BXL.NO_BIEN = BIE.NO_BIEN
                                                                )
                                                AND        ESTATUS != (SELECT    ESP.ESTATUS_FINAL
                                                                        FROM    sera.ESTATUS_X_PANTALLA ESP
                                                                        WHERE    CVE_PANTALLA = 'VTAINMUTOT'
                                                                        AND        ESP.ESTATUS = BIE.ESTATUS
                                                                        AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                            )`);
        } else if (A_ACUMULADO < A_FINAL && params.phase != 2) {
          await this.entity.query(` UPDATE sera.COMER_LOTES
                                                SET VALIDO_SISTEMA = 'G',
                                                ID_ESTATUSVTA = 'GARA',
                                                ACUMULADO = ${A_ACUMULADO}
                                                WHERE ID_LOTE = ${A_LOTE}
                                       `);
          if (params.phase != 3) {
            await this.entity.query(`UPDATE    sera.bien 
                                                        SET    BIE.ESTATUS =(    SELECT    ESP.ESTATUS_FINAL
                                                                    FROM    sera.ESTATUS_X_PANTALLA ESP
                                                                    WHERE    CVE_PANTALLA = 'VTAINMUGARA'
                                                                    AND        ESP.ESTATUS = BIE.ESTATUS
                                                                    AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                                 )
                                                         WHERE   NO_BIEN IN (SELECT    BXL.NO_BIEN
                                                                    FROM    sera.COMER_BIENESXLOTE BXL
                                                                    WHERE    BXL.ID_LOTE = ${A_LOTE}
                                                                    )
                                                )`);
          }
        }
      });
    } else {
      const HL: any[] = await this.entity
        .query(` SELECT    RGE.ID_LOTE, LOT.PRECIO_FINAL, SUM(coalesce(RGE.MONTO_NOAPP_IVA,0) + coalesce(RGE.IVA,0) + coalesce(RGE.MONTO_APP_IVA,0) ) as monto,
                                        coalesce(LOT.ACUMULADO,0) as acum
                                FROM    sera.COMER_PAGOSREFGENS RGE, sera.COMER_LOTES LOT
                                WHERE    LOT.ID_EVENTO      = ${params.event}
                                AND        RGE.ID_EVENTO      = ${params.event}
                                AND        LOT.ID_LOTE      = ${params.lot}
                                AND        LOT.ID_LOTE      = RGE.ID_LOTE
                                AND        LOT.ID_ESTATUSVTA IN ('GARA', 'PAG')
                                AND        RGE.TIPO           = 'N'
                                AND    EXISTS (SELECT    1
                                                FROM    COMER_PAGOREF REF
                                                WHERE    REF.ID_PAGO = RGE.ID_PAGO
                                                AND        REF.VALIDO_SISTEMA IN ('A','S')
                                                AND        LOT.ID_LOTE = REF.ID_LOTE
                                                )
                                GROUP BY RGE.ID_LOTE, LOT.PRECIO_FINAL, LOT.ACUMULADO`);
      HL.forEach(async (element) => {
        A_ACUMULADO = element.monto;
        A_FINAL = element.precio_final;
        A_ACUMULADO = element.monto;
        A_LOTE = element.id_lote;
        A_FINAL = element.precio_final;
        if (A_ACUMULADO >= A_FINAL && params.phase != 3) {
          await this.entity.query(` UPDATE sera.COMER_LOTES
                                                SET VALIDO_SISTEMA = 'S',
                                                IDESTATUSVTANT = ID_ESTATUSVTA,
                                                ID_ESTATUSVTA = 'PAG',
                                                ACUMULADO = ${A_ACUMULADO}
                                                WHERE ID_LOTE = ${A_LOTE}
                                               `);
          await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL 
                                                SET    ESTATUS_COMER = (    SELECT    BIE.ESTATUS
                                                                        FROM    sera.bien BIE
                                                                        WHERE    BIE.NO_BIEN = CBXL.NO_BIEN
                                                                        )
                                                WHERE    EXISTS (SELECT    1
                                                    FROM    sera.COMER_LOTES LOT
                                                    WHERE    LOT.ID_LOTE = ${A_LOTE}
                                                    AND        LOT.ID_LOTE = CBXL.ID_LOTE
                                                    )`);
          await this.entity.query(`UPDATE    sera.bien 
                                                SET    ESTATUS =     (SELECT    ESP.ESTATUS_FINAL
                                                                        FROM    sera.ESTATUS_X_PANTALLA ESP
                                                                        WHERE    CVE_PANTALLA = 'VTAINMUTOT'
                                                                        AND    ESP.ESTATUS = BIE.ESTATUS
                                                                        AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                                        )
                                                WHERE    EXISTS (SELECT    1
                                                                FROM    sera.COMER_BIENESXLOTE BXL
                                                                WHERE    BXL.ID_LOTE = ${A_LOTE}
                                                                AND        BXL.NO_BIEN = BIE.NO_BIEN
                                                                )
                                                AND        ESTATUS != (SELECT    ESP.ESTATUS_FINAL
                                                                        FROM    sera.ESTATUS_X_PANTALLA ESP
                                                                        WHERE    CVE_PANTALLA = 'VTAINMUTOT'
                                                                        AND        ESP.ESTATUS = BIE.ESTATUS
                                                                        AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                            )`);
        } else if (A_ACUMULADO < A_FINAL && params.phase != 2) {
          await this.entity.query(` UPDATE sera.COMER_LOTES
                                                SET VALIDO_SISTEMA = 'G',
                                                ID_ESTATUSVTA = 'GARA',
                                                ACUMULADO = ${A_ACUMULADO}
                                                WHERE ID_LOTE = ${A_LOTE}
                                       `);
          if (params.phase != 3) {
            await this.entity.query(`UPDATE    sera.bien 
                                                        SET    BIE.ESTATUS =(    SELECT    ESP.ESTATUS_FINAL
                                                                    FROM    sera.ESTATUS_X_PANTALLA ESP
                                                                    WHERE    CVE_PANTALLA = 'VTAINMUGARA'
                                                                    AND        ESP.ESTATUS = BIE.ESTATUS
                                                                    AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                                 )
                                                         WHERE   NO_BIEN IN (SELECT    BXL.NO_BIEN
                                                                    FROM    sera.COMER_BIENESXLOTE BXL
                                                                    WHERE    BXL.ID_LOTE = ${A_LOTE}
                                                                    )
                                                )`);
          }
        }
      });
    }

    if (params.phase == 1) {
      await this.entity.query(` UPDATE    sera.COMER_LOTES 
                                SET    VALIDO_SISTEMA = 'S', ID_ESTATUSVTA = 'CAN'
                                WHERE    ID_EVENTO     = ${params.event}
                                AND      VALIDO_SISTEMA IS NULL
                                AND        EXISTS (SELECT    1
                                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE    CXE.ID_EVENTO = ${params.event}
                                                AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND        CXE.PROCESAR = 'S'
                                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                                )
                                AND        EXISTS (SELECT    1
                                        FROM    sera.COMER_PAGOSREFGENS GEN
                                        WHERE    GEN.ID_EVENTO = ${params.event}
                                        AND        GEN.TIPO = 'P'
                                        AND        GEN.ID_LOTE = LOT.ID_LOTE
                                    )`);
      await this.entity.query(`UPDATE    sera.bien 
                        SET    ESTATUS = ( SELECT    ESTATUS_ANT
                                            FROM     sera.COMER_BIENESXLOTE BXL
                                            WHERE    BXL.NO_BIEN = BIE.NO_BIEN
                                            AND        EXISTS (SELECT    1
                                                            FROM    sera.COMER_LOTES LOT
                                                            WHERE    LOT.ID_EVENTO = ${params.event}
                                                            AND        LOT.ID_ESTATUSVTA = 'CAN'
                                                            AND        BXL.ID_LOTE     = LOT.ID_LOTE
                                                            AND        EXISTS (SELECT    1
                                                                            FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                                            WHERE    CXE.ID_EVENTO = ${params.event}
                                                                            AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                            AND        CXE.PROCESAR = 'S'
                                                                            AND     CXE.ENVIADO_SIRSAE = 'N'
                                                                            )
                                                            )
                                            AND        BXL.ID_EVENTO_REMESA IS NULL
                                            )
                        WHERE    EXISTS (SELECT    1
                                    FROM    sera.COMER_BIENESXLOTE BXL
                                    WHERE    EXISTS (SELECT    1
                                                    FROM    sera.COMER_LOTES LOT
                                                    WHERE    LOT.ID_EVENTO      = ${params.event}
                                                    AND        LOT.ID_ESTATUSVTA = 'CAN'
                                                    AND        BXL.ID_LOTE = LOT.ID_LOTE
                                                    AND        EXISTS (SELECT    1
                                                                    FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                                    WHERE    CXE.ID_EVENTO = ${params.event}
                                                                    AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                    AND        CXE.PROCESAR = 'S'
                                                                    AND     CXE.ENVIADO_SIRSAE = 'N'
                                                                    )
                                                    )
                                    AND        BIE.NO_BIEN = BXL.NO_BIEN
                                    AND        BXL.ID_EVENTO_REMESA IS NULL
                                    )`);
      await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL 
                                        SET    ID_EVENTO_COMER = NULL, ID_LOTE_COMER = NULL, VENDIDO = NULL, SELECCIONADO = NULL
                                WHERE    EXISTS (SELECT    1
                                                FROM    sera.COMER_BIENESXLOTE BXL2
                                                WHERE    BXL2.NO_BIEN = CBXL.NO_BIEN
                                                AND        EXISTS (SELECT    1
                                                                FROM    sera.COMER_LOTES LOT
                                                                WHERE    LOT.ID_EVENTO = ${params.event}
                                                                AND        LOT.ID_ESTATUSVTA = 'CAN'
                                                                AND        BXL2.ID_LOTE = LOT.ID_LOTE
                                                                AND        EXISTS (SELECT    1
                                                                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE    CXE.ID_EVENTO = ${params.event}
                                                                                AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                AND        CXE.PROCESAR = 'S'
                                                                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                                                                )
                                                                )
                                                AND    BXL2.ID_EVENTO_REMESA IS NOT NULL
                                                )
                                AND        ID_EVENTO_COMER IS NOT NULL`);
      await this.entity.query(`UPDATE    sera.COMER_LOTES LOT
                                SET    VALIDO_SISTEMA = 'S', ID_ESTATUSVTA = 'DES'
                                WHERE    ID_EVENTO = ${params.event}
                                AND        NOT EXISTS (SELECT    1
                                                        FROM    sera.COMER_PAGOSREFGENS GEN
                                                        WHERE    GEN.ID_EVENTO = ${params.event}
                                                        AND         LOT.ID_LOTE = GEN.ID_LOTE
                                                        )
                                AND        EXISTS (SELECT    1
                                                FROM   sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE    CXE.ID_EVENTO = ${params.event}
                                                AND        CXE.ID_CLIENTE =  LOT.ID_CLIENTE
                                                AND        CXE.PROCESAR = 'S'
                                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                    )`);
      await this.entity.query(` UPDATE    sera.COMER_LOTES 
                                SET    VALIDO_SISTEMA = 'S', ID_ESTATUSVTA = 'DES'
                                WHERE    ID_EVENTO = ${params.event}
                                AND        NOT EXISTS (SELECT    1
                                                        FROM    sera.COMER_PAGOSREFGENS GEN
                                                        WHERE    GEN.ID_EVENTO = ${params.event}
                                                        AND        LOT.ID_LOTE = GEN.ID_LOTE
                                                        )
                                AND        ID_CLIENTE IS NULL
                                AND        (ESASIGNADO IS NULL OR ESASIGNADO = 'N' OR ESASIGNADO = 'NO')`);
      await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL 
                                        SET    ID_EVENTO_COMER = NULL, ID_LOTE_COMER = NULL, VENDIDO = NULL, SELECCIONADO = NULL
                                WHERE    EXISTS (SELECT    1
                                                FROM    sera.COMER_BIENESXLOTE BXL2
                                                WHERE    BXL2.NO_BIEN = CBXL.NO_BIEN
                                                AND    EXISTS (SELECT    1
                                                                FROM    sera.COMER_LOTES LOT
                                                                WHERE    LOT.ID_EVENTO = ${params.event}
                                                                AND        LOT.ID_ESTATUSVTA = 'DES'
                                                                AND        BXL2.ID_LOTE = LOT.ID_LOTE
                                                                AND        LOT.ID_CLIENTE IS NULL
                                                                )
                                                AND    BXL2.ID_EVENTO_REMESA IS NOT NULL
                                                )
                                AND        ID_EVENTO_COMER IS NULL`);

      await this.entity.query(`UPDATE    sera.bien 
                                SET    ESTATUS = ( SELECT    ESTATUS_ANT
                                                    FROM     COMER_BIENESXLOTE BXL
                                                    WHERE    BXL.NO_BIEN = BIE.NO_BIEN
                                                    AND        EXISTS (SELECT    1
                                                                    FROM    sera.COMER_LOTES LOT
                                                                    WHERE    LOT.ID_EVENTO = ${params.event}
                                                                    AND        LOT.ID_ESTATUSVTA = 'CAN'
                                                                    AND        BXL.ID_LOTE     = LOT.ID_LOTE
                                                                   
                                                                    )
                                                    AND        BXL.ID_EVENTO_REMESA IS NULL
                                                    )
                                WHERE    EXISTS (SELECT    1
                                            FROM    sera.COMER_BIENESXLOTE BXL
                                            WHERE    EXISTS (SELECT    1
                                                            FROM    sera.COMER_LOTES LOT
                                                            WHERE    LOT.ID_EVENTO      = ${params.event}
                                                            AND        LOT.ID_ESTATUSVTA = 'CAN'
                                                            AND        BXL.ID_LOTE = LOT.ID_LOTE
                                                           
                                                            )
                                           
                                            AND        BXL.ID_EVENTO_REMESA IS NULL
                                            )`);
    } else if (params.phase == 2) {
      await this.entity.query(` UPDATE    sera.COMER_LOTES
                                SET    VALIDO_SISTEMA = 'S', IDESTATUSVTANT = ID_ESTATUSVTA, ID_ESTATUSVTA = 'CAN'
                                WHERE    ID_LOTE IN (    SELECT    DISTINCT GEN.ID_LOTE
                                                        FROM    sera.COMER_PAGOSREFGENS GEN
                                                        WHERE    GEN.TIPO = 'P'
                                                        AND        GEN.ID_LOTE = LOT.ID_LOTE
                                                        )
                                AND        ID_EVENTO = ${params.event}
                                AND        ID_LOTE = ${params.lot}`);

      await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL 
                                SET    ESTATUS_COMER = (    SELECT    BIE.ESTATUS
                                                        FROM    sera.bien BIE
                                                        WHERE    BIE.NO_BIEN = CBXL.NO_BIEN
                                                        )
                                WHERE    EXISTS (SELECT    1
                                        FROM    sera.COMER_LOTES LOT
                                        WHERE    LOT.ID_EVENTO = ${params.event}
                                        AND        LOT.ID_LOTE = ${params.lot}
                                        AND        LOT.ID_LOTE     = CBXL.ID_LOTE
                                        AND        LOT.ID_ESTATUSVTA = 'CAN'
                                        AND        LOT.ID_LOTE     = ${params.lot}
                                        )`);
      await this.entity.query(`UPDATE    sera.bien 
                                SET    ESTATUS = ( SELECT    ESTATUS_ANT
                                                FROM     sera.COMER_BIENESXLOTE BXL
                                                WHERE    BXL.NO_BIEN = BIE.NO_BIEN
                                                AND        EXISTS (SELECT    1
                                                                FROM    sera.COMER_LOTES LOT
                                                                WHERE    LOT.ID_EVENTO = ${params.event}
                                                                AND        LOT.ID_ESTATUSVTA = 'CAN'
                                                                AND        BXL.ID_LOTE     = LOT.ID_LOTE
                                                                AND        LOT.ID_LOTE     = ${params.lot}
                                                                )
                                                )
                                WHERE    EXISTS (SELECT    1
                                        FROM    sera.COMER_BIENESXLOTE BXL
                                        WHERE    EXISTS (SELECT    1
                                                        FROM    sera.COMER_LOTES LOT
                                                        WHERE    LOT.ID_EVENTO      = ${params.event}
                                                        AND        LOT.ID_ESTATUSVTA = 'CAN'
                                                        AND        BXL.ID_LOTE = LOT.ID_LOTE
                                                        AND        LOT.ID_LOTE = ${params.lot}
                                                        )
                                        AND        BIE.NO_BIEN = BXL.NO_BIEN
                                        )`);
      await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL 
                                        SET    ID_EVENTO_COMER = NULL, ID_LOTE_COMER = NULL, VENDIDO = NULL, SELECCIONADO = NULL
                                WHERE    EXISTS (SELECT    1
                                                FROM    sera.COMER_BIENESXLOTE BXL2
                                                WHERE    BXL2.NO_BIEN = CBXL.NO_BIEN
                                                AND        EXISTS (SELECT    1
                                                                FROM    sera.COMER_LOTES LOT
                                                                WHERE    LOT.ID_EVENTO = ${params.event}
                                                                AND        LOT.ID_ESTATUSVTA = 'CAN'
                                                                AND        BXL2.ID_LOTE = LOT.ID_LOTE
                                                                AND        EXISTS (SELECT    1
                                                                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                                                WHERE    CXE.ID_EVENTO = ${params.event}
                                                                                AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                                AND        CXE.PROCESAR = 'S'
                                                                                )
                                                                )
                                                AND    BXL2.ID_EVENTO_REMESA IS NOT NULL
                                                )
                                AND        ID_EVENTO_COMER IS NOT NULL`);
      await this.entity.query(` UPDATE    sera.COMER_LOTES 
                                SET    VALIDO_SISTEMA = 'S', ID_ESTATUSVTA = 'DES'
                                WHERE    ID_EVENTO = ${params.event}
                                AND        NOT EXISTS (SELECT    1
                                                        FROM    sera.COMER_PAGOSREFGENS GEN
                                                        AND        LOT.ID_LOTE = GEN.ID_LOTE
                                                        )
                                AND        LOT.ID_EVENTO = ${params.event}
                                AND        LOT.LOTE_PUBLICO != 0
                                AND        LOT.ID_LOTE = ${params.lot}`);
      await this.entity.query(` UPDATE    sera.bien 
                                SET    ESTATUS = ( SELECT    ESTATUS_ANT
                                                FROM     sera.COMER_BIENESXLOTE BXL
                                                WHERE    BXL.NO_BIEN = BIE.NO_BIEN
                                                AND        EXISTS (SELECT    1
                                                                FROM    sera.COMER_LOTES LOT
                                                                WHERE    LOT.ID_EVENTO = ${params.event}
                                                                AND        LOT.ID_ESTATUSVTA = 'DES'
                                                                AND        BXL.ID_LOTE = LOT.ID_LOTE
                                                                AND        LOT.ID_LOTE = ${params.lot}
                                                                )
                                                )
                                WHERE    EXISTS (SELECT    1
                                        FROM    sera.COMER_BIENESXLOTE BXL
                                        WHERE    BIE.NO_BIEN = BXL.NO_BIEN
                                        AND        EXISTS (SELECT    1
                                                        FROM    sera.COMER_LOTES LOT
                                                        WHERE    LOT.ID_EVENTO = ${params.event}
                                                        AND        LOT.ID_ESTATUSVTA = 'DES'
                                                        AND        BXL.ID_LOTE = LOT.ID_LOTE
                                                        AND        LOT.ID_LOTE = ${params.lot}
                                                        )
                                        )
                                AND        BIE.ESTATUS NOT IN ('VEN','CXR')`);
      await this.entity.query(` UPDATE    sera.COMER_BIENESXLOTE CBXL  
                                        SET    ID_EVENTO_COMER = NULL, ID_LOTE_COMER = NULL, VENDIDO = NULL, SELECCIONADO = NULL
                                WHERE    EXISTS (SELECT    1
                                                FROM    sera.COMER_BIENESXLOTE BXL2
                                                WHERE    BXL2.NO_BIEN = CBXL.NO_BIEN
                                                AND        EXISTS (SELECT    1
                                                                FROM    sera.COMER_LOTES LOT
                                                                WHERE    LOT.ID_EVENTO = ${params.event}
                                                                AND        LOT.ID_ESTATUSVTA = 'DES'
                                                                AND        BXL2.ID_LOTE = LOT.ID_LOTE
                                                                AND        LOT.ID_CLIENTE IS NULL
                                                                )
                                                AND    BXL2.ID_EVENTO_REMESA IS NOT NULL
                                                )
                                AND        ID_EVENTO_COMER IS NULL`);
    }
  }

  async validaComerAct(event: number, date: Date, lot: number) {
    var L_LOTE = 0;
    var L_CLIENTE = 0;
    var j = 0;
    var i = 0;
    var k = 0;
    var t = 0;
    var COMPRA_TOT = 0;
    var PAGADO_TOT = 0;
    var L_MONTOPENA = 0;
    var L_PARAMETROS = '';
    var PENALTY = 'N';
    var PROP_IVA_CHAT = 0.0;
    var PROP_ISR_CHAT = 0.0;
    let L7: any;

    var PROP_IVA_CHAT = 0.0;
    var PROP_ISR_CHAT = 0.0;

    const q1 = await this.entity.query(`
                SELECT    DISTINCT LOT.ID_LOTE --*
                FROM    sera.COMER_LOTES LOT
                WHERE    LOT.ID_EVENTO = ${event}
                AND        EXISTS (SELECT    PRF.ID_LOTE
                                FROM    sera.COMER_PAGOREF PRF
                                WHERE    PRF.ID_LOTE = LOT.ID_LOTE
                                AND        PRF.VALIDO_SISTEMA = 'A'
                                AND        PRF.FECHA <= ${date}
                                )
                AND        EXISTS (SELECT    1
                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                WHERE    CXE.ID_EVENTO =${event}
                                AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND        CXE.PROCESAR = 'S'
                                AND        CXE.ENVIADO_SIRSAE = 'N'
                                )
                AND        LOT.PRECIO_FINAL > 0
                AND        LOT.VALIDO_SISTEMA IS NULL;   
                `);

    if (!q1.length) {
      return {
        statusCode: '400',
        message: 'No se encontraron datos para cursor l7, distinct id_lote',
      };
    }

    L7 = q1[0].id_lote;
    L_PARAMETROS = (await this.getParameters({ eventId: event, address: 'M' }))
      .message[0];
    await this.prepareLot(event, 'M');
    await this.actEstLotesMue(event);
    await this.borraMuebles(event, null, null);
    this.G_PKREFGEN = 0;

    for (let i = 0; i < L7.data.length; i++) {
      const element = L7.data[i];

      const q2 = await this.entity.query(`
                                SELECT    DISTINCT LOT.ID_CLIENTE --*
                                FROM    sera.COMER_LOTES LOT
                                WHERE    LOT.ID_EVENTO = ${event}
                                AND LOT.ID_LOTE = ${lot};  
                        `);

      if (!q2.length) {
        return {
          statusCode: '400',
          message: 'No se encontraron datos para  DISTINCT LOT.ID_CLIENTE q2',
        };
      }
      L_CLIENTE = q2[0].id_cliente;

      await this.entity.query(`
                        UPDATE    sera.COMER_CLIENTESXEVENTO
                        SET    PROCESADO = 'S'
                        WHERE    ID_EVENTO = ${event}
                        AND    ID_CLIENTE = ${L_CLIENTE}; 
                        `);
      COMPRA_TOT = await this.llenaLotesAct(event, null, lot, 10);
      PAGADO_TOT = await this.llenaPagosAct(event, null, date, 1, lot);
      await this.penaliza({
        buy: COMPRA_TOT,
        payment: PAGADO_TOT,
        client: L_CLIENTE,
      });
      const firstIndex = this.DEPOSITOS.length > 0 ? 0 : 0;
      const lastIndex =
        this.DEPOSITOS.length > 0 ? this.DEPOSITOS.length - 1 : -1;

      for (let i = firstIndex; i <= lastIndex; i++) {
        const d = this.DEPOSITOS[i];
        const firstIndexlotes = this.LOTESXCLI.length > 0 ? 0 : 0;
        const lastIndexlotes =
          this.LOTESXCLI.length > 0 ? this.LOTESXCLI.length - 1 : -1;
        if (d.RESTA > 0) {
          for (let i = firstIndexlotes; i <= lastIndexlotes; i++) {
            const x = this.LOTESXCLI[i];
            if (
              x.PAGADO == 'N' &&
              d.RESTA > 0 &&
              x.ASIGNADO == 'S' &&
              x.MEFALTA > 0
            ) {
              if (d.RESTA == x.MEFALTA && d.RESTA > 0) {
                this.GK = this.GK + 1;
                this.DISPERSION[this.GK].CLIENTE = L_CLIENTE;
                this.DISPERSION[this.GK].LOTE = x.LOTE;
                this.DISPERSION[this.GK].MANDATO = x.MANDATO;
                this.DISPERSION[this.GK].PRECIO = x.MEFALTA;
                this.DISPERSION[this.GK].ID_PAGO = d.ID_PAGO;
                if (x.ESCHATA == 'S') {
                  this.DISPERSION[this.GK].MONCHATA = Math.round(
                    x.MEFALTA * x.PORCIVA * (this.G_PCTCHATARRA / 2),
                  );
                  PROP_ISR_CHAT = Math.round(
                    this.DISPERSION[this.GK].MONCHATA / this.G_IVA,
                  );
                  PROP_IVA_CHAT = Math.round(
                    this.DISPERSION[this.GK].MONCHATA - PROP_ISR_CHAT,
                  );
                  this.DISPERSION[this.GK].ABONADO = Math.round(
                    (x.MEFALTA * x.PORCIVA) / this.G_IVA,
                  );
                  this.DISPERSION[this.GK].IVA = Math.round(
                    x.MEFALTA * x.PORCIVA -
                    this.DISPERSION[this.GK].ABONADO +
                    PROP_IVA_CHAT,
                  );
                  this.DISPERSION[this.GK].ABONADO =
                    this.DISPERSION[this.GK].ABONADO + PROP_ISR_CHAT;
                  this.DISPERSION[this.GK].MONSIVA = Math.round(
                    x.MEFALTA * x.PORNIVA,
                  );
                } else {
                  this.DISPERSION[this.GK].ABONADO = Math.round(
                    (x.MEFALTA * x.PORCIVA) / this.G_IVA,
                  );
                  this.DISPERSION[this.GK].IVA =
                    Math.round(x.MEFALTA * x.PORCIVA) -
                    this.DISPERSION[this.GK].ABONADO;
                  this.DISPERSION[this.GK].MONSIVA = Math.round(
                    x.MEFALTA * x.PORNIVA,
                  );
                }
              }
              this.DISPERSION[this.GK].GARATIA = x.GARATIA;
              x.MEFALTA = 0;
              this.DISPERSION[this.GK].TIPO = 'N';
              x.PAGADO = 'S';
              d.RESTA = 0;
            } else if (d.RESTA < x.MEFALTA && d.RESTA > 0) {
              this.GK = this.GK + 1;
              this.DISPERSION[this.GK].CLIENTE = L_CLIENTE;
              this.DISPERSION[this.GK].LOTE = x.LOTE;
              this.DISPERSION[this.GK].MANDATO = x.MANDATO;
              this.DISPERSION[this.GK].PRECIO = x.PRECIO;
              this.DISPERSION[this.GK].ID_PAGO = d.ID_PAGO;
              if (x.ESCHATA == 'S') {
                this.DISPERSION[this.GK].MONCHATA = Math.round(
                  d.RESTA * x.PORCIVA * (this.G_PCTCHATARRA / 100),
                );
                PROP_ISR_CHAT = Math.round(
                  this.DISPERSION[this.GK].MONCHATA / this.G_IVA,
                );
                PROP_IVA_CHAT = Math.round(
                  this.DISPERSION[this.GK].MONCHATA - PROP_ISR_CHAT,
                );
                this.DISPERSION[this.GK].ABONADO = Math.round(
                  (d.RESTA * x.PORCIVA) / this.G_IVA,
                );
                this.DISPERSION[this.GK].IVA =
                  Math.round(d.RESTA * x.PORNIVA) -
                  this.DISPERSION[this.GK].ABONADO +
                  PROP_IVA_CHAT;
                this.DISPERSION[this.GK].MONSIVA = Math.round(
                  d.RESTA * x.PORNIVA,
                );
                this.DISPERSION[this.GK].ABONADO =
                  this.DISPERSION[this.GK].ABONADO + PROP_ISR_CHAT;
              } else {
                this.DISPERSION[this.GK].ABONADO =
                  Math.round(d.RESTA * x.PORCIVA) / this.G_IVA;
                this.DISPERSION[this.GK].IVA =
                  Math.round(d.RESTA * x.PORCIVA) -
                  this.DISPERSION[this.GK].ABONADO;
                this.DISPERSION[this.GK].MONSIVA = Math.round(
                  d.RESTA * x.PORNIVA,
                );
              }
              this.DISPERSION[this.GK].GARATIA = x.GARATIA;
              x.MEFALTA = x.MEFALTA - d.RESTA;
              this.DISPERSION[this.GK].TIPO = 'N';
              d.RESTA = 0;
              x.PAGADO = 'N';
            } else if (d.RESTA > x.MEFALTA && d.RESTA > 0) {
              this.GK = this.GK + 1;
              this.DISPERSION[this.GK].CLIENTE = L_CLIENTE;
              this.DISPERSION[this.GK].LOTE = x.LOTE;
              this.DISPERSION[this.GK].MANDATO = x.MANDATO;
              this.DISPERSION[this.GK].PRECIO = x.PRECIO;
              this.DISPERSION[this.GK].ID_PAGO = d.ID_PAGO;
              if (x.ESCHATA == 'S') {
                this.DISPERSION[this.GK].MONCHATA = Math.round(
                  x.MEFALTA * x.PORCIVA * (this.G_PCTCHATARRA / 100),
                );
                PROP_ISR_CHAT = Math.round(
                  this.DISPERSION[this.GK].MONCHATA / this.G_IVA,
                );
                PROP_IVA_CHAT = Math.round(
                  this.DISPERSION[this.GK].MONCHATA - PROP_ISR_CHAT,
                );
                this.DISPERSION[this.GK].ABONADO =
                  Math.round(x.MEFALTA * x.PORCIVA) -
                  this.DISPERSION[this.GK].ABONADO +
                  PROP_IVA_CHAT;
                this.DISPERSION[this.GK].MONSIVA = Math.round(
                  x.MEFALTA * x.PORNIVA,
                );
                this.DISPERSION[this.GK].ABONADO =
                  this.DISPERSION[this.GK].ABONADO + PROP_ISR_CHAT;
              } else {
                this.DISPERSION[this.GK].ABONADO = Math.round(
                  (x.MEFALTA * x.PORCIVA) / this.G_IVA,
                );
                this.DISPERSION[this.GK].IVA =
                  Math.round(x.MEFALTA * x.PORCIVA) -
                  this.DISPERSION[this.GK].ABONADO;
                this.DISPERSION[this.GK].MONSIVA = Math.round(
                  x.MEFALTA * x.PORNIVA,
                );
              }
              this.DISPERSION[this.GK].GARATIA = x.GARATIA;
              d.RESTA = d.RESTA - x.MEFALTA;
              x.MEFALTA = 0;
              this.DISPERSION[this.GK].TIPO = 'N';
              x.PAGADO = 'S';
            }
          }
        }
      }

      for (let i = firstIndex; i <= lastIndex; i++) {
        const d = this.DEPOSITOS[i];
        if (d.RESTA > 0) {
          this.GK = this.GK + 1;
          this.DISPERSION[this.GK].CLIENTE = L_CLIENTE;
          this.DISPERSION[this.GK].MANDATO = d.MANDATO;
          this.DISPERSION[this.GK].PRECIO = d.RESTA;
          this.DISPERSION[this.GK].ID_PAGO = d.ID_PAGO;
          this.DISPERSION[this.GK].ABONADO = d.RESTA;
          this.DISPERSION[this.GK].GARATIA = d.RESTA;
          this.DISPERSION[this.GK].TIPO = 'D';
          this.DISPERSION[this.GK].LOTE = d.LOTE;
        }
      }
      await this.insDispBm(L_CLIENTE, 6, event);
    }
    await this.actPagosMue(event);
    await this.actRefesMue(event);

    return {
      statusCode: 200,
      message: ['OK'],
      data: {
        dispersion: this.DISPERSION,
        depositos: this.DEPOSITOS,
      },
    };
  } //

  async appPenaSiste(buy: number, payment: number, client: number) {
    var AP_CUANTO = 0;
    var NOSE = 0;
    var PAGARAXGARA = 0;
    var MEFALTA = 0;
    var APLICARPENA = 0;
    var ERROR = 0;

    NOSE = await this.appPenaExcel(client);
    AP_CUANTO = NOSE;

    this.LOTIPGAR.forEach((lotpar) => {
      if (lotpar.MONAPP == lotpar.MONTO) {
        this.LOTESXCLI.forEach((lot) => {
          if (lot.ASIGNADO == 'S' && lot.GARATIA == lotpar.MONTO) {
            PAGARAXGARA = PAGARAXGARA + lot.PRECIO;
          }
        });
      }
    });
    this.LOTESXCLI.forEach((lot) => {
      if (lot.ASIGNADO == 'S') {
        this.LOTIPGAR.forEach((lotpar) => {
          if (lot.GARATIA != lotpar.MONTO) {
            MEFALTA = MEFALTA + lot.PRECIO;
          }
        });
      }
    });

    if (this.LOTIPGAR.length == 0) {
      this.LOTESXCLI.forEach((lot) => {
        if (lot.ASIGNADO == 'S') {
          this.LOTIPGAR.forEach((lotpar) => {
            if (lot.GARATIA == lotpar.MONTO) {
              MEFALTA = MEFALTA + lot.PRECIO;
            }
          });
        }
      });
    }
    if (payment < AP_CUANTO + PAGARAXGARA + MEFALTA) {
      for (let index = 1; index <= 5; index++) {
        APLICARPENA = await this.obtienePena(0);
        if (payment >= AP_CUANTO + PAGARAXGARA + APLICARPENA) {
          this.pickupLotes(payment - (AP_CUANTO + PAGARAXGARA + APLICARPENA));
          await this.modAprob(APLICARPENA);
          ERROR = await this.appPenaExcel(client);
          return;
        } else {
          APLICARPENA = this.obtienePena(1);
        }
      }
    }
    return {
      statusCode: 200,
      message: ['OK'],
    };
  }

  obtienePena(repite: number): number {
    var BAND_OK = 0;
    var t = 0;
    var ACUM = 0;

    if (repite == 0) {
      this.RETIPGAR.forEach((reti, index) => {
        BAND_OK = 0;
        this.LOTIPGAR.forEach((lotpar, i2) => {
          t = i2;
          if (reti.MONTO == lotpar.MONTO) {
            BAND_OK = 1;
          }
        });
        if (BAND_OK == 0) {
          t = this.LOTIPGAR.length;
          var lot: LOTEXGARA = {};
          lot.MONTO = reti.MONTO;
          lot.MONAPP = 0;
          lot.LOTES = 1;
          lot.TOTXGA = reti.TOTXGA;
          ACUM = ACUM + reti.MONTO;
        }
      });
    } else {
      this.LOTIPGAR.forEach((lotpar, i2) => {
        if (0 == lotpar.MONAPP) {
          lotpar.LOTES = lotpar.LOTES + 1;
          ACUM = lotpar.MONTO * lotpar.LOTES;
        }
      });
    }
    this.insDispBm(1, 1, 1);

    return ACUM;
  }

  async modAprob(pena: number) {
    var CONTLOTES = 0;
    this.LOTESXCLI.forEach((lot) => {
      if (lot.APROBADO == 'N' && lot.GARATIA == pena) {
        lot.ASIGNADO = 'N';
        CONTLOTES = CONTLOTES + 1;
      }
    });
    this.LOTIPGAR.forEach((lot) => {
      if (lot.MONTO == pena) {
        lot.LOTES = CONTLOTES;
        return;
      }
    });
    return true;
  }

  async pickupLotes(dispone: number) {
    var ESMEJOR = 0;
    var IDEAL = 0;
    var SIG = 0;
    var ANT = 0;
    var ACT = 0;
    var FACIL = 0;
    var AUX1 = 0;
    var AUX2 = 0;
    var SUMA = 0;
    var RESTA = 0;
    var NX = 0;
    var j = 0;
    var FINAL = 0;
    var REVISA = 0;
    var PRIMERA = 0;
    var INI = 0;
    var FIN = 0;
    var CANTMIN = 0;

    this.LOTIPGAR.forEach((lotpar) => {
      if (lotpar.MONAPP < lotpar.MONTO) {
        IDEAL = lotpar.TOTXGA - dispone;
        this.LOTESXCLI.forEach((lot) => {
          if (lot.PRECIO == IDEAL) {
            lot.APROBADO = 'N';
            FACIL = 1;
          }
        });
        if (FACIL == 0) {
          AUX1 = dispone;
          this.LOTESXCLI.forEach((lot, index) => {
            if (lot.GARATIA == lotpar.MONTO && PRIMERA == 1) {
              INI = index;
              PRIMERA += 1;
              CANTMIN = lot.PRECIO;
            } else if (lot.GARATIA != lotpar.MONTO && PRIMERA > 1) {
              FIN = index;
            }
            if (FIN == 0) FIN = index;
          });
          for (let index = INI; index <= FIN; index++) {
            if (AUX2 + this.LOTESXCLI[index].PRECIO > AUX1) {
              this.LOTESXCLI[index].APROBADO = 'N';
              NX = index;
            } else if (AUX2 + this.LOTESXCLI[index].PRECIO <= AUX1) {
              AUX2 = AUX2 + this.LOTESXCLI[index].PRECIO;
              this.LOTESXCLI[index].APROBADO = 'S';
            }
          }
          RESTA = AUX1 - AUX2;

          if (RESTA >= CANTMIN) {
            for (let index = INI; index <= FIN; index++) {
              if ('N' == this.LOTESXCLI[index].APROBADO) {
                if (RESTA > this.LOTESXCLI[index].PRECIO) {
                  this.LOTESXCLI[index].APROBADO = 'N';
                } else if (RESTA <= this.LOTESXCLI[index].PRECIO) {
                  RESTA = RESTA - this.LOTESXCLI[index].PRECIO;
                  this.LOTESXCLI[index].APROBADO = 'S';
                }
              }
            }
          }
        }
      }
    });
  }

  async appPenaExcel(client: number): Promise<number> {
    var L_MONTOPENA = 0;
    var L_MONTOTOT = 0;
    var L_MONTOAPP = 0;
    var k = 0;
    var CUENTA = 0;
    var AUX1 = 0;

    this.LOTIPGAR.forEach((lotpgar) => {
      if (!lotpgar.USADA) {
        L_MONTOPENA =
          (parseInt(`${lotpgar.LOTES / this.G_NUMLOTES}`) * lotpgar.MONTO) /
          lotpgar.LOTES;
        L_MONTOTOT = L_MONTOTOT + lotpgar.MONTO;
        L_MONTOAPP = 0;
        this.LOTESXCLI.forEach((lot) => {
          if (lot.ASIGNADO == 'N' && lot.GARATIA == lotpgar.MONTO) {
            CUENTA++;
            AUX1 += L_MONTOPENA;
            if (CUENTA == lotpgar.LOTES && AUX1 != L_MONTOAPP + L_MONTOPENA) {
              L_MONTOPENA = L_MONTOPENA + (L_MONTOTOT - AUX1);
            }
            this.DEPOSITOS.forEach((deposito) => {
              if (deposito.RESTA > 0) {
                var dispersion: Dispersa = {};
                if (deposito.RESTA == L_MONTOPENA) {
                  dispersion.CLIENTE = client;
                  dispersion.LOTE = lot.LOTE;
                  dispersion.MANDATO = lot.MANDATO;
                  dispersion.PRECIO = L_MONTOPENA;
                  dispersion.ID_PAGO = deposito.ID_PAGO;
                  dispersion.ABONADO = L_MONTOPENA / this.G_IVA;
                  dispersion.IVA = L_MONTOPENA - dispersion.ABONADO;
                  dispersion.GARATIA = L_MONTOPENA;
                  dispersion.TIPO = 'P';
                  deposito.RESTA = 0;
                  lotpgar.MONAPP = lotpgar.MONAPP + L_MONTOPENA;
                  L_MONTOAPP = L_MONTOAPP + L_MONTOPENA;
                  lot.MARCPENA = 'S';
                  lotpgar.USADA = 'S';
                } else if (deposito.RESTA < L_MONTOPENA) {
                  dispersion.CLIENTE = client;
                  dispersion.LOTE = lot.LOTE;
                  dispersion.MANDATO = lot.MANDATO;
                  dispersion.PRECIO = deposito.RESTA;
                  dispersion.ID_PAGO = deposito.ID_PAGO;
                  dispersion.ABONADO = deposito.RESTA / this.G_IVA;
                  dispersion.IVA = deposito.RESTA - dispersion.ABONADO;
                  dispersion.GARATIA = lot.GARATIA;
                  dispersion.TIPO = 'P';
                  L_MONTOPENA = L_MONTOPENA - deposito.RESTA;
                  lotpgar.MONAPP = lotpgar.MONAPP + deposito.RESTA;
                  L_MONTOAPP = L_MONTOAPP + deposito.RESTA;
                  deposito.RESTA = 0;
                } else if (deposito.RESTA > L_MONTOPENA) {
                  dispersion.CLIENTE = client;
                  dispersion.LOTE = lot.LOTE;
                  dispersion.MANDATO = lot.MANDATO;
                  dispersion.PRECIO = L_MONTOPENA;
                  dispersion.ID_PAGO = deposito.ID_PAGO;
                  dispersion.ABONADO = L_MONTOPENA / this.G_IVA;
                  dispersion.IVA = L_MONTOPENA - dispersion.ABONADO;
                  dispersion.GARATIA = L_MONTOPENA;
                  dispersion.TIPO = 'P';
                  deposito.RESTA = deposito.RESTA - L_MONTOPENA;
                  lotpgar.MONAPP = lotpgar.MONAPP + L_MONTOPENA;
                  L_MONTOAPP = L_MONTOAPP + L_MONTOPENA;
                  lot.MARCPENA = 'S';
                  lotpgar.USADA = 'S';
                }
                this.DISPERSION.push(dispersion);
              }
            });
          }
        });
      }
    });
    await this.insDispBm(client, 5, 416);
    return L_MONTOAPP;
  }

  async sumaPagosGens(event: number, lot: number): Promise<number> {
    var P_SUMAMONTO = 0;
    const result: any[] = await this.entity
      .query(`SELECT coalesce(SUM (CPS.MONTO),0) as monto
                        FROM sera.COMER_LOTES CL, sera.COMER_PAGOREF CP, sera.COMER_PAGOSREFGENS CPS
                         WHERE CL.ID_EVENTO  = ${event}
                        AND CL.ID_LOTE    = ${lot}
                        AND CL.ID_CLIENTE IS NOT NULL
                        AND CL.ID_LOTE    = CPS.ID_LOTE
                        AND CP.ID_PAGO    = CPS.ID_PAGO`);
    if (result.length > 0) {
      P_SUMAMONTO = result[0].monto;
      return P_SUMAMONTO;
    } else {
      return 0;
    }
  }

  /* LIRH 09032016*/
  async penaLotesPagar(event: number) {
    var L_IDLOTE: number;
    var L_PRECIO_FINAL: number;
    var L_NO_TRANSFERENTE: number;
    var L_ANTICIPO: number;
    var L_PRECIO_GARANTIA: number;
    var L_REFERENCIAL: string;
    var L_MONTO_LIQ: number;

    var P_SUMPAGLOT: number;
    var D: number;
    var APLICAPEN: number;
    var P_PAGO = 0;
    const dateNow = LocalDate.getNow();

    this.DISPERSIONPEN = [];
    D = 0;
    this.G_PKREFGEN = 0;

    const LXC: any[] = await this.entity
      .query(`SELECT LOT.ID_LOTE, coalesce(LOT.PRECIO_FINAL,0) as p_final,LOT.NO_TRANSFERENTE,coalesce(LOT.ANTICIPO,0) as anticipo,LOT.PRECIO_GARANTIA,LOT.REFERENCIAL,LOT.MONTO_LIQ
                        FROM sera.COMER_LOTES LOT, sera.COMER_CLIENTES CLI 
                WHERE LOT.ID_EVENTO    = ${event}
                        AND LOT.LOTE_PUBLICO != 0
                        AND LOT.PRECIO_FINAL > 0
                        AND LOT.ID_CLIENTE   = CLI.ID_CLIENTE
                        AND LOT.VALIDO_SISTEMA IS NULL
                        AND EXISTS (SELECT 1
                                FROM sera.COMER_PAGOSREFGENS CPS
                                WHERE CPS.ID_LOTE    = LOT.ID_LOTE)
                ORDER BY LOT.PRECIO_FINAL DESC, LOT.PRECIO_GARANTIA DESC`);
    for (const element of LXC) {
      L_IDLOTE = element.id_lote;
      L_PRECIO_FINAL = element.p_final;
      L_NO_TRANSFERENTE = element.no_transferente;
      L_ANTICIPO = element.anticipo;
      L_PRECIO_GARANTIA = element.precio_garantia;
      L_REFERENCIAL = element.referencial;
      L_MONTO_LIQ = element.monto_liq;

      APLICAPEN = 0;
      P_SUMPAGLOT = await this.sumaPagosGens(event, L_IDLOTE);
      if (P_SUMPAGLOT < L_PRECIO_FINAL) {
        const result: any[] = await this.entity
          .query(`SELECT CPS.ID_PAGOREFGENS,CPS.ID_PAGO,CPS.ID_EVENTO,CPS.ID_LOTE,CPS.MONTO,CPS.REFERENCIA,CPS.TIPOINGRESO,
                                        CPS.NO_TRANSFERENTE,CPS.IVA,CPS.MONTO_APP_IVA,CPS.MONTO_NOAPP_IVA,CPS.TIPO,CPS.FECHA_PROCESO,CPS.MONTO_CHATARRA
                                        FROM sera.COMER_LOTES CL, sera.COMER_PAGOREF CP, sera.COMER_PAGOSREFGENS CPS
                                        WHERE CL.ID_EVENTO  = ${event}
                                        AND CL.ID_LOTE    = ${L_IDLOTE}
                                        AND CL.ID_CLIENTE IS NOT NULL
                                        AND CL.ID_LOTE    = CPS.ID_LOTE
                                        AND CP.ID_PAGO    = CPS.ID_PAGO`);
        result.forEach((x, index) => {
          if (x.monto == L_PRECIO_GARANTIA) {
            var disppen: DISPERPENA = {};
            if (APLICAPEN == 0) {
              disppen.ID_PAGOREFGENS = x.id_pagorefgens;
              disppen.ID_PAGO = x.id_pago;
              disppen.ID_EVENTO = x.id_evento;
              disppen.ID_LOTE = x.id_lote;
              disppen.MONTO = x.monto;
              disppen.REFERENCIA = x.referencia;
              disppen.NO_TRANSFERENTE = x.no_transferente;
              disppen.IVA = x.iva;
              disppen.MONTO_APP_IVA = x.monto_app_iva;
              disppen.MONTO_NOAPP_IVA = x.monto_noapp_iva;
              disppen.TIPO = 'P';
              disppen.FECHA_PROCESO = x.fecha_proceso;
              disppen.MONTO_CHATARRA = x.monto_chatarra;
              disppen.ACCION = 'U';

              APLICAPEN = 1;
            } else if (APLICAPEN == 1) {
              disppen.ID_PAGOREFGENS = x.id_pagorefgens;
              disppen.ID_PAGO = x.id_pago;
              disppen.ID_EVENTO = x.id_evento;
              disppen.ID_LOTE = x.id_lote;
              disppen.MONTO = x.monto;
              disppen.REFERENCIA = x.referencia;
              disppen.NO_TRANSFERENTE = x.no_transferente;
              disppen.IVA = 0;
              disppen.MONTO_APP_IVA = 0;
              disppen.MONTO_NOAPP_IVA = this.DISPERSIONPEN[index].MONTO;
              disppen.TIPO = 'D';
              disppen.FECHA_PROCESO = x.fecha_proceso;
              disppen.MONTO_CHATARRA = 0;
              disppen.ACCION = 'U';
            }
            this.DISPERSIONPEN.push(disppen);
          } else if (x.monto > L_PRECIO_GARANTIA) {
            var disppen: DISPERPENA = {};
            if (APLICAPEN == 0) {
              disppen.ID_PAGOREFGENS = x.id_pagorefgens;
              disppen.ID_PAGO = x.id_pago;
              disppen.ID_EVENTO = x.id_evento;
              disppen.ID_LOTE = x.id_lote;
              disppen.MONTO = L_PRECIO_GARANTIA;
              disppen.REFERENCIA = x.referencia;
              disppen.NO_TRANSFERENTE = x.no_transferente;
              disppen.IVA =
                L_PRECIO_GARANTIA - this.DISPERSIONPEN[index].MONTO_APP_IVA;
              disppen.MONTO_APP_IVA = L_PRECIO_GARANTIA / this.G_IVA;
              disppen.MONTO_NOAPP_IVA = 0;
              disppen.TIPO = 'P';
              disppen.FECHA_PROCESO = x.fecha_proceso;
              disppen.MONTO_CHATARRA = 0;
              disppen.ACCION = 'U';
              this.DISPERSIONPEN.push(disppen);

              this.DISPERSIONPEN.push({
                ID_PAGOREFGENS: this.G_PKREFGEN + 1,
                ID_PAGO: x.id_pago,
                ID_EVENTO: x.id_evento,
                ID_LOTE: x.id_lote,
                MONTO: x.monto - L_PRECIO_GARANTIA,
                REFERENCIA: x.referencia,
                NO_TRANSFERENTE: x.no_transferente,
                IVA: 0,
                MONTO_APP_IVA: 0,
                MONTO_NOAPP_IVA: this.DISPERSIONPEN[index].MONTO,
                TIPO: 'D',
                FECHA_PROCESO: x.fecha_proceso,
                MONTO_CHATARRA: x.monto_chatarra,
                ACCION: 'I',
              });

              APLICAPEN = 1;
            } else if (APLICAPEN == 1) {
              disppen.ID_PAGOREFGENS = x.id_pagorefgens;
              disppen.ID_PAGO = x.id_pago;
              disppen.ID_EVENTO = x.id_evento;
              disppen.ID_LOTE = x.id_lote;
              disppen.MONTO = x.monto;
              disppen.REFERENCIA = x.referencia;
              disppen.NO_TRANSFERENTE = x.no_transferente;
              disppen.IVA = 0;
              disppen.MONTO_APP_IVA = 0;
              disppen.MONTO_NOAPP_IVA = this.DISPERSIONPEN[index].MONTO;
              disppen.TIPO = 'D';
              disppen.FECHA_PROCESO = x.fecha_proceso;
              disppen.MONTO_CHATARRA = 0;
              disppen.ACCION = 'U';
              this.DISPERSIONPEN.push(disppen);
            }
          }
        });
      }
    }

    if (this.DISPERSIONPEN.length > 0) {
      this.DISPERSIONPEN.forEach(async (element) => {
        if (element.ACCION == 'U') {
          await this.entity.query(`UPDATE sera.COMER_PAGOSREFGENS
                                                SET TIPO            = '${element.TIPO}',
                                                MONTO           = ${element.MONTO},
                                                IVA             = ${element.IVA},
                                                MONTO_APP_IVA   = ${element.MONTO_APP_IVA},
                                                MONTO_NOAPP_IVA = ${element.MONTO_NOAPP_IVA}
                                                WHERE
                                                ID_PAGOREFGENS  = ${element.ID_PAGOREFGENS}
                                                AND ID_PAGO         = ${element.ID_PAGO}
                                                AND ID_EVENTO       = ${element.ID_EVENTO}
                                                AND ID_LOTE         = ${element.ID_LOTE}       `);
          await this.entity.query(` UPDATE sera.COMER_LOTES
                                        SET VALIDO_SISTEMA = 'S',
                                            ID_ESTATUSVTA  = 'CAN'
                                      WHERE
                                            ID_EVENTO      = ${element.ID_EVENTO}
                                        AND ID_LOTE        = ${element.ID_LOTE} `);
        } else if (element.ACCION == 'I') {
          await this.entity.query(`INSERT INTO sera.COMER_PAGOSREFGENS
                                        (   ID_EVENTO,                  ID_PAGOREFGENS,                   ID_PAGO,                 ID_LOTE,
                                            MONTO,                      NO_TRANSFERENTE,                  MONTO_NOAPP_IVA,         MONTO_APP_IVA,
                                            IVA,                        TIPO,                             MONTO_CHATARRA,          FECHA_PROCESO
                                        )
                                        VALUES
                                        (  ${element.ID_EVENTO},${element.ID_PAGOREFGENS}, ${element.ID_PAGO},        ${element.ID_LOTE},
                                           ${element.MONTO},    ${element.NO_TRANSFERENTE},${element.MONTO_NOAPP_IVA},${element.MONTO_APP_IVA},
                                           ${element.IVA},      '${element.TIPO}',           ${element.MONTO_CHATARRA},  CAST('${dateNow}' AS DATE)
                                        )`);
          await this.entity.query(` UPDATE sera.COMER_LOTES
                                                SET VALIDO_SISTEMA = 'S',
                                                ID_ESTATUSVTA  = 'CAN'
                                                WHERE
                                                ID_EVENTO      = ${element.ID_EVENTO}
                                                AND ID_LOTE        = ${element.ID_LOTE} `);
        }
      });
    }

    return true;
  }
  async ventaInmu1(event: number, date: Date, phase: number, lot: number) {
    var VI1_MONTO = 0;
    var VI1_LOTE = 0;
    var VI1_PRECFINAL = 0;
    var VI1_PAGADO = 0;
    var VI1_ACUM = 0;
    var VI1_ANTICIPO = 0;
    var VI1_CLIENTE = 0;

    var P1: any[] = await this.entity
      .query(`SELECT    LOT.ID_LOTE, LOT.PRECIO_FINAL, SUM(PAG.MONTO) as monto, coalesce(LOT.ACUMULADO,0) as acum, LOT.ANTICIPO, LOT.ID_CLIENTE
               FROM    sera.COMER_LOTES LOT, sera.COMER_PAGOREF PAG
               WHERE    LOT.ID_EVENTO = ${event}
               AND        PAG.VALIDO_SISTEMA = 'A'
               AND        LOT.ID_LOTE = coalesce(${lot}, LOT.ID_LOTE)
               AND        LOT.ID_LOTE = PAG.ID_LOTE
               AND        PAG.FECHA          <= '${date}'
               AND        coalesce(LOT.ESASIGNADO,'S') != 'N'
               AND        EXISTS (SELECT    1
                               FROM    sera.COMER_CLIENTESXEVENTO CXE
                               WHERE    CXE.ID_EVENTO = ${event}
                               AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                               AND        CXE.PROCESAR = 'S'
                               AND        CXE.ENVIADO_SIRSAE = 'N'
                               )
               GROUP BY LOT.ID_LOTE, LOT.PRECIO_FINAL, LOT.ACUMULADO, LOT.ANTICIPO, LOT.ID_CLIENTE`);

    P1.forEach((element) => {
      if (phase == 1) {
        if (
          element.precio_final == element.monto ||
          element.anticipo == element.monto
        ) {
          this.insertAreFGens(element.id_lote, date, event, phase);
        }
      } else if (phase == 2) {
        if (element.precio_final - element.acum == VI1_PAGADO) {
          this.insertAreFGens(element.id_lote, date, event, phase);
        }
      } else if (phase == 3) {
        this.insertAreFGens(element.id_lote, date, event, phase);
      }
      this.actClienteProc(element.id_cliente, event);
    });
    return;
  }
  async ventaInmu(
    event: number,
    date: Date,
    phase: number,
    lot: number,
    recal: string,
  ) {
    var L_PARAMETROS = '';
    var L_CLIENTE = 0;
    var j = 0;
    var I = 0;
    var k = 0;
    var t = 0;
    var COMPRA_TOT = 0;
    var PAGADO_TOT = 0;

    await this.getParameters({ eventId: event, address: 'I' });
    this.G_EVENTO = event;
    if (phase == 1) {
      await this.actesLote(event);
      await this.prepareLot(event, 'I');
      await this.borraMuebles(event, null, phase);
    } else if (phase == 2 || phase == 3) {
      await this.borraMuebles(event, lot, phase);
    }

    await this.ventaInmu1(event, date, phase, lot);

    if (phase! + 3) {
      var L7: any[] = await this.entity.query(`SELECT    DISTINCT LOT.ID_CLIENTE
                        FROM    sera.COMER_LOTES LOT
                        WHERE    LOT.ID_EVENTO = ${event}
                        AND        LOT.ID_LOTE        = coalesce(${lot}, LOT.ID_LOTE)
                        AND        EXISTS (SELECT    PRF.ID_LOTE
                                        FROM    sera.COMER_PAGOREF PRF
                                        WHERE    PRF.ID_LOTE = LOT.ID_LOTE
                                        AND        PRF.VALIDO_SISTEMA = 'A'
                                        AND        PRF.FECHA <= '${date}'
                                        )
                        AND        EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${event}
                                        AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND        CXE.PROCESAR = 'S'
                                        )
                        AND        LOT.PRECIO_FINAL > 0
                        AND        (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = case ${phase} when 1 then '1' when 2 then 'G' when 3 then 'G' end)
                        `);
      for (const element of L7) {
        this.DISPERSION = [];

        COMPRA_TOT = await this.llenaLotes(
          event,
          element.id_cliente,
          lot,
          phase,
        );
        PAGADO_TOT = await this.llenaPagos(
          event,
          element.id_cliente,
          date,
          phase,
        );
        await this.penalizaInmu(
          COMPRA_TOT,
          PAGADO_TOT,
          element.id_cliente,
          phase,
        );
        this.pagoALote(element.id_cliente, lot, phase);
        await this.insDispBm(element.id_cliente, 6, event);
        await this.actClienteProc(element.id_cliente, event);
      }
    }

    this.actPagos(event, 'I', phase, lot);
    await this.actRefes(event, lot, phase);
  }

  async actRefes(event: number, lot: number, phase: number) {
    if (phase == 1) {
      await this.entity.query(` UPDATE    sera.COMER_PAGOSREFGENS GEN 
                        SET    REFERENCIA = (    SELECT    coalesce(REFERENCIAORI,REFERENCIA)
                                    FROM    sera.COMER_PAGOREF REF
                                    WHERE    REF.ID_PAGO = GEN.ID_PAGO
                                  )
                        WHERE    EXISTS (SELECT    1
                                FROM    sera.COMER_LOTES LOT
                                WHERE    LOT.ID_EVENTO = ${event}
                                AND    LOT.ID_EVENTO = GEN.ID_EVENTO
                                AND    LOT.ID_LOTE = GEN.ID_LOTE
                                AND    EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${event}
                                        AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND    CXE.PROCESAR = 'S'
                                        AND     CXE.ENVIADO_SIRSAE = 'N'
                                        )
                                )`);
    } else {
      await this.entity.query(`UPDATE    sera.COMER_PAGOSREFGENS GEN
                        SET    REFERENCIA = (    SELECT    coalesce(REFERENCIAORI,REFERENCIA)
                                    FROM    sera.COMER_PAGOREF REF
                                    WHERE    REF.ID_PAGO = GEN.ID_PAGO
                                  )
                        WHERE    EXISTS (SELECT    1
                                FROM    sera.COMER_LOTES LOT
                                WHERE    LOT.ID_EVENTO = ${event}
                                AND    LOT.ID_EVENTO = GEN.ID_EVENTO
                                AND    LOT.ID_LOTE = GEN.ID_LOTE
                                AND    LOT.ID_LOTE = coalesce(${lot}, LOT.ID_LOTE)
                                )`);
    }
    return;
  }

  pagoALote(client: number, lot: number, phase: number) {
    var SALDO = 0;
    var PRIMERA = 1;
    this.DEPOSITOS.forEach((deposito) => {
      if (deposito.RESTA > 0) {
        this.LOTESXCLI.forEach((lot) => {
          if (phase == 1 && PRIMERA == 1) {
            lot.MEFALTA = lot.ANTICIPO;
          } else if (phase == 2 && PRIMERA == 1) {
            lot.MEFALTA = lot.MEFALTA - lot.ACUM;
          }
          PRIMERA += 1;
          if (
            lot.PAGADO == 'N' &&
            lot.MEFALTA > 0 &&
            (lot.MARCPENA || 'N') != 'S'
          ) {
            var dispersion: Dispersa = {};
            if (deposito.RESTA < lot.MEFALTA) {
              dispersion.CLIENTE = lot.CLIENTE;
              dispersion.LOTE = lot.LOTE;
              dispersion.MANDATO = lot.MANDATO;
              dispersion.PRECIO = lot.PRECIO;
              dispersion.ID_PAGO = deposito.ID_PAGO;
              dispersion.ABONADO = (deposito.RESTA * lot.PORCIVA) / this.G_IVA;
              dispersion.IVA =
                (deposito.RESTA * lot.PORCIVA, 2) - dispersion.ABONADO;
              dispersion.MONSIVA =
                deposito.RESTA - (dispersion.ABONADO + dispersion.IVA);
              dispersion.GARATIA = lot.GARATIA;
              lot.MEFALTA = lot.MEFALTA - deposito.RESTA;
              dispersion.TIPO = 'N';
              deposito.RESTA = 0;
              lot.PAGADO = 'N';
            } else {
              dispersion.CLIENTE = lot.CLIENTE;
              dispersion.LOTE = lot.LOTE;
              dispersion.MANDATO = lot.MANDATO;
              dispersion.PRECIO = lot.PRECIO;
              dispersion.ID_PAGO = deposito.ID_PAGO;
              dispersion.ABONADO = (lot.MEFALTA * lot.PORCIVA) / this.G_IVA;
              dispersion.IVA = lot.MEFALTA * lot.PORCIVA - dispersion.ABONADO;
              dispersion.MONSIVA =
                lot.MEFALTA - (dispersion.ABONADO + dispersion.IVA);
              dispersion.GARATIA = lot.GARATIA;
              deposito.RESTA = deposito.RESTA - lot.MEFALTA;
              lot.MEFALTA = 0;
              dispersion.TIPO = 'N';
              lot.PAGADO = 'S';
            }
            this.DISPERSION.push(dispersion);
          }
        });
      }
    });
  }

  async llenaPagos(
    event: number,
    client: number,
    date: Date,
    phase: number,
  ): Promise<number> {
    var L_IDPAGO = 0;
    var L_MONTO = 0;
    var L_MANDATO = 0;
    var L_LOTE = 0;
    var i = 0;
    var L_DEPTOT = 0;

    const L8 = await this.entity
      .query(`SELECT    PRF.ID_PAGO, PRF.MONTO, LOT.NO_TRANSFERENTE, PRF.ID_LOTE
                        FROM    sera.COMER_PAGOREF PRF, sera.COMER_LOTES LOT
                        WHERE    PRF.FECHA         <= '${date}'
                        AND        PRF.VALIDO_SISTEMA = 'A'
                        AND        PRF.ID_LOTE        = LOT.ID_LOTE
                        AND        LOT.ID_EVENTO      = ${event}
                        AND        LOT.ID_CLIENTE     = ${client}
                        AND        PRF.IDORDENINGRESO IS NULL
                        AND        (LOT.VALIDO_SISTEMA IS NULL OR LOT.VALIDO_SISTEMA = case ${phase} when 1 then '1' when 2 then 'G' when 3 then 'G' end)
                        AND        LOT.PRECIO_FINAL   > 0
                        ORDER BY PRF.MONTO DESC`);

    this.DEPOSITOS = [];
    L8.forEach((element) => {
      var deposito: Pago = {};

      deposito.PAGADO = element.monto;
      deposito.ID_PAGO = element.id_pago;
      deposito.RESTA = element.monto;
      deposito.MANDATO = element.no_transferente;
      deposito.LOTE = element.id_lote;
      this.DEPOSITOS.push(deposito);
      L_DEPTOT = L_DEPTOT + L_MONTO;
    });

    return L_DEPTOT;
  }

  async actesLote(event: number) {
    return await this.entity.query(` UPDATE    sera.COMER_LOTES
                SET    IDESTATUSVTANT = ID_ESTATUSVTA
                WHERE    ID_EVENTO = ${event} 
                AND    LOTE_PUBLICO != 0`);
  }

  async borra(event: number) {
    var BR_IDLOTE = 0;
    var BR_IDBXL = 0;
    var BR_IDBXL2 = 0;

    const BR: any[] = await this.entity
      .query(` SELECT    BXL.ID_BIENXLOTE as one, BXL2.ID_BIENXLOTE as two, BXL.ID_LOTE
                FROM    sera.COMER_BIENESXLOTE BXL, sera.COMER_BIENESXLOTE BXL2, sera.COMER_LOTES LOT2, sera.COMER_EVENTOS EVE
                WHERE    EXISTS (SELECT    1
                        FROM    sera.COMER_LOTES LOT
                        WHERE    LOT.ID_EVENTO = ${event}
                        AND    LOT.ID_LOTE = BXL.ID_LOTE
                        AND    EXISTS (SELECT    1
                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                WHERE    CXE.ID_EVENTO = ${event}
                                AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND    CXE.PROCESAR = 'S'
                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                )
                        )
                AND    BXL2.NO_BIEN = BXL.NO_BIEN
                AND    LOT2.ID_LOTE = BXL2.ID_LOTE
                AND    EVE.ID_TPEVENTO = 6
                AND    EVE.ID_EVENTO = LOT2.ID_EVENTO`);

    await this.entity.query(` DELETE  FROM  sera.COMER_PAGOSREFGENS GEN
                        WHERE    EXISTS (SELECT    1
                                FROM     sera.COMER_LOTES LOT
                                WHERE    LOT.ID_EVENTO = ${event}
                                AND    LOT.ID_EVENTO = GEN.ID_EVENTO
                                AND    LOT.ID_LOTE = GEN.ID_LOTE
                                AND    EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${event}
                                        AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND    CXE.PROCESAR = 'S'
                                        AND     CXE.ENVIADO_SIRSAE = 'N'
                                        )
                                )`);
    await this.entity.query(`UPDATE    sera.COMER_PAGOREF CPR
                        SET    VALIDO_SISTEMA = 'A'
                        WHERE    EXISTS (SELECT    1
                                FROM     sera.COMER_LOTES LOT
                                WHERE    LOT.ID_EVENTO = ${event}
                                AND    LOT.ID_LOTE = CPR.ID_LOTE
                                AND    EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${event}
                                        AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND    CXE.PROCESAR = 'S'
                                        AND     CXE.ENVIADO_SIRSAE = 'N'
                                        )
                                )
                        AND    VALIDO_SISTEMA = 'S'`);
    await this.entity.query(`  UPDATE    sera.bien 
                        SET    ESTATUS = (    SELECT    BXL1.ESTATUS_COMER
                                FROM    sera.COMER_BIENESXLOTE BXL1
                                WHERE    BIE.NO_BIEN = BXL1.NO_BIEN
                                AND    EXISTS (SELECT     1
                                        FROM    sera.COMER_LOTES LOT1
                                        WHERE    LOT1.ID_EVENTO = ${event}
                                        AND    LOT1.ID_LOTE = BXL1.ID_LOTE
                                        AND    EXISTS (SELECT    1
                                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE    CXE.ID_EVENTO = ${event}
                                                AND    CXE.ID_CLIENTE = LOT1.ID_CLIENTE
                                                AND    CXE.PROCESAR = 'S'
                                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                                )
                                        )
                                )
                        WHERE    EXISTS (SELECT    1
                                FROM    sera.COMER_BIENESXLOTE BXL
                                WHERE    BXL.NO_BIEN = BIE.NO_BIEN
                                AND    EXISTS    (SELECT 1
                                        FROM    sera.COMER_LOTES LOT
                                        WHERE    LOT.ID_EVENTO = ${event}
                                        AND    LOT.ID_LOTE = BXL.ID_LOTE
                                        AND    EXISTS (SELECT    1
                                                FROM   sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE    CXE.ID_EVENTO = ${event}
                                                AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND    CXE.PROCESAR = 'S'
                                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                                )
                
                                        )
                                )`);
    await this.entity.query(`UPDATE    sera.COMER_LOTES LOT  
                        SET    ID_ESTATUSVTA = 'VEN', VALIDO_SISTEMA = NULL, ACUMULADO = 0
                        WHERE    ID_EVENTO = ${event}
                        AND    EXISTS (SELECT    1
                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                WHERE    CXE.ID_EVENTO = ${event}
                                AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND    CXE.PROCESAR = 'S'
                                AND     CXE.ENVIADO_SIRSAE = 'N'
                        )`);

    await this.entity.query(`UPDATE    sera.COMER_LOTES LOT 
                        SET    ID_ESTATUSVTA = 'APRO', VALIDO_SISTEMA = NULL, ACUMULADO = 0
                        WHERE    ID_EVENTO = ${event}
                        AND    ID_CLIENTE IS NULL
                        AND    ID_ESTATUSVTA != 'DES'`);

    await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL
                        SET    VENDIDO = NULL
                        WHERE    EXISTS (SELECT    1
                                FROM    sera.COMER_BIENESXLOTE BXL
                                WHERE    EXISTS (SELECT    1
                                        FROM    sera.COMER_LOTES LOT
                                        WHERE    LOT.ID_EVENTO = ${event}
                                        AND    LOT.ID_LOTE = BXL.ID_LOTE
                                        AND    EXISTS (SELECT    1
                                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE    CXE.ID_EVENTO = ${event}
                                                AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND    CXE.PROCESAR = 'S'
                                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                                )
                                        )
                                AND    BXL.ID_BIENXLOTE_REMESA = ID_BIENXLOTE
                                )`);
    await this.entity.query(` UPDATE    sera.COMER_EVENTOS
                        SET    ID_ESTATUSVTA = 'PREP'
                        WHERE    ID_EVENTO IN (    SELECT    DISTINCT ID_EVENTO_REMESA
                                FROM    sera.COMER_BIENESXLOTE BXL
                                WHERE    EXISTS (SELECT    1
                                        FROM    sera;COMER_LOTES LOT
                                        WHERE    LOT.ID_EVENTO = ${event}
                                        AND    LOT.ID_LOTE = BXL.ID_LOTE
                                        AND    EXISTS (SELECT    1
                                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE    CXE.ID_EVENTO = ${event}
                                                AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND    CXE.PROCESAR = 'S'
                                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                                )
                                        )
                                AND    BXL.ID_BIENXLOTE_REMESA IS NOT NULL
                                )`);
    await this.entity.query(`DELETE  FROM  sera.COMER_BIENESRECHAZADOS
                        WHERE    ID_EVENTO = ${event}`);
    await this.entity.query(`UPDATE    sera.COMER_CLIENTESXEVENTO
                        SET    PROCESADO = 'N'
                        WHERE    ID_EVENTO = ${event}
                        AND    PROCESAR = 'S'`);

    BR.forEach(async (element) => {
      await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE CBXL
                        SET    ID_EVENTO_COMER = ${event}, ID_LOTE_COMER = ${element.id_lote}, SELECCIONADO = 'S'
                        WHERE    ID_LOTE = ${element.id_lote}
                        AND    ID_BIENXLOTE = ${element.two}`);
    });

    return;
  }

  async nunMandec(event: number, ident: number): Promise<number> {
    var NM_NUMMAND = 0;
    const result = await this.entity
      .query(`SELECT    COUNT(DISTINCT MANDATO) as total
                FROM    sera.COMER_DETALLES
                WHERE    ID_EVENTO = ${event}
                AND    IDENTIFICADOR = ${ident}`);
    return result[0].total || 0;
  }

  async bienesLote(event: number, lot: number) {
    return await this.entity.query(`UPDATE    sera.COMER_LOTES LOT
                SET    NUM_BIENES = (    SELECT COUNT(*)
                             FROM    sera.COMER_BIENESXLOTE BXL
                             WHERE    BXL.ID_LOTE = LOT.ID_LOTE
                         )
                WHERE    ID_EVENTO = ${event}`);
  }

  async actRefesMue(event: number) {
    return await this.entity.query(`UPDATE  sera.COMER_PAGOSREFGENS GEN --*
                SET  REFERENCIA = (  SELECT  coalesce(REFERENCIAORI,REFERENCIA)
                                     FROM   sera.COMER_PAGOREF REF
                                     WHERE   REF.ID_PAGO = GEN.ID_PAGO
                                 )
              WHERE  EXISTS (SELECT  1
                             FROM   sera.COMER_LOTES LOT
                             WHERE   LOT.ID_EVENTO = ${event}
                             AND     LOT.ID_EVENTO = GEN.ID_EVENTO
                             AND     LOT.ID_LOTE = GEN.ID_LOTE
                             AND     EXISTS (SELECT  1
                                             FROM   sera.COMER_CLIENTESXEVENTO CXE
                                             WHERE   CXE.ID_EVENTO = ${event}
                                             AND     CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                             AND     CXE.PROCESAR = 'S'
                                             AND     CXE.ENVIADO_SIRSAE = 'N'
                                             )
                             )`);
  }

  async ventaSbmAct(params: RealStateSaleCurrent) {
    var L_PARAMETROS = '';
    var L_CLIENTE = 0;
    var M_LOTE = 0;
    var j = 0;
    var i = 0;
    var k = 0;
    var t = 0;
    var COMPRA_TOT = 0;
    var PAGADO_TOT = 0;
    var PROP_IVA_CHAT = 0;
    var PROP_ISR_CHAT = 0;
    var SPBM_TPEVENTO = 0;

    const res: any[] = await this.entity.query(`SELECT ID_TPEVENTO
                FROM sera.COMER_EVENTOS
                 WHERE ID_EVENTO = ${params.event}`);
    if (res.length > 0) {
      SPBM_TPEVENTO = res[0].id_tpevento;

      if (SPBM_TPEVENTO == 1) {
        await this.getParameters({ eventId: params.event, address: 'M' });
        this.G_EVENTO = params.event;
        if (!params.lot) {
          if (params.phase == 3) {
            await this.actEstLotesMue(params.event);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );
            var L7_ACT_F3: any[] = await this.entity
              .query(` SELECT  LOT.ID_CLIENTE, LOT.ID_LOTE
                                                FROM  sera.COMER_LOTES LOT
                                                WHERE  LOT.ID_EVENTO = ${params.event}
                                                AND  EXISTS (SELECT  PRF.ID_LOTE
                                                                FROM  sera.COMER_PAGOREF PRF
                                                        WHERE  PRF.ID_LOTE = LOT.ID_LOTE
                                                                AND  PRF.VALIDO_SISTEMA = 'A'
                                                                AND  PRF.FECHA <= '${params.date}'
                                                                AND  PRF.REFERENCIA LIKE '3%'
                                                                )
                                                AND  EXISTS (SELECT  1
                                                                FROM  sera.COMER_CLIENTESXEVENTO CXE
                                                        WHERE  CXE.ID_EVENTO = ${params.event}
                                                                AND  CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                AND  CXE.PROCESAR = 'S'
                                                                )
                                                AND  LOT.PRECIO_FINAL > 0
                                                AND  (LOT.VALIDO_SISTEMA IS NULL )`);
            for (const element of L7_ACT_F3) {
              this.DISPERSION = [];
              COMPRA_TOT = await this.llenaLotesAct(
                params.event,
                element.id_cliente,
                element.id_lote,
                params.phase,
              );
              PAGADO_TOT = await this.llenaPagosAct(
                params.event,
                element.id_cliente,
                params.date,
                params.phase,
                params.lot,
              );
              await this.penalizaInmuAct(
                COMPRA_TOT,
                PAGADO_TOT,
                element.id_cliente,
                3,
              );
              await this.pagoLoteAct(element.id_cliente, null, 3);
              this.insDispBm(element.id_cliente, 6, params.event);
              this.actClienteProc(element.id_cliente, params.event);
            }
          } else if (params.phase == 4) {
            await this.actEstLotesMue(params.event);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );
            var L7_ACT_F4: any[] = await this.entity
              .query(`SELECT  LOT.ID_CLIENTE, LOT.ID_LOTE
                                                FROM  sera.COMER_LOTES LOT
                                                WHERE  LOT.ID_EVENTO = ${params.event}
                                                AND  EXISTS (SELECT  PRF.ID_LOTE
                                                                FROM  sera.COMER_PAGOREF PRF
                                                        WHERE  PRF.ID_LOTE = LOT.ID_LOTE
                                                                AND  PRF.VALIDO_SISTEMA = 'A'
                                                                AND  PRF.FECHA <= '${params.date}'
                                                                AND  PRF.REFERENCIA LIKE '4%'
                                                                )
                                                AND  EXISTS (SELECT  1
                                                                FROM  sera.COMER_CLIENTESXEVENTO CXE
                                                        WHERE  CXE.ID_EVENTO = ${params.event}
                                                                AND  CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                AND  CXE.PROCESAR = 'S'
                                                                )
                                                AND  LOT.PRECIO_FINAL > 0
                                                AND  (LOT.VALIDO_SISTEMA IS NULL )`);
            for (const element of L7_ACT_F4) {
              this.DISPERSION = [];
              COMPRA_TOT = await this.llenaLotesAct(
                params.event,
                element.id_cliente,
                element.id_lote,
                params.phase,
              );
              PAGADO_TOT = await this.llenaPagosAct(
                params.event,
                element.id_cliente,
                params.date,
                params.phase,
                params.lot,
              );
              await this.penalizaInmuAct(
                COMPRA_TOT,
                PAGADO_TOT,
                element.id_cliente,
                4,
              );
              this.dispDevol(params.event, element.id_cliente);
              this.insDispBm(element.id_cliente, 6, params.event);
              this.actClienteProc(element.id_cliente, params.event);
            }
            await this.penaLotesPagar(params.event);
          }
        } else {
          if (params.phase == 3) {
            await this.actEstLotesMue(params.event);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );

            const result = await this.entity
              .query(` SELECT DISTINCT LOT.ID_CLIENTE 
                                                        FROM sera.COMER_LOTES LOT
                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                        AND LOT.ID_LOTE =${params.lot}`);
            L_CLIENTE = result[0].id_cliente;
            this.DISPERSION = [];
            COMPRA_TOT = await this.llenaLotesAct(
              params.event,
              L_CLIENTE,
              params.lot,
              params.phase,
            );
            PAGADO_TOT = await this.llenaPagosAct(
              params.event,
              L_CLIENTE,
              params.date,
              params.phase,
              params.lot,
            );
            await this.penalizaInmuAct(
              COMPRA_TOT,
              PAGADO_TOT,
              L_CLIENTE,
              params.phase,
            );
            this.pagoLoteAct(L_CLIENTE, null, params.phase);
            this.insDispBm(L_CLIENTE, 6, params.event);
            this.actClienteProc(L_CLIENTE, params.event);
          } else if (params.phase == 4) {
            await this.actEstLotesMue(params.event);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );

            const result = await this.entity
              .query(` SELECT DISTINCT LOT.ID_CLIENTE 
                                                        FROM sera.COMER_LOTES LOT
                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                        AND LOT.ID_LOTE =${params.lot}`);
            L_CLIENTE = result[0].id_cliente;
            this.DISPERSION = [];
            COMPRA_TOT = await this.llenaLotesAct(
              params.event,
              L_CLIENTE,
              params.lot,
              params.phase,
            );
            PAGADO_TOT = await this.llenaPagosAct(
              params.event,
              L_CLIENTE,
              params.date,
              params.phase,
              params.lot,
            );
            await this.penalizaInmuAct(
              COMPRA_TOT,
              PAGADO_TOT,
              L_CLIENTE,
              params.phase,
            );
            this.dispDevol(params.event, L_CLIENTE);
            this.insDispBm(L_CLIENTE, 6, params.event);
            this.actClienteProc(L_CLIENTE, params.event);
          }
        }

        await this.actPagosMue(params.event);
        await this.actRefesMue(params.event);
      } else {
        await this.getParameters({ eventId: params.event, address: 'M' });
        this.G_EVENTO = params.event;
        await this.prepareLot(params.event, 'M');

        if (!params.lot) {
          if (params.phase == 1) {
            await this.actEstLotesMue(params.event);
            await this.borraMuebles(params.event, null, null);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );
            var L7_ACT_F1: any[] = await this.entity
              .query(`SELECT  LOT.ID_CLIENTE, LOT.ID_LOTE
                                                        FROM  sera.COMER_LOTES LOT
                                                        WHERE  LOT.ID_EVENTO = ${params.event}
                                                        AND  EXISTS (SELECT  PRF.ID_LOTE
                                                                        FROM  sera.COMER_PAGOREF PRF
                                                                WHERE  PRF.ID_LOTE = LOT.ID_LOTE
                                                                        AND  PRF.VALIDO_SISTEMA = 'A'
                                                                        AND  PRF.FECHA <= '${params.date}'
                                                                        AND  PRF.REFERENCIA LIKE '1%'
                                                                        )
                                                        AND  EXISTS (SELECT  1
                                                                        FROM  sera.COMER_CLIENTESXEVENTO CXE
                                                                WHERE  CXE.ID_EVENTO = ${params.event}
                                                                        AND  CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                        AND  CXE.PROCESAR = 'S'
                                                                        )
                                                        AND  LOT.PRECIO_FINAL > 0
                                                        AND  LOT.VALIDO_SISTEMA IS NULL`);
            for (const element of L7_ACT_F1) {
              this.DISPERSION = [];
              COMPRA_TOT = await this.llenaLotesAct(
                params.event,
                element.id_cliente,
                element.id_lote,
                params.phase,
              );
              PAGADO_TOT = await this.llenaPagosAct(
                params.event,
                element.id_cliente,
                params.date,
                params.phase,
                params.lot,
              );
              await this.penalizaInmuAct(
                COMPRA_TOT,
                PAGADO_TOT,
                element.id_cliente,
                1,
              );

              this.dispDevol(params.event, element.id_cliente);
              this.insDispBm(element.id_cliente, 6, params.event);
              this.actClienteProc(element.id_cliente, params.event);
            }
          } else if (params.phase == 2) {
            await this.actEstLotesMue(params.event);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );
            var L7_ACT_F2: any[] = await this.entity
              .query(`SELECT  LOT.ID_CLIENTE, LOT.ID_LOTE
                                                FROM sera.COMER_LOTES LOT
                                                WHERE  LOT.ID_EVENTO = ${params.event}
                                                AND  EXISTS (SELECT  PRF.ID_LOTE
                                                                FROM  sera.COMER_PAGOREF PRF
                                                        WHERE  PRF.ID_LOTE = LOT.ID_LOTE
                                                                AND  PRF.VALIDO_SISTEMA = 'A'
                                                                AND  PRF.FECHA <= '${params.date}'
                                                                AND  PRF.REFERENCIA LIKE '2%'
                                                                )
                                                AND  EXISTS (SELECT  1
                                                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                                        WHERE  CXE.ID_EVENTO = ${params.event}
                                                                AND  CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                AND  CXE.PROCESAR = 'S'
                                                                )
                                                AND  LOT.PRECIO_FINAL > 0
                                                AND  (LOT.VALIDO_SISTEMA IS NULL )`);
            for (const element of L7_ACT_F2) {
              this.DISPERSION = [];
              COMPRA_TOT = await this.llenaLotesAct(
                params.event,
                element.id_cliente,
                element.id_lote,
                params.phase,
              );
              PAGADO_TOT = await this.llenaPagosAct(
                params.event,
                element.id_cliente,
                params.date,
                params.phase,
                params.lot,
              );
              await this.penalizaInmuAct(
                COMPRA_TOT,
                PAGADO_TOT,
                element.id_cliente,
                2,
              );
              this.dispDevol(params.event, element.id_cliente);
              this.insDispBm(element.id_cliente, 6, params.event);
              this.actClienteProc(element.id_cliente, params.event);
            }
          } else if (params.phase == 7) {
            await this.actEstLotesMue(params.event);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );
            var L7_ACT_F7: any[] = await this.entity
              .query(`SELECT  LOT.ID_CLIENTE, LOT.ID_LOTE
                                                        FROM  sera.COMER_LOTES LOT
                                                        WHERE  LOT.ID_EVENTO = ${params.event}
                                                        AND  EXISTS (SELECT  PRF.ID_LOTE
                                                                        FROM  sera.COMER_PAGOREF PRF
                                                                WHERE  PRF.ID_LOTE = LOT.ID_LOTE
                                                                        AND  PRF.VALIDO_SISTEMA = 'A'
                                                                        AND  PRF.FECHA <= '${params.date}'
                                                                        AND  PRF.REFERENCIA LIKE '7%'
                                                                        )
                                                        AND  EXISTS (SELECT  1
                                                                        FROM  sera.COMER_CLIENTESXEVENTO CXE
                                                                WHERE  CXE.ID_EVENTO = ${params.event}
                                                                        AND  CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                        AND  CXE.PROCESAR = 'S'
                                                                        )
                                                        AND  LOT.PRECIO_FINAL > 0
                                                        AND  (LOT.VALIDO_SISTEMA IS NULL)`);
            for (const element of L7_ACT_F7) {
              this.DISPERSION = [];
              COMPRA_TOT = await this.llenaLotesAct(
                params.event,
                element.id_cliente,
                element.id_lote,
                params.phase,
              );
              PAGADO_TOT = await this.llenaPagosAct(
                params.event,
                element.id_cliente,
                params.date,
                params.phase,
                params.lot,
              );
              await this.penalizaInmuAct(
                COMPRA_TOT,
                PAGADO_TOT,
                element.id_cliente,
                7,
              );
              this.dispDevol(params.event, element.id_cliente);
              this.insDispBm(element.id_cliente, 6, params.event);
              this.actClienteProc(element.id_cliente, params.event);
            }
          } else if (params.phase == 3) {
            await this.actEstLotesMue(params.event);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );
            var L7_ACT_F3: any[] = await this.entity
              .query(` SELECT  LOT.ID_CLIENTE, LOT.ID_LOTE
                                                FROM  sera.COMER_LOTES LOT
                                                WHERE  LOT.ID_EVENTO = ${params.event}
                                                AND  EXISTS (SELECT  PRF.ID_LOTE
                                                                FROM  sera.COMER_PAGOREF PRF
                                                        WHERE  PRF.ID_LOTE = LOT.ID_LOTE
                                                                AND  PRF.VALIDO_SISTEMA = 'A'
                                                                AND  PRF.FECHA <= '${params.date}'
                                                                AND  PRF.REFERENCIA LIKE '3%'
                                                                )
                                                AND  EXISTS (SELECT  1
                                                                FROM  sera.COMER_CLIENTESXEVENTO CXE
                                                        WHERE  CXE.ID_EVENTO = ${params.event}
                                                                AND  CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                AND  CXE.PROCESAR = 'S'
                                                                )
                                                AND  LOT.PRECIO_FINAL > 0
                                                AND  (LOT.VALIDO_SISTEMA IS NULL)`);
            for (const element of L7_ACT_F3) {
              this.DISPERSION = [];
              COMPRA_TOT = await this.llenaLotesAct(
                params.event,
                element.id_cliente,
                element.id_lote,
                params.phase,
              );
              PAGADO_TOT = await this.llenaPagosAct(
                params.event,
                element.id_cliente,
                params.date,
                params.phase,
                params.lot,
              );
              await this.penalizaInmuAct(
                COMPRA_TOT,
                PAGADO_TOT,
                element.id_cliente,
                3,
              );
              this.insDispBm(element.id_cliente, 6, params.event);
              this.actClienteProc(element.id_cliente, params.event);
            }
          } else if (params.phase == 4) {
            await this.actEstLotesMue(params.event);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );
            var L7_ACT_F4: any[] = await this.entity
              .query(`SELECT  LOT.ID_CLIENTE, LOT.ID_LOTE
                                                FROM  sera.COMER_LOTES LOT
                                                WHERE  LOT.ID_EVENTO = ${params.event}
                                                AND  EXISTS (SELECT  PRF.ID_LOTE
                                                                FROM  sera.COMER_PAGOREF PRF
                                                        WHERE  PRF.ID_LOTE = LOT.ID_LOTE
                                                                AND  PRF.VALIDO_SISTEMA = 'A'
                                                                AND  PRF.FECHA <= '${params.date}'
                                                                AND  PRF.REFERENCIA LIKE '4%'
                                                                )
                                                AND  EXISTS (SELECT  1
                                                                FROM  sera.COMER_CLIENTESXEVENTO CXE
                                                        WHERE  CXE.ID_EVENTO = ${params.event}
                                                                AND  CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                AND  CXE.PROCESAR = 'S'
                                                                )
                                                AND  LOT.PRECIO_FINAL > 0
                                                AND  (LOT.VALIDO_SISTEMA IS NULL )`);
            L7_ACT_F4.forEach(async (element) => {
              this.DISPERSION = [];
              COMPRA_TOT = await this.llenaLotesAct(
                params.event,
                element.id_cliente,
                element.id_lote,
                params.phase,
              );
              PAGADO_TOT = await this.llenaPagosAct(
                params.event,
                element.id_cliente,
                params.date,
                params.phase,
                params.lot,
              );
              await this.penalizaInmuAct(
                COMPRA_TOT,
                PAGADO_TOT,
                element.id_cliente,
                4,
              );
              this.dispDevol(params.event, element.id_cliente);
              this.insDispBm(element.id_cliente, 6, params.event);
              this.actClienteProc(element.id_cliente, params.event);
            });
          } else {
            await this.actEstLotesMue(params.event);
            await this.borraMuebles(params.event, null, null);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );
            const L7: any[] = await this.entity
              .query(` SELECT    DISTINCT LOT.ID_CLIENTE 
                                                FROM    sera.COMER_LOTES LOT
                                                WHERE    LOT.ID_EVENTO = ${params.event}
                                                AND        LOT.ID_LOTE        = coalesce(${params.lot}, LOT.ID_LOTE)
                                                AND        EXISTS (SELECT    PRF.ID_LOTE
                                                                FROM    sera.COMER_PAGOREF PRF
                                                                WHERE    PRF.ID_LOTE = LOT.ID_LOTE
                                                                AND        PRF.VALIDO_SISTEMA = 'A'
                                                                AND        PRF.FECHA <= '${params.date}'
                                                                )
                                                AND        EXISTS (SELECT    1
                                                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                                WHERE    CXE.ID_EVENTO = ${params.event}
                                                                AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                AND        CXE.PROCESAR = 'S'
                                                                )
                                                AND        LOT.PRECIO_FINAL > 0
                                                AND        LOT.VALIDO_SISTEMA IS NULL `);
            for (const element of L7) {
              this.DISPERSION = [];
              COMPRA_TOT = await this.llenaLotesAct(
                params.event,
                element.id_cliente,
                element.id_lote,
                params.phase,
              );
              PAGADO_TOT = await this.llenaPagosAct(
                params.event,
                element.id_cliente,
                params.date,
                params.phase,
                params.lot,
              );
              await this.penalizaInmuAct(
                COMPRA_TOT,
                PAGADO_TOT,
                element.id_cliente,
                3,
              );
              this.pagoLoteAct(element.id_cliente, null, 3);
              this.insDispBm(element.id_cliente, 6, params.event);
              this.actClienteProc(element.id_cliente, params.event);
            }
          }
        } else {
          if (params.phase == 1) {
            await this.actEstLotesMue(params.event);
            await this.borraMuebles(params.event, null, null);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );

            const result = await this.entity
              .query(` SELECT DISTINCT LOT.ID_CLIENTE 
                                                        FROM sera.COMER_LOTES LOT
                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                        AND LOT.ID_LOTE =${params.lot}`);
            L_CLIENTE = result[0].id_cliente;
            this.DISPERSION = [];
            COMPRA_TOT = await this.llenaLotesAct(
              params.event,
              L_CLIENTE,
              params.lot,
              params.phase,
            );
            PAGADO_TOT = await this.llenaPagosAct(
              params.event,
              L_CLIENTE,
              params.date,
              params.phase,
              params.lot,
            );
            await this.penalizaInmuAct(COMPRA_TOT, PAGADO_TOT, L_CLIENTE, 1);
            this.dispDevol(params.event, L_CLIENTE);
            this.insDispBm(L_CLIENTE, 6, params.event);
            this.actClienteProc(L_CLIENTE, params.event);
          } else if (params.phase == 2) {
            await this.actEstLotesMue(params.event);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );

            const result = await this.entity
              .query(` SELECT DISTINCT LOT.ID_CLIENTE 
                                                        FROM sera.COMER_LOTES LOT
                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                        AND LOT.ID_LOTE =${params.lot}`);
            L_CLIENTE = result[0].id_cliente;
            this.DISPERSION = [];
            COMPRA_TOT = await this.llenaLotesAct(
              params.event,
              L_CLIENTE,
              params.lot,
              params.phase,
            );
            PAGADO_TOT = await this.llenaPagosAct(
              params.event,
              L_CLIENTE,
              params.date,
              params.phase,
              params.lot,
            );
            await this.penalizaInmuAct(
              COMPRA_TOT,
              PAGADO_TOT,
              L_CLIENTE,
              params.phase,
            );
            this.dispDevol(params.event, L_CLIENTE);
            this.insDispBm(L_CLIENTE, 6, params.event);
            this.actClienteProc(L_CLIENTE, params.event);
          } else if (params.phase == 3) {
            await this.actEstLotesMue(params.event);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );

            const result = await this.entity
              .query(` SELECT DISTINCT LOT.ID_CLIENTE 
                                                        FROM sera.COMER_LOTES LOT
                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                        AND LOT.ID_LOTE =${params.lot}`);
            L_CLIENTE = result[0].id_cliente;
            this.DISPERSION = [];
            COMPRA_TOT = await this.llenaLotesAct(
              params.event,
              L_CLIENTE,
              params.lot,
              params.phase,
            );
            PAGADO_TOT = await this.llenaPagosAct(
              params.event,
              L_CLIENTE,
              params.date,
              params.phase,
              params.lot,
            );
            await this.penalizaInmuAct(
              COMPRA_TOT,
              PAGADO_TOT,
              L_CLIENTE,
              params.phase,
            );
            this.dispDevol(params.event, L_CLIENTE);
            this.insDispBm(L_CLIENTE, 6, params.event);
            this.actClienteProc(L_CLIENTE, params.event);
          } else if (params.phase == 4) {
            await this.actEstLotesMue(params.event);
            await this.borraMuebles(params.event, null, null);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );

            const result = await this.entity
              .query(` SELECT DISTINCT LOT.ID_CLIENTE 
                                                        FROM sera.COMER_LOTES LOT
                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                        AND LOT.ID_LOTE =${params.lot}`);
            L_CLIENTE = result[0].id_cliente;
            this.DISPERSION = [];
            COMPRA_TOT = await this.llenaLotesAct(
              params.event,
              L_CLIENTE,
              params.lot,
              params.phase,
            );
            PAGADO_TOT = await this.llenaPagosAct(
              params.event,
              L_CLIENTE,
              params.date,
              params.phase,
              params.lot,
            );
            await this.penalizaInmuAct(
              COMPRA_TOT,
              PAGADO_TOT,
              L_CLIENTE,
              params.phase,
            );
            this.dispDevol(params.event, L_CLIENTE);
            this.insDispBm(L_CLIENTE, 6, params.event);
            this.actClienteProc(L_CLIENTE, params.event);
          } else if (params.phase == 7) {
            await this.actEstLotesMue(params.event);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );

            const result = await this.entity
              .query(` SELECT DISTINCT LOT.ID_CLIENTE 
                                                        FROM sera.COMER_LOTES LOT
                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                        AND LOT.ID_LOTE =${params.lot}`);
            L_CLIENTE = result[0].id_cliente;
            this.DISPERSION = [];
            COMPRA_TOT = await this.llenaLotesAct(
              params.event,
              L_CLIENTE,
              params.lot,
              params.phase,
            );
            PAGADO_TOT = await this.llenaPagosAct(
              params.event,
              L_CLIENTE,
              params.date,
              params.phase,
              params.lot,
            );
            await this.penalizaInmuAct(COMPRA_TOT, PAGADO_TOT, L_CLIENTE, 1);
            this.dispDevol(params.event, L_CLIENTE);
            this.insDispBm(L_CLIENTE, 6, params.event);
            this.actClienteProc(L_CLIENTE, params.event);
          } else {
            await this.actEstLotesMue(params.event);
            await this.borraMuebles(params.event, null, null);
            this.G_PKREFGEN = 0;
            await this.ventaInmu1Act(
              params.event,
              params.date,
              null,
              params.phase,
              params.address,
            );

            const result = await this.entity
              .query(` SELECT DISTINCT LOT.ID_CLIENTE 
                                                        FROM sera.COMER_LOTES LOT
                                                        WHERE LOT.ID_EVENTO = ${params.event}
                                                        AND LOT.ID_LOTE =${params.lot}`);
            L_CLIENTE = result[0].id_cliente;
            this.DISPERSION = [];
            COMPRA_TOT = await this.llenaLotesAct(
              params.event,
              L_CLIENTE,
              params.lot,
              params.phase,
            );
            PAGADO_TOT = await this.llenaPagosAct(
              params.event,
              L_CLIENTE,
              params.date,
              params.phase,
              params.lot,
            );
            await this.penalizaInmuAct(
              COMPRA_TOT,
              PAGADO_TOT,
              L_CLIENTE,
              params.phase,
            );
            this.dispDevol(params.event, L_CLIENTE);
            this.insDispBm(L_CLIENTE, 6, params.event);
            this.actClienteProc(L_CLIENTE, params.event);
          }
        }
        await this.actPagosMue(params.event);
        await this.actRefesMue(params.event);
      }
      return { statusCode: 200, message: ['OK'], data: [] };
    } else {
      return { statusCode: 400, message: ['No se encontro el evento.'] };
    }
  }

  async ventaSbm(event: number, date: Date) {
    var L_PARAMETROS = '';
    var L_CLIENTE = 0;
    var j = 0;
    var I = 0;
    var k = 0;
    var t = 0;
    var COMPRA_TOT = 0;
    var PAGADO_TOT = 0;

    await this.getParameters({ eventId: event, address: 'M' });
    this.G_EVENTO = event;

    await this.prepareLot(event, 'M');
    await this.actEstLotesMue(event);
    await this.borraMuebles(event, null, null);
    this.G_PKREFGEN = 0;
    await this.ventaInmu1(event, date, null, null);

    var L7: any[] = await this.entity.query(`SELECT    DISTINCT LOT.ID_CLIENTE
                FROM    sera.COMER_LOTES LOT
                WHERE    LOT.ID_EVENTO = ${event}
                AND        EXISTS (SELECT    PRF.ID_LOTE
                                FROM    sera.COMER_PAGOREF PRF
                                WHERE    PRF.ID_LOTE = LOT.ID_LOTE
                                AND        PRF.VALIDO_SISTEMA = 'A'
                                AND        PRF.FECHA <= '${date}'
                                )
                AND        EXISTS (SELECT    1
                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                WHERE    CXE.ID_EVENTO = ${event}
                                AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND        CXE.PROCESAR = 'S'
                                )
                AND        LOT.PRECIO_FINAL > 0
                AND        (LOT.VALIDO_SISTEMA IS NULL)
                `);
    for (const element of L7) {
      this.DISPERSION = [];

      COMPRA_TOT = await this.llenaLotes(event, element.id_cliente, null, null);
      PAGADO_TOT = await this.llenaPagos(event, element.id_cliente, date, null);
      await this.penalizaInmu(COMPRA_TOT, PAGADO_TOT, element.id_cliente, null);
      this.pagoALote(element.id_cliente, null, 2);
      await this.insDispBm(element.id_cliente, 6, event);
      await this.actClienteProc(element.id_cliente, event);
    }

    await this.actPagosMue(event);
    await this.actRefesMue(event);

    return {
      statusCode: 200,
      message: ['OK'],
      data: {
        COMPRA_TOT,
        PAGADO_TOT,
        L7,
      },
    };
  }

  async actLotes(event: number) {
    await this.entity.query(` UPDATE    sera.COMER_LOTES LOT
                        SET    VALIDO_SISTEMA = 'S',
                                        ID_ESTATUSVTA = 'PAG'
                        WHERE    ID_EVENTO = ${event}
                        AND        EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${event}
                                        AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND        CXE.PROCESAR = 'S'
                                        AND     CXE.ENVIADO_SIRSAE = 'N'
                                        )
                        AND        VALIDO_SISTEMA IS NULL
                        AND        LOTE_PUBLICO != 0
                        AND        EXISTS (SELECT    1
                                        FROM    sera.COMER_PAGOSREFGENS GEN
                                        WHERE    GEN.ID_EVENTO = ${event}
                                        AND        GEN.TIPO = 'N'
                                        AND        GEN.ID_LOTE =LOT.ID_LOTE
                                        )`);
    await this.entity.query(`UPDATE sera.bien  BIE
                                SET    ESTATUS = (    SELECT    ESP.ESTATUS_FINAL
                                                FROM    sera.ESTATUS_X_PANTALLA ESP
                                                WHERE    CVE_PANTALLA = 'VTAMUETOT'
                                                AND        ESP.ESTATUS = BIE.ESTATUS
                                AND ESP.PROCESO_EXT_DOM = BIE.PROCESO_EXT_DOM
                                                        )
                                WHERE    EXISTS (SELECT    BXL.NO_BIEN
                                        FROM    sera.COMER_BIENESXLOTE BXL
                                        WHERE    EXISTS (SELECT    1
                                                        FROM    sera.COMER_LOTES LOT
                                                        WHERE    LOT.ID_EVENTO = ${event}
                                                        AND        LOT.ID_ESTATUSVTA = 'PAG'
                                                        AND        BXL.ID_LOTE = LOT.ID_LOTE
                                                        AND        EXISTS (SELECT    1
                                                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                                        WHERE    CXE.ID_EVENTO = ${event}
                                                                        AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                                        AND        CXE.PROCESAR = 'S'
                                                                        AND     CXE.ENVIADO_SIRSAE = 'N'
                                                                        )
                                                        )
                                        AND        BXL.NO_BIEN = BIE.NO_BIEN
                                        )`);
    await this.entity.query(`UPDATE    sera.COMER_LOTES LOT
                                SET    VALIDO_SISTEMA = 'S', ID_ESTATUSVTA = 'CAN'
                                WHERE    ID_EVENTO     = ${event}
                                AND        EXISTS (SELECT    1
                                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE    CXE.ID_EVENTO = ${event}
                                                AND        CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND        CXE.PROCESAR = 'S'
                                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                                )
                                AND        VALIDO_SISTEMA IS NULL
                                AND        LOTE_PUBLICO != 0
                                AND        EXISTS (SELECT    1
                                        FROM    sera.COMER_PAGOSREFGENS GEN
                                        WHERE    GEN.ID_EVENTO = ${event}
                                        AND        GEN.TIPO = 'P'
                                        AND        GEN.ID_LOTE = LOT.ID_LOTE
                            )`);
    await this.entity.query(`UPDATE    sera.bien BIE
                        SET    ESTATUS = ( SELECT    ESTATUS_ANT
                         FROM     sera.COMER_BIENESXLOTE BXL2
                            WHERE    BXL2.NO_BIEN = BIE.NO_BIEN
                            AND    EXISTS (SELECT    1
                                    FROM    sera.COMER_LOTES LOT
                                    WHERE    LOT.ID_EVENTO = ${event}
                                    AND    LOT.ID_ESTATUSVTA = 'CAN'
                                    AND    BXL2.ID_LOTE = LOT.ID_LOTE
                                    AND    EXISTS (SELECT    1
                                            FROM    sera.COMER_CLIENTESXEVENTO CXE
                                            WHERE    CXE.ID_EVENTO = ${event}
                                            AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                            AND    CXE.PROCESAR = 'S'
                                            AND     CXE.ENVIADO_SIRSAE = 'N'
                                            )
                                    )
                            AND    BXL2.ID_EVENTO_REMESA IS NULL
                         )
                        WHERE    EXISTS (SELECT    1
                                FROM    sera.COMER_BIENESXLOTE BXL
                                WHERE    EXISTS (SELECT    1
                                        FROM    sera.COMER_LOTES LOT
                                        WHERE    LOT.ID_EVENTO = ${event}
                                        AND    LOT.ID_ESTATUSVTA = 'CAN'
                                        AND    BXL.ID_LOTE = LOT.ID_LOTE
                                        AND    EXISTS (SELECT    1
                                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE    CXE.ID_EVENTO = ${event}
                                                AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND    CXE.PROCESAR = 'S'
                                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                                )
                                        )
                                AND    BIE.NO_BIEN = BXL.NO_BIEN
                                AND    BXL.ID_EVENTO_REMESA IS NULL
                     )`);
    await this.entity.query(` UPDATE    sera.COMER_BIENESXLOTE  BXL
                        SET    ID_EVENTO_COMER = NULL, ID_LOTE_COMER = NULL, VENDIDO = NULL, SELECCIONADO = NULL
                        WHERE    EXISTS (SELECT    1
                                FROM    sera.COMER_BIENESXLOTE BXL2
                                WHERE    BXL2.NO_BIEN = BXL.NO_BIEN
                                AND    EXISTS (SELECT    1
                                        FROM    sera.COMER_LOTES LOT
                                        WHERE    LOT.ID_EVENTO = ${event}
                                        AND    LOT.ID_ESTATUSVTA = 'CAN'
                                        AND    BXL2.ID_LOTE = LOT.ID_LOTE
                                        AND    EXISTS (SELECT    1
                                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE    CXE.ID_EVENTO = ${event}
                                                AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND    CXE.PROCESAR = 'S'
                                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                                )
                                        )
                                AND    BXL2.ID_EVENTO_REMESA IS NOT NULL
                                )
                        AND    ID_EVENTO_COMER IS NOT NULL`);
    await this.entity.query(`UPDATE    sera.COMER_LOTES  LOT
                        SET    VALIDO_SISTEMA = 'S', ID_ESTATUSVTA = 'DES'
                        WHERE    NOT EXISTS (    SELECT    1
                                FROM    sera.COMER_PAGOSREFGENS GEN
                                WHERE    GEN.ID_EVENTO = ${event}
                                AND    LOT.ID_LOTE = GEN.ID_LOTE
                                )
                        AND    EXISTS (SELECT    1
                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                WHERE    CXE.ID_EVENTO = ${event}
                                AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND    CXE.PROCESAR = 'S'
                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                )
                        AND    ID_EVENTO = ${event}
                        AND    LOTE_PUBLICO != 0`);
    await this.entity.query(` UPDATE    sera.COMER_LOTES LOT
                        SET    VALIDO_SISTEMA = 'S', ID_ESTATUSVTA = 'DES'
                        WHERE    NOT EXISTS (    SELECT    1
                                FROM    sera.COMER_PAGOSREFGENS GEN
                                WHERE    GEN.ID_EVENTO = ${event}
                                AND   LOT.ID_LOTE = GEN.ID_LOTE
                                )
                        AND    ID_EVENTO = ${event}
                        AND    LOTE_PUBLICO != 0
                        AND    ID_CLIENTE IS NULL
                        AND    ID_ESTATUSVTA != 'DES'`);
    await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE BXL
                        SET    ID_EVENTO_COMER = NULL, ID_LOTE_COMER = NULL, VENDIDO = NULL, SELECCIONADO = NULL
                        WHERE    EXISTS (SELECT    1
                                FROM    sera.COMER_BIENESXLOTE BXL2
                                WHERE    BXL2.NO_BIEN = BXL.NO_BIEN
                                AND    EXISTS (SELECT    1
                                        FROM    sera.COMER_LOTES LOT
                                        WHERE    LOT.ID_EVENTO = ${event}
                                        AND    LOT.ID_ESTATUSVTA = 'DES'
                                        AND    BXL2.ID_LOTE = LOT.ID_LOTE
                                        AND    EXISTS (SELECT    1
                                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                                WHERE    CXE.ID_EVENTO = ${event}
                                                AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                AND    CXE.PROCESAR = 'S'
                                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                                )
                                        )
                                AND    BXL2.ID_EVENTO_REMESA IS NOT NULL
                                )
                        AND    ID_EVENTO_COMER IS NOT NULL`);
    await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE BXL
                        SET    ID_EVENTO_COMER = NULL, ID_LOTE_COMER = NULL, VENDIDO = NULL, SELECCIONADO = NULL
                        WHERE    EXISTS (SELECT    1
                                FROM    sera.COMER_BIENESXLOTE BXL2
                                WHERE    BXL2.NO_BIEN = BXL.NO_BIEN
                                AND    EXISTS (SELECT    1
                                        FROM    sera.COMER_LOTES LOT
                                        WHERE    LOT.ID_EVENTO = ${event}
                                        AND    LOT.ID_ESTATUSVTA = 'DES'
                                        AND    BXL2.ID_LOTE = LOT.ID_LOTE
                                        AND    LOT.ID_CLIENTE IS NULL
                                        )
                                AND    BXL2.ID_EVENTO_REMESA IS NOT NULL
                                )
                        AND    ID_EVENTO_COMER IS NOT NULL`);
    await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE BXL
                        SET    ID_EVENTO_COMER = NULL, ID_LOTE_COMER = NULL, VENDIDO = NULL, SELECCIONADO = NULL
                        WHERE    EXISTS (SELECT    1
                                FROM    sera.COMER_BIENESXLOTE BXL2
                                WHERE    BXL2.NO_BIEN = BXL.NO_BIEN
                                AND    EXISTS (SELECT    1
                                        FROM    sera.COMER_LOTES LOT
                                        WHERE    LOT.ID_EVENTO = ${event}
                                        AND    LOT.ID_ESTATUSVTA = 'DES'
                                        AND    BXL2.ID_LOTE = LOT.ID_LOTE
                                        AND    LOT.ID_CLIENTE IS NULL
                                        )
                                AND    BXL2.ID_EVENTO_REMESA IS NOT NULL
                                )
                        AND    ID_EVENTO_COMER IS NULL`);
    await this.entity.query(`UPDATE    sera.bien BIE
                SET    ESTATUS = ( SELECT    ESTATUS_ANT
                         FROM     sera.COMER_BIENESXLOTE BXL2
                            WHERE    BXL2.NO_BIEN = BIE.NO_BIEN
                            AND    EXISTS (SELECT    1
                                    FROM    sera.COMER_LOTES LOT2
                                    WHERE    LOT2.ID_EVENTO = ${event}
                                    AND    LOT2.ID_ESTATUSVTA = 'DES'
                                    AND    BXL2.ID_LOTE = LOT2.ID_LOTE
                                    AND    EXISTS (SELECT    1
                                            FROM    sera.COMER_CLIENTESXEVENTO CXE
                                            WHERE    CXE.ID_EVENTO = ${event}
                                            AND    CXE.ID_CLIENTE = LOT2.ID_CLIENTE
                                            AND    CXE.PROCESAR = 'S'
                                            AND     CXE.ENVIADO_SIRSAE = 'N'
                                            )
                                    )
                            AND    BXL2.ID_EVENTO_REMESA IS NULL
                         )
                WHERE    EXISTS (SELECT    1
                        FROM    sera.COMER_BIENESXLOTE BXL
                        WHERE    EXISTS (SELECT    1
                                FROM    sera.COMER_LOTES LOT
                                WHERE    LOT.ID_EVENTO = ${event}
                                AND    LOT.ID_ESTATUSVTA = 'DES'
                                AND    BXL.ID_LOTE = LOT.ID_LOTE
                                AND    EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${event}
                                        AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND    CXE.PROCESAR = 'S'
                                        AND     CXE.ENVIADO_SIRSAE = 'N'
                                        )
                                )
                        AND    BIE.NO_BIEN = BXL.NO_BIEN
                        AND    BXL.ID_EVENTO_REMESA IS NULL
                     )`);
    await this.entity.query(`
                        UPDATE    sera.bien BIE
                        SET    ESTATUS = ( SELECT    ESTATUS_ANT
                                FROM     sera.COMER_BIENESXLOTE BXL2
                                WHERE    BXL2.NO_BIEN = BIE.NO_BIEN
                                AND    EXISTS (SELECT    1
                                        FROM    sera.COMER_LOTES LOT2
                                        WHERE    LOT2.ID_EVENTO = ${event}
                                        AND    LOT2.ID_ESTATUSVTA = 'DES'
                                        AND    BXL2.ID_LOTE = LOT2.ID_LOTE
                                        AND    LOT2.ID_CLIENTE IS NULL
                                        )
                                AND    BXL2.ID_EVENTO_REMESA IS NULL
                                )
                        WHERE    EXISTS (SELECT    1
                                FROM    sera.COMER_BIENESXLOTE BXL
                                WHERE    EXISTS (SELECT    1
                                        FROM    sera.COMER_LOTES LOT
                                        WHERE    LOT.ID_EVENTO = ${event}
                                        AND    LOT.ID_ESTATUSVTA = 'DES'
                                        AND    BXL.ID_LOTE = LOT.ID_LOTE
                                        AND    LOT.ID_CLIENTE IS NULL
                                        )
                                AND   BIE.NO_BIEN = BXL.NO_BIEN
                                AND    BXL.ID_EVENTO_REMESA IS NULL
             )`);
  }

  async remesas(event: number) {
    var R_EVENTO = 0;
    var R_IDBXLREM = 0;
    var R_IDLOTREM = 0;
    var R_BIENESDISPO = 0;

    var R1: any[] = await this.entity
      .query(`SELECT    BXL.ID_BIENXLOTE_REMESA as remesa, BXL.ID_LOTE       
                FROM    sera.COMER_BIENESXLOTE BXL, sera.bien BIE
                WHERE    BXL.NO_BIEN = BIE.NO_BIEN
                AND    EXISTS (SELECT    1
                        FROM    sera.COMER_LOTES LOT
                        WHERE    LOT.ID_EVENTO = ${event}
                        AND    BXL.ID_LOTE = LOT.ID_LOTE
                        AND    LOT.ID_ESTATUSVTA = 'PAG'
                        AND    EXISTS (SELECT    1
                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                WHERE    CXE.ID_EVENTO = ${event}
                                AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND    CXE.PROCESAR = 'S'
                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                )
                        )
                AND    BIE.ESTATUS IN ('VTR', 'VPT')
                AND    BXL.ID_BIENXLOTE_REMESA IS NOT NULL`);

    R1.forEach(async (element) => {
      await this.entity.query(` UPDATE    sera.COMER_BIENESXLOTE
                        SET    VENDIDO = 'S'
                        WHERE    ID_LOTE = ${element.id_lote}
                        AND    ID_BIENXLOTE = ${element.remesa}`);
    });

    var R2: any[] = await this.entity
      .query(` SELECT    DISTINCT BXL.ID_EVENTO_REMESA 
                FROM    sera.COMER_BIENESXLOTE BXL
                WHERE    EXISTS (SELECT    1
                        FROM    sera.COMER_LOTES LOT
                        WHERE    LOT.ID_EVENTO = ${event}
                        AND    BXL.ID_LOTE = LOT.ID_LOTE
                        AND    EXISTS (SELECT    1
                                FROM    sera.COMER_CLIENTESXEVENTO CXE
                                WHERE    CXE.ID_EVENTO = ${event}
                                AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND    CXE.PROCESAR = 'S'
                                AND     CXE.ENVIADO_SIRSAE = 'N'
                                )
                        )
                AND    BXL.ID_BIENXLOTE_REMESA IS NOT NULL`);

    for (const element of R2) {
      var result = await this.entity
        .query(`SELECT    coalesce(COUNT(*),0) as total 
                        FROM    sera.COMER_BIENESXLOTE BXL2
                        WHERE    EXISTS (SELECT    1
                                FROM    sera.COMER_LOTES LOT
                                WHERE    LOT.ID_EVENTO = ${element.id_evento_remesa}
                                AND    LOT.ID_LOTE = BXL2.ID_LOTE
                                )
                        AND    VENDIDO IS NULL`);
      R_BIENESDISPO = result[0].total || 0;
      if (R_BIENESDISPO == 0) {
        await this.entity.query(` UPDATE    sera.COMER_EVENTOS 
                                SET    ID_ESTATUSVTA = 'NDIS'
                                WHERE    ID_EVENTO = ${element.id_evento_remesa}`);
      }
    }
  }
  /**
   *
   * @procedure REMESASMUE_ACT
   */
  async remittancesCurrentGoods(data: UpdateCurrentGeneralStatus) {
    let R1 = await this.entity
      .query(`SELECT BXL.ID_BIENXLOTE_REMESA, BXL.ID_LOTE_REMESA
                        FROM sera.COMER_BIENESXLOTE BXL
                        JOIN sera.BIEN BIE ON BXL.NO_BIEN = BIE.NO_BIEN
                        JOIN sera.COMER_LOTES LOT ON LOT.ID_LOTE = BXL.ID_LOTE
                        WHERE LOT.ID_ESTATUSVTA = 'PAG'
                        AND BXL.ID_BIENXLOTE_REMESA IS NOT NULL
                        AND EXISTS (
                        SELECT 1
                        FROM sera.COMER_LOTES LOT2
                        WHERE LOT2.ID_EVENTO = ${data.event}
                        AND LOT2.ID_LOTE = ${data.lot}
                        AND BXL.ID_LOTE = LOT2.ID_LOTE
                        AND EXISTS (
                                SELECT 1
                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                WHERE CXE.ID_EVENTO = ${data.event}
                                AND CXE.ID_CLIENTE = LOT2.ID_CLIENTE
                                AND CXE.PROCESAR = 'S'
                                AND CXE.ENVIADO_SIRSAE = 'N'
                        )
                        );
                `);
    let R2 = await this.entity.query(`
                        SELECT DISTINCT BXL.ID_EVENTO_REMESA as event
                        FROM sera.COMER_BIENESXLOTE BXL
                        WHERE BXL.ID_BIENXLOTE_REMESA IS NOT NULL
                        AND EXISTS (
                        SELECT 1
                        FROM sera.COMER_LOTES LOT
                        WHERE
                        LOT.ID_LOTE = ${data.lot}
                        AND BXL.ID_LOTE = LOT.ID_LOTE
                        and  LOT.ID_EVENTO = ${data.event}
                        AND EXISTS (
                                SELECT 1
                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                WHERE CXE.ID_EVENTO = ${data.event}
                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND CXE.PROCESAR = 'S'
                                AND CXE.ENVIADO_SIRSAE = 'N'
                        )
                        );
                `);
    var R_EVENTO: number;
    var R_IDBXLREM: number;
    var R_IDLOTREM: number;
    var R_BIENESDISPO = 0;
    for (const iterator of R1) {
      await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE
                        SET    VENDIDO = 'S'
                        WHERE    ID_LOTE = ${iterator.id_lote_remesa}
                        AND    ID_BIENXLOTE =${iterator.id_bienxlote_remesa}`);
    }
    for (const iterator of R2) {
      let count =
        (
          await this.entity.query(`
                                SELECT    COUNT(*) val1
                                FROM    sera.COMER_BIENESXLOTE BXL2
                                WHERE    EXISTS (SELECT    1
                                        FROM    sera.COMER_LOTES LOT
                                        WHERE    LOT.ID_EVENTO = ${iterator.event}
                                        AND    LOT.ID_LOTE = BXL2.ID_LOTE
                                        )
                                AND    VENDIDO IS NULL
                        `)
        )[0]?.val1 || 0;
      if (count > 0) {
        await this.entity.query(` UPDATE    sera.COMER_EVENTOS EVE
                                SET    EVE.ID_ESTATUSVTA = 'NDIS'
                                WHERE    EVE.ID_EVENTO = ${iterator.event}`);
      }
    }
    return {
      statusCode: 200,
      message: ['OK'],
    };
  }

  /**
   *
   * @procedure REMESASMUE
   */
  async remittancesGoods(event: number) {
    let R1 = await this.entity
      .query(`SELECT BXL.ID_BIENXLOTE_REMESA, BXL.ID_LOTE_REMESA
                        FROM sera.COMER_BIENESXLOTE BXL
                        INNER JOIN sera.BIEN BIE ON BXL.NO_BIEN = BIE.NO_BIEN
                        INNER JOIN sera.COMER_LOTES LOT ON LOT.ID_LOTE = BXL.ID_LOTE
                        WHERE EXISTS (
                        SELECT 1
                        FROM sera.COMER_LOTES LOT
                        WHERE LOT.ID_EVENTO = ${event}
                        AND BXL.ID_LOTE = LOT.ID_LOTE
                        AND EXISTS (
                                SELECT 1
                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                WHERE CXE.ID_EVENTO = ${event}
                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND CXE.PROCESAR = 'S'
                                AND CXE.ENVIADO_SIRSAE = 'N'
                        )
                        )
                        AND LOT.ID_ESTATUSVTA = 'PAG'
                        AND BXL.ID_BIENXLOTE_REMESA IS NOT NULL;
                
                `);
    let R2 = await this.entity.query(`
                        SELECT DISTINCT BXL.ID_EVENTO_REMESA as event
                        FROM sera.COMER_BIENESXLOTE BXL
                        WHERE BXL.ID_BIENXLOTE_REMESA IS NOT NULL
                        AND EXISTS (
                                SELECT 1
                                FROM sera.COMER_LOTES LOT
                                WHERE
                                LOT.ID_LOTE = BXL.id_lote
                                AND BXL.ID_LOTE = LOT.ID_LOTE
                                and  LOT.ID_EVENTO = ${event}
                                AND EXISTS (
                                        SELECT 1
                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE CXE.ID_EVENTO = ${event}
                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND CXE.PROCESAR = 'S'
                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                )
                        );
                `);
    var R_BIENESDISPO = 0;
    for (const iterator of R1) {
      await this.entity.query(`UPDATE    sera.COMER_BIENESXLOTE
                        SET    VENDIDO = 'S'
                        WHERE    ID_LOTE = ${iterator.id_lote_remesa}
                        AND    ID_BIENXLOTE =${iterator.id_bienxlote_remesa}`);
    }
    for (const iterator of R2) {
      let count =
        (
          await this.entity.query(`
                                SELECT    COUNT(*) val1
                                FROM    sera.COMER_BIENESXLOTE BXL2
                                WHERE    EXISTS (SELECT    1
                                        FROM    sera.COMER_LOTES LOT
                                        WHERE    LOT.ID_EVENTO = ${iterator.event}
                                        AND    LOT.ID_LOTE = BXL2.ID_LOTE
                                        )
                                AND    VENDIDO IS NULL
                        `)
        )[0]?.val1 || 0;
      if (count > 0) {
        await this.entity.query(` UPDATE    sera.COMER_EVENTOS EVE
                                SET    EVE.ID_ESTATUSVTA = 'NDIS'
                                WHERE    EVE.ID_EVENTO = ${iterator.event}`);
      }
    }
    return {
      statusCode: 200,
      message: ['OK'],
    };
  }

  /**
   * @procedure HISTORICO_ACT
   */
  async currentHistoric(data: UpdateCurrentGeneralStatus) {
    var H1 = await this.entity.query(`
                        SELECT BXL.NO_BIEN, BIE.ESTATUS        
                        FROM sera.COMER_BIENESXLOTE BXL
                        INNER JOIN sera.BIEN BIE ON BXL.NO_BIEN = BIE.NO_BIEN
                        WHERE EXISTS (
                        SELECT 1
                        FROM sera.COMER_LOTES LOT
                        WHERE LOT.ID_EVENTO = ${data.event}
                        AND LOT.ID_LOTE = ${data.lot}
                        AND BXL.ID_LOTE = LOT.ID_LOTE
                        AND EXISTS (
                                SELECT 1
                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                WHERE CXE.ID_EVENTO = ${data.event}
                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND CXE.PROCESAR = 'S'
                                AND CXE.ENVIADO_SIRSAE = 'N'
                        )
                        )
                        AND EXISTS (
                        SELECT 1
                        FROM sera.COMER_LOTES LOT2
                        WHERE LOT2.ID_LOTE = BXL.ID_LOTE
                        AND LOT2.ID_ESTATUSVTA = 'PAG'
                        )
                        AND BXL.ID_EVENTO_REMESA IS NOT NULL
                        
                        UNION
                        
                        SELECT BXL.NO_BIEN, BIE.ESTATUS
                        FROM sera.COMER_BIENESXLOTE BXL
                        INNER JOIN sera.BIEN BIE ON BXL.NO_BIEN = BIE.NO_BIEN
                        WHERE EXISTS (
                        SELECT 1
                        FROM sera.COMER_LOTES LOT
                        WHERE LOT.ID_EVENTO = ${data.event}
                        AND LOT.ID_LOTE =  ${data.lot}
                        AND BXL.ID_LOTE = LOT.ID_LOTE
                        AND LOT.ID_CLIENTE IS NOT NULL
                        AND LOT.LOTE_PUBLICO != 0
                        AND EXISTS (
                                SELECT 1
                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                WHERE CXE.ID_EVENTO = ${data.event}
                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND CXE.PROCESAR = 'S'
                                AND CXE.ENVIADO_SIRSAE = 'N'
                        )
                        )
                        AND BXL.ID_EVENTO_REMESA IS NULL
                        
                        UNION
                        
                        SELECT BXL.NO_BIEN, BIE.ESTATUS
                        FROM sera.COMER_BIENESXLOTE BXL
                        INNER JOIN sera.BIEN BIE ON BXL.NO_BIEN = BIE.NO_BIEN
                        WHERE EXISTS (
                        SELECT 1
                        FROM sera.COMER_LOTES LOT
                        WHERE LOT.ID_EVENTO = ${data.event}
                        AND LOT.ID_LOTE =  ${data.lot}
                        AND BXL.ID_LOTE = LOT.ID_LOTE
                        AND LOT.ID_CLIENTE IS NULL
                        )
                        AND BXL.ID_EVENTO_REMESA IS NULL;
                
                `);
    var H_PROGRAMA = 'FCOMER612';
    if (data.address == 'I') {
      H_PROGRAMA = 'FCOMER612_I';
    }
    var errores = [];
    for (const iterator of H1) {
      try {
        await this.entity.query(`
                                INSERT INTO sera.HISTORICO_ESTATUS_BIEN
                                (NO_BIEN, ESTATUS,     FEC_CAMBIO,     USUARIO_CAMBIO, PROGRAMA_CAMBIO_ESTATUS, MOTIVO_CAMBIO)
                                VALUES
                                (${iterator.no_bien}, '${iterator.estatus}',    current_date, '${data.user}',         '${H_PROGRAMA}',         'AUTOMATICO')
                                `);
      } catch (error) {
        errores.push(`Bien duplicado ${iterator.no_bien}`);
      }
    }
    return {
      statusCode: 200,
      message: errores,
    };
  }

  /**
   *
   * @procedure HISTORICO
   * @returns
   */
  async historic(data: { event: number; address: string; user: string }) {
    var H1 = await this.entity.query(`
                        SELECT BXL.NO_BIEN, BIE.ESTATUS
                        FROM sera.COMER_BIENESXLOTE BXL
                        INNER JOIN sera.BIEN BIE ON BXL.NO_BIEN = BIE.NO_BIEN
                        WHERE EXISTS (
                        SELECT 1
                        FROM sera.COMER_LOTES LOT
                        WHERE LOT.ID_EVENTO = ${data.event}
                        AND BXL.ID_LOTE = LOT.ID_LOTE
                        AND EXISTS (
                                SELECT 1
                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                WHERE CXE.ID_EVENTO = ${data.event}
                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND CXE.PROCESAR = 'S'
                                AND CXE.ENVIADO_SIRSAE = 'N'
                        )
                        )
                        AND EXISTS (
                        SELECT 1
                        FROM sera.COMER_LOTES LOT2
                        WHERE LOT2.ID_LOTE = BXL.ID_LOTE
                        AND LOT2.ID_ESTATUSVTA = 'PAG'
                        )
                        AND BXL.ID_EVENTO_REMESA IS NOT NULL
                        
                        UNION
                        
                        SELECT BXL.NO_BIEN, BIE.ESTATUS
                        FROM sera.COMER_BIENESXLOTE BXL
                        INNER JOIN sera.BIEN BIE ON BXL.NO_BIEN = BIE.NO_BIEN
                        WHERE EXISTS (
                        SELECT 1
                        FROM sera.COMER_LOTES LOT
                        WHERE LOT.ID_EVENTO = ${data.event}
                        AND BXL.ID_LOTE = LOT.ID_LOTE
                        AND LOT.ID_CLIENTE IS NOT NULL
                        AND LOT.LOTE_PUBLICO != 0
                        AND EXISTS (
                                SELECT 1
                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                WHERE CXE.ID_EVENTO = ${data.event}
                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND CXE.PROCESAR = 'S'
                                AND CXE.ENVIADO_SIRSAE = 'N'
                        )
                        )
                        AND BXL.ID_EVENTO_REMESA IS NULL
                        
                        UNION
                        
                        SELECT BXL.NO_BIEN, BIE.ESTATUS
                        FROM sera.COMER_BIENESXLOTE BXL
                        INNER JOIN sera.BIEN BIE ON BXL.NO_BIEN = BIE.NO_BIEN
                        WHERE EXISTS (
                        SELECT 1
                        FROM sera.COMER_LOTES LOT
                        WHERE LOT.ID_EVENTO = ${data.event}
                        AND BXL.ID_LOTE = LOT.ID_LOTE
                        AND LOT.ID_CLIENTE IS NULL
                        )
                        AND BXL.ID_EVENTO_REMESA IS NULL
                
                `);
    var H_PROGRAMA = 'FCOMER612';
    if (data.address == 'I') {
      H_PROGRAMA = 'FCOMER612_I';
    }
    var errores = [];
    for (const iterator of H1) {
      try {
        await this.entity.query(`
                                INSERT INTO sera.HISTORICO_ESTATUS_BIEN
                                (NO_BIEN, ESTATUS,     FEC_CAMBIO,     USUARIO_CAMBIO, PROGRAMA_CAMBIO_ESTATUS, MOTIVO_CAMBIO)
                                VALUES
                                (${iterator.no_bien}, '${iterator.estatus}',    current_date, '${data.user}',         '${H_PROGRAMA}',         'AUTOMATICO')
                                `);
      } catch (error) {
        errores.push(`Bien duplicado ${iterator.no_bien}`);
      }
    }
    return {
      statusCode: 200,
      message: errores,
    };
  }

  /**
   * @procedure ACT_LOTES_BASES
   */
  async updateLotBase(event: number) {
    await this.entity.query(`
                        update
                        sera.COMER_LOTES LOT
                        set
                                VALIDO_SISTEMA = 'S'
                                , ID_ESTATUSVTA = 'PAG'
                        where
                                LOT.ID_EVENTO =  ${event}
                                and exists (
                                        select
                                                1
                                        from
                                                sera.COMER_CLIENTESXEVENTO CXE
                                        where
                                                CXE.ID_EVENTO =  ${event}
                                                and CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                and CXE.PROCESAR = 'S'
                                                and CXE.ENVIADO_SIRSAE = 'N'
                                )
                                and VALIDO_SISTEMA is null
                                and LOTE_PUBLICO != 0
                                and exists (
                                        select
                                                1
                                        from
                                                sera.COMER_PAGOSREFGENS GEN
                                        where
                                                GEN.ID_EVENTO = ${event}
                                                and GEN.TIPO = 'N'
                                                and GEN.ID_LOTE = LOT.ID_LOTE
                                )
                `);

    await this.entity.query(`
                        update
                        sera.COMER_LOTES LOT
                        set
                                VALIDO_SISTEMA = 'S'
                                , ID_ESTATUSVTA = 'CAN'
                        where
                                LOT.ID_EVENTO =  ${event}
                                and exists (
                                        select
                                                1
                                        from
                                                sera.COMER_CLIENTESXEVENTO CXE
                                        where
                                                CXE.ID_EVENTO =  ${event}
                                                and CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                and CXE.PROCESAR = 'S'
                                                and CXE.ENVIADO_SIRSAE = 'N'
                                )
                                and VALIDO_SISTEMA is null
                                and LOTE_PUBLICO != 0
                                and exists (
                                        select
                                                1
                                        from
                                                sera.COMER_PAGOSREFGENS GEN
                                        where
                                                GEN.ID_EVENTO = ${event}
                                                and GEN.TIPO = 'P'
                                                and GEN.ID_LOTE = LOT.ID_LOTE
                                )
                `);
    await this.entity.query(`
                update
                        sera.COMER_LOTES LOT
                        
                        set
                                VALIDO_SISTEMA = 'S'
                                , ID_ESTATUSVTA = 'DES'
                        where
                                not exists (
                                        select
                                                1
                                        from
                                                sera.COMER_PAGOSREFGENS GEN
                                        where
                                                GEN.ID_EVENTO = ${event}
                                                and LOT.ID_LOTE = GEN.ID_LOTE
                                )
                                and exists (
                                        select
                                                1
                                        from
                                                sera.COMER_CLIENTESXEVENTO CXE
                                        where
                                                CXE.ID_EVENTO =  ${event}
                                                and CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                and CXE.PROCESAR = 'S'
                                                and CXE.ENVIADO_SIRSAE = 'N'
                        )
                `);
    await this.entity.query(`
                update
                        sera.COMER_LOTES LOT
                        set
                                VALIDO_SISTEMA = 'S'
                                , ID_ESTATUSVTA = 'DES'
                        where
                                not exists (
                                        select
                                                1
                                        from
                                                sera.COMER_PAGOSREFGENS GEN
                                        where
                                                GEN.ID_EVENTO = ${event}
                                                and LOT.ID_LOTE = GEN.ID_LOTE
                                )
                                and exists (
                                        select
                                                1
                                        from
                                                sera.COMER_CLIENTESXEVENTO CXE
                                        where
                                                CXE.ID_EVENTO = ${event}
                                                and CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                                and CXE.PROCESAR = 'S'
                                                and CXE.ENVIADO_SIRSAE = 'N'
                                )
                                and LOT.ID_EVENTO = ${event}
                                and LOT.LOTE_PUBLICO != 0
                `);
    await this.entity.query(`
                update
                                sera.COMER_LOTES LOT
                        set
                                VALIDO_SISTEMA = 'S'
                                , ID_ESTATUSVTA = 'DES'
                        where
                                not exists (
                                        select
                                                1
                                        from
                                                sera.COMER_PAGOSREFGENS GEN
                                        where
                                                GEN.ID_EVENTO = ${event}
                                                and LOT.ID_LOTE = GEN.ID_LOTE
                                )
                                and ID_EVENTO = ${event}
                                and LOTE_PUBLICO != 0
                                and ID_CLIENTE is null
                                and ID_ESTATUSVTA != 'DES';
                `);
    return {
      statusCode: 200,
      message: ['OK'],
    };
  }

  /**
   * @procedure ACT_EST_GRAL_ACT
   */
  async updateCurrentGeneralStatus(data: UpdateCurrentGeneralStatus) {
    try {
      data.address = 'M';
      await this.actLotAct(data);
      await this.remittancesCurrentGoods(data);
      await this.currentHistoric(data);
      await this.currentBlackList(data);
      return {
        statusCode: 200,
        message: ['OK'],
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message]
      }
    }
  }

  /**
   * @procedure ACT_EST_GRAL
   */
  async updateGeneralStatus(event: number, user: string) {
    try {
      await this.actLotes(event);
      await this.remittancesGoods(event);
      await this.historic({ event: event, address: 'M', user: user });
      await this.blackList(event);
      return {
        statusCode: 200,
        message: ['OK'],
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message]
      }
    }
  }

  /**
   * @procedure ACT_EST_BASES
   */
  async updateStatusBase(event: number) {
    await this.updateLotBase(event);
    return {
      statusCode: 200,
      message: ['OK'],
    };
  }

  /**
   * @procedure ACTMAN_BIELOTE
   */
  async updateMandateGoodLot(event: number) {
    await this.entity.query(`
                        UPDATE sera.COMER_BIENESXLOTE BXL
                        SET NO_TRANSFERENTE = (
                        SELECT NO_TRANSFERENTE
                        FROM sera.EXPEDIENTES EXP
                        INNER JOIN sera.BIEN BIE1 ON EXP.NO_EXPEDIENTE = BIE1.NO_EXPEDIENTE
                        WHERE BXL.NO_BIEN = BIE1.NO_BIEN
                        )
                        WHERE EXISTS (
                        SELECT 1
                        FROM sera.COMER_LOTES LOT
                        WHERE BXL.ID_LOTE = LOT.ID_LOTE
                        AND EXISTS (
                                SELECT 1
                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                WHERE CXE.ID_EVENTO = ${event}
                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND CXE.PROCESADO = 'S'
                                AND CXE.PROCESAR = 'S'
                                LIMIT 1
                        )
                                AND EXISTS (
                                        SELECT 1
                                        FROM sera.COMER_EVENTOS EVE
                                        WHERE EVE.ID_EVENTO = ${event}
                                        AND EVE.ID_EVENTO = LOT.ID_EVENTO
                                        LIMIT 1
                                )
                        );
                        
                `);

    const q1 = `SELECT ID_LOTE, ID_CLIENTE from sera.COMER_LOTES LOT 
                               WHERE    EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO = ${event}
                                        AND    CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND    CXE.PROCESADO = 'S'
                                        AND    CXE.PROCESAR = 'S'
                                        LIMIT 1
                                )`;

    const qr1: any[] = await this.entity.query(q1);

    const ids_lote = qr1.map(({ id_lote }) => id_lote).toString();

    const ids_cliente = qr1.map(({ id_cliente }) => id_cliente).toString();

    const q2 = `SELECT NO_TRANSFERENTE
                FROM    sera.COMER_BIENESXLOTE BXL
                WHERE   BXL.ID_LOTE IN (${ids_lote})`;


    const q2r = await this.entity.query(q2);
    const q = `
                UPDATE    sera.COMER_LOTES LOT
                       SET    NO_TRANSFERENTE = ${q2r[0].no_transferente}
                       WHERE ID_CLIENTE IN (${ids_cliente}) AND ID_LOTE IN (${ids_lote})
               
                `;
    console.log(q);
    await this.entity.query(q);
    return {
      statusCode: 200,
      message: ['OK'],
    };
  }

  /**
   * @procedure PREP_OI_BASES_CA
   */
  async prepOiBaseCa(data: {
    event: number;
    descrption: string;
    user?: string;
  }) {
    var P_CONCEP: string;
    var O_IDENTI = 0;

    var USUARIO: string;
    var L_PARAMETROS: any;

    var C1 = await this.entity.query(`
                        SELECT
                                REF.ID_PAGO,
                                CLI.RFC,
                                TO_CHAR(REF.FECHA, 'YYYYMMDD') AS FECHA,
                                REF.MONTO m1,
                                SUBSTRING(REF.REFERENCIAORI, 1, 30) AS REFERENCIAORI,
                                REF.NO_MOVIMIENTO,
                                LOT.LOTE_PUBLICO,
                                REF.MONTO m2,
                                SUBSTRING(LOT.DESCRIPCION, 1, 380) AS DESCRIPCION,
                                MOD.VALOR,
                                REF.IDORDENINGRESO
                        FROM
                        sera.COMER_PAGOREF REF
                        INNER JOIN
                        sera.COMER_LOTES LOT ON LOT.ID_LOTE = REF.ID_LOTE
                        INNER JOIN
                        sera.COMER_CLIENTES CLI ON LOT.ID_CLIENTE = CLI.ID_CLIENTE
                        INNER JOIN
                        sera.COMER_PARAMETROSMOD MOD ON REF.CVE_BANCO = MOD.PARAMETRO
                        WHERE
                                LOT.ID_EVENTO = ${data.event}
                                AND LOT.LOTE_PUBLICO != 0
                                AND EXISTS (
                                        SELECT 1
                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE CXE.ID_EVENTO = ${data.event}
                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                )
                                AND MOD.DIRECCION = 'C'
                                AND REF.IDORDENINGRESO IS NULL
                                ORDER BY
                        REF.ID_PAGO
                `);
    L_PARAMETROS = this.getParameters({ eventId: data.event, address: 'M' });
    if (L_PARAMETROS.statusCode == 400) return L_PARAMETROS;
    await this.updateMandateGoodLot(data.event);
    await this.entity.query(`
                        DELETE FROM sera.COMER_CABECERAS CAB
                        WHERE CAB.ID_EVENTO = ${data.event}
                        AND CAB.CLIENTE_RFC IN (
                                SELECT CLI.RFC
                                FROM sera.COMER_CLIENTES CLI
                                INNER JOIN sera.COMER_CLIENTESXEVENTO CXE ON CLI.ID_CLIENTE = CXE.ID_CLIENTE
                                WHERE CXE.ID_EVENTO = ${data.event}
                                AND CXE.PROCESADO = 'S'
                                AND CXE.PROCESAR = 'S'
                        )
               `);
    await this.entity.query(`
                        DELETE FROM sera.COMER_DETALLES DET
                        WHERE ID_EVENTO = ${event}
                        AND EXISTS (
                                SELECT 1
                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                INNER JOIN sera.COMER_LOTES LOT ON CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                WHERE CXE.ID_EVENTO = ${event}
                                AND CXE.PROCESADO = 'S'
                                AND CXE.PROCESAR = 'S'
                                AND DET.ID_LOTE = LOT.ID_LOTE
                        )
               `);
    O_IDENTI =
      (
        await this.entity.query(`
                        SELECT MAX(IDENTIFICADOR) as val1
                        FROM sera.COMER_CABECERAS
                        WHERE ID_EVENTO = ${data.event}
               `)
      )[0]?.val1 || 0;
    USUARIO =
      (
        await this.entity.query(`
                        SELECT coalesce(RTRIM(LTRIM(USUARIO_SIRSAE)),'SAE'||'${data.user}') as user
                        FROM sera.SEG_USUARIOS
                        WHERE USUARIO = '${data.user}';
                       
               `)
      )[0]?.user || '';
    for (const iterator of C1) {
      O_IDENTI = O_IDENTI + 1;
      P_CONCEP = `DEPOSITO POR VENTA DE BASES EVENTO ${data.event} ${data.descrption} DE LA BASE ${iterator.lote_publico} `;
      await this.entity.query(`
                        INSERT INTO sera.COMER_CABECERAS
                                (IDENTIFICADOR, CONSECUTIVO, AREA, DOCUMENTO, UNRESPONSABLE, CLIENTE_RFC, CONCEPTO,
                                ANEXO, FECHA, TIPOPE, FORMAPAGO, FECHAORDEN, BANCO, USAUTORIZA,
                                MONTO_TOTAL_PADRE, NUMOVTO, REFERENCIA, IDPAGO, ID_EVENTO, IDORDENGRABADA
                                )
                                VALUES
                                (${O_IDENTI}, 0, '${this.G_AREA}', 'OI', 720, '${iterator.rfc}', '${P_CONCEP}',
                                'PANTALLA BANCARIA', '${iterator.fecha}', 3, 'T',  '${iterator.fecha}', '${iterator.valor}', '${USUARIO}',
                                ${iterator.monto}, '${iterator.no_movimiento}', '${iterator.referenciaori}', '${iterator.id_pago}', ${data.event}, '${iterator.idordeningreso}'
                                )
                        `);
    }
    return {
      statusCode: 200,
      message: ['OK'],
    };
  }

  /**
   * @procedure PENALIZA
   */

  async penaliza(data: { buy: number; payment: number; client: number }) {
    var t = 0;
    var L_MONTOPENA = 0;
    var todos_lotes = 0;
    var penalizados = 0;
    var TOT_PENALIZA = 0;
    var tot_pagara = 0;
    var ERROR = 0;
    var PRIMERAVEZ = 1;
    var MATCH = 1;
    this.LOTIPGAR = [];
    this.RETIPGAR = [];
    if (data.payment < data.buy) {
      PRIMERAVEZ = 1;
      t = 0;
      this.LOTESXCLI.forEach((element) => {
        MATCH = 0;
        if (element.ASIGNADO == 'N') {
          tot_pagara = tot_pagara + element.PRECIO;
          if (PRIMERAVEZ > 1) {
            for (const lotpgar of this.LOTIPGAR) {
              if (lotpgar.MONTO == element.GARATIA) {
                lotpgar.LOTES = lotpgar.LOTES + 1;
                MATCH = 1;
                break;
              }
            }
            if (MATCH == 0) {
              this.LOTIPGAR.push({
                LOTES: 1,
                MONAPP: 0,
                MONTO: element.GARATIA,
              });
            }
          } else {
            this.LOTIPGAR.push({
              LOTES: 1,
              MONAPP: 0,
              MONTO: element.GARATIA,
            });
          }
        }
        PRIMERAVEZ = PRIMERAVEZ + 1;
      });
      t = 0;
      PRIMERAVEZ = 1;
      this.LOTESXCLI.forEach((element) => {
        MATCH = 0;
        if (PRIMERAVEZ > 1) {
          for (const RETIPGAR of this.RETIPGAR) {
            if (RETIPGAR.MONTO == element.GARATIA) {
              RETIPGAR.LOTES = RETIPGAR.LOTES + 1;
              RETIPGAR.TOTXGA = RETIPGAR.TOTXGA + element.PRECIO;
              MATCH = 1;
              break;
            }
          }
          if (MATCH == 0) {
            this.RETIPGAR.push({
              LOTES: 1,
              TOTXGA: element.PRECIO,
              MONTO: element.GARATIA,
            });
          }
        } else {
          this.RETIPGAR.push({
            LOTES: 1,
            TOTXGA: element.PRECIO,
            MONTO: element.GARATIA,
          });
        }
        PRIMERAVEZ = PRIMERAVEZ + 1;
      });
      this.LOTIPGAR.forEach((element) => {
        TOT_PENALIZA =
          TOT_PENALIZA +
          Math.ceil(element.LOTES / this.G_NUMLOTES) * element.MONTO;
      });
      if (data.payment >= data.buy - tot_pagara + TOT_PENALIZA) {
        ERROR = await this.appPenaExcel(data.client);
      } else {
        await this.appPenaSiste(data.buy, data.payment, data.client);
      }
    }
    return {
      statusCode: 200,
      message: ['OK'],
    };
  }

  /**
   * @procedure VALIDA_COMER
   */
  async validComer(data: { event: number; date: string }) {
    var L_CLIENTE = 0;
    var j = 0;
    var i = 0;
    var k = 0;
    var t = 0;
    var COMPRA_TOT = 0.0;
    var PAGADO_TOT = 0.0;
    var L_MONTOPENA = 0.0;
    var L_PARAMETROS: any;
    var PENALTY = 'N';
    var PROP_IVA_CHAT = 0.0;
    var PROP_ISR_CHAT = 0.0;

    var L7 = await this.entity.query(`
                        SELECT    DISTINCT LOT.ID_CLIENTE 
                        FROM    sera.COMER_LOTES LOT
                        WHERE    LOT.ID_EVENTO    = ${data.event}
                        AND        EXISTS (SELECT    PRF.ID_LOTE
                                        FROM    sera.COMER_PAGOREF PRF
                                        WHERE    PRF.ID_LOTE        = LOT.ID_LOTE
                                        AND        PRF.VALIDO_SISTEMA = 'A'
                                        AND        PRF.FECHA         <= '${data.date}'
                                        )
                        AND        EXISTS (SELECT    1
                                        FROM    sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE    CXE.ID_EVENTO      = ${data.event}
                                        AND        CXE.ID_CLIENTE     = LOT.ID_CLIENTE
                                        AND        CXE.PROCESAR       = 'S'
                                        AND        CXE.ENVIADO_SIRSAE = 'N'
                                        )
                        AND        LOT.PRECIO_FINAL > 0
                        AND        LOT.VALIDO_SISTEMA IS NULL
                        AND        LOT.ID_CLIENTE IS NOT NULL
                `);
    L_PARAMETROS = await this.getParameters({
      eventId: data.event,
      address: 'M',
    });
    await this.prepareLot(data.event, 'M');
    await this.actEstLotesMue(data.event);
    await this.borraMuebles(data.event, null, null);
    this.G_PKREFGEN = 0;
    for (const iterator of L7) {
      await this.entity.query(`
                                UPDATE    sera.COMER_CLIENTESXEVENTO
                                SET    PROCESADO  = 'S'
                                WHERE    ID_EVENTO  = ${data.event}
                                AND    ID_CLIENTE = ${iterator.id_cliente};
                        `);
      this.DISPERSION = [];
      COMPRA_TOT = await this.llenaLotes(
        data.event,
        iterator.id_cliente,
        null,
        1,
      );
      PAGADO_TOT = await this.llenaPagos(
        data.event,
        iterator.id_cliente,
        new Date(data.date),
        1,
      );
      await this.penaliza({
        buy: COMPRA_TOT,
        payment: PAGADO_TOT,
        client: iterator.id_cliente,
      });
      this.DEPOSITOS.forEach((DEPOSITOS) => {
        if (DEPOSITOS.RESTA > 0) {
          this.LOTESXCLI.forEach((LOTESXCLI) => {
            if (
              LOTESXCLI.PAGADO == 'N' &&
              DEPOSITOS.RESTA > 0 &&
              LOTESXCLI.ASIGNADO == 'S' &&
              LOTESXCLI.MEFALTA > 0
            ) {
              var DISPERSION: Dispersa = {};
              if (DEPOSITOS.RESTA == LOTESXCLI.MEFALTA && DEPOSITOS.RESTA > 0) {
                DISPERSION.CLIENTE = L_CLIENTE;
                DISPERSION.LOTE = LOTESXCLI.LOTE;
                DISPERSION.MANDATO = LOTESXCLI.MANDATO;
                DISPERSION.PRECIO = LOTESXCLI.MEFALTA;
                DISPERSION.ID_PAGO = DEPOSITOS.ID_PAGO;
                if (LOTESXCLI.ESCHATA == 'S') {
                  DISPERSION.MONCHATA = Number(
                    (
                      LOTESXCLI.MEFALTA *
                      LOTESXCLI.PORCIVA *
                      (this.G_PCTCHATARRA / 100)
                    ).toFixed(2),
                  );
                  PROP_ISR_CHAT = Number(
                    (DISPERSION.MONCHATA / this.G_IVA, 2).toFixed(2),
                  );
                  PROP_IVA_CHAT = Number(
                    (DISPERSION.MONCHATA - PROP_ISR_CHAT).toFixed(2),
                  );
                  DISPERSION.ABONADO = Number(
                    (
                      (LOTESXCLI.MEFALTA * LOTESXCLI.PORCIVA) /
                      this.G_IVA
                    ).toFixed(2),
                  );
                  DISPERSION.IVA =
                    Number((LOTESXCLI.MEFALTA * LOTESXCLI.PORCIVA).toFixed(2)) -
                    DISPERSION.ABONADO +
                    PROP_IVA_CHAT;
                  DISPERSION.ABONADO = DISPERSION.ABONADO + PROP_ISR_CHAT;
                  DISPERSION.MONSIVA = Number(
                    (LOTESXCLI.MEFALTA * LOTESXCLI.PORNIVA).toFixed(2),
                  );
                } else {
                  DISPERSION.ABONADO = Number(
                    (
                      (LOTESXCLI.MEFALTA * LOTESXCLI.PORCIVA) /
                      this.G_IVA
                    ).toFixed(2),
                  );
                  DISPERSION.IVA =
                    Number((LOTESXCLI.MEFALTA * LOTESXCLI.PORCIVA).toFixed(2)) -
                    DISPERSION.ABONADO;
                  DISPERSION.MONSIVA = Number(
                    (LOTESXCLI.MEFALTA * LOTESXCLI.PORNIVA).toFixed(2),
                  );
                }
                DISPERSION.GARATIA = LOTESXCLI.GARATIA;
                LOTESXCLI.MEFALTA = 0;
                DISPERSION.TIPO = 'N';
                LOTESXCLI.PAGADO = 'S';
                DEPOSITOS.RESTA = 0;
              } else if (
                DEPOSITOS.RESTA < LOTESXCLI.MEFALTA &&
                DEPOSITOS.RESTA > 0
              ) {
                DISPERSION.CLIENTE = L_CLIENTE;
                DISPERSION.LOTE = LOTESXCLI.LOTE;
                DISPERSION.MANDATO = LOTESXCLI.MANDATO;
                DISPERSION.PRECIO = LOTESXCLI.PRECIO;
                DISPERSION.ID_PAGO = DEPOSITOS.ID_PAGO;
                if (LOTESXCLI.ESCHATA == 'S') {
                  DISPERSION.MONCHATA = Number(
                    (
                      DEPOSITOS.RESTA *
                      LOTESXCLI.PORCIVA *
                      (this.G_PCTCHATARRA / 100)
                    ).toFixed(2),
                  );
                  PROP_ISR_CHAT = Number(
                    (DISPERSION.MONCHATA / this.G_IVA, 2).toFixed(2),
                  );
                  PROP_IVA_CHAT = Number(
                    (DISPERSION.MONCHATA - PROP_ISR_CHAT).toFixed(2),
                  );
                  DISPERSION.ABONADO = Number(
                    (
                      (DEPOSITOS.RESTA * LOTESXCLI.PORCIVA) /
                      this.G_IVA
                    ).toFixed(2),
                  );
                  DISPERSION.IVA =
                    Number((DEPOSITOS.RESTA * LOTESXCLI.PORCIVA).toFixed(2)) -
                    DISPERSION.ABONADO +
                    PROP_IVA_CHAT;
                  DISPERSION.ABONADO = DISPERSION.ABONADO + PROP_ISR_CHAT;
                  DISPERSION.MONSIVA = Number(
                    (DEPOSITOS.RESTA * LOTESXCLI.PORNIVA).toFixed(2),
                  );
                } else {
                  DISPERSION.ABONADO = Number(
                    (
                      (DEPOSITOS.RESTA * LOTESXCLI.PORCIVA) /
                      this.G_IVA
                    ).toFixed(2),
                  );
                  DISPERSION.IVA =
                    Number((DEPOSITOS.RESTA * LOTESXCLI.PORCIVA).toFixed(2)) -
                    DISPERSION.ABONADO;
                  DISPERSION.MONSIVA = Number(
                    (DEPOSITOS.RESTA * LOTESXCLI.PORNIVA).toFixed(2),
                  );
                }
                DISPERSION.GARATIA = LOTESXCLI.GARATIA;
                LOTESXCLI.MEFALTA = LOTESXCLI.MEFALTA - DEPOSITOS.RESTA;
                DISPERSION.TIPO = 'N';
                LOTESXCLI.PAGADO = 'N';
                DEPOSITOS.RESTA = 0;
              } else if (
                DEPOSITOS.RESTA > LOTESXCLI.MEFALTA &&
                DEPOSITOS.RESTA > 0
              ) {
                DISPERSION.CLIENTE = L_CLIENTE;
                DISPERSION.LOTE = LOTESXCLI.LOTE;
                DISPERSION.MANDATO = LOTESXCLI.MANDATO;
                DISPERSION.PRECIO = LOTESXCLI.PRECIO;
                DISPERSION.ID_PAGO = DEPOSITOS.ID_PAGO;
                if (LOTESXCLI.ESCHATA == 'S') {
                  DISPERSION.MONCHATA = Number(
                    (
                      LOTESXCLI.MEFALTA *
                      LOTESXCLI.PORCIVA *
                      (this.G_PCTCHATARRA / 100)
                    ).toFixed(2),
                  );
                  PROP_ISR_CHAT = Number(
                    (DISPERSION.MONCHATA / this.G_IVA, 2).toFixed(2),
                  );
                  PROP_IVA_CHAT = Number(
                    (DISPERSION.MONCHATA - PROP_ISR_CHAT).toFixed(2),
                  );
                  DISPERSION.ABONADO = Number(
                    (
                      (LOTESXCLI.MEFALTA * LOTESXCLI.PORCIVA) /
                      this.G_IVA
                    ).toFixed(2),
                  );
                  DISPERSION.IVA =
                    Number((LOTESXCLI.MEFALTA * LOTESXCLI.PORCIVA).toFixed(2)) -
                    DISPERSION.ABONADO +
                    PROP_IVA_CHAT;
                  DISPERSION.ABONADO = DISPERSION.ABONADO + PROP_ISR_CHAT;
                  DISPERSION.MONSIVA = Number(
                    (LOTESXCLI.MEFALTA * LOTESXCLI.PORNIVA).toFixed(2),
                  );
                } else {
                  DISPERSION.ABONADO = Number(
                    (
                      (LOTESXCLI.MEFALTA * LOTESXCLI.PORCIVA) /
                      this.G_IVA
                    ).toFixed(2),
                  );
                  DISPERSION.IVA =
                    Number((LOTESXCLI.MEFALTA * LOTESXCLI.PORCIVA).toFixed(2)) -
                    DISPERSION.ABONADO;
                  DISPERSION.MONSIVA = Number(
                    (LOTESXCLI.MEFALTA * LOTESXCLI.PORNIVA).toFixed(2),
                  );
                }
                DISPERSION.GARATIA = LOTESXCLI.GARATIA;
                LOTESXCLI.MEFALTA = 0;
                DISPERSION.TIPO = 'N';
                LOTESXCLI.PAGADO = 'S';
                DEPOSITOS.RESTA = DEPOSITOS.RESTA - LOTESXCLI.MEFALTA;
              }
              this.DISPERSION.push(DISPERSION);
            }
          });
        }
      });
      this.DEPOSITOS.forEach((DEPOSITOS) => {
        if (DEPOSITOS.RESTA > 0) {
          var DISPERSION: Dispersa = {};
          DISPERSION.CLIENTE = L_CLIENTE;
          DISPERSION.MANDATO = DEPOSITOS.MANDATO;
          DISPERSION.PRECIO = DEPOSITOS.RESTA;
          DISPERSION.ID_PAGO = DEPOSITOS.ID_PAGO;
          DISPERSION.ABONADO = DEPOSITOS.RESTA;
          DISPERSION.GARATIA = DEPOSITOS.RESTA;
          DISPERSION.TIPO = 'D';
          DISPERSION.LOTE = DEPOSITOS.LOTE;
          this.DISPERSION.push(DISPERSION);
        }
      });
      await this.insDispBm(L_CLIENTE, 6, data.event);
    }
    await this.actPagosMue(data.event);
    await this.actRefesMue(data.event);
    return {
      statusCode: 200,
      message: ['OK'],
      data: {
        dispersion: this.DISPERSION,
        depositos: this.DEPOSITOS,
      },
    };
  }

  /**
   * @procedure UTIL_DECGROUP
   */
  async utilDecGroup(amount: number) {
    var UD_SUMA = 0;
    var PRIMERA_VEZ = 1;
    var H = 0;
    var UD_NUEVO = 1;
    var UD_POS = 0;
    var UD_DIF = 0;
    var UD_MAYOR = 0;
    var UD_AJUIMP = 0;
    var UD_AJUIVA = 0;
    var UD_AJUSIVA = 0;
    var UD_AUX1 = 0;
    this.DETAUX = [];
    this.DETOI.forEach((DETOI) => {
      if (DETOI.IMPORTE > 0) {
        UD_SUMA = UD_SUMA + DETOI.IMPORTE + DETOI.IVA + DETOI.MONSIVA;
      }
    });
    this.DETOI.forEach((DETOI) => {
      if (PRIMERA_VEZ == 1) {
        this.DETAUX.push({
          IDENTIFICADOR: DETOI.IDENTIFICADOR,
          MANDATO: DETOI.MANDATO,
          INGRESO: DETOI.INGRESO,
          IMPORTE: DETOI.IMPORTE,
          IVA: DETOI.IVA,
          REFERENCIA: DETOI.REFERENCIA,
          INDTIPO: DETOI.INDTIPO,
          LOTESIAB: DETOI.LOTESIAB,
          DESCRIPCION: DETOI.DESCRIPCION,
          EVENTO: DETOI.EVENTO,
          LOTE: DETOI.LOTE,
          VTALOTE: DETOI.VTALOTE,
          MONTORET: DETOI.MONTORET,
          MONSIVA: DETOI.MONSIVA,
        });
      } else {
        UD_NUEVO = 1;
        for (const DETAUX of this.DETAUX) {
          if (DETAUX.MANDATO == DETOI.MANDATO) {
            (DETAUX.IMPORTE = DETAUX.IMPORTE + DETOI.IMPORTE),
              (DETAUX.IVA = DETAUX.IVA + DETOI.IVA),
              (DETAUX.MONSIVA = DETAUX.MONSIVA + DETOI.MONSIVA),
              (DETAUX.MONTORET = DETAUX.MONTORET + DETOI.MONTORET);
            UD_NUEVO = 0;
            break;
          }
        }
        if (UD_NUEVO == 1) {
          this.DETAUX.push({
            IDENTIFICADOR: DETOI.IDENTIFICADOR,
            MANDATO: DETOI.MANDATO,
            INGRESO: DETOI.INGRESO,
            IMPORTE: DETOI.IMPORTE,
            IVA: DETOI.IVA,
            REFERENCIA: DETOI.REFERENCIA,
            INDTIPO: DETOI.INDTIPO,
            LOTESIAB: DETOI.LOTESIAB,
            DESCRIPCION: DETOI.DESCRIPCION,
            EVENTO: DETOI.EVENTO,
            LOTE: DETOI.LOTE,
            VTALOTE: DETOI.VTALOTE,
            MONTORET: DETOI.MONTORET,
            MONSIVA: DETOI.MONSIVA,
          });
        }
      }
      PRIMERA_VEZ = PRIMERA_VEZ + 1;
    });
    if (amount != UD_SUMA) {
      UD_DIF = amount - UD_SUMA;
      this.DETAUX.forEach((DETAUX, index) => {
        if (UD_MAYOR < DETAUX.IMPORTE + DETAUX.MONSIVA) {
          UD_MAYOR = DETAUX.IMPORTE + DETAUX.MONSIVA;
          UD_POS = index;
        }
      });
      UD_AUX1 = this.DETAUX[UD_POS].IMPORTE + this.DETAUX[UD_POS].IVA + UD_DIF;
      UD_AJUIMP = UD_AUX1 / this.G_IVA;
      UD_AJUIVA = UD_AUX1 - UD_AJUIMP;
      this.DETAUX[UD_POS].IMPORTE = UD_AJUIMP;
      this.DETAUX[UD_POS].IVA = UD_AJUIVA;
    }
    return {
      statusCode: 200,
      message: ['OK'],
    };
  }

  /**
   * @procedure PREP_OI
   */
  async prepOi(event: number, description: string, user: string) {
    try {
      var P_IDPAGO: number;
      var P_RFC: string;
      var P_CONCEP: string;
      var P_CONAUX: string;
      var P_BANCO: string;
      var O_IDENTI = 0;
      var O_CONSE = 0;
      var P_FECHAHOY = LocalDate.getNow();
      var P_FECHA: string;
      var P_MONIVA: number;
      var P_MOVTO: number;
      var P_REFE: string;
      var P_MONTO: number;
      var P_LOTPUB: number;
      var P_OI: number;
      var LOT_MONTO: number;
      var H_TIPO: string;
      var H_MAND: string;
      var H_MONTO: number;
      var H_REF: string;
      var H_MONIVA: number;
      var H_MONSIVA: number;
      var H_IVA: number;
      var H_REFE: string;
      var H_MOV: number;
      var H_LOTDES: string;
      var H_CONCEP: string;
      var H_IDENT: number = 0;
      var USUARIO: string;
      var H_LOTPUB: number;
      var H_DESCTIPO: string;
      var H_MONTOCHAT: number;
      var H_MONTOLOTE: number;
      var H_LOTE: number;
      var AUX_CONT: number;
      var L_PARAMETROS: string;
      var H_INGRESO: string;
      var H_TPINGRESO: string;
      var H_NUMBIENES: number = 0;
      var H_SIAB: number;
      var L_MANDATOS = 0;
      var D_PCT: number;
      var D_MANDATO: string;
      var D_NOBIEN: number;
      var D_CONCEP: string;
      var AUX_CONCEP: string;
      var D_IVA: number;
      var D_MONIVA: number;
      var D_MONSIVA: number;
      var J: number = 0;
      var P_CVE_EVENTO: string;
      var P_ID_LOTE: number;
      var C_NO_BIEN = '';
      var A_NO_BIEN = '';

      let C1 = await this.entity.query(`
                        SELECT
                        REF.ID_PAGO P_IDPAGO,
                        CLI.RFC P_RFC,
                        TO_CHAR(REF.FECHA, 'YYYYMMDD') P_FECHA,
                        REF.MONTO P_MONTO,
                        SUBSTR(REF.REFERENCIAORI, 1, 30) P_REFE,
                        REF.NO_MOVIMIENTO P_MOVTO,
                        LOT.LOTE_PUBLICO P_LOTPUB,
                        LOT.ID_LOTE P_ID_LOTE,
                        REF.MONTO P_MONIVA,
                        SUBSTR(LOT.DESCRIPCION, 1, 380) P_CONAUX,
                        MOD.VALOR P_BANCO,
                        REF.IDORDENINGRESO P_OI,
                        (
                        SELECT CVE_PROCESO FROM sera.COMER_EVENTOS EVE WHERE EVE.ID_EVENTO = LOT.ID_EVENTO
                        ) P_CVE_EVENTO
                FROM
                        sera.COMER_PAGOREF REF,
                        sera.COMER_LOTES LOT,
                        sera.COMER_CLIENTES CLI,
                        sera.COMER_PARAMETROSMOD MOD
                WHERE
                        LOT.ID_EVENTO = ${event}
                        AND LOT.ID_LOTE = REF.ID_LOTE
                        AND LOT.ID_CLIENTE = CLI.ID_CLIENTE
                        AND REF.VALIDO_SISTEMA = 'S'
                        AND LOT.LOTE_PUBLICO != 0
                        AND EXISTS (
                                SELECT 1
                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                WHERE CXE.ID_EVENTO =  ${event}
                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND CXE.PROCESADO = 'S'
                                AND CXE.PROCESAR = 'S'
                                LIMIT 1
                        )
                        AND REF.CVE_BANCO = MOD.PARAMETRO
                        AND MOD.DIRECCION = 'C'
                        AND REF.IDORDENINGRESO IS NULL
                        ORDER BY REF.ID_PAGO
                `);
      let C2 = async (pago: number) => {
        return await this.entity.query(`
                                SELECT
                                (GEN.MONTO_APP_IVA + GEN.IVA) as H_MONTO,
                                GEN.TIPO H_TIPO,
                                SUBSTR(GEN.REFERENCIA, 1, 30) as H_REFE,
                                GEN.MONTO_APP_IVA H_MONIVA,
                                COALESCE(GEN.IVA, 0) as H_IVA,
                                1 as H_MOV,
                                CAT.CVMAN H_MAND,
                                COALESCE(GEN.MONTO_NOAPP_IVA, 0) as H_MONSIVA,
                                SUBSTR(LOT.DESCRIPCION, 1, 420) H_LOTDES,
                                LOT.LOTE_PUBLICO H_LOTPUB,
                                        CASE GEN.TIPO
                                        WHEN 'N' THEN 'Pago Normal'
                                        WHEN 'P' THEN 'Pago a Penalizar'
                                        WHEN 'D' THEN 'Pago a Devolver'
                                ELSE ''
                                END as H_DESCTIPO,
                                LOT.ID_LOTE H_LOTE,
                                LOT.PRECIO_FINAL H_MONTOLOTE,
                                GEN.MONTO_CHATARRA H_MONTOCHAT,
                                CASE GEN.TIPO
                                        WHEN 'N' THEN G_TPOINGRESO
                                        WHEN 'P' THEN G_TPOINGRESOP
                                        WHEN 'D' THEN G_TPOINGRESOD
                                        ELSE ''
                                END H_INGRESO ,
                                LOT.NUM_BIENES H_NUMBIENES
                        FROM
                                sera.COMER_PAGOSREFGENS GEN,
                                sera.CAT_TRANSFERENTE CAT,
                                sera.COMER_LOTES LOT
                        WHERE
                                GEN.ID_PAGO = ${pago}
                                AND CAT.NO_TRANSFERENTE = GEN.NO_TRANSFERENTE
                                AND GEN.ID_LOTE = LOT.ID_LOTE
                                AND LOT.LOTE_PUBLICO != 0
                                AND EXISTS (
                                        SELECT 1
                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE CXE.ID_EVENTO = L_EVENTO
                                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                        AND CXE.PROCESADO = 'S'
                                        AND CXE.ENVIADO_SIRSAE = 'N'
                                        AND CXE.PROCESAR = 'S'
                                        LIMIT 1
                                )
                        `);
      };
      let C3 = async (lote: number) =>
        await this.entity.query(`
                        SELECT
                                BXL.PCTSLOTE D_PCT,
                                COALESCE(CAT.CVMAN, '0') as D_MANDATO,
                                BXL.NO_BIEN D_NOBIEN,
                                SUBSTR(BIE.DESCRIPCION, 1, 438) as AUX_CONCEP,
                                BXL.PRECIO_SIN_IVA D_MONIVA,
                                BXL.MONTO_NOAPP_IVA D_MONSIVA,
                                BXL.IVA_FINAL D_IVA
                        FROM
                                sera.COMER_BIENESXLOTE BXL,
                                sera.CAT_TRANSFERENTE CAT,
                                sera.BIEN BIE
                        WHERE
                                BXL.ID_LOTE = ${lote}
                                AND BIE.NO_BIEN = BXL.NO_BIEN
                                AND BXL.NO_TRANSFERENTE = CAT.NO_TRANSFERENTE(+)
                        ORDER BY BXL.NO_BIEN;

                `);
      let C4 = async (lote: number) =>
        await this.entity.query(`
                        SELECT TO_CHAR(BXL.NO_BIEN) as no_bien
                        FROM sera.COMER_BIENESXLOTE BXL
                        WHERE BXL.ID_LOTE = ${lote}
                        ORDER BY BXL.NO_BIEN
                        LIMIT 300
                `);
      await this.getParameters({ eventId: event, address: 'M' });
      await this.updateMandateGoodLot(event);

      await this.entity.query(`
                        UPDATE sera.COMER_BIENESXLOTE BXLS
                        SET PCTSLOTE = (
                                SELECT BXL.PRECIO_FINAL / LOT.PRECIO_FINAL
                                FROM sera.COMER_LOTES LOT
                                JOIN sera.COMER_BIENESXLOTE BXL ON LOT.ID_LOTE = BXL.ID_LOTE
                                WHERE LOT.ID_EVENTO = ${event}
                                AND BXLS.NO_BIEN = BXL.NO_BIEN
                        )
                        WHERE EXISTS (
                                SELECT 1
                                FROM sera.COMER_LOTES LOTS
                                WHERE LOTS.ID_EVENTO = ${event}
                                AND LOTS.ID_LOTE = BXLS.ID_LOTE
                                AND EXISTS (
                                SELECT 1
                                        FROM sera.COMER_CLIENTESXEVENTO CXE
                                        WHERE CXE.ID_EVENTO = ${event}
                                        AND LOTS.ID_CLIENTE = CXE.ID_CLIENTE
                                        AND CXE.PROCESADO = 'S'
                                        AND CXE.PROCESAR = 'S'
                                        LIMIT 1
                                )
                                LIMIT 1
                        )      
                `);
      await this.entity.query(`
                        DELETE FROM sera.COMER_DETALLES DET
                        WHERE ID_EVENTO = ${event}
                        AND EXISTS (
                                SELECT 1
                                FROM sera.COMER_CLIENTESXEVENTO CXE
                                JOIN sera.COMER_LOTES LOT ON CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                WHERE CXE.ID_EVENTO = ${event}
                                AND CXE.PROCESADO = 'S'
                                AND CXE.PROCESAR = 'S'
                                AND DET.ID_LOTE = LOT.ID_LOTE
                                LIMIT 1
                        );
                
                `);
      await this.entity.query(`
                        DELETE FROM sera.COMER_CABECERAS CAB
                        WHERE CAB.ID_EVENTO = ${event}
                        AND CAB.CLIENTE_RFC IN (
                                SELECT CLI.RFC
                                FROM sera.COMER_CLIENTES CLI
                                JOIN sera.COMER_CLIENTESXEVENTO CXE ON CLI.ID_CLIENTE = CXE.ID_CLIENTE
                                WHERE CXE.ID_EVENTO = ${event}
                                AND CXE.PROCESADO = 'S'
                                AND CXE.PROCESAR = 'S'
                        );
                
                `);

      O_IDENTI =
        (
          await this.entity.query(`
                        SELECT    MAX(IDENTIFICADOR) as val1
                        FROM    sera.COMER_CABECERAS
                        WHERE    ID_EVENTO = ${event}
                `)
        )[0]?.val1 || 0;
      USUARIO =
        (
          await this.entity.query(`
                        SELECT coalesce(RTRIM(LTRIM(USUARIO_SIRSAE)),'SAE'||'${user}') as val1
                        FROM SERA.SEG_USUARIOS
                        WHERE USUARIO = '${user}'
                `)
        )[0]?.val1 || '';
      USUARIO = USUARIO.trim();

      for (const c1 of C1) {
        O_IDENTI = O_IDENTI + 1;
        P_CONCEP = `DEPOSITO POR VENTA DE BIENES EVENTO ${description}`;
        await this.entity.query(`
                                INSERT INTO sera.COMER_CABECERAS
                                (IDENTIFICADOR,        CONSECUTIVO,    AREA,        DOCUMENTO,    UNRESPONSABLE,    CLIENTE_RFC,    CONCEPTO,
                                ANEXO,            FECHA,        TIPOPE,        FORMAPAGO,    FECHAORDEN,    BANCO,        USAUTORIZA,
                                MONTO_TOTAL_PADRE,     NUMOVTO,    REFERENCIA,    IDPAGO,        ID_EVENTO,    IDORDENGRABADA, CVE_EVENTO
                                )
                                VALUES
                                (${O_IDENTI},        0,        '${this.G_AREA}',        '${this.G_TPODOC}',    '${this.G_UR}',        '${c1.p_rfc}',        '${c1.p_concep}',
                                '${this.G_ANEXO}',        '${c1.p_fecha}',    '${this.G_TPOPERACION}',     'R',        '${c1.p_fecha}',    '${c1.p_banco}',    '${USUARIO}',
                                ${c1.p_monto},        '${c1.p_movto}',     '${c1.p_refe}',        '${c1.p_idpago}',    ${event},    '${c1.p_oi}', '${c1.p_cve_evento}'
                                )
                        `);
        var C2R = await C2(c1.p_idpago);
        H_IDENT = 0;
        for (const c2 of C2R) {
          L_MANDATOS =
            (
              await this.entity.query(`
                                        SELECT COUNT(DISTINCT CAT.CVMAN) as cvman
                                        FROM sera.COMER_LOTES LOT
                                        JOIN sera.COMER_BIENESXLOTE BXL ON LOT.ID_LOTE = BXL.ID_LOTE
                                        LEFT JOIN sera.CAT_TRANSFERENTE CAT ON BXL.NO_TRANSFERENTE = CAT.NO_TRANSFERENTE
                                        WHERE LOT.ID_EVENTO = ${event}
                                        AND LOT.ID_LOTE = ${c2.h_lote}
                                `)
            )[0]?.cvman || 0;
          if (L_MANDATOS > 1 && (c2.h_tipo == 'N' || c2.h_tipo == 'P')) {
            this.DETOI = [];
            J = 0;
            var C3R = await C3(c2.h_lote);
            for (const c3 of C3R) {
              H_CONCEP =
                c2.h_decstipo +
                ' A cuenta del lote ' +
                c2.h_lotpub +
                ' que contiene ' +
                c2.h_numbienes +
                ' bienes ' +
                c2.h_lotes.slice(0, 410);
              this.DETOI.push({
                IDENTIFICADOR: O_IDENTI,
                MANDATO: c3.d_mandato,
                INGRESO: c2.h_ingreso,
                IMPORTE: Number((c2.h_monsiva * c3.d_pct).toFixed(2)),
                IVA:
                  Number((c2.h_monsiva * c3.d_pct).toFixed(2)) * this.G_IVA -
                  Number((c2.h_monsiva * c3.d_pct).toFixed(2)),
                REFERENCIA: c2.h_refe,
                INDTIPO: c2.h_tipo,
                LOTESIAB: c2.h_lotpub,
                DESCRIPCION: H_CONCEP,
                EVENTO: event,
                LOTE: c2.h_lote,
                VTALOTE: c2.h_montolote,
                MONTORET: Number((c2.h_montochat * c3.d_pct).toFixed(2)),
                MONSIVA: Number((c2.h_monsiva * c3.d_pct).toFixed(2)),
                BIEN: c3.d_nobien,
              });
              J = J + 1;
            }
            await this.utilDecGroup(c2.h_monto);
            for (const DETAUX of this.DETAUX) {
              H_IDENT = H_IDENT + 1;
              if (DETAUX.IVA == 0 || !DETAUX.IVA) {
                this.G_TASAIVA = 0;
                await this.entity.query(`
                                                                INSERT INTO sera.COMER_DETALLES
                                                                        (IDENTIFICADOR,     CONSECUTIVO,     MANDATO,     INGRESO,     IMPORTE,
                                                                        IVA,         LOTESIAB,     DESCRIPCION, ID_EVENTO,     REFERENCIA,
                                                                        UNRESPONSABLE,     IMPORTE_SIVA,      ID_LOTE,         TIPO_PAGO,     PRECIO_VTA_LOTE,
                                                                        PORC_IVA,     PORC_RET,     MONTO_RETENIDO,     INDTIPO
                                                                        )
                                                                VALUES
                                                                (${O_IDENTI},     '${c2.h_ident}',     '${DETAUX.MANDATO}', '${DETAUX.INGRESO}',${DETAUX.IMPORTE},
                                                                        ${DETAUX.IVA}, '${DETAUX.LOTESIAB}', '${DETAUX.DESCRIPCION}', ${DETAUX.EVENTO}, '${DETAUX.REFERENCIA}',
                                                                       ' ${this.G_UR}',         ${DETAUX.MONSIVA}, ${c2.h_lote},         'T',      ${DETAUX.VTALOTE},
                                                                        ${this.G_TASAIVA},     ${this.G_PCTCHATARRA}, ${DETAUX.MONTORET}, '${DETAUX.INDTIPO}'
                                                                );
                                                        `);
                this.G_TASAIVA = 16;
              } else {
                await this.entity.query(`
                                                                INSERT INTO sera.COMER_DETALLES
                                                                        (IDENTIFICADOR,     CONSECUTIVO,     MANDATO,     INGRESO,     IMPORTE,
                                                                        IVA,         LOTESIAB,     DESCRIPCION, ID_EVENTO,     REFERENCIA,
                                                                        UNRESPONSABLE,     IMPORTE_SIVA,      ID_LOTE,         TIPO_PAGO,     PRECIO_VTA_LOTE,
                                                                        PORC_IVA,     PORC_RET,     MONTO_RETENIDO,     INDTIPO
                                                                        )
                                                                VALUES
                                                                (${O_IDENTI},     '${c2.h_ident}',     '${DETAUX.MANDATO}', '${DETAUX.INGRESO}',${DETAUX.IMPORTE},
                                                                        ${DETAUX.IVA}, '${DETAUX.LOTESIAB}', '${DETAUX.DESCRIPCION}', ${DETAUX.EVENTO}, '${DETAUX.REFERENCIA}',
                                                                ' ${this.G_UR}',         ${DETAUX.MONSIVA}, ${c2.h_lote},         'T',      ${DETAUX.VTALOTE},
                                                                        ${this.G_TASAIVA},     ${this.G_PCTCHATARRA}, ${DETAUX.MONTORET}, '${DETAUX.INDTIPO}'
                                                                );
                                                        `);
              }
            }
          } else {
            H_SIAB = 0;
            if (c2.h_numbienes == 1) {
              H_SIAB =
                (
                  await this.entity.query(` SELECT    BXL.NO_BIEN
                                                FROM    sera.COMER_BIENESXLOTE BXL
                                                WHERE    BXL.ID_LOTE = ${c2.h_lote}
                                                limit 1`)
                )[0]?.no_bien || 0;
              H_CONCEP =
                c2.h_desctipo +
                ' A cuenta de NO SIAB ' +
                H_SIAB +
                ' ' +
                'del lote ' +
                c2.h_lotpub +
                ' ' +
                c2.h_lotdes +
                ' del evento ' +
                description;
            } else {
              H_CONCEP =
                c2.h_desctipo +
                ' A cuenta del lote ' +
                c2.h_lotpub +
                ' que contiene ' +
                c2.h_numbienes +
                ' bienes ' +
                c2.h_lotdes.splice(0, 410);
            }
            H_IDENT = H_IDENT + 1;
            if (c2.h_iva == 0 || !c2.h_iva) {
              this.G_TASAIVA = 0;
              await this.entity.query(`
                                                INSERT INTO sera.COMER_DETALLES
                                                (IDENTIFICADOR,    CONSECUTIVO,    MANDATO,    INGRESO,    IMPORTE,    IVA,        REFERENCIA,
                                                 INDTIPO,    LOTESIAB,    DESCRIPCION, ID_EVENTO,    UNRESPONSABLE,    IMPORTE_SIVA,     ID_LOTE,
                                                 TIPO_PAGO, PORC_IVA,    PRECIO_VTA_LOTE,PORC_RET,    MONTO_RETENIDO
                                                )
                                                VALUES
                                                (${O_IDENTI},    ${H_IDENT},    '${c2.h_mand}',        '${c2.h_ingreso}',   ${c2.h_moniva},    ${c2.h_iva},        '${c2.h_refe}',
                                                 '${c2.h_tipo}',        '${c2.h_lotpub}',    '${H_CONCEP}',    ${event},    '${this.G_UR}',        '${c2.h_monsiva}',    ${c2.h_lote},
                                                 'T',        ${this.G_TASAIVA}, ${c2.h_montolote},    ${this.G_PCTCHATARRA},    '${c2.h_montochat}'
                                                );
                        
                                                `);
              this.G_TASAIVA = 16;
            } else {
              await this.entity.query(`
                                                INSERT INTO sera.COMER_DETALLES
                                                (IDENTIFICADOR,    CONSECUTIVO,    MANDATO,    INGRESO,    IMPORTE,    IVA,        REFERENCIA,
                                                        INDTIPO,    LOTESIAB,    DESCRIPCION, ID_EVENTO,    UNRESPONSABLE,    IMPORTE_SIVA,     ID_LOTE,
                                                        TIPO_PAGO, PORC_IVA,    PRECIO_VTA_LOTE,PORC_RET,    MONTO_RETENIDO
                                                )
                                                VALUES
                                                        (${O_IDENTI},    ${H_IDENT},    '${c2.h_mand}',        '${c2.h_ingreso}',   ${c2.h_moniva},    ${c2.h_iva},        '${c2.h_refe}',
                                                        '${c2.h_tipo}',        '${c2.h_lotpub}',    '${H_CONCEP}',    ${event},    '${this.G_UR}',        '${c2.h_monsiva}',    ${c2.h_lote},
                                                        'T',        ${this.G_TASAIVA}, ${c2.h_montolote},    ${this.G_PCTCHATARRA},    '${c2.h_montochat}'
                                                        )
                        
                                                `);
            }
          }
        }
        var C4R = await C4(c1.p_id_lote);
        C4R.forEach((element) => {
          A_NO_BIEN = ` ${A_NO_BIEN}+${element.no_bien}-`;
        });
        A_NO_BIEN = A_NO_BIEN.slice(0, A_NO_BIEN.length - 1);
        await this.entity.query(`
                        UPDATE sera.COMER_DETALLES
                                SET BIENESSIAB   = SUBSTR('${A_NO_BIEN}',1,3000)
                         WHERE ID_EVENTO    = ${event}
                                AND LOTESIAB     = '${c1.p_lotpub}'
                                AND ID_LOTE      = ${c1.p_id_lote}
                        `);
        A_NO_BIEN = '';
      }
      return {
        statusCode: 200,
        message: ['OK'],
      };
    } catch (error) {
      console.log(error);
      return new InternalServerErrorException(error.message);
    }
  }



  async prepOiInmu(data: PrepOIInmu) {
    var C1: any[] = await this.entity.query(`
    
     SELECT
            PAG.ID_PAGO,
            CLI.RFC,
            TO_CHAR(PAG.FECHA, 'YYYYMMDD') as fecha,
            PAG.MONTO,
            SUBSTRING(PAG.REFERENCIAORI, 1, 30) as ref,
            PAG.NO_MOVIMIENTO,
            LOT.LOTE_PUBLICO,
            PAG.MONTO,
            SUBSTRING(LOT.DESCRIPCION, 1, 355) || ' PAGO DE ' ||
            CASE
                WHEN LOT.ID_ESTATUSVTA = 'GARA' THEN 'GARANTIA'
                WHEN LOT.ID_ESTATUSVTA = 'PAG' THEN 'LIQUIDACION'
            END as estatusvta,
            PAG.ID_LOTE,
            PMO.VALOR
        FROM
            SERA.COMER_PAGOREF PAG
        INNER JOIN
            SERA.COMER_LOTES LOT ON LOT.ID_LOTE = PAG.ID_LOTE
        INNER JOIN
            SERA.COMER_CLIENTES CLI ON CLI.ID_CLIENTE = LOT.ID_CLIENTE
        INNER JOIN
            SERA.COMER_PARAMETROSMOD PMO ON PAG.CVE_BANCO = PMO.PARAMETRO
        WHERE
            LOT.ID_EVENTO = ${data.event}
            AND PAG.VALIDO_SISTEMA = 'S'
            AND LOT.LOTE_PUBLICO <> 0
            AND        LOT.ID_LOTE         = COALESCE(${data.lot},LOT.ID_LOTE)
            AND PAG.IDORDENINGRESO IS NULL
            AND NOT EXISTS (
                SELECT 1
                FROM SERA.COMER_CABECERAS CAB
                WHERE CAB.IDPAGO = PAG.ID_PAGO
                AND CAB.IDORDENGRABADA IS NOT NULL
            )
            AND EXISTS (
                SELECT 1
                FROM SERA.COMER_CLIENTESXEVENTO CXE
                WHERE CXE.ID_EVENTO = ${data.event}
                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                AND CXE.PROCESAR = 'S'
            )
        ORDER BY
            PAG.ID_PAGO;
    `)

    var C2 = async (paid: number) => {
      return await this.entity.query(`
            select
            
                (GEN.MONTO_APP_IVA + GEN.IVA) IVA,
                GEN.TIPO,
                SUBSTRING(GEN.REFERENCIA, 1, 30) referencia,
                GEN.MONTO_APP_IVA,
                GEN.IVA val0,
                1 val1,
                COALESCE(CAT.CVMAN, '0') mandate,
                GEN.MONTO_NOAPP_IVA,
                SUBSTRING(LOT.DESCRIPCION, 1, 430) AS LOTE,
                LOT.LOTE_PUBLICO,
                LOT.ID_LOTE,
                CASE
                WHEN GEN.TIPO = 'N' THEN 'Pago Normal'
                WHEN GEN.TIPO = 'P' THEN 'Pago a Penalizar'
                WHEN GEN.TIPO = 'D' THEN 'Pago a Devolver'
                END AS TIPO_DESCRIPCION,
                LOT.PRECIO_FINAL,
                CASE
                  WHEN LOT.ID_ESTATUSVTA = 'GARA' THEN 'A'
                  WHEN LOT.ID_ESTATUSVTA = 'PAG' THEN 'C'
                END AS ESTATUS_DESCRIPCION,
                CASE
                  WHEN GEN.TIPO = 'N' THEN ${this.G_TPOINGRESO}
                  WHEN GEN.TIPO = 'P' THEN  ${this.G_TPOINGRESOP}
                  WHEN GEN.TIPO = 'D' THEN  ${this.G_TPOINGRESOD}
                END AS TPINGRESO,
                LOT.NUM_BIENES
            FROM
                SERA.COMER_PAGOSREFGENS GEN
            LEFT JOIN
                SERA.CAT_TRANSFERENTE CAT ON GEN.NO_TRANSFERENTE = CAT.NO_TRANSFERENTE
            JOIN
                SERA.COMER_LOTES LOT ON GEN.ID_LOTE = LOT.ID_LOTE
            where
                GEN.id_pago  = ${paid}
                and
                LOT.LOTE_PUBLICO <> 0
                AND LOT.ID_LOTE = GEN.ID_LOTE
                AND EXISTS (
                    SELECT 1
                    FROM SERA.COMER_PAGOREF PAG
                    WHERE PAG.ID_PAGO = GEN.ID_PAGO
                    AND PAG.VALIDO_SISTEMA = 'S'
                    AND PAG.CONCILIADO IS NULL
                )

        `)
    }

    var C3 = async (lot: number) => {
      return await this.entity.query(`SELECT
            BXL.PCTSLOTE,
            COALESCE(CAT.CVMAN, '0') as mandato,
            BXL.NO_BIEN,
            LEFT(BIE.DESCRIPCION, 438)as description, 
            BXL.PRECIO_SIN_IVA,
            BXL.MONTO_NOAPP_IVA,
            BXL.IVA_FINAL
        FROM
            sera.BIEN BIE
        JOIN
            sera.COMER_BIENESXLOTE BXL ON BXL.ID_LOTE = ${lot}
        LEFT JOIN
            sera.CAT_TRANSFERENTE CAT ON BXL.NO_TRANSFERENTE = CAT.NO_TRANSFERENTE
        WHERE
            BXL.NO_BIEN = BIE.NO_BIEN
            and bxl.id_lote = ${lot}
        `)
    }
    let parameters = await this.getParameters({ address: 'I', eventId: data.event })
    await this.bienesLote(data.event, null)

    await this.entity.query(`
      DELETE  FROM  SERA.COMER_CABECERAS CAB
      WHERE    CAB.ID_EVENTO = ${data.event}
      AND        CAB.IDORDENGRABADA IS NULL
      AND        EXISTS (SELECT 1
                      FROM    SERA.COMER_DETALLES DET
                      WHERE    DET.ID_EVENTO         = CAB.ID_EVENTO
                    AND        DET.IDENTIFICADOR    = CAB.IDENTIFICADOR
                    AND        DET.ID_LOTE         = coalesce(${data.lot}, DET.ID_LOTE)
                    )`)
    await this.entity.query(`
      DELETE FROM sera.COMER_DETALLES WHERE ID_EVENTO = ${data.event} AND IDORDENGRABADA IS NULL AND ID_LOTE = coalesce(${data.lot}, ID_LOTE)
    `)
    if (data.phase == 1) {
      await this.entity.query(`
          UPDATE    SERA.COMER_BIENESXLOTE as  BXLS
          SET    PCTSLOTE = (SELECT    BXL.PRECIO_FINAL/LOT.PRECIO_FINAL
                              FROM    sera.COMER_LOTES LOT, sera.COMER_BIENESXLOTE BXL
                              WHERE    LOT.ID_EVENTO = ${data.event}
                              AND    LOT.ID_LOTE = BXL.ID_LOTE
                              AND    BXLS.NO_BIEN = BXL.NO_BIEN
                              )
          WHERE    EXISTS ( SELECT    1
                            FROM    sera.COMER_LOTES LOTS
                            WHERE    LOTS.ID_EVENTO = ${data.event}
                            AND      LOTS.ID_LOTE = BXLS.ID_LOTE
                          )
      `)
    }
    var O_IDENTI = (await this.entity.query(`select max(IDENTIFICADOR) as val1 from sera.comer_cabeceras where id_evento = ${data.event}`))[0]?.val1 || 0

    var USUARIO = (await this.entity.query(` SELECT coalesce(RTRIM(LTRIM(USUARIO_SIRSAE)),'SAE'||USER) as usuario
      FROM sera.SEG_USUARIOS
      WHERE USUARIO = '${data.usuario}'`))[0]?.usuario || ''
    for (const c1 of C1) {
      O_IDENTI = parseInt(O_IDENTI) + 1;
      var L_MANDATOS = (await this.entity.query(`
        SELECT COUNT(DISTINCT BXL.NO_TRANSFERENTE)
          FROM SERA.COMER_BIENESXLOTE BXL
          JOIN SERA.BIEN BIE ON BIE.NO_BIEN = BXL.NO_BIEN
          JOIN SERA.EXPEDIENTES EXP ON BIE.NO_EXPEDIENTE = EXP.NO_EXPEDIENTE
          WHERE EXISTS (
              SELECT 1
              FROM SERA.COMER_LOTES LOT
              WHERE LOT.ID_LOTE = ${data.lot}
              AND LOT.ID_LOTE = BXL.ID_LOTE
          )
      `))
      O_IDENTI = parseInt(O_IDENTI) + 1;
      var P_CONCEP = 'DEPOSITO POR VENTA DE BIENES INMUEBLES ' + 'EVENTO ' + data.descriptionEvent + ' ' + c1.estatusvta;
      await this.entity.query(`
        INSERT INTO sera.COMER_CABECERAS
                (IDENTIFICADOR,            CONSECUTIVO,    AREA,            DOCUMENTO,    UNRESPONSABLE,    CLIENTE_RFC,    CONCEPTO,
                 ANEXO,                    FECHA,            TIPOPE,            FORMAPAGO,    FECHAORDEN,        BANCO,            USAUTORIZA,
                 MONTO_TOTAL_PADRE,     NUMOVTO,        REFERENCIA,        IDPAGO,        ID_EVENTO)
                VALUES
                (${O_IDENTI},                0,                '${this.G_AREA}',            '${this.G_TPODOC}',    '${this.G_UR}',            '${c1.rfc}',            '${P_CONCEP}',
                 '${this.G_ANEXO}',                '${c1.fecha}',        '${this.G_TPOPERACION}',     'R',        '${c1.fecha}',        '${c1.valor}',        '${data.usuario}',
                 '${c1.monto}',                '${c1.no_movimiento}',         '${c1.ref}',            '${c1.id_pago}',    ${data.event});
      `)
      var c2Result = await C2(c1.id_pago)
      for (const c2 of c2Result) {
        var  H_IDENT = 0;

        if(L_MANDATOS >  1 && c2.tipo == 'N'){
          for (const c3 of await C3(data.lot)) {
            var D_CONCEP = 'Pago Normal A cuenta del bien '+c3.no_bien+' '+c3.description;
            H_IDENT++;
            if(c3.iva == 0 || !c3.iva){
              this.G_TASAIVA = 0
              await this.entity.query(`
                INSERT INTO sera.COMER_DETALLES
                  (IDENTIFICADOR,            CONSECUTIVO,                MANDATO,    INGRESO,    IMPORTE,
                    IVA,                    REFERENCIA,                 INDTIPO,    LOTESIAB,    DESCRIPCION,
                    ID_EVENTO,                UNRESPONSABLE,                IMPORTE_SIVA,             ID_LOTE,    TIPO_PAGO,
                    PORC_IVA,                PRECIO_VTA_LOTE
                  )
                  VALUES
                  ('${O_IDENTI}',                ${H_IDENT},                   '${c3.mandato}',    '${c2.tpingreso}',    ROUND(${c2.monto_app_iva}*${c3.pctslote},2),
                    ROUND(${c2.val0}*${c3.pctslote},2),    '${c2.ref}',                        '${c2.tipo}',        '${c2.lote_publico}',    '${D_CONCEP}',
                    ${data.event},    '${this.G_UR}',        ROUND(${c2.monto_noapp_iva}*${c3.pctslote},2),    ${c2.id_lote},    '${c2.estatus_descripcion}',
                    ${this.G_TASAIVA},    ${c2.precio_final}
                  )
              `)
              this.G_TASAIVA= 16;
            }else{
              await this.entity.query(`
              INSERT INTO sera.COMER_DETALLES
                (IDENTIFICADOR,            CONSECUTIVO,                MANDATO,    INGRESO,    IMPORTE,
                  IVA,                    REFERENCIA,                 INDTIPO,    LOTESIAB,    DESCRIPCION,
                  ID_EVENTO,                UNRESPONSABLE,                IMPORTE_SIVA,             ID_LOTE,    TIPO_PAGO,
                  PORC_IVA,                PRECIO_VTA_LOTE
                )
                VALUES
                ('${O_IDENTI}',                ${H_IDENT},                   '${c3.mandato}',    '${c2.tpingreso}',    ROUND(${c2.monto_app_iva}*${c3.pctslote},2),
                  ROUND(${c2.val0}*${c3.pctslote},2),    '${c2.ref}',                        '${c2.tipo}',        '${c2.lote_publico}',    '${D_CONCEP}',
                  ${data.event},    '${this.G_UR}',        ROUND(${c2.monto_noapp_iva}*${c3.pctslote},2),    ${c2.id_lote},    '${c2.estatus_descripcion}',
                  ${this.G_TASAIVA},    ${c2.precio_final}
                )
            `)
            }

          }
        }else{
          H_IDENT = Number(H_IDENT) + 1;
          var H_SIAB = 0;
          var H_CONCEP = "" 

          if(c2.num_bienes == 1){
            H_SIAB = (await this.entity.query(`
              SELECT    BXL.NO_BIEN
                           
                            FROM    SERA.COMER_BIENESXLOTE BXL
                            WHERE    BXL.ID_LOTE = ${c2.id_lote}
                            limit 1
            `))[0]?.no_bien
             H_CONCEP = c2.tipo_descripcion+' A cuenta de NO SIAB '+H_SIAB+' del lote '+c2.lote_publico+' bienes '+c2.lote; 
          }else{
             H_CONCEP = c2.tipo_descripcion+' A cuenta del lote '+c2.lote_publico+' que contiene '+c2.num_bienes+' bienes '+c2.lote; 
          }
          if(c2.val0 == 0 || !c2.val0){
            this.G_TASAIVA = 0;
            await this.entity.query(`
              INSERT INTO SERA.COMER_DETALLES
                (IDENTIFICADOR,    CONSECUTIVO,    MANDATO,        INGRESO,    IMPORTE,
                  IVA,            REFERENCIA,        INDTIPO,        LOTESIAB,    DESCRIPCION,
                ID_EVENTO,        UNRESPONSABLE,    IMPORTE_SIVA,    ID_LOTE,    TIPO_PAGO,
                PORC_IVA,        PRECIO_VTA_LOTE
                )
              VALUES
                (${O_IDENTI},        ${H_IDENT},        '${c2.mandate}',            '${c2.tpingreso}',    ${c2.monto_app_iva},
                ${c2.val0},            ${c2.ref},            '${c2.tipo}',            '${c2.lote_publico}',    '${H_CONCEP}',
                ${data.event},        '${this.G_UR}',            ${c2.monto_noapp_iva},         ${c2.id_lote},    '${c2.estatus_descripcion}',
                '${this.G_TASAIVA}',         ${c2.precio_final}
              )
            `)
          }else{
            this.G_TASAIVA = 16;

            await this.entity.query(`
            INSERT INTO SERA.COMER_DETALLES
              (IDENTIFICADOR,    CONSECUTIVO,    MANDATO,        INGRESO,    IMPORTE,
                IVA,            REFERENCIA,        INDTIPO,        LOTESIAB,    DESCRIPCION,
              ID_EVENTO,        UNRESPONSABLE,    IMPORTE_SIVA,    ID_LOTE,    TIPO_PAGO,
              PORC_IVA,        PRECIO_VTA_LOTE
              )
            VALUES
              (${O_IDENTI},        ${H_IDENT},        '${c2.mandate}',            '${c2.tpingreso}',    ${c2.monto_app_iva},
              ${c2.val0},            ${c2.ref},            '${c2.tipo}',            '${c2.lote_publico}',    '${H_CONCEP}',
              ${data.event},        '${this.G_UR}',            ${c2.monto_noapp_iva},         ${c2.id_lote},    '${c2.estatus_descripcion}',
              '${this.G_TASAIVA}',         ${c2.precio_final}
            )
          `)
          }
        }
      }
     
    }
    await this.typeAdjustPayment(data.event,data.lot)
    await this.ajustTwoDecimals(data.event,data.lot)
    return {
      statusCode:200,
      message:["OK"]
    }
  }


  async typeAdjustPayment(event:number,lot:number){
    var CTP = await this.entity.query(`
        SELECT
          DET.LOTESIAB,
          COUNT(DET.LOTESIAB) as val1
        FROM
            sera.COMER_DETALLES DET
        JOIN
            sera.COMER_CABECERAS CAB ON DET.ID_EVENTO = ${event}
        WHERE
            DET.ID_EVENTO = ${event}
            AND CAB.IDORDENGRABADA IS NULL
            AND DET.TIPO_PAGO = 'C'
            AND (DET.ID_LOTE = ${lot} OR ${lot} IS NULL) 
        GROUP BY
            DET.LOTESIAB
        HAVING
            COUNT(DET.LOTESIAB) > 1;  
    `)
    var ARU = await this.entity.query(`
      SELECT
        DET.LOTESIAB,
        COUNT(DET.LOTESIAB) val1
        FROM
            SERA.COMER_DETALLES DET
        JOIN
           SERA. COMER_CABECERAS CAB ON DET.ID_EVENTO = DET.id_evento
        WHERE
            DET.ID_EVENTO = ${event}
            AND DET.IDENTIFICADOR = CAB.IDENTIFICADOR
            AND CAB.IDORDENGRABADA IS NULL
            AND (DET.ID_LOTE = COALESCE(${lot}, DET.ID_LOTE))
            AND LEFT(DET.REFERENCIA, 1) = '1'
            AND DET.TIPO_PAGO = 'C'
        GROUP BY
            DET.LOTESIAB
        HAVING
            COUNT(DET.LOTESIAB) = 1
    `)

    var cont = 0 ;
    for (const ctp of CTP) {
      cont ++
      if(cont> 1){
        await this.entity.query(`
          UPDATE    SERA.COMER_DETALLES
          SET    TIPO_PAGO = 'A'
          WHERE    ID_EVENTO = ${event}
          AND    LOTESIAB =${lot}
          AND    IDORDENGRABADA IS NULL
        `)
      }
    }
    for (const aru of ARU) {
      if(cont == 1){
        await this.entity.query(` UPDATE    sera.COMER_DETALLES
        SET    TIPO_PAGO = 'T'
        WHERE    ID_EVENTO = ${event}
        AND    LOTESIAB = ${lot}
        AND    IDORDENGRABADA IS NULL`)
      }
    }
    await this.entity.query(`
      UPDATE    sera.COMER_DETALLES
      SET    TIPO_PAGO = 'T'
      WHERE    ID_EVENTO = ${event}
      AND    TIPO_PAGO IS NULL
      AND    IDORDENGRABADA IS NULL
      AND    INDTIPO IN ('D', 'P')
    `)

    return {
      statusCode:200,
      message:["OK"]
    }
  }
//AJUSTA_DEC
  async ajustTwoDecimals(event:number,lot:number){
    var OBTINDENT = 1
    await this.updateDecimal(event,OBTINDENT)
  }
  async findDifeDec(event:number,lot:number,ident:number){
    var C1  = await this.entity.query(`
      SELECT DISTINCT CAB.IDENTIFICADOR, CAB.MONTO_TOTAL_PADRE as monto
      FROM sera.COMER_CABECERAS CAB
      JOIN sera.COMER_DETALLES DET ON CAB.IDENTIFICADOR = DET.IDENTIFICADOR
      WHERE CAB.ID_EVENTO = ${event}
        AND DET.ID_EVENTO = ${event}
        AND DET.ID_LOTE = COALESCE(${lot}, DET.ID_LOTE)
        AND CAB.IDORDENGRABADA IS NULL
      ORDER BY 1
    `)

    var VIDENT       =0
    var VMONTO        = 0;
    var HMONTO        = 0;
    var AMONTO        = 0;
    for (const c1 of C1) {
      var monto = (await this.entity.query(`
          SELECT    SUM(ROUND(IMPORTE,2)+ ROUND(IVA,2) +ROUND(IMPORTE_SIVA,2) ) as v1
          FROM    sera.COMER_DETALLES
          WHERE    ID_EVENTO = ${event}
          AND    IDENTIFICADOR = '${c1.identificador}'
      `))[0]?.v1 || 0
      AMONTO = VMONTO - c1.monto
      if(AMONTO != 0 && Math.abs(AMONTO)< 1.0){
        VIDENT = c1.identificador
        break
      }
    }
    return {
      statusCode:200,
      message:["OK"],
      data:{
        ident:VIDENT
      }
    }
  }

  async updateDecimal(event:number,indent:number){
    var MIMPORTE = await this.entity.query(`
      SELECT    SUM(MONTO_TOTAL_PADRE)
      FROM    sera.COMER_CABECERAS
      WHERE    ID_EVENTO = ${event}
      AND    IDENTIFICADOR = ${indent};
    `)
    await this.entity.query(`
      UPDATE    sera.COMER_DETALLES
      SET    IMPORTE = ROUND(IMPORTE,2), IVA = ROUND(IVA,2), IMPORTE_SIVA = ROUND(IMPORTE_SIVA,2)
      WHERE    ID_EVENTO = ${event}
      AND    IDENTIFICADOR = ${indent};  
    `)
    var result = await this.entity.query(`
        SELECT    SUM(IMPORTE) val1, SUM(IVA) val2, SUM(IMPORTE_SIVA) val3
        FROM    sera.COMER_DETALLES
        WHERE    ID_EVENTO = ${event}
        AND    IDENTIFICADOR = ${indent};
    `)
     var MIMPORTED = result[0]?.val1 || 0
     var MIVAD = result[0]?.val2 ||0
     var MIMPSIVAD = result[0]?.val3 ||0
     var MORIGINAL = MIMPORTE;
     var MMODIFICADO = Number(MIMPORTED) + Number(MIVAD) + Number(MIMPSIVAD);
      var  MDIFE = MORIGINAL - MMODIFICADO;
      await this.adjustRegxMand(event,indent,MDIFE)
  }
  async adjustRegxMand(event:number, ident:number,dife:number){

    var AR_APP = 0

    var AJ = await this.entity.query(`
      SELECT   DISTINCT( MANDATO) as mandate
      FROM    sera.COMER_DETALLES
      WHERE    ID_EVENTO = ${event}
      AND    IDENTIFICADOR = ${ident}
    `)

      var AR_AUXCANT = Math.abs(dife);
       var  AR_NUMAND = await this.mandateDecimalNumber(event, ident);
       var  AR_CANT = dife / AR_NUMAND;
       if(Math.abs(AR_CANT) == AR_AUXCANT){
        AR_NUMAND = 1
       }
       for (const iterator of AJ) {
        await this.entity.query(`
          UPDATE    sera.COMER_DETALLES DET
          SET    IMPORTE_SIVA = IMPORTE_SIVA + ${AR_CANT}
          WHERE    ID_EVENTO = ${event}
          AND    IDENTIFICADOR = ${ident}
          AND    MANDATO = ${iterator.mandate}
          AND    IMPORTE_SIVA > ABS(${AR_CANT})
        `)

        AR_APP = AR_APP + Math.abs(AR_CANT);
        if(AR_NUMAND == 1) break;
        if((iterator.mandate-1) == 1){
          if(AR_AUXCANT-(AR_APP+Math.abs(AR_CANT)) != 0){
            AR_CANT = AR_CANT+(AR_AUXCANT-(AR_APP+Math.abs(AR_CANT)))
          }
        }

       }
       return {
        statusCode:200,
        message:["OK"]
       }
  }

  async mandateDecimalNumber(event:number, ident:number):Promise<number>{
    var mandate = (await this.entity.query(`
      SELECT    COUNT(DISTINCT MANDATO) as val1
      FROM    sera.COMER_DETALLES
      WHERE    ID_EVENTO = ${event}
      AND    IDENTIFICADOR = ${ident};
    `))[0]?.val1|| 0
    return mandate
  }

  async prepOiInmuAct(data:PrepOiInmuAct){
    var C1 = await this.entity.query(`
        SELECT
          PAG.ID_PAGO as P_IDPAGO,
          CLI.RFC as P_RFC, 
          TO_CHAR(PAG.FECHA, 'YYYYMMDD') as P_FECHA,
          PAG.MONTO as P_MONTO,
          SUBSTRING(PAG.REFERENCIAORI, 1, 30) as P_REFE,
          PAG.NO_MOVIMIENTO as P_MOVTO,
          LOT.LOTE_PUBLICO as P_LOTPUB,
          PAG.MONTO as P_MONIVA,
          SUBSTRING(LOT.DESCRIPCION, 1, 355) || ' PAGO DE ' ||
              CASE
                  WHEN LOT.ID_ESTATUSVTA = 'GARA' THEN 'GARANTIA'
                  WHEN LOT.ID_ESTATUSVTA = 'PAG' THEN 'LIQUIDACION'
              END as P_CONAUX,
          PAG.ID_LOTE as P_IDLOTE,
          PMO.VALOR as P_BANCO,
          (SELECT CVE_PROCESO FROM SERA.COMER_EVENTOS EVE WHERE EVE.ID_EVENTO = LOT.ID_EVENTO) AS P_CVE_EVENTO
      FROM
          SERA.COMER_PAGOREF PAG
      JOIN
          SERA.COMER_LOTES LOT ON LOT.ID_EVENTO = ${data.event} AND LOT.ID_LOTE = PAG.ID_LOTE
      JOIN
          SERA.COMER_CLIENTES CLI ON LOT.ID_CLIENTE = CLI.ID_CLIENTE
      JOIN
          SERA.COMER_PARAMETROSMOD PMO ON PAG.CVE_BANCO = PMO.PARAMETRO AND PMO.DIRECCION = 'C'
      WHERE
          PAG.VALIDO_SISTEMA = 'S'
          AND LOT.LOTE_PUBLICO != 0
          AND LOT.ID_LOTE = COALESCE(${data.lot}, LOT.ID_LOTE)
          AND PAG.IDORDENINGRESO IS NULL
          AND NOT EXISTS (
              SELECT 1
              FROM SERA.COMER_CABECERAS CAB
              WHERE CAB.IDPAGO = PAG.ID_PAGO
              AND CAB.IDORDENGRABADA IS NOT NULL
          )
          AND EXISTS (
              SELECT 1
              FROM SERA.COMER_CLIENTESXEVENTO CXE
              WHERE CXE.ID_EVENTO = ${data.event}
              AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
              AND CXE.PROCESAR = 'S'
          )
      ORDER BY
          LOT.LOTE_PUBLICO,
          PAG.REFERENCIA

    `)
    var C2 =async (paid:number)=>{
      return await this.entity.query(`
          SELECT
            (GEN.MONTO_APP_IVA + GEN.IVA) as H_MONTO,
            GEN.TIPO as H_TIPO,
            SUBSTRING(GEN.REFERENCIA, 1, 30) as H_REFE,
            GEN.MONTO_APP_IVA as H_MONIVA,
            GEN.IVA as H_IVA,
            1 as H_MOV,
            COALESCE(CAT.CVMAN, '0') as H_MAND,
            GEN.MONTO_NOAPP_IVA as H_MONSIVA,
            SUBSTRING(LOT.DESCRIPCION, 1, 430) as H_LOTDES,
            LOT.LOTE_PUBLICO as H_LOTPUB,
            LOT.ID_LOTE as H_IDLOTE,
            CASE
                WHEN GEN.TIPO = 'N' THEN 'Pago Normal'
                WHEN GEN.TIPO = 'P' THEN 'Pago a Penalizar'
                WHEN GEN.TIPO = 'D' THEN 'Pago a Devolver'
                ELSE NULL
            END AS H_DESCTIPO,
            LOT.PRECIO_FINAL as H_MONTOLOTE,
            CASE
                WHEN LOT.ID_ESTATUSVTA = 'VEN' THEN 'A'
                WHEN LOT.ID_ESTATUSVTA = 'GARA' THEN 'A'
                WHEN LOT.ID_ESTATUSVTA = 'PAG' THEN 'C'
                ELSE NULL
            END AS H_IDTIPO,
            CASE
                WHEN GEN.TIPO = 'N' THEN '${this.G_TPOINGRESO}'
                WHEN GEN.TIPO = 'P' THEN'${this.G_TPOINGRESOP}'
                WHEN GEN.TIPO = 'D' THEN '${this.G_TPOINGRESOD}'
                ELSE NULL
            END AS H_INGRESO,
            LOT.NUM_BIENES as H_NUMBIENES
        FROM
            sera.COMER_PAGOSREFGENS GEN
        JOIN
            sera.COMER_LOTES LOT ON GEN.ID_LOTE = LOT.ID_LOTE
        LEFT JOIN
            sera.CAT_TRANSFERENTE CAT ON GEN.NO_TRANSFERENTE = CAT.NO_TRANSFERENTE
        WHERE
            GEN.ID_PAGO = ${paid}
            AND LOT.LOTE_PUBLICO != 0
            AND LOT.ID_LOTE = GEN.ID_LOTE
            AND EXISTS (
                SELECT 1
                FROM sera.COMER_PAGOREF PAG
                WHERE PAG.ID_PAGO = GEN.ID_PAGO
                AND PAG.VALIDO_SISTEMA = 'S'
                AND PAG.CONCILIADO IS NULL
            )
  
      `)
    }
    var C3 = async (lot:number)=>{
      return await this.entity.query(`
        SELECT
          BXL.PCTSLOTE as D_PCT,
          COALESCE(CAT.CVMAN, '0') as D_MANDATO,
          BXL.NO_BIEN as D_NOBIEN,
          SUBSTRING(BIE.DESCRIPCION, 1, 438) as AUX_CONCEP,
          BXL.PRECIO_SIN_IVA as D_MONIVA,
          BXL.MONTO_NOAPP_IVA as D_MONSIVA,
          BXL.IVA_FINAL as D_IVA
        FROM
            BIENES BIE
        JOIN
            COMER_BIENESXLOTE BXL ON BXL.NO_BIEN = BIE.NO_BIEN
        LEFT JOIN
            CAT_TRANSFERENTE CAT ON BXL.NO_TRANSFERENTE = CAT.NO_TRANSFERENTE
        WHERE
            BXL.ID_LOTE = ${lot};
  
      `)
    }
    var C4 = async (lot:number)=>{
      return await this.entity.query(`
        SELECT TO_CHAR(BXL.NO_BIEN) as C_NO_BIEN
        FROM SERA.COMER_BIENESXLOTE BXL
        WHERE BXL.ID_LOTE = ${lot}
          ORDER BY BXL.NO_BIEN
        LIMIT 300;
      
      `)
    }
    var parametros = await this.getParameters({eventId:data.event,address:'I'})
    await this.bienesLote(data.event,null)
    await this.entity.query(`
      DELETE FROM SERA.COMER_CABECERAS CAB
      WHERE CAB.ID_EVENTO = ${data.event}
      AND CAB.IDORDENGRABADA IS NULL
      AND EXISTS (
          SELECT 1
          FROM SERA.COMER_DETALLES DET
          WHERE DET.ID_EVENTO = CAB.ID_EVENTO
          AND DET.IDENTIFICADOR = CAB.IDENTIFICADOR
          AND DET.ID_LOTE = COALESCE(${data.lot}, DET.ID_LOTE)
      )
    
    `)
    await this.entity.query(`        DELETE from sera.COMER_DETALLES WHERE ID_EVENTO = ${data.event} AND IDORDENGRABADA IS NULL AND ID_LOTE = COALESCE(${data.lot}, ID_LOTE)    `)
    if(data.phase == 1 ||data.phase == 7 ||data.phase == 3 ||data.phase == 4 ||data.phase == 2){
      await this.entity.query(`
          UPDATE    SERA.COMER_BIENESXLOTE BXLS
          SET    PCTSLOTE = (SELECT    BXL.PRECIO_FINAL/LOT.PRECIO_FINAL
                              FROM    SERA.COMER_LOTES LOT, SERA.COMER_BIENESXLOTE BXL
                              WHERE    LOT.ID_EVENTO = ${data.event}
                              AND    LOT.ID_LOTE = BXL.ID_LOTE
                              AND    LOT.ID_CLIENTE IS NOT NULL
                              AND    BXLS.NO_BIEN = BXL.NO_BIEN
                              limit 1
                              )
          WHERE    EXISTS (SELECT    1
                          FROM    SERA.COMER_LOTES LOTS
                          WHERE    LOTS.ID_EVENTO = ${data.event}
                          AND        LOTS.ID_CLIENTE IS NOT NULL
                          AND        LOTS.ID_LOTE = BXLS.ID_LOTE
                          )
      `)
    }

    var AUX_CONT =( await this.entity.query(` SELECT    MAX(IDENTIFICADOR) as val1
    FROM    SERA.COMER_CABECERAS
    WHERE    ID_EVENTO = ${data.event}`))[0]?.val1 || 0
    var O_IDENTI = AUX_CONT
    var USUARIO = (await this.entity.query(` SELECT coalesce(RTRIM(LTRIM(USUARIO_SIRSAE)),'SAE'||USER) as usuario
      FROM sera.SEG_USUARIOS
      WHERE USUARIO = '${data.user}'`))[0]?.usuario || ''
    for (const c1 of C1) {
      O_IDENTI = Number(O_IDENTI) + 1;
      var L_MANDATOS = (await this.entity.query(`
        SELECT COUNT(DISTINCT BXL.NO_TRANSFERENTE)
          FROM SERA.COMER_BIENESXLOTE BXL
          JOIN SERA.BIEN BIE ON BIE.NO_BIEN = BXL.NO_BIEN
          JOIN SERA.EXPEDIENTES EXP ON BIE.NO_EXPEDIENTE = EXP.NO_EXPEDIENTE
          WHERE EXISTS (
              SELECT 1
              FROM SERA.COMER_LOTES LOT
              WHERE LOT.ID_LOTE = ${data.lot}
              AND LOT.ID_LOTE = BXL.ID_LOTE
          )
      `))
      O_IDENTI = Number(O_IDENTI) + 1;
      var P_CONCEP = 'DEPOSITO POR VENTA DE BIENES INMUEBLES '+ 'EVENTO ' +data.descriptionEvent +' '+c1.p_conaux;
      await this.entity.query(`
       INSERT INTO sera.COMER_CABECERAS
        (IDENTIFICADOR,            CONSECUTIVO,    AREA,            DOCUMENTO,    UNRESPONSABLE,    CLIENTE_RFC,    CONCEPTO,
        ANEXO,                    FECHA,            TIPOPE,            FORMAPAGO,    FECHAORDEN,        BANCO,            USAUTORIZA,
        MONTO_TOTAL_PADRE,     NUMOVTO,        REFERENCIA,        IDPAGO,        ID_EVENTO, CVE_EVENTO)
        VALUES
        (${O_IDENTI},                0,                '${this.G_AREA}',            '${this.G_TPODOC}',    '${this.G_UR}',            '${c1.p_rfc}',            '${P_CONCEP}',
        '${this.G_ANEXO}',                '${c1.p_fecha}',        '${this.G_TPOPERACION}',     'R',        '${c1.p_fecha}',        '${c1.p_banco}',        '${USUARIO}',
        '${c1.p_monto}',                '${c1.p_movto}',         '${c1.p_refe}',            '${c1.p_idpago}',    ${data.event}, '${c1.p_cve_evento}')
      `)
      for (const c2 of await C2(c1.p_idpago)) {
        var H_IDENT = 0;
        if(c2.h_tipo == 'D' && ["1","2","3","4"].includes((`${c2.h_refe}`.substring(0,1))))   {
          var H_IDTIPO = 'T'
        }
        if(c2.h_tipo == 'A' && ["3","4"].includes((`${c2.h_refe}`.substring(0,1))))   {
          var H_IDTIPO = 'C'
        }
        if(L_MANDATOS >  1 && c2.h_tipo== 'N'){
          var AUX_CONCEP = null
          for (const c3 of await C3(data.lot)) {
            var D_CONCEP = 'Pago Normal A cuenta del bien '+c3.d_nobien +' '+AUX_CONCEP;
            H_IDENT ++;
            this.G_TASAIVA = 16
            if(c2.h_iva == 0 || !c2.h_iva){
              this.G_TASAIVA = 0
              await this.entity.query(`
              INSERT INTO SERA.COMER_DETALLES
                (IDENTIFICADOR,            CONSECUTIVO,                MANDATO,    INGRESO,    IMPORTE,
                  IVA,                    REFERENCIA,                 INDTIPO,    LOTESIAB,    DESCRIPCION,
                  ID_EVENTO,                UNRESPONSABLE,                IMPORTE_SIVA,             ID_LOTE,    TIPO_PAGO,
                  PORC_IVA,                PRECIO_VTA_LOTE
                )
              VALUES
                  (${O_IDENTI},                ${H_IDENT},                    ${c3.d_mandato},    '${c2.h_ingreso}',    ROUND(${c2.h_moniva}*${c3.d_pct},2),
                    ROUND(${c2.h_iva}*${c3.d_pct},2),    '${c2.h_refe}',                        '${c2.h_tipo}',        '${c2.h_lotpub}',    '${D_CONCEP}',
                    ${data.event},    '${this.G_UR}',        ROUND(${c2.h_monsiva}*${c3.d_pct},2),    '${c2.h_idlote}',    '${c2.h_idtipo}',
                    '${this.G_TASAIVA}',                '${c2.h_montolote}'
                  )
              `)
              this.G_TASAIVA = 16;
            }else{
              await this.entity.query(`
              INSERT INTO SERA.COMER_DETALLES
                (IDENTIFICADOR,            CONSECUTIVO,                MANDATO,    INGRESO,    IMPORTE,
                  IVA,                    REFERENCIA,                 INDTIPO,    LOTESIAB,    DESCRIPCION,
                  ID_EVENTO,                UNRESPONSABLE,                IMPORTE_SIVA,             ID_LOTE,    TIPO_PAGO,
                  PORC_IVA,                PRECIO_VTA_LOTE
                )
              VALUES
                  (${O_IDENTI},                ${H_IDENT},                    ${c3.d_mandato},    '${c2.h_ingreso}',    ROUND(${c2.h_moniva}*${c3.d_pct},2),
                    ROUND(${c2.h_iva}*${c3.d_pct},2),    '${c2.h_refe}',                        '${c2.h_tipo}',        '${c2.h_lotpub}',    '${D_CONCEP}',
                    ${data.event},    '${this.G_UR}',        ROUND(${c2.h_monsiva}*${c3.d_pct},2),    '${c2.h_idlote}',    '${c2.h_idtipo}',
                    '${this.G_TASAIVA}',                '${c2.h_montolote}'
                  )
              `)
            }
          }
        }else{
          H_IDENT ++
          var H_SIAB = 0
          this.G_TASAIVA = 16
          var H_CONCEP = ""
          if(c2.h_numbienes == 1){
            H_SIAB =(await this.entity.query(`
              SELECT    BXL.NO_BIEN
              FROM    sera.COMER_BIENESXLOTE BXL
              WHERE    BXL.ID_LOTE = ${c2.h_idlote}
              limit 1
            `))[0]?.no_bien
            H_CONCEP =c2.h_desctipo+' A cuenta de NO SIAB '+(H_SIAB)+' '+'del lote '+(c2.h_lotpub)+' '+ c2.h_lotdes
          }else{
            H_CONCEP = c2.h_desctipo||' A cuenta del lote '+(c2.h_lotpub)+' que contiene '+ (c2.h_numbienes)+' bienes '+`${c2.h_lotdes}`.substring(0,410);
          }
          if(c2.h_iva == 0 || !c2.h_iva){
            this.G_TASAIVA = 0
            await this.entity.query(`
              INSERT INTO sera.COMER_DETALLES
                (IDENTIFICADOR,    CONSECUTIVO,    MANDATO,        INGRESO,    IMPORTE,
                  IVA,            REFERENCIA,        INDTIPO,        LOTESIAB,    DESCRIPCION,
                ID_EVENTO,        UNRESPONSABLE,    IMPORTE_SIVA,    ID_LOTE,    TIPO_PAGO,
                PORC_IVA,        PRECIO_VTA_LOTE
              )
              VALUES
                (${O_IDENTI},        ${H_IDENT},        '${c2.h_mand}',            '${c2.h_ingreso}',    '${c2.h_moniva}',
                '${c2.h_iva}',            '${c2.h_refe}',            '${c2.h_tipo}',            '${c2.h_lotpub}',    '${H_CONCEP}',
                ${data.event},        '${this.G_UR}',            '${c2.h_monsiva}',        '${c2.h_idlote}',    '${c2.h_idtipo}',
                ${this.G_TASAIVA},        '${c2.h_montolote}'
              )
            `)
            this.G_TASAIVA = 16;

          }else{
            await this.entity.query(`
            INSERT INTO sera.COMER_DETALLES
              (IDENTIFICADOR,    CONSECUTIVO,    MANDATO,        INGRESO,    IMPORTE,
                IVA,            REFERENCIA,        INDTIPO,        LOTESIAB,    DESCRIPCION,
              ID_EVENTO,        UNRESPONSABLE,    IMPORTE_SIVA,    ID_LOTE,    TIPO_PAGO,
              PORC_IVA,        PRECIO_VTA_LOTE
            )
            VALUES
              (${O_IDENTI},        ${H_IDENT},        '${c2.h_mand}',            '${c2.h_ingreso}',    '${c2.h_moniva}',
              '${c2.h_iva}',            '${c2.h_refe}',            '${c2.h_tipo}',            '${c2.h_lotpub}',    '${H_CONCEP}',
              ${data.event},        '${this.G_UR}',            '${c2.h_monsiva}',        '${c2.h_idlote}',    '${c2.h_idtipo}',
              ${this.G_TASAIVA},        '${c2.h_montolote}'
            )
          `)
          }
        }

      }
      var A_NO_BIEN = ""
      for (const c4 of await C4(data.lot)) {
        A_NO_BIEN = c4.no+A_NO_BIEN+"-"
      }
      A_NO_BIEN = A_NO_BIEN.substring(0,A_NO_BIEN.length-1)
      await this.entity.query(`
        UPDATE sera.COMER_DETALLES
          SET BIENESSIAB   = SUBSTR('${A_NO_BIEN}',1,3000)
        WHERE ID_EVENTO    = ${data.event}
          AND LOTESIAB     = ${data.publicLot}
          AND ID_LOTE      = ${data.lot}
      `)
      A_NO_BIEN = ""
    }

    await this.typeAdjustPayment(data.event,data.lot)
    await this.ajustTwoDecimals(data.event,data.lot)
    
    return {
      statusCode:200,
      message:["OK"]
    }
  }

  async actEstGralIAct(data:UpdateCurrentGeneralStatus){
    await this.actLotesInmuAct({
      event:data.event,
      phase:data.phase,lot:data.lot,publicLot:data.publicLot
    })
    if([3,4,7,2,1].includes(data.phase)){
      await this.remesas(data.event)
      await this.historic({address:'I',event:data.event,user:data.user})
      if(data.phase == 4){
        await this.blackList(data.event)
      }
    }
    return {
      statusCode:200,
      message:["OK"]
    }
  }
  async actEstGralI(data:UpdateCurrentGeneralStatus){
    await this.actLotesInmuAct({
      event:data.event,
      phase:data.phase,lot:data.lot,publicLot:data.lot
    })
    if([1,2].includes(data.phase)){
      await this.remesas(data.event)
      await this.historic({address:'I',event:data.event,user:data.user})
      if(data.phase == 2){
        await this.blackList(data.event)
      }
    }
    return {
      statusCode:200,
      message:["OK"]
    }
  }
}
