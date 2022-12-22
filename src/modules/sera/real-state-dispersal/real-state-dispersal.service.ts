import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ACUMDETALLESOI } from './dto/acum-detalles.dto';
import { SALDO } from './dto/saldos.dto';
import { ValPenaLot, ValuePenaLot } from './dto/value-pena-lot.dto';
import { ComerLotsEntity } from './entity/comer-lots.entity';

@Injectable()
export class RealStateDispersalService {

    DETOI: ACUMDETALLESOI[] = []
    DETAUX: ACUMDETALLESOI[] = []
    tab_VALPENALOTE: ValuePenaLot[] = [];
    n_MONTO_DIF_LIQ: number
    n_MONTO_LIQ: number
    tab_SALDOS: SALDO[] = [];
    tab_LOTES: number[] = [];
    tab_PAGOS: number[];
    n_CONT_PAGOS: 0;
    l_BAN_PAGOS: boolean;
    n_ID_EVENTO: number;
    n_ORDEN_LOTES: number;
    c_ERROR: string;
    n_MONTO_TOT_PAGO: number
    n_MONTO_TOT_CLIE: number
    n_ID_PAGO: number;
    c_REFERENCIA: string;
    n_NO_MOVIMIENTO: number;
    f_FECHA: Date;
    n_MONTO: number;
    c_CVE_BANCO: string;
    n_CODIGO: number;
    n_ID_LOTE: number;
    c_TIPO: string;
    f_FECHA_REGISTRO: Date;
    c_REFERENCIAORI: string;
    c_CUENTA: string;
    n_NO_TRANSFERENTE: number;
    l_BAN: boolean;
    n_ID_PAGOREFGENS: number;
    n_PORC_IVA: number;
    n_TASAIVA: number;
    n_TCANT_LOTES: number;
    n_TLOTE: number;
    n_SALDO_GARANT: number;
    n_MONTO_DIF: number;
    n_CVE_EJEC: number;
    e_EXCEPPROC: any;
    c_REL_LOTES: string;
    n_COMA: number;
    n_SALDO_PRECIO_FINAL: number
    n_SALDO_ANTICIPO: number
    n_SALDO_PRECIO_GARANTIA: number
    n_SALDO_MONTO_LIQ: number
    n_SALDO_GARANTIA_ASIG: number
    n_MONTO_PRECIO_GARANTIA: number
    n_IND_FINAL: number;
    c_CVE_PROCESO: string;
    n_ID_CLIENTE: number
    n_LOTE_PUBLICO: number
    p_MSG_PROCESO: string
    p_EST_PROCESO: number;
    n_REL_CLIENTE: number;
    n_IND_REPRO: number;
    c_PARAMETRO: string;
    c_VALOR: string;
    n_ID_TPEVENTO: number;
    c_DIRECCION: string;
    c_IND_MOV: string;
    f_FEC_FALLO: Date
    f_FECHA_CIERRE_EVENTO: Date
    f_FECHA_NOTIFICACION: Date
    n_NUM_DIAS: number;
    c_TIPO_LC: string;
    c_TABLA_APLICA: string
    c_IND_FEC: string
    c_IND_MONTO: string
    n_DIAS_GRACIA_CHEQUE: number
    n_DIAS_GRACIA_TRANSF: number
    f_FECHA_GRACIA_GARANT: Date
    f_FECHA_GRACIA_LIQ: Date
    c_LLAVE: string
    n_VALIDA: number;
    n_PORPENAIP: number
    n_PORGARCUMSE: number
    n_MONPENAIP: number
    n_PFMPENAIP: number
    n_ADPGPENAIP: number
    n_EXENTAPENA: number
    c_CONIVA: string;
    l_BANP: boolean;
    f_FECHA_INI_PENA: Date;
    G_IVA = 0
    G_NUMLOTES = 0
    G_UR: string
    G_TPOPERACION = 0;
    G_TPOINGRESO: string
    G_AREA: string
    G_TPODOC: string
    G_ANEXO: string
    G_PCTCHATARRA = 0;
    G_TASAIVA: number
    G_TPOINGRESOP: string
    G_TPOINGRESOD: string
    G_MANDDEV: string
    G_USAUTORIZA: string
    constructor(@InjectRepository(ComerLotsEntity) private entity: Repository<ComerLotsEntity>) {
        this.detailAdjustMandates(16)
    }


    //PROCEDIMIENTO PARA AJUSTAR LOS IMPORTES DE PAGOS VS IMPORTES DE LOTES EN DETALLE MANDATOS
    async detailAdjustMandates(lot: number): Promise<string> {

        var ni_ID_LOTE: number
        var ni_IVA_FINAL: number
        var ni_MONTO_APP_IVA: number
        var ni_MONTO_NOAPP_IVA: number
        var ni_IDENTIFICADOR: number;
        var pi_RESUL = 'OK';
        var ni_ID_LOTE = lot;


        var re_MAND_DIF: any[] = await this.entity.query(`SELECT A.MANDATO,
                    BXL_MONTO_APP_IVA - CD_MONTO_APP_IVA DIF_MONTO_APP_IVA,
                    BXL_IVA_FINAL - CD_IVA_FINAL DIF_IVA_FINAL,
                    BXL_MONTO_NOAPP_IVA - CD_MONTO_NOAPP_IVA DIF_MONTO_NOAPP_IVA
                    FROM (SELECT coalesce(CAT.CVMAN,'0') MANDATO,
                            BXL.ID_LOTE,
                            SUM(BXL.MONTO_APP_IVA) BXL_MONTO_APP_IVA,
                            SUM(BXL.IVA_FINAL) BXL_IVA_FINAL,
                            SUM(BXL.MONTO_NOAPP_IVA) BXL_MONTO_NOAPP_IVA
                    FROM sera.COMER_BIENESXLOTE BXL,
                            sera.CAT_TRANSFERENTE CAT,
                            sera.BIENES BIE
                    WHERE BIE.NO_BIEN = BXL.NO_BIEN
                        AND BXL.NO_TRANSFERENTE = CAT.NO_TRANSFERENTE
                        AND BXL.ID_LOTE = ${lot}
                    GROUP BY coalesce(CAT.CVMAN,'0'), BXL.ID_LOTE) A,
                    (SELECT CD.MANDATO,
                            CD.ID_LOTE,
                            SUM(CD.IMPORTE) CD_MONTO_APP_IVA,
                            SUM(CD.IVA) CD_IVA_FINAL,
                            SUM(CD.IMPORTE_SIVA) CD_MONTO_NOAPP_IVA
                    FROM sera.COMER_DETALLES CD
                    WHERE CD.ID_LOTE = ${lot}
                        AND CD.INDTIPO = 'N'
                    GROUP BY CD.MANDATO, CD.ID_LOTE) B
            WHERE A.MANDATO = B.MANDATO
                AND A.ID_LOTE = B.ID_LOTE
                AND (BXL_MONTO_APP_IVA - CD_MONTO_APP_IVA <> 0 OR
                    BXL_IVA_FINAL - CD_IVA_FINAL <> 0 OR
                    BXL_MONTO_NOAPP_IVA - CD_MONTO_NOAPP_IVA <> 0)`)

        var query: any[] = await this.entity.query(`SELECT (BXL_MONTO_APP_IVA - CD_MONTO_APP_IVA) as param1,
                (BXL_IVA_FINAL - CD_IVA_FINAL) as param2,
                    (BXL_MONTO_NOAPP_IVA - CD_MONTO_NOAPP_IVA) as param3 
            FROM (SELECT BXL.ID_LOTE,
                            SUM(coalesce(BXL.MONTO_APP_IVA,0)) BXL_MONTO_APP_IVA,
                            SUM(coalesce(BXL.IVA_FINAL,0)) BXL_IVA_FINAL,
                            SUM(coalesce(BXL.MONTO_NOAPP_IVA,0)) BXL_MONTO_NOAPP_IVA
                    FROM sera.COMER_BIENESXLOTE BXL
                    WHERE BXL.ID_LOTE = ${lot}
                    GROUP BY BXL.ID_LOTE) A,
                    (SELECT CD.ID_LOTE,
                            SUM(coalesce(CD.IMPORTE,0)) CD_MONTO_APP_IVA,
                            SUM(coalesce(CD.IVA,0)) CD_IVA_FINAL,
                            SUM(coalesce(CD.IMPORTE_SIVA,0)) CD_MONTO_NOAPP_IVA
                    FROM sera.COMER_DETALLES CD
                    WHERE CD.ID_LOTE = ${lot}
                        AND CD.INDTIPO = 'N'
                    GROUP BY CD.ID_LOTE) B
            WHERE A.ID_LOTE = B.ID_LOTE`)
        if (query.length > 0) {
            ni_MONTO_APP_IVA = query[0].param1 || 0
            ni_IVA_FINAL = query[0].param2 || 0
            ni_MONTO_NOAPP_IVA = query[0].param3 || 0
            if (ni_MONTO_APP_IVA == 0) {
                ni_IVA_FINAL = 0
                ni_MONTO_NOAPP_IVA = 0
                const query1: any[] = await this.entity.query(`SELECT MAX(IDENTIFICADOR)  as mx
                        FROM sera.COMER_DETALLES CD
                        WHERE ID_LOTE = ${lot}
                        AND EXISTS (SELECT 1 FROM sera.COMER_CABECERAS CC WHERE CC.IDENTIFICADOR = CD.IDENTIFICADOR AND EXISTS (SELECT 1 FROM sera.COMER_PAGOREF PR WHERE PR.ID_PAGO = CC.IDPAGO AND IDORDENINGRESO IS NULL))
                        AND INDTIPO = 'N'`)
                ni_IDENTIFICADOR = query1[0]?.mx || null
                if (ni_IDENTIFICADOR) {
                    re_MAND_DIF.forEach(async element => {
                        await this.entity.query(`  UPDATE sera.COMER_DETALLES
                            SET IVA          = IVA + ${element.dif_iva_final},
                                IMPORTE      = IMPORTE + ${element.dif_monto_app_iva},
                                IMPORTE_SIVA = IMPORTE_SIVA + ${element.dif_monto_noapp_iva}
                          WHERE ID_LOTE = ${lot}
                            AND MANDATO = '${element.mandato}'
                            AND IDENTIFICADOR = ${ni_IDENTIFICADOR}`)
                    });
                }
            }

        } else {
            pi_RESUL = `No se pudieron obtener los importes por Lote ${lot}`
        }


        return pi_RESUL
    }

    // -- PROCEDIMIENTO PARA AJUSTAR LOS IMPORTES DE PAGOS VS IMPORTES DE LOTES --
    async adjustPaymentRefGens(event: number, lot: number): Promise<string> {
        var ni_ID_EVENTO = event
        var ni_ID_LOTE = lot
        var ni_IVA_LOTE: number
        var ni_MONTO_APP_IVA: number
        var ni_MONTO_NOAPP_IVA: number
        var ni_ID_PAGOREFGENS: number
        var pi_RESUL = "OK"

        var query: any[] = await this.entity.query(`SELECT SUM(coalesce(IVA,0)) as param1,
                    SUM(coalesce(MONTO_APP_IVA,0)) as param2,
                    SUM(coalesce(MONTO_NOAPP_IVA,0)) as param3

            FROM sera.COMER_PAGOSREFGENS 
            WHERE ID_EVENTO = ${event}
                AND ID_LOTE = ${lot}
                AND TIPO = 'N'`);
        ni_IVA_LOTE = query[0].param1 || 0
        ni_MONTO_APP_IVA = query[0].param2 || 0
        ni_MONTO_NOAPP_IVA = query[0].param3 || 0
        if (ni_IVA_LOTE == 0 && ni_MONTO_APP_IVA == 0 && ni_MONTO_NOAPP_IVA == 0) return "No se pudieron obtener los importes de los pagos (Lote " + obj.LOTE_PUBLICO + ")."

        var obj = this.tab_VALPENALOTE.filter(x => x.ID_LOTE == ni_ID_LOTE)[0];

        if ((ni_IVA_LOTE + ni_MONTO_APP_IVA + ni_MONTO_NOAPP_IVA) == (obj.IVA_LOTE + obj.MONTO_APP_IVA + obj.MONTO_NOAPP_IVA)) {
            if (ni_IVA_LOTE != obj.IVA_LOTE || ni_MONTO_APP_IVA != obj.MONTO_APP_IVA || ni_MONTO_NOAPP_IVA != obj.MONTO_NOAPP_IVA) {
                const query1: any[] = await this.entity.query(` SELECT MAX(ID_PAGOREFGENS) as mx
                    FROM sera.COMER_PAGOSREFGENS PRG
                    WHERE ID_EVENTO = ${ni_ID_EVENTO} 
                        AND ID_LOTE = ${ni_ID_LOTE} 
                        AND EXISTS (SELECT 1 FROM sera.COMER_PAGOREF PR WHERE PR.ID_PAGO = PRG.ID_PAGO AND IDORDENINGRESO IS NULL)
                        AND TIPO = 'N'`)
                ni_ID_PAGOREFGENS = query[0]?.mx || 0
                if (ni_ID_PAGOREFGENS != null) {
                    await this.entity.query(` UPDATE sera.COMER_PAGOSREFGENS
                    SET IVA             = IVA + (${obj.IVA_LOTE}- ${ni_IVA_LOTE}),
                        MONTO_APP_IVA   = MONTO_APP_IVA + (${obj.MONTO_APP_IVA}- ${ni_MONTO_APP_IVA}),
                        MONTO_NOAPP_IVA = MONTO_NOAPP_IVA + (${obj.MONTO_NOAPP_IVA} - ${ni_MONTO_NOAPP_IVA})
                  WHERE ID_PAGOREFGENS = ${ni_ID_PAGOREFGENS}
                    AND ID_EVENTO = ${ni_ID_EVENTO}
                    AND ID_LOTE = ${ni_ID_LOTE}`)
                }
            }
        } else {
            pi_RESUL = "Los importes del Lote " + obj.LOTE_PUBLICO + " no concuerda con el de los pagos (Lote: " + (obj.IVA_LOTE + obj.MONTO_APP_IVA + obj.MONTO_NOAPP_IVA) + ", Pagos: " + (ni_IVA_LOTE + ni_MONTO_APP_IVA + ni_MONTO_NOAPP_IVA) + ")."
        }

        return pi_RESUL

    }

    //-- CORRIGE LOS DECIMALES Y SIMPLIFICA LOS REGISTRO POR MANDATO DE LO QUE SE ENVIARA A SIRSAE --
    async utitDecGroup(amount: number) {
        var PRIMERA_VEZ = 1
        var H = 0
        var UD_NUEVO = 1

        this.DETAUX = []

        this.DETOI.forEach(element => {
            if (PRIMERA_VEZ == 1) {
                H = H + 1;
                var detauxObj: ACUMDETALLESOI = {}
                detauxObj.IDENTIFICADOR = element.IDENTIFICADOR;
                detauxObj.MANDATO = element.MANDATO;
                detauxObj.INGRESO = element.INGRESO;
                detauxObj.IMPORTE = element.IMPORTE;
                detauxObj.IVA = element.IVA;
                detauxObj.REFERENCIA = element.REFERENCIA;
                detauxObj.INDTIPO = element.INDTIPO;
                detauxObj.LOTESIAB = element.LOTESIAB;
                detauxObj.DESCRIPCION = element.DESCRIPCION;
                detauxObj.EVENTO = element.EVENTO;
                detauxObj.LOTE = element.LOTE;
                detauxObj.VTALOTE = element.VTALOTE;
                detauxObj.MONTORET = element.MONTORET;
                detauxObj.MONSIVA = element.MONSIVA;
                detauxObj.TIPO_PAGO = element.TIPO_PAGO;
                this.DETAUX.push(detauxObj)

            } else {
                UD_NUEVO = 1;

                for (let index = 0; index < this.DETAUX.length; index++) {
                    if (this.DETAUX[index].MANDATO == element.MANDATO) {
                        this.DETAUX[index].IMPORTE = this.DETAUX[index].IMPORTE + element.IMPORTE;
                        this.DETAUX[index].IVA = this.DETAUX[index].IVA + element.IVA;
                        this.DETAUX[index].MONSIVA = this.DETAUX[index].MONSIVA + element.MONSIVA;
                        this.DETAUX[index].MONTORET = this.DETAUX[index].MONTORET + element.MONTORET;

                        UD_NUEVO = 0;
                        break
                    }

                }

                if (UD_NUEVO == 1) {
                    var detauxObj1: ACUMDETALLESOI = {}
                    detauxObj1.IDENTIFICADOR = element.IDENTIFICADOR;
                    detauxObj1.MANDATO = element.MANDATO;
                    detauxObj1.INGRESO = element.INGRESO;
                    detauxObj1.IMPORTE = element.IMPORTE;
                    detauxObj1.IVA = element.IVA;
                    detauxObj1.REFERENCIA = element.REFERENCIA;
                    detauxObj1.INDTIPO = element.INDTIPO;
                    detauxObj1.LOTESIAB = element.LOTESIAB;
                    detauxObj1.DESCRIPCION = element.DESCRIPCION;
                    detauxObj1.EVENTO = element.EVENTO;
                    detauxObj1.LOTE = element.LOTE;
                    detauxObj1.VTALOTE = element.VTALOTE;
                    detauxObj1.MONTORET = element.MONTORET;
                    detauxObj1.MONSIVA = element.MONSIVA;
                    detauxObj1.TIPO_PAGO = element.TIPO_PAGO;
                    this.DETAUX[H] = detauxObj1
                    H = H + 1;
                }
            }
            PRIMERA_VEZ = PRIMERA_VEZ + 1;
        });
    }

    async getParameters(event: number, address: string) {
        var nf_ID_TPEVENTO = 1;
        var query: any[] = await this.entity.query(`SELECT ID_TPEVENTO 
        FROM sera.COMER_EVENTOS
         WHERE ID_EVENTO = ${event}`)
        if (query.length > 0) {
            nf_ID_TPEVENTO = query[0].id_tpevento
        }

        if (nf_ID_TPEVENTO == 5) {
            this.G_NUMLOTES = 0;
        } else {
            var query1: any[] = await this.entity.query(` SELECT    VALOR::numeric 
                FROM    sera.COMER_PARAMETROSMOD PAR, sera.COMER_EVENTOS EVE
                WHERE    PAR.PARAMETRO = 'NUMLOTGARLICP'
                AND        PAR.DIRECCION = 'C'
                AND        EVE.ID_EVENTO = ${event}
                AND        PAR.ID_TPEVENTO = EVE.ID_TPEVENTO`)
            if (query1.length > 0) {
                this.G_NUMLOTES = query1[0].valor
            } else {
                return 'NO EXISTE EL PARAMETRO NUMLOTGARLICP PARA EL TIPO DE EVENTO'
            }
        }



        if (nf_ID_TPEVENTO = 5) {
            const queryValor: any[] = await this.entity.query(`SELECT VALOR
            AS  G_UR
            FROM   sera.COMER_PARAMETROSMOD PAR
            WHERE  PAR.PARAMETRO = 'UR'
            AND    PAR.DIRECCION = LTRIM(TO_CHAR(${nf_ID_TPEVENTO}))`);
            this.G_UR = queryValor[0].G_UR;
        } else {
            const queryValor2: any[] = await this.entity.query(`SELECT VALOR
            AS   G_UR
            FROM   sera.COMER_PARAMETROSMOD PAR
            WHERE  PAR.PARAMETRO = 'UR'
            AND    PAR.DIRECCION = 'C'
            AND    COALESCE(PAR.ID_TPEVENTO,0) = DECODE(${nf_ID_TPEVENTO},5,5,13,13,0)`);
            this.G_UR = queryValor2[0].G_UR;
        }
        if (this.G_UR == "" || !this.G_UR)
            return 'NO EXISTE EL PARAMETRO UR';

        const queryValor3: any[] = await this.entity.query(`SELECT    TO_number
            AS    G_TPOPERACION
            FROM    sera.COMER_PARAMETROSMOD PAR
            WHERE    PAR.PARAMETRO = 'TPOPERACION'
            AND        PAR.DIRECCION = ${address}
            AND COALESCE(PAR.ID_TPEVENTO,0) = DECODE(${nf_ID_TPEVENTO},13,13,0)`);
        this.G_TPOPERACION = queryValor3[0].G_TPOPERACION;

        if (this.G_TPOPERACION == 0 || !this.G_TPOPERACION)
            return 'NO EXISTE EL PARAMETRO TPOPERACION PARA LA DIRECCION ' || address;

        const queryValor4: any[] = await this.entity.query(`SELECT    VALOR
            AS    G_TPOINGRESO
            FROM    sera.COMER_PARAMETROSMOD PAR
            WHERE    PAR.PARAMETRO = 'TPOINGRESO'
            AND        PAR.DIRECCION = ${address}
            AND COALESCE(PAR.ID_TPEVENTO,0) = DECODE(${nf_ID_TPEVENTO},5,5,13,13,0)`);
        this.G_TPOINGRESO = queryValor4[0].G_TPOINGRESO;
        if (this.G_TPOINGRESO == "" || !this.G_TPOINGRESO)
            return 'NO EXISTE EL PARAMETRO TPOINGRESO PARA LA DIRECCION ' || address;

        const queryValor5: any[] = await this.entity.query(`SELECT    VALOR
            AS    G_AREA
            FROM    sera.COMER_PARAMETROSMOD PAR
            WHERE    PAR.PARAMETRO = 'AREA'
            AND        PAR.DIRECCION = ${address}
            AND COALESCE(PAR.ID_TPEVENTO,0) = DECODE(nf_ID_TPEVENTO,13,13,0)`);
        this.G_AREA = queryValor5[0].G_AREA;
        if (this.G_TPOINGRESO == "" || !this.G_TPOINGRESO)
            return 'NO EXISTE EL PARAMETRO AREA PARA LA DIRECCION ' || address;


        const queryValor6: any[] = await this.entity.query(`SELECT    VALOR
            AS    G_TPODOC
            FROM    sera.COMER_PARAMETROSMOD PAR
            WHERE    PAR.PARAMETRO = 'TPODOCUMENTO'
            AND        PAR.DIRECCION = 'C'`);
        this.G_TPODOC = queryValor6[0].G_TPODOC;
        if (this.G_TPODOC == "" || !this.G_TPODOC)
            return 'NO EXISTE EL PARAMETRO TPODOCUMENTO';


        const queryValor7: any[] = await this.entity.query(`SELECT    VALOR
            AS    G_ANEXO
            FROM    sera.COMER_PARAMETROSMOD PAR
            WHERE    PAR.PARAMETRO = 'ANEXO'
            AND        PAR.DIRECCION = 'C'`);
        this.G_ANEXO = queryValor7[0].G_ANEXO;
        if (this.G_ANEXO == "" || !this.G_ANEXO)
            return 'NO EXISTE EL PARAMETRO ANEXO';


        const queryValor8: any[] = await this.entity.query(`SELECT    VALOR
            AS    G_PCTCHATARRA
            FROM    sera.COMER_PARAMETROSMOD PAR
            WHERE    PAR.PARAMETRO = 'RETXCHATARRA'
            AND        PAR.DIRECCION = 'M'`);
        this.G_PCTCHATARRA = queryValor8[0].G_PCTCHATARRA;

        if (queryValor8.length == 0) return 'NO EXISTE EL PARAMETRO RETXCHATARRA';


        if (this.n_ID_TPEVENTO == 5 && this.c_CONIVA == 'N') {
            this.G_IVA = 0;
            this.G_TASAIVA = 0;
        } else {

            const queryValor9: any[] = await this.entity.query(`SELECT    1 + TO_number/100, TO_number
                AS    G_IVA, G_TASAIVA
                FROM    sera.COMER_PARAMETROSMOD PAR
                WHERE    PAR.PARAMETRO = 'IVA'
                AND        PAR.DIRECCION = 'C'`);
            this.G_IVA = queryValor9[0].G_IVA;
            if (this.G_IVA == 0 || !this.G_IVA)
                return 'NO EXISTE EL PARAMETRO IVA';
        }


        const queryValor10: any[] = await this.entity.query(`SELECT    VALOR
            AS    G_TPOINGRESOP
            FROM    sera.COMER_PARAMETROSMOD PAR
            WHERE    PAR.PARAMETRO = 'TPOINGRESOP'
            AND        PAR.DIRECCION = ${address}`);
        this.G_TPOINGRESOP = queryValor10[0].G_TPOINGRESOP;
        if (this.G_TPOINGRESOP == "" || !this.G_TPOINGRESOP)
            return 'NO EXISTE EL PARAMETRO TIPO DE INGRESO PARA PENALIZACIONES PARA LA DIRECCION ' || address;



        const queryValor11: any[] = await this.entity.query(`SELECT    VALOR
            AS    G_TPOINGRESOD
            FROM    sera.COMER_PARAMETROSMOD PAR
            WHERE    PAR.PARAMETRO = 'TPOINGRESOD'
            AND        PAR.DIRECCION = ${address}`);
        this.G_TPOINGRESOD = queryValor11[0].G_TPOINGRESOD;
        if (this.G_TPOINGRESOD == "" || !this.G_TPOINGRESOD)
            return 'NO EXISTE EL PARAMETRO TIPO DE INGRESO PARA DEVOLUCIONES PARA LA DIRECCION ' || address;


        const queryValor12: any[] = await this.entity.query(`SELECT VALOR
            AS G_MANDDEV
            FROM sera.COMER_PARAMETROSMOD PAR
            WHERE PAR.PARAMETRO = 'MANDDEV'
                AND PAR.DIRECCION = 'C'`);
        this.G_MANDDEV = queryValor12[0].G_MANDDEV;
        if (this.G_MANDDEV == "" || !this.G_MANDDEV)
            return 'NO EXISTE EL PARAMETRO MANDATO DE DEVOLUCIONES';

        const queryValor13: any[] = await this.entity.query(`SELECT VALOR
            AS G_USAUTORIZA
            FROM sera.COMER_PARAMETROSMOD PAR
            WHERE PAR.PARAMETRO = 'USAUTORIZA'
                AND PAR.DIRECCION = 'C'`);
        this.G_USAUTORIZA = queryValor13[0].G_USAUTORIZA;
        if (this.G_USAUTORIZA == "" || !this.G_USAUTORIZA)
            return 'NO EXISTE EL PARAMETRO DE USUARIO QUE AUTORIZA OI DE CHATARRA';

        return 'OK';

    }


    async PREP_OI_BORRA(event: number) {
        var n_CUENTAREG: number = 0;
        /* >> JACG 15-08-16 Se adiciona en indicador de Orden de ingreso en la depuración. */
        if (this.n_CVE_EJEC == 1 || this.n_CVE_EJEC == 3) { // -- Borrado de registos cuando el proceso es por clientes --
            const queryCuenta: any[] = await this.entity.query(`SELECT COUNT(0)
            AS n_CUENTAREG
            FROM sera.COMER_DETALLES DET
            WHERE ID_EVENTO = ${event}
                AND EXISTS (SELECT 1
                            FROM sera.COMER_CLIENTESXEVENTO CXE, COMER_LOTES LOT
                            WHERE CXE.ID_EVENTO = ${event}
                            AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                            AND COALESCE(CXE.PROCESADO,'N') = 'S'
                            AND COALESCE(CXE.PROCESAR,'N') = 'S'
                            AND COALESCE(CXE.ENVIAR_SIRSAE,'N') = 'S'
                            AND COALESCE(CXE.ENVIADO_SIRSAE,'N') = 'N'
                            AND DET.ID_LOTE = LOT.ID_LOTE)
                AND IDORDENGRABADA IS NULL`);
            n_CUENTAREG = queryCuenta[0].n_CUENTAREG;
            if (n_CUENTAREG > 0) {
                await this.entity.query(`DELETE sera.COMER_DETALLES DET
                WHERE ID_EVENTO = ${event}
                AND EXISTS (SELECT *
                                FROM sera.COMER_CLIENTESXEVENTO CXE, sera.COMER_LOTES LOT
                                WHERE CXE.ID_EVENTO = ${event}
                                AND CXE.ID_CLIENTE = LOT.ID_CLIENTE
                                AND COALESCE(CXE.PROCESADO,'N') = 'S'
                                AND COALESCE(CXE.PROCESAR,'N') = 'S'
                                AND COALESCE(CXE.ENVIAR_SIRSAE,'N') = 'S'
                                AND COALESCE(CXE.ENVIADO_SIRSAE,'N') = 'N'
                                AND DET.ID_LOTE = LOT.ID_LOTE
                                LIMIT 1)
                AND IDORDENGRABADA IS NULL`);
            }
            const queryCuenta2: any[] = await this.entity.query(`SELECT COUNT(0)
                AS n_CUENTAREG
                FROM sera.COMER_CABECERAS CAB
                WHERE CAB.ID_EVENTO = ${event}
                AND  CAB.CLIENTE_RFC IN (SELECT CLI.RFC
                                            FROM sera.COMER_CLIENTES CLI, sera.COMER_CLIENTESXEVENTO CXE
                                            WHERE CXE.ID_EVENTO = ${event}
                                            AND CLI.ID_CLIENTE = CXE.ID_CLIENTE
                                            AND COALESCE(CXE.PROCESADO,'N') = 'S'
                                            AND COALESCE(CXE.PROCESAR,'N') = 'S'
                                            AND COALESCE(CXE.ENVIAR_SIRSAE,'N') = 'S'
                                            AND COALESCE(CXE.ENVIADO_SIRSAE,'N') = 'N')
                    AND IDORDENGRABADA IS NULL`);
            n_CUENTAREG = queryCuenta2[0].n_CUENTAREG;
            if (n_CUENTAREG > 0) {
                await this.entity.query(`DELETE sera.COMER_CABECERAS CAB
                WHERE CAB.ID_EVENTO = ${event}
                AND CAB.CLIENTE_RFC IN (SELECT CLI.RFC
                                            FROM sera.COMER_CLIENTES CLI, sera.COMER_CLIENTESXEVENTO CXE
                                            WHERE CXE.ID_EVENTO = ${event}
                                            AND CLI.ID_CLIENTE = CXE.ID_CLIENTE
                                            AND COALESCE(CXE.PROCESADO,'N') = 'S'
                                            AND COALESCE(CXE.PROCESAR,'N') = 'S'
                                            AND COALESCE(CXE.ENVIAR_SIRSAE,'N') = 'S'
                                            AND COALESCE(CXE.ENVIADO_SIRSAE,'N') = 'N')
                AND IDORDENGRABADA IS NULL`);
            }
        } else { //-- Borrado de registos cuando el proceso es por lotes --
            this.n_TCANT_LOTES = this.tab_SALDOS.length;
            if (this.n_TCANT_LOTES > 0) {
                this.n_TLOTE = 1;
                while (this.n_TLOTE) {
                    const queryCuenta3: any[] = await this.entity.query(`SELECT COUNT(0)
                        AS n_CUENTAREG
                        FROM sera.COMER_DETALLES
                        WHERE ID_EVENTO = ${event}
                        AND ID_LOTE = ${this.n_TLOTE}
                        AND IDORDENGRABADA IS NULL`);
                    n_CUENTAREG = queryCuenta3[0].n_CUENTAREG;
                    if (n_CUENTAREG > 0) {
                        await this.entity.query(`DELETE FROM sera.COMER_DETALLES
                        WHERE ID_EVENTO = ${event}
                            AND ID_LOTE = ${this.n_TLOTE}
                            AND IDORDENGRABADA IS NULL`);
                    }
                    this.n_TLOTE += 1;
                }
                const queryCuenta4: any[] = await this.entity.query(`SELECT COUNT(0)
                AS n_CUENTAREG
                FROM sera.COMER_CABECERAS
                WHERE ID_EVENTO = ${event}
                AND IDENTIFICADOR NOT IN (SELECT IDENTIFICADOR FROM sera.COMER_DETALLES WHERE ID_EVENTO = ${event})`);
                n_CUENTAREG = queryCuenta4[0].n_CUENTAREG;
                if (n_CUENTAREG > 0) {
                    await this.entity.query(`DELETE FROM sera.COMER_CABECERAS
                    WHERE ID_EVENTO = ${event}
                    AND IDENTIFICADOR NOT IN (SELECT IDENTIFICADOR FROM sera.COMER_DETALLES WHERE ID_EVENTO = ${event})`);
                }
            }

        }
    }


    async PREP_OI(event: number, descriptionEvent: string) {

        var USER: string = ""

        var tab_ID_PAGO: number[] = [];
        var P_IDPAGO: number;
        var P_RFC: string;
        var P_CONCEP: string;
        var P_CONAUX: string;
        var P_BANCO: string;
        var O_IDENTI: number = 0;
        var P_FECHA: string;
        var P_MONIVA: number;
        var P_MOVTO: number;
        var P_REFE: string;
        var P_MONTO: number;
        var P_LOTPUB: number;
        var P_OI: number;
        var H_TIPO: string;
        var H_MAND: string;
        var H_MONTO: number;
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
        var H_NUMBIENES: number = 0;
        var H_TIPO_PAGO: string;
        var H_SIAB: number;
        var L_MANDATOS: number = 0;
        var D_PCT: number;
        var D_MANDATO: string;
        var D_NOBIEN: number;
        var AUX_CONCEP: string;
        var D_IVA: number;
        var D_MONIVA: number;
        var D_MONSIVA: number;
        var J: number = 0;
        var P_CVE_EVENTO: string;
        var P_ID_LOTE: number;
        var C_NO_BIEN: string;
        var A_NO_BIEN: string;
        var re_C1: any[]; //TODO: verify tipo de datos no identificado
        var re_C2: any[];
        var c_QUERY1: string;
        var c_QUERY2: string;
        var c_REL_LOTS: string;
        var e_PREP_OI: any;
        var h_DIRECCION: string;
        var n_CTANVO: number;
        var n_MONTONVO: number;
        var n_CTAANT: number;
        var n_MONTOANT: number;
        var n_SMONTO_APP_IVA: number;
        var n_SMONTO_NOAPP_IVA: number;
        var n_SIVA_FINAL: number;
        var n_SBIENES: number;
        var n_PMONTO_APP_IVA: number;
        var n_PMONTO_NOAPP_IVA: number;
        var n_PIVA_FINAL: number;
        var n_PBIENES: number;
        var n_NO_DELEGACIONREM: number;
        var nsp_MONTO_APP_IVA: number;
        var nsp_MONTO_NOAPP_IVA: number;
        var nsp_IVA_FINAL: number;


        var p_RESUL: string = "";
        /* << JACG 10-10-17 Se realizan los ajustes para cuando sea el último pago */
        /* << JACG 24-07-17 Se realizan los ajustes para determinar los importes correctos de lso bienes para cuando se desagregan los mandatos. */
        //TODO: verify cursor
        var C3: any[] = await this.entity.query(`SELECT BXL.PCTSLOTE, COALESCE(CAT.CVMAN,'0'), BXL.NO_BIEN, SUBSTR(BIE.DESCRIPCION,1,438), DECODE(PDIRECCION,'I',BXL.MONTO_APP_IVA,DECODE(CL.PORC_APP_IVA,1,BXL.PRECIO_SIN_IVA,0)), BXL.MONTO_NOAPP_IVA, BXL.IVA_FINAL
            FROM sera.COMER_BIENESXLOTE BXL, sera.CAT_TRANSFERENTE CAT, sera.BIENES BIE, sera.COMER_LOTES CL
            WHERE BXL.ID_LOTE = ${P_ID_LOTE}
                AND BXL.ID_LOTE = CL.ID_LOTE
                AND BIE.NO_BIEN     = BXL.NO_BIEN
                AND BXL.NO_TRANSFERENTE = CAT.NO_TRANSFERENTE(+)
            ORDER BY BXL.NO_BIEN`);
        var C4: any[] = await this.entity.query(`SELECT TO_CHAR(BXL.NO_BIEN)
            FROM sera.COMER_BIENESXLOTE BXL
            WHERE BXL.ID_LOTE = ${P_ID_LOTE} 
            limit 300
            ORDER BY BXL.NO_BIEN`);

        // >> JACG 17-04-17 Se obtiene la dirección del Evento para la Obtención de Parámetros y tipos de pago.

        const queryDireccion: any[] = await this.entity.query(`SELECT DIRECCION
            AS h_DIRECCION
            FROM sera.COMER_EVENTOS
            WHERE ID_EVENTO = ${event}`);
        h_DIRECCION = queryDireccion[0].h_DIRECCION;

        if (!h_DIRECCION)
            h_DIRECCION = 'M';
        p_RESUL = 'OK';
        L_PARAMETROS = await this.getParameters(event, h_DIRECCION);
        if (L_PARAMETROS != 'OK') {
            p_RESUL = L_PARAMETROS;
        }
        c_REL_LOTS = null;
        //ACTMAN_BIELOTE (L_EVENTO);
        await this.PREP_OI_BORRA(event);
        if (this.n_CVE_EJEC == 2) {

            this.n_TCANT_LOTES = this.tab_SALDOS.length;

            if (this.n_TCANT_LOTES > 0) {
                this.n_TLOTE = 1;
                while (this.n_TLOTE) {

                    if (!c_REL_LOTS) {
                        c_REL_LOTS = `${this.n_TLOTE}`;
                    } else {
                        c_REL_LOTS = c_REL_LOTS + ',' + this.n_TLOTE;
                    }
                    this.n_TLOTE += 1
                }
            }
        }
        const queryCont: any[] = await this.entity.query(`SELECT MAX(IDENTIFICADOR)
            INTO AUX_CONT
            FROM sera.COMER_CABECERAS
        WHERE ID_EVENTO = ${event}`);
        AUX_CONT = queryCont[0].AUX_CONT;
        O_IDENTI = (AUX_CONT || 0); //TODO: buscar equivalente en nestJs
        /* >> JACG 09-06-17 En caso de chatarra, se toma el usuario que autoriza del parámetro. */
        if (this.n_ID_TPEVENTO == 5 || USER == 'SERA') {
            USUARIO = this.G_USAUTORIZA;
        } else {
            const queryUser: any[] = await this.entity.query(`SELECT COALESCE(RTRIM(LTRIM(USUARIO_SIRSAE)),'SAE'||${USER})
            AS USUARIO
            FROM sera.SEG_USUARIOS
            WHERE USUARIO = ${USER}`);
            USUARIO = queryUser[0].USUARIO;
        }
        USUARIO = USUARIO.trim();
        if (this.n_CVE_EJEC == 1 || this.n_CVE_EJEC == 3) {
            c_QUERY1 = `SELECT REF.ID_PAGO, CLI.RFC, TO_CHAR(REF.FECHA,'YYYYMMDD') as fecha, REF.MONTO, SUBSTR(REF.REFERENCIAORI,1,30) refe, REF.NO_MOVIMIENTO,
                        LOT.LOTE_PUBLICO, LOT.ID_LOTE, REF.MONTO, SUBSTR(LOT.DESCRIPCION,1,380), MOD.VALOR, REF.IDORDENINGRESO,
                        (SELECT CVE_PROCESO FROM sera.COMER_EVENTOS EVE WHERE EVE.ID_EVENTO = LOT.ID_EVENTO) CVE_EVENTO
                        FROM sera.COMER_PAGOREF REF,
                        COMER_LOTES LOT,
                        COMER_CLIENTES CLI, 
                        COMER_PARAMETROSMOD MOD 
                        WHERE LOT.ID_LOTE = REF.ID_LOTE 
                        AND LOT.ID_CLIENTE = CLI.ID_CLIENTE 
                        AND REF.VALIDO_SISTEMA = 'S' 
                        AND LOT.LOTE_PUBLICO != 0 
                        AND REF.CVE_BANCO = MOD.PARAMETRO 
                        AND MOD.DIRECCION = 'C'
                        AND REF.IDORDENINGRESO IS NULL 
                        AND ID_PAGO IN (SELECT ID_PAGO 
                        FROM sera.COMER_PAGOREF_VIRT PRV 
                        WHERE ID_LOTE IN (SELECT ID_LOTE 
                        FROM sera.COMER_LOTES LOT 
                        WHERE ID_EVENTO = '${event}' 
                        AND EXISTS (SELECT 1 
                        FROM sera.COMER_CLIENTESXEVENTO CXE 
                        WHERE CXE.ID_EVENTO = '${event}' 
                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE 
                        AND COALESCE (CXE.PROCESADO, 'N') = 'S' 
                        AND COALESCE (CXE.PROCESAR, 'N') = 'S' 
                        AND COALESCE (CXE.ENVIAR_SIRSAE, 'N') = 'S'
                        AND COALESCE (CXE.ENVIADO_SIRSAE, 'N') = 'N'))) 
                        ORDER BY REF.ID_PAGO`;
        } else {
            c_QUERY1 = `SELECT REF.ID_PAGO, CLI.RFC, TO_CHAR(REF.FECHA,'YYYYMMDD') as fecha, REF.MONTO, SUBSTR(REF.REFERENCIAORI,1,30) as refe, REF.NO_MOVIMIENTO, 
                        LOT.LOTE_PUBLICO, LOT.ID_LOTE, REF.MONTO, SUBSTR(LOT.DESCRIPCION,1,380) aux , MOD.VALOR, REF.IDORDENINGRESO, 
                        (SELECT CVE_PROCESO FROM sera.COMER_EVENTOS EVE WHERE EVE.ID_EVENTO = LOT.ID_EVENTO) CVE_EVENTO 
                        FROM sera.COMER_PAGOREF REF, 
                        COMER_LOTES LOT, 
                        COMER_CLIENTES CLI, 
                        COMER_PARAMETROSMOD MOD 
                        WHERE LOT.ID_LOTE = REF.ID_LOTE 
                        AND LOT.ID_CLIENTE = CLI.ID_CLIENTE 
                        AND REF.VALIDO_SISTEMA = 'S' 
                        AND LOT.LOTE_PUBLICO != 0 
                        AND REF.CVE_BANCO = MOD.PARAMETRO 
                        AND MOD.DIRECCION = 'C' 
                        AND REF.IDORDENINGRESO IS NULL 
                        AND ID_PAGO IN (SELECT ID_PAGO 
                        FROM sera.COMER_PAGOREF_VIRT PRV 
                        WHERE ID_LOTE IN (c_REL_LOTS)) 
                        ORDER BY REF.ID_PAGO`;
        }

        tab_ID_PAGO = [];
        re_C1 = await this.entity.query(c_QUERY1);
        re_C1.forEach(async element => {
            P_IDPAGO = element.id_pago;
            P_RFC = element.rfc;
            P_FECHA = element.fecha;
            P_MONTO = element.monto;
            P_REFE = element.refe;
            P_MOVTO = element.no_movimiento;
            P_LOTPUB = element.lote_publico;
            P_ID_LOTE = element.id_lote;
            P_MONIVA = element.monto;
            P_CONAUX = element.aux;
            P_BANCO = element.valor;
            P_OI = element.idordeningreso;
            P_CVE_EVENTO = element.cve_evento;

            O_IDENTI = O_IDENTI + 1;

            tab_ID_PAGO[P_IDPAGO] = O_IDENTI;
            if (this.n_ID_TPEVENTO == 5) {
                P_CONCEP = 'INTERCAMBIO DE CFDIs, ' + 'EVENTO ' + descriptionEvent + P_CONAUX;
            } else {
                P_CONCEP = 'DEPOSITO POR VENTA DE BIENES, ' + 'EVENTO ' + descriptionEvent + P_CONAUX;
            }

            await this.entity.query(`INSERT INTO COMER_CABECERAS (IDENTIFICADOR,        CONSECUTIVO,    AREA,        DOCUMENTO,    UNRESPONSABLE,    CLIENTE_RFC,    CONCEPTO,
                                        ANEXO,            FECHA,        TIPOPE,        FORMAPAGO,    FECHAORDEN,    BANCO,        USAUTORIZA,
                                        MONTO_TOTAL_PADRE,     NUMOVTO,    REFERENCIA,    IDPAGO,        ID_EVENTO,    IDORDENGRABADA, CVE_EVENTO)
                                VALUES (${O_IDENTI},        0,        '${this.G_AREA}',        '${this.G_TPODOC}',    '${this.G_UR}',        ${P_RFC},        '${P_CONCEP}',
                                        '${this.G_ANEXO}',        ${P_FECHA},    ${this.G_TPOPERACION},     'R',        ${P_FECHA},    '${P_BANCO}',    '${USUARIO}',            
                                    ${P_MONTO},        ${P_MOVTO},     '${P_REFE}',        ${P_IDPAGO},    ${event},    '${P_OI}', ${P_CVE_EVENTO})`);
        });

        if (this.n_CVE_EJEC == 1 || this.n_CVE_EJEC == 3) {
            c_QUERY1 = `SELECT DISTINCT PRV.ID_LOTE, PRECIO_FINAL 
                        FROM sera.COMER_PAGOSREFGENS PRV, 
                        COMER_PAGOREF REF, 
                        COMER_LOTES LOT, 
                        COMER_PARAMETROSMOD MOD 
                        WHERE LOT.ID_EVENTO = '${event}' 
                        AND PRV.ID_PAGO = REF.ID_PAGO 
                        AND LOT.ID_LOTE = PRV.ID_LOTE 
                        AND REF.VALIDO_SISTEMA = 'S'
                        AND LOT.LOTE_PUBLICO != 0 
                        AND REF.CVE_BANCO = MOD.PARAMETRO 
                        AND MOD.DIRECCION = 'C' 
                        AND REF.IDORDENINGRESO IS NULL 
                        AND EXISTS (SELECT *
                        FROM sera.COMER_CLIENTESXEVENTO CXE 
                        WHERE CXE.ID_EVENTO = '${event}' 
                        AND CXE.ID_CLIENTE = LOT.ID_CLIENTE 
                        AND COALESCE (CXE.PROCESADO, 'N') = 'S' 
                        AND COALESCE (CXE.PROCESAR, 'N') = 'S' 
                        AND COALESCE (CXE.ENVIAR_SIRSAE, 'N') = 'S' 
                        AND COALESCE (CXE.ENVIADO_SIRSAE, 'N') = 'N'
                        LIMIT 1) 
                        ORDER BY PRV.ID_LOTE`;
        } else {
            c_QUERY1 = `SELECT DISTINCT PRV.ID_LOTE, PRECIO_FINAL 
                        FROM sera.COMER_PAGOREF_VIRT PRV, 
                        COMER_PAGOREF REF, 
                        COMER_LOTES LOT, 
                        COMER_PARAMETROSMOD MOD 
                        WHERE LOT.ID_EVENTO = '${event}' 
                        AND PRV.ID_PAGO = REF.ID_PAGO 
                        AND LOT.ID_LOTE = PRV.ID_LOTE 
                        AND REF.VALIDO_SISTEMA = 'S' 
                        AND LOT.LOTE_PUBLICO != 0 
                        AND REF.CVE_BANCO = MOD.PARAMETRO 
                        AND MOD.DIRECCION = 'C' 
                        AND REF.IDORDENINGRESO IS NULL 
                        AND PRV.ID_LOTE IN ('${c_REL_LOTS}') 
                        ORDER BY PRV.ID_LOTE`;
        }
        re_C1 = await this.entity.query(c_QUERY1);
        for (const element of re_C1) {
            P_ID_LOTE = element.P_ID_LOTE, P_MONTO = element.P_MONTO;
            if (h_DIRECCION == 'I') {
                const queryCount: any[] = await this.entity.query(`SELECT COUNT(0) AS n_CTANVO, COALESCE(SUM(MONTO),0)
                    AS n_MONTONVO
                    FROM sera.COMER_PAGOSREFGENS CPG
                    WHERE ID_LOTE = ${P_ID_LOTE}
                    AND TIPO = 'N'
                    AND EXISTS (SELECT *
                                    FROM sera.COMER_PAGOREF REF,
                                        COMER_PARAMETROSMOD MOD
                                WHERE REF.ID_PAGO = CPG.ID_PAGO
                                        AND REF.VALIDO_SISTEMA = 'S'
                                        AND REF.CVE_BANCO = MOD.PARAMETRO
                                        AND MOD.DIRECCION = 'C'
                                        AND REF.IDORDENINGRESO IS NULL
                                LIMIT 1)`);
                n_CTANVO = queryCount[0].n_CTANVO;
                n_MONTONVO = queryCount[0].n_MONTONVO;
                if (!n_CTANVO || !n_MONTONVO) {
                    n_CTANVO = 0;
                    n_MONTONVO = 0;
                }
                // --DBMS_OUTPUT.PUT_LINE('n_CTANVO: '||TO_CHAR(n_CTANVO)||', n_MONTONVO: '||TO_CHAR(n_MONTONVO));

                const queryCount2: any[] = await this.entity.query(`SELECT COUNT(0) AS n_CTAANT, COALESCE(SUM(MONTO),0)
                    AS n_MONTOANT 
                    FROM sera.COMER_PAGOSREFGENS CPG
                    WHERE ID_LOTE = ${P_ID_LOTE}
                    AND TIPO = 'N'
                    AND EXISTS (SELECT 1
                                    FROM sera.COMER_PAGOREF REF,
                                        sera.COMER_PARAMETROSMOD MOD
                                WHERE REF.ID_PAGO = CPG.ID_PAGO
                                    AND REF.VALIDO_SISTEMA = 'S'
                                    AND REF.CVE_BANCO = MOD.PARAMETRO
                                    AND MOD.DIRECCION = 'C'
                                    AND REF.IDORDENINGRESO IS NOT NULL)`);
                n_CTAANT = queryCount2[0].n_CTAANT;
                n_MONTOANT = queryCount2[0].n_MONTOANT;
                if (!n_CTAANT || n_MONTOANT) {
                    n_CTAANT = 0;
                    n_MONTOANT = 0;
                }
                //--DBMS_OUTPUT.PUT_LINE('n_CTAANT: '||TO_CHAR(n_CTAANT)||', n_MONTOANT: '||TO_CHAR(n_MONTOANT));
                if (n_MONTOANT == 0 && n_CTANVO == 1 && n_MONTONVO == P_MONTO) {
                    H_TIPO_PAGO = 'T';
                } else if (n_MONTONVO + n_MONTOANT == P_MONTO) {
                    H_TIPO_PAGO = 'C';
                } else {
                    H_TIPO_PAGO = 'A';
                }
            } else {
                H_TIPO_PAGO = 'T';
                n_CTANVO = 0;
            }
            //--DBMS_OUTPUT.PUT_LINE('H_TIPO_PAGO: '||H_TIPO_PAGO);
            c_QUERY2 = `SELECT IDPAGO, MONTO, TIPO, REFE, MONIVA, IVA, MOV, MAND, MONSIVA, LOTDES, LOTPUB, DESCTIPO, LOTE, MONTOLOTE, MONTOCHAT, INGRESO, NUMBIENES, DECODE ('${h_DIRECCION}','M','T',DECODE (TIPO,'P','T','D','T',DECODE(ROWNUM, 'TO_CHAR(${n_CTANVO})','${H_TIPO_PAGO}', 'A'))) TIPO_PAGO FROM (
                        SELECT GEN.ID_PAGO IDPAGO, GEN.MONTO_APP_IVA + GEN.IVA MONTO, GEN.TIPO, SUBSTR(GEN.REFERENCIA,1,30) REFE, GEN.MONTO_APP_IVA MONIVA, COALESCE(GEN.IVA,0) IVA, 1 MOV, 
                        CAT.CVMAN MAND, COALESCE(GEN.MONTO_NOAPP_IVA,0) MONSIVA,    SUBSTR(LOT.DESCRIPCION,1,420) LOTDES, LOT.LOTE_PUBLICO LOTPUB, 
                        DECODE(GEN.TIPO,''N'',DECODE('TO_CHAR(${this.n_ID_TPEVENTO})',5,'Intercambio de CFDI','Pago Normal'),'P','Pago a Penalizar','D','Pago a Devolver') DESCTIPO, LOT.ID_LOTE LOTE, LOT.PRECIO_FINAL MONTOLOTE, 
                        GEN.MONTO_CHATARRA MONTOCHAT, DECODE(GEN.TIPO,'N','${this.G_TPOINGRESO}', 'P', '${this.G_TPOINGRESOP}', 'D', '${this.G_TPOINGRESOD}') INGRESO, 
                        LOT.NUM_BIENES NUMBIENES 
                        FROM sera.COMER_PAGOSREFGENS GEN, sera.CAT_TRANSFERENTE CAT, sera.COMER_LOTES LOT 
                        WHERE CAT.NO_TRANSFERENTE = GEN.NO_TRANSFERENTE 
                        AND GEN.ID_LOTE = LOT.ID_LOTE 
                        AND LOT.LOTE_PUBLICO != 0 
                        AND LOT.ID_LOTE = 'TO_CHAR(${P_ID_LOTE})' 
                        AND GEN.TIPO = 'N' 
                        AND NOT EXISTS (SELECT * FROM sera.COMER_PAGOREF CP WHERE CP.ID_PAGO = GEN.ID_PAGO AND IDORDENINGRESO IS NOT NULL LIMIT 1) 
                        ORDER BY ID_PAGO)  
                        UNION ALL 
                        SELECT GEN.ID_PAGO IDPAGO, GEN.MONTO_APP_IVA + GEN.IVA MONTO, GEN.TIPO, SUBSTR(GEN.REFERENCIA,1,30) REFE, GEN.MONTO_APP_IVA MONIVA, COALESCE(GEN.IVA,0) IVA, 1 MOV, 
                        DECODE (GEN.TIPO,'D','${this.G_MANDDEV}',CAT.CVMAN) MAND, COALESCE(GEN.MONTO_NOAPP_IVA,0) MONSIVA,    SUBSTR(LOT.DESCRIPCION,1,420) LOTDES, LOT.LOTE_PUBLICO LOTPUB, 
                        DECODE(GEN.TIPO,'N',DECODE('TO_CHAR(${this.n_ID_TPEVENTO})',5,'Intercambio de CFDI','Pago Normal'),'P','Pago a Penalizar','D','Pago a Devolver') DESCTIPO, LOT.ID_LOTE LOTE, LOT.PRECIO_FINAL MONTOLOTE, 
                        GEN.MONTO_CHATARRA MONTOCHAT, DECODE(GEN.TIPO,'N','${this.G_TPOINGRESO}', 'P', '${this.G_TPOINGRESOP}', 'D', '${this.G_TPOINGRESOD}') INGRESO, 
                        LOT.NUM_BIENES NUMBIENES
                        , DECODE ('${h_DIRECCION}','M','T',DECODE (GEN.TIPO,'P','T','D','T',DECODE(ROWNUM, '||TO_CHAR(n_CTANVO)||','${H_TIPO_PAGO}', 'A'))) TIPO_PAGO 
                        FROM sera.COMER_PAGOSREFGENS GEN, sera.CAT_TRANSFERENTE CAT, sera.COMER_LOTES LOT 
                        WHERE CAT.NO_TRANSFERENTE = GEN.NO_TRANSFERENTE 
                        AND GEN.ID_LOTE = LOT.ID_LOTE 
                        AND LOT.LOTE_PUBLICO != 0 
                        AND LOT.ID_LOTE = 'TO_CHAR(${P_ID_LOTE})' 
                        AND GEN.TIPO <> 'N' 
                        AND NOT EXISTS (SELECT * FROM sera.COMER_PAGOREF CP WHERE CP.ID_PAGO = GEN.ID_PAGO AND IDORDENINGRESO IS NOT NULL LIMIT 1)`;


        }
    }


    async PUF_VERIF_MONTO_PENA(client: number,
        relLots: string,
        address: string,
        idTpEvent: number,
        idTypeDisp: number,
        event: number): Promise<string> {
        var ttab_VALPENALOTF: ValPenaLot[] = []
        var ttab_LOTES: number[] = []

        var cu_MONTOS_VENTA = await this.entity.query(`  SELECT ID_CLIENTE,
    coalesce(SUM(PRECIO_FINAL),0) PRECIO_FINAL,
    DECODE(${this.n_CVE_EJEC},1,coalesce(SUM(ANTICIPO),0),coalesce(SUM(PRECIO_FINAL),0)) ANTICIPO
    FROM sera.COMER_LOTES CL
    WHERE ID_EVENTO = ${event}
    AND ID_CLIENTE = ${client}
    GROUP BY ID_CLIENTE;`)



        //-- Montos para validación de penalización --
        var cu_VALPENALOTE = await this.entity.query(`SELECT ID_LOTE,
            coalesce (PRECIO_FINAL, 0) PRECIO_FINAL,
            DECODE(${this.n_CVE_EJEC},1,coalesce(ANTICIPO,0),coalesce(PRECIO_FINAL,0)) ANTICIPO,
            coalesce(PRECIO_GARANTIA,0) PRECIO_GARANTIA 
            FROM sera.COMER_LOTES CL
            WHERE ID_EVENTO = ${event}
            AND ID_CLIENTE = ${client}
            ORDER BY PRECIO_FINAL DESC`)


        //-- Cursor para los pagos de cualquier tipo por cliente --
        var cu_MONTOS_PAGOREF4 = await this.entity.query(`SELECT coalesce(VIR.MONTO,0) MONTO,
    coalesce(VIR.MONTO_PENA,0) MONTO_PENA
    FROM sera.COMER_PAGOREF_VIRT VIR, sera.COMER_PAGOREF CPR, sera.COMER_PARAMETROSMOD MOD
    WHERE VIR.ID_PAGO = CPR.ID_PAGO
    AND VIR.ID_LOTE = ${this.n_TLOTE}
    AND ((${this.n_CVE_EJEC} = 1 AND VIR.TIPO_REF IN ('2','3','4','7','6')) OR (${this.n_CVE_EJEC} = 2 AND VIR.ID_PAGO IN (SELECT VI.ID_PAGO
                                FROM sera.COMER_PAGOREF_VIRT VI, sera.COMER_PAGOREF CP
                            WHERE VI.ID_PAGO = CP.ID_PAGO
                                AND VI.ID_LOTE = ${this.n_TLOTE}
                                AND REFERENCIA IN (SELECT  REF_GSAE||REF_GBANCO FROM sera.COMER_LOTES CL, sera.COMER_REF_GARANTIAS CG
                                                WHERE CL.ID_LOTE = CG.ID_LOTE
                                                    AND CL.ID_CLIENTE = CG.ID_CLIENTE
                                                    AND CL.ID_LOTE = CP.ID_LOTE)
                            UNION
                            SELECT VI.ID_PAGO
                                FROM sera.COMER_PAGOREF_VIRT VI, sera.COMER_PAGOREF CP
                            WHERE VI.ID_PAGO = CP.ID_PAGO
                                AND VI.ID_LOTE = ${this.n_TLOTE}
                                AND VI.TIPO_REF IN ('2','3','4','7','6') )))
    AND VALIDO_SISTEMA IN ('A','S')
    AND CVE_BANCO = PARAMETRO
    AND DIRECCION = 'C'`)




        //-- VARIABLES --
        var tab_VALPENALOTF: ValPenaLot[];
        var c_PAR_LOTES: string;
        var c_RESP: string;
        var n_ID_TIPO_DISP: number;

        var c_REL_LOTES = relLots;
        var c_PAR_LOTES = relLots;
        var n_ID_CLIENTE = client;
        var c_DIRECCION = address;
        var n_ID_TPEVENTO = idTpEvent;
        var n_ID_TIPO_DISP = idTypeDisp;
        var n_ID_EVENTO = event;
        var c_RESP = 'OK';

        const queryValor: any[] = await this.entity.query(`SELECT VALOR
    AS c_VALOR
    FROM sera.COMER_PARAMETROSMOD
    WHERE PARAMETRO = 'EXENTAPENA'`);
        this.c_VALOR = queryValor[0].c_VALOR;
        this.c_LLAVE = c_DIRECCION + `${n_ID_TPEVENTO}`;
        this.n_VALIDA = this.c_VALOR.indexOf(this.c_LLAVE);
        if (!this.c_VALOR) {
            c_RESP = 'Parámetro EXENTAPENA no encontrado.';
            this.n_VALIDA = 1;
        }
        tab_VALPENALOTF = [];
        if (this.n_VALIDA == 0) {
            if (n_ID_TIPO_DISP == 1 || n_ID_TIPO_DISP == 3) {
                this.n_CVE_EJEC = n_ID_TIPO_DISP;
            } else {
                this.n_CVE_EJEC = 2;
            }
           
            const queryValor2: any[] = await this.entity.query(`SELECT VALOR
            AS c_VALOR
            FROM sera.COMER_PARAMETROSMOD
            WHERE PARAMETRO = 'PORPENAIP'`);
            this.c_VALOR = queryValor2[0].c_VALOR;
            this.c_LLAVE = c_DIRECCION + `${n_ID_TPEVENTO}`.trim();
            this.n_VALIDA = this.c_VALOR.indexOf(this.c_LLAVE);
            if (this.n_VALIDA == 0) {
                this.n_PORPENAIP = 0;
            } else {
                this.c_VALOR = this.c_VALOR.substring(this.c_VALOR.indexOf(this.c_LLAVE), this.c_VALOR.indexOf('|') - this.c_VALOR.indexOf(this.c_LLAVE));
                this.n_PORPENAIP = parseInt(this.c_VALOR)
            }

            if (!this.n_PORPENAIP) {
                this.n_PORPENAIP = 0;
            }


            const queryValor3: any[] = await this.entity.query(`SELECT VALOR
            AS c_VALOR
            FROM sera.COMER_PARAMETROSMOD
            WHERE PARAMETRO = 'MONPENAIP'`);
            this.c_VALOR = queryValor3[0].c_VALOR;
            this.c_LLAVE = c_DIRECCION + `${n_ID_TPEVENTO}`;
            this.n_VALIDA = this.c_VALOR.indexOf(this.c_LLAVE)
            if (this.n_VALIDA = 0) {
                this.n_MONPENAIP = 0;
            } else {
                this.c_VALOR = this.c_VALOR.substring(this.c_VALOR.indexOf(this.c_LLAVE), this.c_VALOR.indexOf('|') - this.c_VALOR.indexOf(this.c_LLAVE));
                this.n_MONPENAIP = parseInt(this.c_VALOR)
            }
            if (!this.n_MONPENAIP) {
                this.n_MONPENAIP = 0;
            }


            const queryValor4: any[] = await this.entity.query(`SELECT VALOR
            AS c_VALOR
            FROM sera.COMER_PARAMETROSMOD
            WHERE PARAMETRO = 'PFMPENAIP'`);
            this.c_VALOR = queryValor4[0].c_VALOR;
            this.c_LLAVE = c_DIRECCION + n_ID_TPEVENTO;
           
            this.n_VALIDA = this.c_VALOR.indexOf(this.c_LLAVE)
            if (this.n_VALIDA == 0) {
                this.n_PFMPENAIP = 0;
            } else {
                this.c_VALOR = this.c_VALOR.substring(this.c_VALOR.indexOf(this.c_LLAVE), this.c_VALOR.indexOf('|') - this.c_VALOR.indexOf(this.c_LLAVE));
                this.n_MONPENAIP = parseInt(this.c_VALOR)
            }
            if (!this.n_PFMPENAIP) {
                this.n_PFMPENAIP = 0;
            }
            
            const queryValor5: any[] = await this.entity.query(`SELECT VALOR
            AS c_VALOR
            FROM sera.COMER_PARAMETROSMOD
            WHERE PARAMETRO = 'ADPGPENAIP'`);
            this.c_LLAVE = c_DIRECCION + n_ID_TPEVENTO;
            this.n_ADPGPENAIP = this.c_VALOR.indexOf(this.c_LLAVE)

            if (!this.n_ADPGPENAIP) {
                this.n_ADPGPENAIP = 0;
            }

            if (n_ID_TIPO_DISP == 1 || n_ID_TIPO_DISP == 3) {
                //-- Ciclo de montos totales por cliente clave de proceso 1 y 3 --

                for (const element of cu_MONTOS_VENTA) {
                    const queryMontoPago: any[] = await this.entity.query(`SELECT COALESCE(SUM(VIR.MONTO),0)
                AS n_MONTO_TOT_PAGO
                FROM sera.COMER_PAGOREF_VIRT VIR, sera.COMER_PAGOREF CPR, sera.COMER_PARAMETROSMOD MOD
                WHERE VIR.ID_PAGO = CPR.ID_PAGO
                AND VIR.ID_LOTE IN (SELECT ID_LOTE
                            FROM sera.COMER_LOTES
                            WHERE ID_EVENTO = ${this.n_ID_EVENTO}
                            AND ID_CLIENTE = ${element.ID_CLIENTE})
                AND ((n_CVE_EJEC = 1 AND VIR.TIPO_REF NOT IN ('2','3','4','7','6')) OR n_CVE_EJEC = 3)
                AND VALIDO_SISTEMA IN ('A','S')
                AND CVE_BANCO = PARAMETRO
                AND DIRECCION = 'C'`);
                    this.n_MONTO_TOT_PAGO = queryMontoPago[0].n_MONTO_TOT_PAGO;

                    this.n_MONTO_DIF_LIQ = this.n_MONTO_TOT_PAGO - element.ANTICIPO;
                    if (this.n_MONTO_DIF_LIQ < 0) {
                        this.n_MONTO_DIF_LIQ = 0;
                    }

                    this.tab_LOTES = [];
                    this.n_ORDEN_LOTES = 0;
                    cu_VALPENALOTE.forEach(element1 => {
                        var obj = this.tab_VALPENALOTE.filter(x => x.ID_LOTE == element1.id_lote)[0]
                        obj.ID_LOTE = element1.ID_LOTE;
                        obj.PRECIO_FINAL = element1.PRECIO_FINAL;
                        obj.PRECIO_GARANTIA = element1.PRECIO_GARANTIA;
                        this.l_BANP = true;
                        obj.MONTO_PENA = 0;
                        if (this.n_PORPENAIP > 0) {
                            if (element1.PRECIO_FINAL > this.n_PFMPENAIP) {
                                obj.MONTO_PENA = obj.MONTO_PENA + Math.round(element1.PRECIO_FINAL * this.n_PORPENAIP);
                            } else {
                                obj.MONTO_PENA = obj.MONTO_PENA + element1.PRECIO_GARANTIA;
                            }
                            this.l_BANP = false;
                        }
                        if (this.n_MONPENAIP > 0) {
                            obj.MONTO_PENA = obj.MONTO_PENA + this.n_MONPENAIP;
                            this.l_BANP = false;
                        }
                        if (this.n_ADPGPENAIP > 0) {
                            obj.MONTO_PENA = obj.MONTO_PENA + element1.PRECIO_GARANTIA;
                            this.l_BANP = false;
                        }
                        if (this.l_BANP) {
                            obj.MONTO_PENA = element1.PRECIO_GARANTIA;
                        }

                        
                        obj.SALDO_ANTICIPO = element1.ANTICIPO;
                        obj.MONTO_POR_APLIC = 0;
                        this.n_MONTO_LIQ = 0;
                        if (this.n_MONTO_DIF_LIQ > 0) {
                            this.n_MONTO_LIQ = element1.PRECIO_FINAL - element1.ANTICIPO;
                            if (this.n_MONTO_DIF_LIQ - this.n_MONTO_LIQ <= 0) {
                                this.n_MONTO_LIQ = this.n_MONTO_DIF_LIQ;
                            }
                            obj.SALDO_ANTICIPO = obj.SALDO_ANTICIPO + this.n_MONTO_LIQ;
                            this.n_MONTO_DIF_LIQ = this.n_MONTO_DIF_LIQ - this.n_MONTO_LIQ;
                        }
                        this.n_ORDEN_LOTES = this.n_ORDEN_LOTES + 1;
                        this.tab_LOTES.push(element.id_lote)
                    });

                    if (this.n_ORDEN_LOTES > 0) {
                        const queryMonto2: any[] = await this.entity.query(`SELECT SUM(COALESCE(VIR.MONTO,0))
                    AS n_MONTO
                    FROM sera.COMER_PAGOREF_VIRT VIR, sera.COMER_PAGOREF CPR, sera.COMER_PARAMETROSMOD MOD
                    WHERE VIR.ID_PAGO = CPR.ID_PAGO
                    AND VIR.ID_LOTE IN (SELECT ID_LOTE
                                    FROM sera.COMER_LOTES
                                    WHERE ID_EVENTO = ${n_ID_EVENTO}
                                    AND ID_CLIENTE = ${n_ID_CLIENTE})
                    AND ((n_CVE_EJEC = 1 AND VIR.TIPO_REF NOT IN ('2','3','4','7','6')) OR n_CVE_EJEC = 3)
                    AND VALIDO_SISTEMA IN ('A','S')
                    AND CVE_BANCO = PARAMETRO
                    AND DIRECCION = 'C'`);
                        this.n_MONTO = queryMonto2[0].queryMonto2;

                        for (let v_I = 0; v_I <= this.n_ORDEN_LOTES; v_I++) {
                            this.n_TLOTE = this.tab_LOTES[v_I];
                            var objLot = this.tab_VALPENALOTE.filter(x => x.ID_LOTE == this.n_TLOTE)[0]
                            if (this.n_MONTO >= objLot.SALDO_ANTICIPO) {
                                objLot.MONTO_POR_APLIC = objLot.SALDO_ANTICIPO;
                                this.n_MONTO = this.n_MONTO - objLot.SALDO_ANTICIPO;
                                objLot.SALDO_ANTICIPO = 0;
                            } else {
                                objLot.MONTO_POR_APLIC = this.n_MONTO;
                                objLot.SALDO_ANTICIPO = objLot.SALDO_ANTICIPO - this.n_MONTO;
                                this.n_MONTO = 0;
                                return;
                            }
                        }
                    }
                }

            } else {
                while (c_PAR_LOTES.length > 0) {
                    this.n_COMA = c_PAR_LOTES.indexOf(",")
                    if (this.n_COMA == 0) {
                        this.n_ID_LOTE = parseInt(c_PAR_LOTES);
                        c_PAR_LOTES = null;
                    } else {
                        this.n_ID_LOTE = parseInt(c_PAR_LOTES.substring(1, this.n_COMA - 1));
                        c_PAR_LOTES = c_PAR_LOTES.substring(this.n_COMA + 1)
                    }
                    if (this.n_ID_LOTE > 0) {
                        const queryMonto2: any[] = await this.entity.query(`SELECT ID_LOTE,
                        COALESCE(PRECIO_FINAL, 0) AS PRECIO_FINAL,
                        DECODE(n_CVE_EJEC,1,COALESCE(PRECIO_GARANTIA,0),COALESCE(PRECIO_FINAL,0)) AS ANTICIPO,
                        DECODE(n_CVE_EJEC,1,COALESCE(PRECIO_GARANTIA,0),0) AS PRECIO_GARANTIA
                    FROM sera.COMER_LOTES CL
                    WHERE ID_EVENTO = ${this.n_ID_EVENTO}
                    AND ID_LOTE = ${this.n_ID_LOTE}`);
                        var obj2 = this.tab_VALPENALOTE.filter(x => x.ID_LOTE == this.n_ID_LOTE)[0]
                        obj2.ID_LOTE = queryMonto2[0].id_lote;
                        obj2.PRECIO_FINAL = queryMonto2[0].precio_final;
                        obj2.SALDO_ANTICIPO = queryMonto2[0].anticipo;
                        obj2.PRECIO_GARANTIA = queryMonto2[0].precio_garantia;

                        if (this.n_PORPENAIP > 0 || this.n_MONPENAIP > 0) {
                            if (this.n_PORPENAIP > 0) {
                                obj2.MONTO_PENA = Math.round(obj2.PRECIO_FINAL * this.n_PORPENAIP) + this.n_MONPENAIP;
                            } else {
                                obj2.MONTO_PENA = this.n_MONPENAIP;
                            }
                        } else {
                            obj2.MONTO_PENA = obj2.PRECIO_GARANTIA;
                        }
                        obj2.MONTO_POR_APLIC = 0;

                    }
                    if (!this.n_ID_LOTE) {
                        this.c_ERROR = 'Relación de Lotes inconsistente (Alfabéticos).';
                    }
                }
            }
            this.n_TCANT_LOTES = tab_VALPENALOTF.length;
            if (this.n_TCANT_LOTES > 0) {
                this.tab_VALPENALOTE.forEach((element2, index) => {
                    cu_MONTOS_PAGOREF4.forEach(element3 => {
                        this.n_MONTO = element3.monto - element3.monto_pena;
                        objLot.MONTO_POR_APLIC = objLot.MONTO_POR_APLIC + this.n_MONTO;
                    });
                });

                this.n_TLOTE = 0;
                while (this.n_TLOTE < tab_VALPENALOTF.length) {
                    if (objLot.MONTO_POR_APLIC < objLot.MONTO_PENA) {
                        const queryLote: any[] = await this.entity.query(`SELECT LOTE_PUBLICO
                    AS n_LOTE_PUBLICO
                    FROM sera.COMER_LOTES
                    WHERE ID_LOTE = ${this.n_TLOTE}`);
                        this.n_LOTE_PUBLICO = queryLote[0].n_LOTE_PUBLICO;
                        if (!this.n_LOTE_PUBLICO) {
                            this.n_LOTE_PUBLICO = 0;
                        }
                        if (c_RESP == 'OK') {
                            c_RESP = 'Lotes sin cubrir Monto de Penalización: ' + this.n_LOTE_PUBLICO;
                        } else {
                            c_RESP = c_RESP + ', ' + this.n_LOTE_PUBLICO
                        }
                    }

                    this.n_TLOTE++
                }
            }
        }
        return c_RESP;
    }


    async FA_FECHA_GRACIA(): Promise<any> {
        var f_FECHA_GRACIA: Date = new Date();
        var c_MENSAJE: string = "";

        /* PK_COMER_LC.P_OBT_DATLC (c_PARAMETRO, //TODO: verificar 
                                 n_ID_TPEVENTO,
                                 c_DIRECCION,
                                 c_IND_MOV,
                                 n_NUM_DIAS,
                                 c_TIPO_LC,
                                 c_TABLA_APLICA,
                                 c_IND_FEC,
                                 c_IND_MONTO,
                                 c_ERROR);*/
        if (this.c_ERROR != 'OK') {
            return this.f_FEC_FALLO;
        }

        /* if(this.c_IND_FEC == 'C') {
             f_FECHA_GRACIA = this.PK_COMER_LC.OBTENER_POST_FECHA_HABIL (this.f_FECHA_CIERRE_EVENTO,
                                                                     this.n_NUM_DIAS,
                                                                     c_MENSAJE);
         } else if(this.c_IND_FEC == 'F') {
             f_FECHA_GRACIA = this.PK_COMER_LC.OBTENER_POST_FECHA_HABIL (this.f_FEC_FALLO,
                                                                     this.n_NUM_DIAS,
                                                                     c_MENSAJE);
         } else {
             f_FECHA_GRACIA = this.PK_COMER_LC.OBTENER_POST_FECHA_HABIL (this.f_FECHA_NOTIFICACION,
                 this.n_NUM_DIAS,
                 c_MENSAJE);
         }*/
        if (c_MENSAJE == 'OK') {
            return f_FECHA_GRACIA;
        } else {
            return null;
        }
    }

    async PA_DEPURA() {
        var n_CUENTAREG: number = 0;
        if (this.n_CVE_EJEC == 1 || this.n_CVE_EJEC == 3) {
            await this.entity.query(`UPDATE sera.COMER_PAGOREF
                SET VALIDO_SISTEMA = 'A'
                WHERE ID_LOTE IN (SELECT ID_LOTE
                                FROM sera.COMER_LOTES
                                WHERE ID_EVENTO = ${this.n_ID_EVENTO}
                                AND ID_CLIENTE = ${this.n_REL_CLIENTE}
                                AND LOTE_PUBLICO != 0)
                AND VALIDO_SISTEMA = 'S'
                AND IDORDENINGRESO IS NULL`);
            await this.entity.query(`UPDATE sera.COMER_LOTES
                SET ID_ESTATUSVTA = 'VEN'
            WHERE ID_EVENTO = ${this.n_ID_EVENTO}
                AND ID_CLIENTE = ${this.n_REL_CLIENTE}
                AND LOTE_PUBLICO != 0`);
            await this.entity.query(`UPDATE sera.COMER_BIENESXLOTE
                SET ESTATUS_ANT = ESTATUS_COMER,
                    ESTATUS_COMER = 'CPV'
            WHERE ID_LOTE IN (SELECT ID_LOTE
                                FROM sera.COMER_LOTES
                                WHERE ID_EVENTO = ${this.n_ID_EVENTO}
                                AND ID_CLIENTE = ${this.n_REL_CLIENTE}
                                AND LOTE_PUBLICO != 0)`);
            await this.entity.query(`UPDATE sera.BIENES
                SET ESTATUS = 'VEN'
            WHERE NO_BIEN IN (SELECT NO_BIEN
                                FROM sera.COMER_BIENESXLOTE
                                WHERE ID_LOTE IN (SELECT ID_LOTE
                                                    FROM sera.COMER_LOTES
                                                    WHERE ID_EVENTO = ${this.n_ID_EVENTO}
                                                    AND ID_CLIENTE = ${this.n_REL_CLIENTE}
                                                    AND LOTE_PUBLICO != 0))`);
            await this.entity.query(`UPDATE sera.COMER_CLIENTESXEVENTO
                SET PROCESADO = 'N',
                    PROCESAR = 'S',
                    ENVIAR_SIRSAE = 'N',
                    ENVIADO_SIRSAE = 'N',
                    FECHA_EJECUCION = NULL
            WHERE ID_EVENTO = ${this.n_ID_EVENTO}
                AND ID_CLIENTE = ${this.n_REL_CLIENTE}`);

            var query1 = await this.entity.query(`SELECT ID_CLIENTE, LOTE_PUBLICO 
                FROM sera.COMER_LOTES
                WHERE ID_EVENTO = ${this.n_ID_EVENTO}
                AND ID_CLIENTE = ${this.n_REL_CLIENTE}
                AND LOTE_PUBLICO != 0`)
            query1.forEach(element => {
                /* PK_COMER_PENALIZACIONES.PA_REVERSA_PENALIZACION (re_REL_LOTES.ID_CLIENTE,
                     n_ID_EVENTO,
                     re_REL_LOTES.LOTE_PUBLICO,
                     P_MSG_PROCESO,
                     P_EST_PROCESO);*/
            });

            const queryCuentaReg = await this.entity.query(`SELECT COUNT(0)
            AS n_CUENTAREG
            FROM sera.COMER_DETALLES DET
            WHERE ID_EVENTO = ${this.n_ID_EVENTO}
                AND EXISTS (SELECT 1
                            FROM sera.COMER_LOTES LOT
                            WHERE LOT.ID_EVENTO = ${this.n_ID_EVENTO}
                            AND LOT.ID_CLIENTE = ${this.n_REL_CLIENTE}
                            AND DET.ID_LOTE = LOT.ID_LOTE)
                AND IDORDENGRABADA IS NULL`);
            n_CUENTAREG = queryCuentaReg[0].n_CUENTAREG;
            if (n_CUENTAREG > 0) {
                await this.entity.query(`DELETE sera.COMER_DETALLES DET
                WHERE ID_EVENTO = n_ID_EVENTO
                AND EXISTS (SELECT *
                                FROM sera.COMER_LOTES LOT
                                WHERE LOT.ID_EVENTO = ${this.n_ID_EVENTO}
                            AND LOT.ID_CLIENTE = ${this.n_REL_CLIENTE}
                            AND DET.ID_LOTE = LOT.ID_LOTE 
                            LIMIT 1)
                AND IDORDENGRABADA IS NULL`);
            }
            const queryCuentaReg2: any[] = await this.entity.query(`SELECT COUNT(0)
            AS n_CUENTAREG
            FROM sera.COMER_CABECERAS CAB
            WHERE CAB.ID_EVENTO = ${this.n_ID_EVENTO}
            AND  CAB.CLIENTE_RFC = (SELECT CLI.RFC
                                        FROM sera.COMER_CLIENTES CLI
                                        WHERE CLI.ID_CLIENTE = ${this.n_REL_CLIENTE})
                AND IDORDENGRABADA IS NULL`);
            n_CUENTAREG = queryCuentaReg2[0].n_CUENTAREG;
            if (n_CUENTAREG > 0) {
                await this.entity.query(`DELETE sera.COMER_CABECERAS CAB
                WHERE CAB.ID_EVENTO = ${this.n_ID_EVENTO}
                AND CAB.CLIENTE_RFC IN (SELECT CLI.RFC
                                        FROM sera.COMER_CLIENTES CLI
                                        WHERE CLI.ID_CLIENTE = ${this.n_REL_CLIENTE})
                AND IDORDENGRABADA IS NULL`);
            }
        } else {

            await this.entity.query(`UPDATE sera.COMER_PAGOREF CP
                SET VALIDO_SISTEMA = 'A'
            WHERE EXISTS (SELECT 1
                        FROM sera.COMER_PAGOREF_VIRT VI
                        WHERE VI.ID_PAGO = CP.ID_PAGO
                            AND ID_LOTE = TO_NUMBER(${this.c_REL_LOTES}))
                AND VALIDO_SISTEMA = 'S'
                AND IDORDENINGRESO IS NULL`);


            await this.entity.query(`UPDATE sera.COMER_LOTES
                SET ID_ESTATUSVTA = 'VEN'
            WHERE ID_LOTE = TO_NUMBER(${this.c_REL_LOTES})`);
            await this.entity.query(`UPDATE sera.COMER_BIENESXLOTE
                SET ESTATUS_ANT = ESTATUS_COMER,
                    ESTATUS_COMER = 'CPV'
            WHERE ID_LOTE = TO_NUMBER(${this.c_REL_LOTES})`);
            await this.entity.query(`UPDATE sera.BIENES
                SET ESTATUS = 'VEN'
            WHERE NO_BIEN IN (SELECT NO_BIEN
                                FROM sera.COMER_BIENESXLOTE
                                WHERE ID_LOTE = TO_NUMBER(${this.c_REL_LOTES}))`);

            const queryCuentaReg3: any[] = await this.entity.query(`SELECT COUNT(0)
            AS n_CUENTAREG
            FROM sera.COMER_DETALLES
            WHERE ID_EVENTO = n_ID_EVENTO
                AND ID_LOTE = TO_NUMBER(c_REL_LOTES)
                AND IDORDENGRABADA IS NULL`);
            n_CUENTAREG = queryCuentaReg3[0].n_CUENTAREG;
            if (n_CUENTAREG > 0) {
                await this.entity.query(`DELETE FROM sera.COMER_DETALLES
                WHERE ID_EVENTO = ${this.n_ID_EVENTO}
                AND ID_LOTE = TO_NUMBER(${this.c_REL_LOTES})
                AND IDORDENGRABADA IS NULL`);
            }
            const queryCuentaReg4: any[] = await this.entity.query(`SELECT COUNT(0)
            AS n_CUENTAREG
            FROM sera.COMER_CABECERAS
            WHERE ID_EVENTO = n_ID_EVENTO
                AND IDENTIFICADOR NOT IN (SELECT IDENTIFICADOR FROM COMER_DETALLES WHERE ID_EVENTO = n_ID_EVENTO)`);
            n_CUENTAREG = queryCuentaReg4[0].n_CUENTAREG;
            if (n_CUENTAREG > 0) {
                await this.entity.query(`DELETE FROM sera.COMER_CABECERAS
                WHERE ID_EVENTO = ${this.n_ID_EVENTO}
                AND IDENTIFICADOR NOT IN (SELECT IDENTIFICADOR FROM sera.COMER_DETALLES WHERE ID_EVENTO = ${this.n_ID_EVENTO})`);
            }


            const queryLote: any[] = await this.entity.query(`SELECT ID_CLIENTE AS n_ID_CLIENTE, LOTE_PUBLICO
                AS n_LOTE_PUBLICO
                FROM sera.COMER_LOTES
                WHERE ID_LOTE = TO_NUMBER(c_REL_LOTES)`)
            /*PK_COMER_PENALIZACIONES.PA_REVERSA_PENALIZACION (n_ID_CLIENTE,
                                                            n_ID_EVENTO,
                                                            n_LOTE_PUBLICO,
                                                            P_MSG_PROCESO,
                                                            P_EST_PROCESO);*/
            this.n_ID_CLIENTE = queryLote[0].n_ID_CLIENTE;
            this.n_LOTE_PUBLICO = queryLote[0].n_LOTE_PUBLICO;
        }
    }


    async PA_DISPINMUEBLES(event: number,
        cveEjec: number,
        relLots: string,
        indEnd: number,
        client: number,
        indRepro: number,
    ){

        var cu_MONTOS_VENTA =
            await this.entity.query(`SELECT ID_CLIENTE,
                COALESCE(SUM(PRECIO_FINAL),0) PRECIO_FINAL,
                case ${cveEjec} when 1 then COALESCE(SUM(ANTICIPO),0) else COALESCE(SUM(PRECIO_FINAL),0)  end as  anticipo ,
                case ${cveEjec} when 1 then COALESCE(SUM(PRECIO_GARANTIA),0) else 0 end  as precio_garantia,
                case ${cveEjec} when 1 then SUM(COALESCE(MONTO_LIQ,COALESCE(PRECIO_FINAL,0)-COALESCE(ANTICIPO,0))) else COALESCE(SUM(PRECIO_FINAL),0) end as monto_liq,
                case ${cveEjec} when 1 then COALESCE(SUM(GARANTIA_ASIG),0) else 0 end as garantia_asig 
                FROM sera.COMER_LOTES CL
                WHERE ID_ESTATUSVTA IN ('VEN')
                AND ID_EVENTO = ${event}
                AND EXISTS (SELECT *
                    FROM sera.COMER_CLIENTESXEVENTO CXE
                    WHERE CXE.ID_EVENTO = ${event}
                    AND CXE.ID_CLIENTE = CL.ID_CLIENTE
                    AND COALESCE(CXE.PROCESADO,'N') = 'N'
                    AND COALESCE(CXE.PROCESAR,'N') = 'S'
                    LIMIT 1)
                AND LOTE_PUBLICO != 0
                GROUP BY ID_CLIENTE
                ORDER BY ID_CLIENTE`);
                this.n_ID_LOTE = 1
        var cu_MONTOS_LOTES = await this.entity.query(`SELECT COALESCE(PRECIO_FINAL,0) PRECIO_FINAL,
        case ${cveEjec} when 1 then COALESCE((ANTICIPO),0) else COALESCE((PRECIO_FINAL),0)  end as  anticipo ,
        case ${cveEjec} when 1 then COALESCE((PRECIO_GARANTIA),0) else 0 end  as precio_garantia,
        case ${cveEjec} when 1 then (COALESCE(MONTO_LIQ,COALESCE(PRECIO_FINAL,0)-COALESCE(ANTICIPO,0))) else COALESCE((PRECIO_FINAL),0) end as monto_liq,
        case ${cveEjec} when 1 then COALESCE((GARANTIA_ASIG),0) else 0 end as garantia_asig, 
                    ID_LOTE,
                    LOTE_PUBLICO,
                    NO_TRANSFERENTE
                    FROM sera.COMER_LOTES CL
                    WHERE ID_ESTATUSVTA IN ('VEN')
                    AND ID_EVENTO = ${event}
                    AND ID_CLIENTE = ${client}
                    AND LOTE_PUBLICO != 0 
                    ORDER BY PRECIO_FINAL DESC`);

        var cu_MONTOS_PAGOREF = await this.entity.query(`SELECT VIR.ID_PAGO, REFERENCIA, NO_MOVIMIENTO, FECHA, COALESCE(VIR.MONTO,0) MONTO, CVE_BANCO, CODIGO, VIR.ID_LOTE, TIPO, FECHA_REGISTRO, REFERENCIAORI, CUENTA,
                        (SELECT NO_TRANSFERENTE FROM sera.COMER_LOTES WHERE ID_LOTE = VIR.ID_LOTE) NO_TRANSFERENTE
                        FROM sera.COMER_PAGOREF_VIRT VIR, sera.COMER_PAGOREF CPR, sera.COMER_PARAMETROSMOD MOD
                        WHERE VIR.ID_PAGO = CPR.ID_PAGO
                        AND VIR.ID_LOTE IN (SELECT ID_LOTE
                                    FROM sera.COMER_LOTES
                                    WHERE ID_ESTATUSVTA IN ('VEN')
                                    AND ID_EVENTO = ${event}
                                    AND ID_CLIENTE = ${client}
                                    AND LOTE_PUBLICO != 0)
                        AND ((${cveEjec} = 1 AND VIR.TIPO_REF NOT IN ('2','3','4','7','6')) OR ${cveEjec} = 3) 
                        AND VALIDO_SISTEMA = 'A'
                        AND CVE_BANCO = PARAMETRO
                        AND DIRECCION = 'C'
                        AND IDORDENINGRESO IS NULL
                        ORDER BY NO_MOVIMIENTO`);


        var cu_MONTOS_PAGOREF4 = await this.entity.query(`SELECT VIR.ID_PAGO, REFERENCIA, NO_MOVIMIENTO, FECHA, COALESCE(VIR.MONTO,0) MONTO, CVE_BANCO, CODIGO, VIR.ID_LOTE, TIPO, FECHA_REGISTRO, REFERENCIAORI, CUENTA,
                (SELECT NO_TRANSFERENTE FROM sera.COMER_LOTES WHERE ID_LOTE = VIR.ID_LOTE) NO_TRANSFERENTE,
                COALESCE(VIR.MONTO_PENA,0) MONTO_PENA
                FROM sera.COMER_PAGOREF_VIRT VIR, sera.COMER_PAGOREF CPR, sera.COMER_PARAMETROSMOD MOD
                WHERE VIR.ID_PAGO = CPR.ID_PAGO
                AND VIR.ID_LOTE = '${this.n_ID_LOTE}'
                AND ((${cveEjec} = 1 AND VIR.TIPO_REF IN ('2','3','4','7','6')) OR (${cveEjec} = 2 AND VIR.ID_PAGO IN (SELECT VI.ID_PAGO
                                                                                                             FROM sera.COMER_PAGOREF_VIRT VI, sera.COMER_PAGOREF CP
                                                                                                             WHERE VI.ID_PAGO = CP.ID_PAGO
                                                                                                                 AND VI.ID_LOTE = '${this.n_ID_LOTE}'
                                                                                                                 AND REFERENCIA IN (SELECT  CONCAT_WS(REF_GSAE,REF_GBANCO) FROM sera.COMER_LOTES CL, sera.COMER_REF_GARANTIAS CG
                                                                                                                                 WHERE CL.ID_LOTE = CG.ID_LOTE
                                                                                                                                     AND CL.ID_CLIENTE = CG.ID_CLIENTE
                                                                                                                                     AND CL.ID_LOTE = CP.ID_LOTE)
                                                                                                             UNION
                                                                                                             SELECT VI.ID_PAGO
                                                                                                             FROM sera.COMER_PAGOREF_VIRT VI, sera.COMER_PAGOREF CP
                                                                                                             WHERE VI.ID_PAGO = CP.ID_PAGO
                                                                                                                 AND VI.ID_LOTE = '${this.n_ID_LOTE}'
                                                                                                                                            AND VI.TIPO_REF IN ('2','3','4','7','6') )))
                            AND VALIDO_SISTEMA = 'A'
                            AND CVE_BANCO = PARAMETRO
                            AND DIRECCION = 'C'
                            AND IDORDENINGRESO IS NULL
                            ORDER BY SUBSTR(REFERENCIA,1,1), NO_MOVIMIENTO`);


        var cu_PAGOSREFGENS = await this.entity.query(`SELECT * FROM sera.COMER_PAGOSREFGENS CP 
                        WHERE ID_LOTE = '${this.n_ID_LOTE}'
                        AND TIPO = 'N'
                        AND EXISTS (SELECT *
                            FROM sera.COMER_PAGOREF
                            WHERE ID_PAGO = CP.ID_PAGO
                            AND IDORDENINGRESO IS NULL
                            LIMIT 1)
                       
                        ORDER BY ID_PAGOREFGENS`);
        var cu_VALPENALOTE = await this.entity.query(`SELECT ID_CLIENTE,
                            ID_LOTE,
                            LOTE_PUBLICO,
                            NO_TRANSFERENTE,
                            COALESCE (PRECIO_FINAL, 0) PRECIO_FINAL,
                            COALESCE ((SELECT SUM (MONTO)
                            FROM sera.COMER_PAGOSREFGENS CPG
                            WHERE EXISTS (SELECT 1
                                        FROM sera.COMER_PAGOREF CPR
                                        WHERE ID_PAGO = CPG.ID_PAGO
                                            AND IDORDENINGRESO IS NOT NULL)
                            AND ID_EVENTO = CL.ID_EVENTO
                            AND TIPO = 'N'
                            AND ID_LOTE = CL.ID_LOTE),0) MONTO_APLIC,
                            COALESCE(PRECIO_GARANTIA,0) PRECIO_GARANTIA,
                            case ${cveEjec} when 1 then COALESCE((ANTICIPO),0) else COALESCE((PRECIO_FINAL),0)  end as  anticipo ,
                            case COALESCE(EXCEDE_FALTA,0) when 0 then 0 else 1 end as IND_CANC_USUARIO,
                            case COALESCE(EXCEDE_FALTA,0) when 2 then 1 else 0 end as IND_CANC_SIN_PENA,
                            COALESCE(PORC_APP_IVA,0) PORC_APP_IVA,
                            COALESCE(IVA_LOTE,0) IVA_LOTE,
                            case '${this.c_DIRECCION}' when 'I' then COALESCE(MONTO_APP_IVA,0) end as MONTO_APP_IVA,
                            COALESCE(MONTO_NOAPP_IVA,0) MONTO_NOAPP_IVA 
                            FROM sera.COMER_LOTES CL 
                            WHERE ID_EVENTO = ${event}
                            AND LOTE_PUBLICO != 0
                            AND ID_CLIENTE IS NOT NULL
                            ORDER BY ID_CLIENTE, PRECIO_FINAL DESC`);


        var cu_MONTOS_VENTA_PENA = await this.entity.query(`SELECT ID_CLIENTE,
                    COALESCE(SUM(PRECIO_FINAL),0) PRECIO_FINAL,
                    case ${cveEjec} when 1 then COALESCE(SUM(ANTICIPO),0) else COALESCE(SUM(PRECIO_FINAL),0)  end as  anticipo ,
                    case ${cveEjec} when 1 then COALESCE(SUM(PRECIO_GARANTIA),0) else 0 end  as precio_garantia,
                    case ${cveEjec} when 1 then SUM(COALESCE(MONTO_LIQ,COALESCE(PRECIO_FINAL,0)-COALESCE(ANTICIPO,0))) else COALESCE(SUM(PRECIO_FINAL),0) end as monto_liq,
                    case ${cveEjec} when 1 then COALESCE(SUM(GARANTIA_ASIG),0) else 0 end as garantia_asig  
                    FROM sera.COMER_LOTES CL
                    WHERE ID_EVENTO = ${event}
                    AND LOTE_PUBLICO != 0
                    AND ID_CLIENTE IS NOT NULL
                    GROUP BY ID_CLIENTE
                    ORDER BY ID_CLIENTE`);

        var cu_MONTOS_LOTES_PENA = await this.entity.query(`SELECT COALESCE(PRECIO_FINAL,0) PRECIO_FINAL,
        case ${cveEjec} when 1 then COALESCE((ANTICIPO),0) else COALESCE((PRECIO_FINAL),0)  end as  anticipo ,
        case ${cveEjec} when 1 then COALESCE((PRECIO_GARANTIA),0) else 0 end  as precio_garantia,
        case ${cveEjec} when 1 then (COALESCE(MONTO_LIQ,COALESCE(PRECIO_FINAL,0)-COALESCE(ANTICIPO,0))) else COALESCE((PRECIO_FINAL),0) end as monto_liq,
        case ${cveEjec} when 1 then COALESCE((GARANTIA_ASIG),0) else 0 end as garantia_asig, 
                ID_LOTE,
                LOTE_PUBLICO,
                NO_TRANSFERENTE
                FROM sera.COMER_LOTES CL
                WHERE ID_EVENTO = ${event}
                AND ID_CLIENTE = ${client}
                AND LOTE_PUBLICO != 0
                ORDER BY PRECIO_FINAL DESC`);


        var cu_MONTOS_PAGOREF_PENA = await this.entity.query(`SELECT VIR.ID_PAGO, REFERENCIA, NO_MOVIMIENTO, FECHA, COALESCE(VIR.MONTO,0) MONTO, CVE_BANCO, CODIGO, VIR.ID_LOTE, TIPO, FECHA_REGISTRO, REFERENCIAORI, CUENTA,
                    (SELECT NO_TRANSFERENTE FROM sera.COMER_LOTES WHERE ID_LOTE = VIR.ID_LOTE) NO_TRANSFERENTE,
                    COALESCE(VIR.MONTO_PENA,0) MONTO_PENA
                    FROM sera.COMER_PAGOREF_VIRT VIR, sera.COMER_PAGOREF CPR, sera.COMER_PARAMETROSMOD MOD
                    WHERE VIR.ID_PAGO = CPR.ID_PAGO
                    AND VIR.ID_LOTE = ${this.n_ID_LOTE}
                    AND ((${cveEjec} = 1 AND VIR.TIPO_REF IN ('2','3','4','7','6')) OR (${cveEjec} = 2 AND VIR.ID_PAGO IN (SELECT VI.ID_PAGO
                                                                                                            FROM sera.COMER_PAGOREF_VIRT VI, sera.COMER_PAGOREF CP
                                                                                                           WHERE VI.ID_PAGO = CP.ID_PAGO
                                                                                                             AND VI.ID_LOTE = ${this.n_ID_LOTE}
                                                                                                             AND REFERENCIA IN (SELECT  REF_GSAE||REF_GBANCO FROM sera.COMER_LOTES CL, sera.COMER_REF_GARANTIAS CG
                                                                                                                               WHERE CL.ID_LOTE = CG.ID_LOTE
                                                                                                                                 AND CL.ID_CLIENTE = CG.ID_CLIENTE
                                                                                                                                 AND CL.ID_LOTE = CP.ID_LOTE)
                                                                                                          UNION
                                                                                                          SELECT VI.ID_PAGO
                                                                                                            FROM sera.COMER_PAGOREF_VIRT VI, sera.COMER_PAGOREF CP
                                                                                                           WHERE VI.ID_PAGO = CP.ID_PAGO
                                                                                                             AND VI.ID_LOTE = ${this.n_ID_LOTE}
                                                                                                             AND VI.TIPO_REF IN ('2','3','4','7','6') )))
                    AND VALIDO_SISTEMA IN ('A','S')
                    AND CVE_BANCO = PARAMETRO
                    AND DIRECCION = 'C'
               
                    ORDER BY SUBSTR(REFERENCIA,1,1), NO_MOVIMIENTO`);

        this.n_ID_EVENTO = 13018;
        this.n_ID_EVENTO = event;
        this.n_CVE_EJEC = cveEjec;
        this.c_REL_LOTES = relLots;
        this.n_IND_FINAL = indEnd;
        this.n_REL_CLIENTE = client;
        this.n_IND_REPRO = indRepro;
        this.c_IND_MOV = 'C';

        if (this.n_CVE_EJEC != 1 && this.n_CVE_EJEC != 2 && this.n_CVE_EJEC != 3) {
            this.c_ERROR = 'Proceso inválido';
            //RAISE e_EXCEPPROC;
        }

        const queryProceso: any[] = await this.entity.query(`SELECT CVE_PROCESO AS c_CVE_PROCESO,
                ID_TPEVENTO AS n_ID_TPEVENTO,
                DIRECCION AS c_DIRECCION,
                FEC_FALLO AS f_FEC_FALLO,
                FECHA_CIERRE_EVENTO AS f_FECHA_CIERRE_EVENTO,
                FECHA_NOTIFICACION AS f_FECHA_NOTIFICACION
                FROM sera.COMER_EVENTOS
                WHERE ID_EVENTO = ${this.n_ID_EVENTO}`);
        this.c_CVE_PROCESO = queryProceso[0].c_CVE_PROCESO;
        this.n_ID_TPEVENTO = queryProceso[0].n_ID_TPEVENTO;
        this.c_DIRECCION = queryProceso[0].c_DIRECCION;
        this.f_FEC_FALLO = queryProceso[0].f_FEC_FALLO;
        this.f_FECHA_CIERRE_EVENTO = queryProceso[0].f_FECHA_CIERRE_EVENTO;
        this.f_FECHA_NOTIFICACION = queryProceso[0].f_FECHA_NOTIFICACION;
        if (!this.n_ID_TPEVENTO) {
            this.c_ERROR = 'Evento inexistente.';
        }

        const queryCheque: any[] = await this.entity.query(`SELECT VALOR AS n_DIAS_GRACIA_CHEQUE
            FROM sera.COMER_PARAMETROSMOD
            WHERE PARAMETRO = 'ENDDISPC'`);
        this.n_DIAS_GRACIA_CHEQUE = queryCheque[0].n_DIAS_GRACIA_CHEQUE;

        if (!this.n_DIAS_GRACIA_CHEQUE) {
            this.c_ERROR = 'Parámetro de dias de gracia por cheque inexistente.';
        }

        const queryDias: any[] = await this.entity.query(`SELECT VALOR 
            AS n_DIAS_GRACIA_TRANSF
            FROM sera.COMER_PARAMETROSMOD
            WHERE PARAMETRO = 'ENDDISPT'`);
        this.n_DIAS_GRACIA_TRANSF = queryDias[0].n_DIAS_GRACIA_TRANSF;
        if (!this.n_DIAS_GRACIA_TRANSF) {
            this.c_ERROR = 'Parámetro de dias de gracia por transferencia inexistente.';
        }

        this.c_PARAMETRO = 'GCE';
        this.f_FECHA_GRACIA_GARANT = await this.FA_FECHA_GRACIA();
        if (!this.f_FECHA_GRACIA_GARANT) {
            this.c_ERROR = 'No se obtuvo la Fecha de gracia de garantía.';
        }
        this.c_PARAMETRO = 'LIQE';
        this.f_FECHA_GRACIA_LIQ = await this.FA_FECHA_GRACIA();
        if (!this.f_FECHA_GRACIA_LIQ) {
            this.c_ERROR = 'No se obtuvo la Fecha de gracia de liquidación.';
        }
        if (this.f_FECHA_GRACIA_LIQ < new Date()) {
            this.f_FECHA_INI_PENA = new Date(this.f_FECHA_GRACIA_LIQ.getTime() + 86400000);
        } else {
            this.f_FECHA_INI_PENA = new Date((this.f_FECHA_GRACIA_GARANT?.getTime() || new Date().getTime()) + 86400000);
        }


        const queryConiva: any[] = await this.entity.query(`SELECT UPPER(VALOR)
                AS c_CONIVA 
                FROM sera.COMER_PARAMETROSMOD
                WHERE PARAMETRO = 'CHCONIVA'`);
        this.c_CONIVA = queryConiva[0].c_CONIVA;
        if (!this.c_CONIVA) {
            this.c_ERROR = 'Parámetro de IVA Chatarra inexistente.';
        }

        if (this.f_FECHA_GRACIA_LIQ < new Date()) {
            this.c_PARAMETRO = 'PORPENAIP';
        } else {
            this.c_PARAMETRO = 'PORPENAIG';
        }


        const queryValor: any[] = await this.entity.query(`SELECT VALOR 
                AS c_VALOR
                FROM sera.COMER_PARAMETROSMOD
                WHERE PARAMETRO = '${this.c_PARAMETRO}'`);
        this.c_VALOR = queryValor[0].c_VALOR || "";
        this.c_LLAVE = this.c_DIRECCION + this.n_ID_TPEVENTO;
        this.n_VALIDA = this.c_VALOR.indexOf(this.c_LLAVE);
        if (this.n_VALIDA == 0) {
            this.n_PORPENAIP = 0;
        } else {
            this.c_VALOR = this.c_VALOR.substring(this.c_VALOR.indexOf(this.c_LLAVE), this.c_VALOR.indexOf('|') - this.c_VALOR.indexOf(this.c_LLAVE));
            this.n_PORPENAIP = 2//TO_NUMBER(GETWORDCSV(c_VALOR, 2));
        }
        if (!this.n_PORPENAIP) {
            this.n_PORPENAIP = 0;
        }

        if (this.f_FECHA_GRACIA_LIQ < new Date()) {
            this.c_PARAMETRO = 'MONPENAIP';
        } else {
            this.c_PARAMETRO = 'MONPENAIG';
        }

        const queryValor2: any[] = await this.entity.query(`SELECT VALOR
            AS c_VALOR
            FROM sera.COMER_PARAMETROSMOD
            WHERE PARAMETRO = '${this.c_PARAMETRO}'`);
        this.c_VALOR = queryValor2[0].c_VALOR ||"";
        this.c_LLAVE = this.c_DIRECCION + this.n_ID_TPEVENTO;
        this.n_VALIDA = this.c_VALOR.indexOf(this.c_LLAVE)
        if (this.n_VALIDA == 0) {
            this.n_MONPENAIP = 0;
        } else {
            this.c_VALOR = this.c_VALOR.substring(this.c_VALOR.indexOf(this.c_LLAVE), this.c_VALOR.indexOf('|') - this.c_VALOR.indexOf(this.c_LLAVE));
            this.n_MONPENAIP = 2//TO_NUMBER(GETWORDCSV(c_VALOR, 2));
        }
        if (!this.n_MONPENAIP) {
            this.n_MONPENAIP = 0;
        }

        if (this.f_FECHA_GRACIA_LIQ < new Date()) {
            this.c_PARAMETRO = 'PFMPENAIP';
        } else {
            this.c_PARAMETRO = 'PFMPENAIG';
        }

        const queryValor3: any[] = await this.entity.query(`SELECT VALOR
            AS c_VALOR
            FROM sera.COMER_PARAMETROSMOD
            WHERE PARAMETRO = '${this.c_PARAMETRO}'`);
        this.c_LLAVE = this.c_DIRECCION + this.n_ID_TPEVENTO;
        this.n_VALIDA = this.c_VALOR.indexOf(this.c_LLAVE)
        if (this.n_VALIDA == 0) {
            this.n_PFMPENAIP = 0;
        } else {
            this.c_VALOR = this.c_VALOR.substring(this.c_VALOR.indexOf(this.c_LLAVE), this.c_VALOR.indexOf('|') - this.c_VALOR.indexOf(this.c_LLAVE));
            this.n_PFMPENAIP = 2 //TO_NUMBER(GETWORDCSV(c_VALOR, 2));
        }
        if (!this.n_PFMPENAIP) {
            this.n_PFMPENAIP = 0;
        }


        if (this.f_FECHA_GRACIA_LIQ < new Date()) {
            this.c_PARAMETRO = 'ADPGPENAIP';
        } else {
            this.c_PARAMETRO = 'ADPGPENAIG';
        }

        const queryValor4: any[] = await this.entity.query(`SELECT VALOR
            AS c_VALOR
            FROM sera.COMER_PARAMETROSMOD
            WHERE PARAMETRO = '${this.c_PARAMETRO}'`);
        this.c_VALOR = queryValor4[0].c_VALOR ||""
        this.c_LLAVE = this.c_DIRECCION + this.n_ID_TPEVENTO;
        this.n_ADPGPENAIP = this.c_VALOR.indexOf(this.c_LLAVE)
        if (!this.n_ADPGPENAIP) {
            this.n_ADPGPENAIP = 0;
        }


        const queryValor5: any[] = await this.entity.query(`SELECT VALOR
            AS c_VALOR
            FROM sera.COMER_PARAMETROSMOD
            WHERE PARAMETRO = 'EXENTAPENA'`);
        this.c_VALOR = queryValor5[0].c_VALOR || ""
        this.c_LLAVE = this.c_DIRECCION + this.n_ID_TPEVENTO;

        this.n_EXENTAPENA = this.c_VALOR.indexOf(this.c_LLAVE);
        if (!this.c_VALOR) {
            this.c_ERROR = 'Parámetro EXENTAPENA no encontrado.';
        }

        this.c_PARAMETRO = 'PORGARASIG';

        const queryValor6: any[] = await this.entity.query(`SELECT VALOR
            AS c_VALOR
            FROM sera.COMER_PARAMETROSMOD
            WHERE PARAMETRO = '${this.c_PARAMETRO}'`);
        this.c_VALOR = queryValor6[0].c_VALOR || ""
        this.c_LLAVE = this.c_DIRECCION + this.n_ID_TPEVENTO;
        this.n_VALIDA = this.c_VALOR.indexOf(this.c_LLAVE);
        if (this.n_VALIDA == 0) {
            this.n_PORGARCUMSE = 0;
        } else {
            this.c_VALOR = this.c_VALOR.substring(this.c_VALOR.indexOf(this.c_LLAVE), this.c_VALOR.indexOf('|') - this.c_VALOR.indexOf(this.c_LLAVE));

            this.n_PORGARCUMSE = 2//TO_NUMBER(GETWORDCSV(c_VALOR, 2));
        }
        if (!this.n_PORGARCUMSE) {
            this.n_PORGARCUMSE = 0;
        }
        this.tab_SALDOS = [];
        this.tab_VALPENALOTE = [];
        this.tab_PAGOS = [];
        this.n_CONT_PAGOS = 0;
        this.G_NUMLOTES = 0;
        this.G_TPOPERACION = 0;
        this.G_PCTCHATARRA = 0;
        if (this.n_ID_TPEVENTO != 5) {
            cu_VALPENALOTE.forEach(element => {
                var obj:any = {}
               obj.ID_CLIENTE = element.id_cliente;
               obj.ID_LOTE = element.id_lote;
               obj.LOTE_PUBLICO = element.lote_publico;
               obj.NO_TRANSFERENTE = element.no_transferente;
               obj.PRECIO_FINAL = element.precio_final;
               obj.MONTO_APLIC = element.monto_aplic;
               this.tab_VALPENALOTE[element.id_lote] = obj

                this.l_BANP = true;
                this.tab_VALPENALOTE[element.id_lote] = {MONTO_PENA:0};
                if (this.n_PORPENAIP > 0) {
                    if (element.precio_final > this.n_PFMPENAIP) {
                        this.tab_VALPENALOTE[element.id_lote] = {MONTO_PENA:this.tab_VALPENALOTE[element.id_lote].MONTO_PENA + Math.round(element.PRECIO_FINAL * this.n_PORPENAIP)}; //TODO: metodos
                    } else {
                        this.tab_VALPENALOTE[element.id_lote] ={MONTO_PENA: this.tab_VALPENALOTE[element.id_lote].MONTO_PENA + element.PRECIO_GARANTIA};
                    }
                    this.l_BANP = false;
                }
                if (this.n_MONPENAIP > 0) {
                    this.tab_VALPENALOTE[element.id_lote] = {MONTO_PENA:this.tab_VALPENALOTE[element.id_lote].MONTO_PENA + this.n_MONPENAIP};
                    this.l_BANP = false;
                }
                if (this.n_ADPGPENAIP > 0) {
                    this.tab_VALPENALOTE[element.id_lote] = {MONTO_PENA:this.tab_VALPENALOTE[element.id_lote].MONTO_PENA + element.PRECIO_GARANTIA};
                    this.l_BANP = false;
                }
                if (this.l_BANP) {
                    this.tab_VALPENALOTE[element.id_lote] = {MONTO_PENA:element.PRECIO_GARANTIA};
                }
                var ob1:any = {
                    MONTO_GCUMPLE : Math.round(element.PRECIO_FINAL * this.n_PORGARCUMSE),
                    MONTO_POR_APLIC :0,
                    IND_PENA : element.IND_CANC_USUARIO,
                    IND_CANC_SIN_PENA : element.IND_CANC_SIN_PENA,
                    PORC_APP_IVA : element.PORC_APP_IVA,
                    IVA_LOTE : element.IVA_LOTE,
                    MONTO_APP_IVA : element.MONTO_APP_IVA,
                    MONTO_NOAPP_IVA : element.MONTO_NOAPP_IVA,
                    SALDO_ANTICIPO : 0
                }
                this.tab_VALPENALOTE[element.id_lote] = ob1

            });

            if (this.n_EXENTAPENA == 0) {
                this.n_TCANT_LOTES = this.tab_VALPENALOTE.length;
                if (this.n_TCANT_LOTES > 0) {
                    if (this.n_CVE_EJEC == 1 || this.n_CVE_EJEC == 3) {
                        cu_MONTOS_VENTA_PENA.forEach(async element => {
                            const queryPago: any[] = await this.entity.query(`SELECT COALESCE(SUM(VIR.MONTO),0)
                                AS n_MONTO_TOT_PAGO
                                FROM sera.COMER_PAGOREF_VIRT VIR, sera.COMER_PAGOREF CPR, sera.COMER_PARAMETROSMOD MOD
                                WHERE VIR.ID_PAGO = CPR.ID_PAGO
                                    AND VIR.ID_LOTE IN (SELECT ID_LOTE
                                                        FROM sera.COMER_LOTES
                                                        WHERE ID_EVENTO = ${this.n_ID_EVENTO}
                                                        AND ID_CLIENTE = ${element.id_cliente}
                                                        AND LOTE_PUBLICO != 0)
                                    AND ((n_CVE_EJEC = 1 AND VIR.TIPO_REF NOT IN ('2','3','4','7','6')) OR n_CVE_EJEC = 3)
                                    AND VALIDO_SISTEMA IN ('A','S')
                                    AND CVE_BANCO = PARAMETRO
                                    AND DIRECCION = 'C'`);
                            this.n_MONTO_TOT_PAGO = queryPago[0].n_MONTO_TOT_PAGO;

                            this.n_MONTO_DIF_LIQ = this.n_MONTO_TOT_PAGO - element.ANTICIPO;
                            if (this.n_MONTO_DIF_LIQ < 0) {
                                this.n_MONTO_DIF_LIQ = 0;
                            }

                            this.tab_LOTES = [];
                            this.n_ORDEN_LOTES = 0;

                            cu_MONTOS_LOTES_PENA.forEach(element2 => {

                                this.tab_VALPENALOTE[element2.id_lote].SALDO_ANTICIPO = element2.ANTICIPO;
                                this.n_MONTO_LIQ = 0;
                                if (this.n_MONTO_DIF_LIQ > 0) {
                                    this.n_MONTO_LIQ = element2.precio_final - element2.anticipo;
                                    if ((this.n_MONTO_DIF_LIQ - this.n_MONTO_LIQ) <= 0) {
                                        this.n_MONTO_LIQ = this.n_MONTO_DIF_LIQ;
                                    }
                                    this.tab_VALPENALOTE[element2.id_lote].SALDO_ANTICIPO = this.tab_VALPENALOTE[element2.ID_LOTE].SALDO_ANTICIPO + this.n_MONTO_LIQ;
                                    this.n_MONTO_DIF_LIQ = this.n_MONTO_DIF_LIQ - this.n_MONTO_LIQ;
                                }

                                this.n_ORDEN_LOTES = this.n_ORDEN_LOTES + 1;
                                this.tab_LOTES[this.n_ORDEN_LOTES] = element2.ID_LOTE;
                            });

                            if (this.n_ORDEN_LOTES > 0) {
                                const queryPago: any[] = await this.entity.query(`SELECT COALESCE(SUM(COALESCE(VIR.MONTO,0)),0)
             AS n_MONTO
             FROM sera.COMER_PAGOREF_VIRT VIR, sera.COMER_PAGOREF CPR, sera.COMER_PARAMETROSMOD MOD
             WHERE VIR.ID_PAGO = CPR.ID_PAGO
             AND VIR.ID_LOTE IN (SELECT ID_LOTE
                                     FROM sera.COMER_LOTES
                                     WHERE ID_EVENTO = ${this.n_ID_EVENTO}
                                     AND ID_CLIENTE = ${element.id_cliente})
             AND ((n_CVE_EJEC = 1 AND VIR.TIPO_REF NOT IN ('2','3','4','7','6')) OR ${cveEjec} = 3)
             AND VALIDO_SISTEMA IN ('A','S')
             AND CVE_BANCO = PARAMETRO
             AND DIRECCION = 'C'
             AND FECHA <= ${this.f_FECHA_GRACIA_LIQ}`);

                                for (let v_I = 0; v_I <= this.n_ORDEN_LOTES; v_I++) {
                                    this.n_TLOTE = this.tab_LOTES[v_I];

                                    if (this.n_MONTO >= this.tab_VALPENALOTE[this.n_TLOTE].SALDO_ANTICIPO) {
                                        this.tab_VALPENALOTE[this.n_TLOTE].MONTO_POR_APLIC = this.tab_VALPENALOTE[this.n_TLOTE].SALDO_ANTICIPO;
                                        this.n_MONTO = this.n_MONTO - this.tab_VALPENALOTE[this.n_TLOTE].SALDO_ANTICIPO;
                                        this.tab_VALPENALOTE[this.n_TLOTE].SALDO_ANTICIPO = 0;
                                    } else {
                                        this.tab_VALPENALOTE[this.n_TLOTE].MONTO_POR_APLIC = this.n_MONTO;
                                        this.tab_VALPENALOTE[this.n_TLOTE].SALDO_ANTICIPO = this.tab_VALPENALOTE[this.n_TLOTE].SALDO_ANTICIPO - this.n_MONTO;
                                        this.n_MONTO = 0;
                                        break;
                                    }

                                }
                            }
                        });




                    }
                    /* PROCESO PARA PAGOS DE CUALQUIER TIPO */
                    this.n_TCANT_LOTES = this.tab_VALPENALOTE.length;
                    if (this.n_TCANT_LOTES > 0) {

                        this.tab_VALPENALOTE.forEach((element, index) => {
                            this.n_MONTO = 0;
                            this.n_TLOTE = index;
                            cu_MONTOS_PAGOREF_PENA.forEach((element2, index2) => {
                                this.n_MONTO = element2.monto - element2.monto_pena;
                                this.tab_VALPENALOTE[index].MONTO_POR_APLIC = this.tab_VALPENALOTE[index].MONTO_POR_APLIC + this.n_MONTO;
                            });
                        });

                    }
                    if (this.n_TCANT_LOTES > 0) {
                        this.tab_VALPENALOTE.forEach((element, index) => {
                            this.n_TLOTE = index;

                            if (this.f_FECHA_GRACIA_LIQ < new Date() &&
                                this.tab_VALPENALOTE[this.n_TLOTE].MONTO_POR_APLIC < this.tab_VALPENALOTE[this.n_TLOTE].PRECIO_FINAL) {
                                this.tab_VALPENALOTE[this.n_TLOTE].IND_PENA = 1;
                            } else if (this.f_FECHA_GRACIA_GARANT < new Date() &&
                                this.tab_VALPENALOTE[this.n_TLOTE].MONTO_POR_APLIC < this.tab_VALPENALOTE[this.n_TLOTE].MONTO_GCUMPLE) {
                                this.tab_VALPENALOTE[this.n_TLOTE].IND_PENA = 1;
                            }

                        });

                    }
                }
            }

        }


        const queryPagoRef: any[] = await this.entity.query(`SELECT COALESCE(MAX(ID_PAGOREFGENS),0)
                    AS n_ID_PAGOREFGENS
                    FROM sera.COMER_PAGOSREFGENS
                    WHERE ID_EVENTO = ${this.n_ID_EVENTO}`);
        this.n_ID_PAGOREFGENS = queryPagoRef[0].n_ID_PAGOREFGENS;
        if (!this.n_ID_PAGOREFGENS) {
            this.n_ID_PAGOREFGENS = 0;
        }
        const queryIva: any[] = await this.entity.query(`SELECT 1 + (VALOR::numeric/100) AS n_PORC_IVA, 
                VALOR AS n_TASAIVA 
                FROM sera.COMER_PARAMETROSMOD PAR
                WHERE PAR.PARAMETRO = 'IVA'
                AND PAR.DIRECCION = 'C'`);
        this.n_PORC_IVA = queryIva[0].n_PORC_IVA;
        this.n_TASAIVA = queryIva[0].n_TASAIVA;
        if (!this.n_PORC_IVA || !this.n_TASAIVA) {
            this.n_PORC_IVA = 1.16;
            this.n_TASAIVA = 16;
        }

        if (this.n_CVE_EJEC == 1 || this.n_CVE_EJEC == 3) {

            if (this.n_IND_REPRO == 1) {
                this.PA_DEPURA();
            }

            cu_MONTOS_VENTA.forEach(async (element, index) => {
                const queryMontoTot: any[] = await this.entity.query(`SELECT COALESCE(SUM(MONTO),0)
                            AS n_MONTO_TOT_PAGO
                            FROM sera.COMER_PAGOREF, sera.COMER_PARAMETROSMOD
                            WHERE ID_LOTE IN (SELECT ID_LOTE
                                        FROM sera.COMER_LOTES
                                        WHERE ID_ESTATUSVTA IN ('VEN')
                                        AND ID_EVENTO = ${this.n_ID_EVENTO}
                                        AND ID_CLIENTE = re_MONTOS_VENTA.ID_CLIENTE
                                        AND LOTE_PUBLICO != 0)
                            AND SUBSTR(REFERENCIA,1,1) NOT IN ('2','3','4','7','6')
                            AND VALIDO_SISTEMA = 'A'
                            AND CVE_BANCO = PARAMETRO
                            AND DIRECCION = 'C'
                            AND IDORDENINGRESO IS NULL`);
                this.n_MONTO_TOT_PAGO = queryMontoTot[0].n_MONTO_TOT_PAGO;

                this.n_MONTO_TOT_CLIE = element.anticipo;

                this.n_MONTO_DIF_LIQ = this.n_MONTO_TOT_PAGO - element.anticipo;
                if (this.n_MONTO_DIF_LIQ < 0) {
                    this.n_MONTO_DIF_LIQ = 0;
                }


                this.tab_LOTES = [];
                this.n_ORDEN_LOTES = 0;
                cu_MONTOS_LOTES.forEach(element2 => {
                    this.tab_SALDOS[element2.id_lote].SALDO_PRECIO_FINAL = element2.PRECIO_FINAL - this.tab_VALPENALOTE[element2.id_lote].MONTO_APLIC;
                    this.tab_SALDOS[element2.id_lote].SALDO_ANTICIPO = element2.ANTICIPO;
                    if (this.tab_VALPENALOTE[element.id_lote].MONTO_APLIC >= element2.PRECIO_GARANTIA) {
                        this.tab_SALDOS[element2.id_lote].SALDO_PRECIO_GARANTIA = 0;
                    } else {
                        this.tab_SALDOS[element2.id_lote].SALDO_PRECIO_GARANTIA = element2.PRECIO_GARANTIA - this.tab_VALPENALOTE[element2.id_lote].MONTO_APLIC;
                    }
                    this.tab_SALDOS[element2.id_lote].SALDO_MONTO_LIQ = element2.MONTO_LIQ;

                    this.tab_SALDOS[element2.id_lote].SALDO_GARANTIA_ASIG = element2.GARANTIA_ASIG;

                    if (this.n_ID_TPEVENTO == 4 && this.c_DIRECCION == 'M') {
                        this.tab_SALDOS[element2.id_lote].MONTO_PRECIO_GARANTIA = Math.round(element2.PRECIO_FINAL * .5);
                    } else {
                        this.tab_SALDOS[element2.id_lote].MONTO_PRECIO_GARANTIA = element2.PRECIO_GARANTIA;
                    }

                    this.n_MONTO_LIQ = 0;
                    if (this.n_MONTO_DIF_LIQ > 0) {
                        this.n_MONTO_LIQ = element2.PRECIO_FINAL - element2.ANTICIPO;
                        if (this.n_MONTO_DIF_LIQ - this.n_MONTO_LIQ <= 0) {
                            this.n_MONTO_LIQ = this.n_MONTO_DIF_LIQ;
                        }
                        this.tab_SALDOS[element2.id_lote].SALDO_ANTICIPO = this.tab_SALDOS[element2.id_lote].SALDO_ANTICIPO + this.n_MONTO_LIQ;
                        this.n_MONTO_DIF_LIQ = this.n_MONTO_DIF_LIQ - this.n_MONTO_LIQ;
                    }

                    this.tab_SALDOS[element2.id_lote].NO_TRANSFERENTE = element2.NO_TRANSFERENTE;

                    this.n_ORDEN_LOTES = this.n_ORDEN_LOTES + 1;
                    this.tab_LOTES[this.n_ORDEN_LOTES] = element2.id_lote;
                });

                this.n_MONTO = 0;
                this.l_BAN = false;

            });

        }
        if(this.c_ERROR.length > 0){
            return {statusCode:400,message:[this.c_ERROR]};

        }
        var p_RESUL = 'Correcto.';
        return {statusCode:200,message:[p_RESUL]};

    }

}
