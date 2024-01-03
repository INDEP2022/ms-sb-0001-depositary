import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchPayment } from './dto/search-payment.dto';
import { ValidPayment } from './dto/valid-payment.dto';
import { ComerLotsEntity } from './entity/comer-lots.entity';
import { LocalDate } from 'src/shared/utils/local-date';
import { PaPaymentEfeDupNrefDto } from './dto/pa-payment-efe-dup-nref.dto';
import * as moment from 'moment-timezone';
import { pAdmPayEfeDuplicatedDto } from './dto/p-adm-pay-efe-duplicate.dto';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ComerPaymentService {
    constructor(@InjectRepository(ComerLotsEntity) private entity: Repository<ComerLotsEntity>,
                @Inject('CAPTURELINE') private readonly captureline: ClientProxy) { }

    async bankDescription(bankKey: string, code: number): Promise<string> {
        var descripcion = ""
        const result: any[] = await this.entity.query(`select DESCRIPCION
            from sera.COMER_CTRLPAGOS
            where CODIGO    = ${code}
            and CVE_BANCO = '${bankKey}'`)
        return (result.length > 0) ? result[0].descripcion : 'NEVAL'

    }

    async paymentProcess() {
        const dateNow = LocalDate.getNow();
        var LV_LOTE_PUBLICO = 0
        var LV_DES_INCONS = ""
        var LV_TIPO_INCON = 0
        var LV_VALREFER = 0
        var LV_VALMVTO = 0
        var LV_FECHA = new Date(dateNow)
        var LV_TIPO_FECHA = 0;
        var LV_VAL_SISTEMA = "";
        var LV_ID_TIPO_SAT = 0
        var LV_VALTIPSAT = 0
        var LV_DESCRIPCION = ""
        var LV_IFDSC = ""
        var LV_CODIGO = 0
        var LV_SUCURSAL = "", LV_CVE_BANCO = ""
        var LV_ID_CLIENTE = 0, LV_ID_EVENTO = 0, LV_ID_LOTE = 0, LV_TIPO_REF = 0, LV_MONTO = 0, LV_REFERENCIA = 0
        var LV_VAL_MONTO = 0

        await this.entity.query(`UPDATE sera.COMER_TMP_PAGOSXCONFIRM
            SET REFERENCIA = RTRIM(LTRIM(REPLACE(REFERENCIA,CHR(09),'')))`);
        await this.entity.query(`UPDATE sera.COMER_TMP_PAGOSXCONFIRM 
            SET REFERENCIA = RTRIM(LTRIM(REPLACE(REFERENCIA,'00000000000000000000','')))`);
        var message = "Proceso finalizo satisfactoriamente."

        var dData: any[] = await this.entity.query(`select CBCTABN   ,CVECHEQUE,ESTATUSMOV,FECHA_MOV,IDORDENINGRESO,IFDSC,
                IMPORTEDEP,coalesce(NUMMOV,CLK_SEQDET) NUMMOV,
                ltrim(rtrim(REFERENCIA)) REFERENCIA,
                coalesce(ltrim(rtrim(REFERENCIA_ORI)),ltrim(rtrim(REFERENCIA))) REFERENCIA_ORI,
                TIPO_PAGO_SAT,ID_PROCESO
            from sera.COMER_TMP_PAGOSXCONFIRM
            where PROCESADOS = 0`);
        for (const element of dData) {
            const query = await this.entity.query(`select    ID_CLIENTE,   ID_EVENTO,   ID_LOTE,   TIPO_REF,coalesce(MONTO,0) as monto, REFERENCIA
                  
                from sera.V_COMER_PAGOS
                where '${element.referencia}' LIKE '%'||REFERENCIA||'%'
                limit 1`);
            if (query[0].id_evento && query[0].id_lote) {
                LV_ID_CLIENTE = query[0].id_cliente
                LV_ID_EVENTO = query[0].id_evento
                LV_ID_LOTE = query[0].id_lote
                LV_TIPO_REF = query[0].tipo_ref
                LV_MONTO = query[0].monto
                LV_REFERENCIA = query[0].referencia
                var r = await this.entity.findOne({ where: { eventId: element.id_evento, id: element.id_lote } })
                LV_LOTE_PUBLICO = r ? r.publicLot : null
            }
            if (element.estatosmov == 1 || element.estatusmov == 2) {
                if (element.estatusmov == 1) {
                    LV_TIPO_INCON = 12;
                    LV_DES_INCONS = 'Cheques salvo en buen cobro (SIRSAE).';
                } else {
                    LV_TIPO_INCON = 13;
                    LV_DES_INCONS = 'Cheques Devueltos (SIRSAE).';
                }
            } else {
                if ((element.referencia || "NEREF") == "NEREF") {
                    LV_TIPO_INCON = 2;
                    LV_DES_INCONS = 'Pagos no Referenciados';
                } else {
                    var r1 = await this.entity.query(`select count(0) as count 
                    from sera.V_COMER_PAGOS
                    where '${element.referencia}' LIKE '%'||REFERENCIA||'%'`)
                    LV_VALREFER = r1[0].count
                    if (LV_VALREFER == 0) {
                        LV_TIPO_INCON = 13;
                        LV_DES_INCONS = 'La Referencia no se encuentra registrada en SIAB';
                    } else {
                        LV_TIPO_FECHA = 0;
                        LV_VAL_SISTEMA = null;
                        if (!element.tipo_pago_sat) {
                            LV_ID_TIPO_SAT = 99;
                        } else {
                            LV_ID_TIPO_SAT = parseInt(element.tipo_pago_sat)
                            const r2 = await this.entity.query(` select count(0) as count
                            from sera.COMER_CATTIPOPAGO_SAT
                            where ID_TIPO_SAT = ${element.tipo_pago_sat}`)
                            LV_ID_TIPO_SAT = r2[0].count

                            if (LV_ID_TIPO_SAT == 0) {
                                LV_TIPO_INCON = 4;
                                LV_DES_INCONS = 'Valor no valido del Tipo SAT(SIRSAE).';
                            }
                        }
                        if (!element.cbctabn) {
                            LV_TIPO_INCON = 5;
                            LV_DES_INCONS = 'No se localiz la Cuenta de Banco(SIRSAE).'
                        } else {
                            var r3: any[] = await this.entity.query(`select    SUCURSAL,   CVE_BANCO
                                  
                            from sera.CUENTAS_BANCARIAS
                            where CVE_CUENTA = substr('${element.cbctabn}',1,30)`)
                            if (r3.length > 0) {
                                LV_SUCURSAL = r3[0].sucursal
                                LV_CVE_BANCO = r3[0].cve_banco
                            } else {
                                LV_TIPO_INCON = 5;
                                LV_DES_INCONS = 'No se localiz la Cuenta de Banco(SIRSAE).';
                            }
                        }
                        LV_VAL_MONTO = parseInt(`${element.importedep}`)
                        if (LV_MONTO == element.importedep) {
                            LV_TIPO_INCON = 6;
                            LV_DES_INCONS = 'Valor del monto no es igual al monto original de la Referencia o LC.';
                        }
                        if (`${element.ifdsc}`.includes("BANCO SANT")) {
                            LV_IFDSC = 'SANTAND PS';
                            LV_TIPO_FECHA = 2;
                            var r4: any[] = await this.entity.query(` select min(CODIGO) as min
                            from sera.COMER_CTRLPAGOS
                            where ltrim(rtrim(DESCRIPCION)) = ltrim(rtrim('${element.cvecheque}'))
                            group by DESCRIPCION`)

                            LV_CODIGO = (r4.length > 0) ? r4[0].min : null
                        } else {
                            var r5: any[] = await this.entity.query(`select CVE_BANCO,   TIPO_FECHA,   CODIGO
                            
                            from sera.CAT_BANCOS
                            where  CVE_BANCO = '${LV_CVE_BANCO || element.ifdsc}'`)
                            if (r5.length > 0) {
                                LV_IFDSC = r5[0].cve_banco
                                LV_TIPO_FECHA = r5[0].tipo_fecha
                                LV_CODIGO = r5[0].codigo
                            } else {
                                LV_IFDSC = null;
                                LV_TIPO_FECHA = 0;
                                LV_CODIGO = 0;
                                LV_TIPO_INCON = 6;
                                LV_DES_INCONS = 'No se localiz la Cuenta de Banco(SIRSAE).'
                            }
                        }

                        if ((LV_IFDSC || "NE") == "NE" && LV_CODIGO == 0) {
                            LV_TIPO_INCON = 7;
                            LV_DES_INCONS = 'No se localiz el Cdigo de Banco (SIRSAE).';
                        } else {
                            LV_DESCRIPCION = await this.bankDescription(LV_IFDSC, LV_CODIGO);
                            if (LV_DESCRIPCION == "NEVAL") {
                                LV_TIPO_INCON = 8;
                                LV_DES_INCONS = 'No se localiz la descripcin del Banco (SIRSAE).'
                            }
                        }

                        if (LV_TIPO_FECHA != 0 && element.fecha_mov) {
                            /**begin
                                LV_FECHA := FA_FECHA_BANCOS(dat.FECHA_MOV,LV_TIPO_FECHA);
                            exception when others then
                                LV_FECHA      := sysdate;
                                LV_TIPO_INCON := 9;
                                LV_DES_INCONS := 'No se localiz la fecha de deposito(SIRSAE).';
                            end; */
                        } else {
                            LV_TIPO_INCON = 9;
                            LV_DES_INCONS = 'No se localiz la fecha de deposito (SIRSAE).'
                        }
                        LV_VALMVTO = 0;

                        const mov: any[] = await this.entity.query(` select NO_MOVIMIENTO
                        from sera.COMER_PAGOREF
                        where REFERENCIAORI = '${element.referencia}'`)

                        mov.forEach(item => {
                            if (item.no_movimiento == element.nummov) {
                                LV_VALMVTO += 1
                            }
                        });
                        if (LV_VALMVTO == 0) {
                            LV_TIPO_INCON = 0;
                            LV_DES_INCONS = 'Pago no existente';
                        } else {
                            LV_TIPO_INCON = 1;
                            LV_DES_INCONS = 'Pago duplicado';
                        }
                    }

                }
            }

            var LV_ESTATUS = ""
            var LV_RESULTADO = ""
            if (LV_TIPO_INCON == 0) {
                if (element.tipo_pago_sat == 1) {
                    LV_ESTATUS = 'EFE';
                    LV_VAL_SISTEMA = 'R';
                    LV_RESULTADO = 'Deposito Rechazado por devolucin';
                } else {
                    LV_ESTATUS = 'PAG';
                    LV_VAL_SISTEMA = 'A';
                    LV_RESULTADO = 'Referencia Valida';
                }
                await this.entity.query(`update sera.COMER_REF_GARANTIAS
                    set INDICADOR = 1,
                        ESTATUS   = '${LV_ESTATUS}'
                where '${element.referencia}' LIKE '%'||REF_GSAE||REF_GBANCO||'%'`)
                await this.entity.query(` update sera.COMER_DET_LC
                set INDICADOR = 1,
                    ESTATUS   = '${LV_ESTATUS}'
                where '${element.referencia}' LIKE '%'||LC_SAE||LC_BANCO||'%';`)

                var r7: any[] = await this.entity.query(`select last_value+1 as id_last from sera.SEQ_COMER_PAGOR`)
                var LV_ID_PAGO = r7[0].id_last
                var LV_TIPO = ""
                if (LV_TIPO_REF == 1 || LV_TIPO_REF == 2 || LV_TIPO_REF == 3) {
                    LV_TIPO = 'L';
                } else {
                    LV_TIPO = "G"
                }

                var r8: any[] = await this.entity.query(`select last_value+1 as id_last from sera.SEQ_BITACORA`)
                var LV_REGISTRO = r8[0].id_last
                await this.entity.query(`insert into sera.COMER_PAGOREF(
                    ID_PAGO    ,REFERENCIA    ,REFERENCIAORI,NO_MOVIMIENTO ,FECHA         ,CVE_BANCO  ,
                    MONTO      ,DESCRIPCION   ,CODIGO       ,IDORDENINGRESO,CUENTA        ,ID_TIPO_SAT,
                    TIPO       ,VALIDO_SISTEMA,ID_LOTE      ,RESULTADO     ,FECHA_REGISTRO,SUCURSAL   ,
                    NO_REGISTRO
                    )
             values(
                    ${LV_ID_PAGO}    ,'${LV_REFERENCIA}' ,'${LV_REFERENCIA}'     ,'${element.nummov}'        ,'${LV_FECHA}'    ,${LV_IFDSC}      ,
                    '${element.importedep}','${LV_DESCRIPCION}',${LV_CODIGO}         ,'${element.IDORDENINGRESO}','${element.cbctabn}' ,${LV_ID_TIPO_SAT},
                    ${LV_TIPO}       ,'${LV_VAL_SISTEMA}',${LV_ID_LOTE}        ,'${LV_RESULTADO}'      ,CAST('${dateNow}' AS DATE),'${LV_SUCURSAL}'   ,
                    '${LV_REGISTRO}'        
                    )`)

            } else {
                if (LV_TIPO_INCON == 11 || LV_TIPO_INCON == 0) {
                    await this.entity.query(`insert into sera.COMER_PAGOS_INCONSISTENCIAS(
                        ID_PAGO    ,REFERENCIA,REFERENCIAORI ,NO_MOVTO  ,FECHA      ,CVE_BANCO    ,MONTO     ,
                        DESCRIPCION,CODIGO    ,IDORDENINGRESO,CUENTA    ,ID_TIPO_SAT,TIPO         ,ID_CLIENTE,
                        ID_EVENTO  ,ID_LOTE   ,LOTE_PUBLICO  ,ID_PROCESO,ID_INCONSIS,DESC_INCONSIS       
                        )
                 values(
                        ${LV_ID_PAGO}    ,'${element.referencia}','${element.referencia_ori}','${element.nummov}'    ,'${LV_FECHA}'      ,'${LV_IFDSC}'     ,'${element.importedep}',
                        '${LV_DESCRIPCION}','${LV_CODIGO}'     ,${element.idordeningreso},'${element.cbctabn}'  ,${LV_ID_TIPO_SAT},'${LV_TIPO}'      ,${LV_ID_CLIENTE} ,
                        ${LV_ID_EVENTO}  ,${LV_ID_LOTE}    ,'${LV_LOTE_PUBLICO}'   ,${element.id_proceso},'${LV_TIPO_INCON}' ,'${LV_DES_INCONS}'
                       );`)
                }
            }
        }
        await this.entity.query(`delete from sera.COMER_TMP_PAGOSXCONFIRM`)
        return { statusCode: 200, message: [message] }
    }

    async changePaymentProcess(currentSearch: number, newSearch: number) {
        var LV_DESC_BUSQUEDA = ""

        var P_EST_PROCESO = 1;
        var P_MSG_PROCESO = 'Proceso finalizado.';

        if ((newSearch || 0) == 0) {
            P_EST_PROCESO = 0;
            P_MSG_PROCESO = 'Proceso actual no puede ser el mismo';
        }
        if ((newSearch || 0) == currentSearch) {
            P_EST_PROCESO = 0;
            P_MSG_PROCESO = 'El cambio de proceso no puede ser al mismo';
        }

        if (P_EST_PROCESO == 1) {
            await this.entity.query(` delete from sera.BUSQUEDA_PAGOS_DET
            where ID_TBUSQUEDA = ${newSearch};`)
            await this.entity.query(` delete from sera.BUSQUEDA_PAGOS_MAE 
            where ID_TBUSQUEDA = ${newSearch};`)
            switch (newSearch) {
                case 0:
                    LV_DESC_BUSQUEDA = 'Pagos Realizados'
                    break;
                case 1:
                    LV_DESC_BUSQUEDA = 'Pagos en Duplicados'
                    break;
                case 2:
                    LV_DESC_BUSQUEDA = 'Pagos No Referenciados'
                    break;
                case 3:
                    LV_DESC_BUSQUEDA = 'Pagos en Efectivo'

                    break;
                case 4:
                    LV_DESC_BUSQUEDA = 'Pagos Iconsistentes'
                    break;

                default:
                    break;
            }

            await this.entity.query(`insert into sera.BUSQUEDA_PAGOS_MAE(ID_TBUSQUEDA,DES_TBUSQUEDA) values(${newSearch},'${LV_DESC_BUSQUEDA}')`)

            const C_DATAFEC: any[] = await this.entity.query(` select CODIGO       ,CUENTA     ,CVE_BANCO     ,DESC_INCONSIS  ,DESCRIPCION,FECHA     ,GEN_REFERENCIA,
                ID_CLIENTE   ,ID_EVENTO  ,ID_INCONSIS   ,ID_LOTE        ,ID_PAGO    ,ID_PROCESO,ID_SELEC      ,
                ID_TBUSQUEDA ,ID_TIPO_SAT,IDORDENINGRESO,LOTE_PUBLICO   ,MONTO      ,NO_MOVTO  ,REFERENCIA    ,
                REFERENCIAORI,RESULTADO  ,TIPO          ,TIPO_REFERENCIA,VALIDO_SISTEMA
                from sera.BUSQUEDA_PAGOS_DET
                where ID_TBUSQUEDA = ${currentSearch}
                and ID_SELEC     = 1`)
            C_DATAFEC.forEach(async dat => {
                await this.entity.query(` insert into sera.BUSQUEDA_PAGOS_DET (
                    CODIGO     ,CUENTA        ,CVE_BANCO      ,DESC_INCONSIS,DESCRIPCION,FECHA     ,GEN_REFERENCIA, 
                    ID_CLIENTE ,ID_EVENTO     ,ID_LOTE        ,ID_PAGO      ,ID_PROCESO ,ID_SELEC  ,ID_TBUSQUEDA  ,
                    ID_TIPO_SAT,IDORDENINGRESO,LOTE_PUBLICO   ,MONTO        ,NO_MOVTO   ,REFERENCIA,REFERENCIAORI ,
                    RESULTADO  ,TIPO          ,TIPO_REFERENCIA,VALIDO_SISTEMA
                    )
                values (
                    '${dat.codigo}'    ,'${dat.cuenta}'       , '${dat.cve_banco}'      ,'${dat.desc_inconsis}','${dat.descripcion}','${dat.fecha}'     ,'${dat.gen_referencia}',
                    ${dat.id_cliente} ,${dat.id_evento}     ,${dat.id_lote}        ,${dat.id_pago}      ,${dat.id_proceso} ,${dat.id_selec}  ,${newSearch}  ,
                    ${dat.id_tipo_sat},${dat.idordeningreso},'${dat.lote_publico}'   ,${dat.monto}        ,'${dat.no_movto}'  ,'${dat.referencia}','${dat.referenciaori}' ,
                    '${dat.resultado}' ,'${dat.tipo}'         ,'${dat.tipo_referencia}','${dat.valido_sistema}'
                        )`)
                await this.entity.query(`delete from  sera.BUSQUEDA_PAGOS_DET 
                where ID_TBUSQUEDA = ${dat.id_tbusqueda}
                  and ID_PROCESO   =${dat.id_proceso};`)
            });
            return {
                statusCode: 200, message: ["OK"], data: {
                    estProcess: P_EST_PROCESO,
                    msgProcess: P_MSG_PROCESO
                }
            }
        }
    }

    async searchPayment(params: SearchPayment) {

        let LV_QUERY = ""
        let LV_QUERY_INSE = ""
        let LV_QUERY_PREF = ""
        let LV_QUERY_INCO = ""
        let LV_QUERY_COUN = ""
        let LV_WHERE = ""
        let LV_WHERE_EVELOT = ""
        let LV_WHERE_BANCO = ""
        let LV_WHERE_MONTO = ""
        let LV_WHERE_REFE = ""
        let LV_WHERE_VSIS = ""
        let LV_WHERE_TBUSQ = ""
        let LV_TABLE = ""
        let LV_TIPO_PAGO = ""
        let LV_ID_INCONSIS = ""
        let LV_VALEVENTO = 0
        let LV_VALLOTE = 0
        let LV_VALBANCO = 0
        let LV_VALMAEBUS = 0
        let LV_TOTREGQRY = 0


        try {
            let P_MSG_PROCESO = 'Proceso finalizo satisfactoriamente ...'
            let P_EST_PROCESO = 1
            LV_WHERE = 'where 1=1';

            LV_QUERY_INSE = `insert into sera.BUSQUEDA_PAGOS_DET(
                ID_TBUSQUEDA,ID_PAGO,REFERENCIA,REFERENCIAORI,NO_MOVTO,FECHA,MONTO,
                CVE_BANCO,CODIGO,ID_LOTE,VALIDO_SISTEMA,CUENTA,ID_CLIENTE,DESCRIPCION,
                ID_TIPO_SAT,TIPO,RESULTADO,IDORDENINGRESO,ID_PROCESO,ID_INCONSIS,DESC_INCONSIS,
                ID_SELEC,ID_EVENTO,LOTE_PUBLICO
                ) `;
            LV_QUERY_PREF = `select ${params.typeSearch},ID_PAGO, REFERENCIA,REFERENCIA,NO_MOVIMIENTO,FECHA, MONTO,
                CVE_BANCO, CODIGO, ID_LOTE, VALIDO_SISTEMA,CUENTA,ID_CLIENTE,DESCRIPCION,
                ID_TIPO_SAT,TIPO,RESULTADO,IDORDENINGRESO,NULL,NULL,NULL,0,
                (select ID_EVENTO    from sera.COMER_LOTES where ID_LOTE = a.ID_LOTE) ID_EVENTO,
                (select LOTE_PUBLICO from sera.COMER_LOTES where ID_LOTE = a.ID_LOTE) LOTE_PUBLICO
        from sera.COMER_PAGOREF a `;

        LV_QUERY_INCO =`select ${params.typeSearch},ID_PAGO, REFERENCIA,COALESCE(referenciaori, '0') AS referenciaori,NO_MOVTO,FECHA, MONTO,
                        CVE_BANCO, CODIGO, ID_LOTE, NULL,CUENTA,ID_CLIENTE,DESCRIPCION,
                        ID_TIPO_SAT,TIPO,NULL,IDORDENINGRESO,NULL,NULL,NULL,0,
                        (select ID_EVENTO    from sera.COMER_LOTES where ID_LOTE = a.ID_LOTE) ID_EVENTO,
                        (select LOTE_PUBLICO from sera.COMER_LOTES where ID_LOTE = a.ID_LOTE) LOTE_PUBLICO
                        from sera.COMER_PAGOS_INCONSISTENCIAS a `

            LV_QUERY_COUN = 'select count(0) as count from ';
            if ((params.event || 11111111111) == 11111111111) {
                LV_VALEVENTO = 0;
            } else {
                var r = await this.entity.query(`select COUNT(0) as count
            from sera.COMER_EVENTOS
                where ID_EVENTO = ${params.event}`)
                LV_VALEVENTO = r[0].count
                if (LV_VALEVENTO == 0) {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'El id evento ' + params.event + ' , no es valido';
                }
            }

            if ((params.lot || 11111111111) == 11111111111) {
                if (LV_VALEVENTO != 0) {
                    LV_WHERE_EVELOT = ' and ID_LOTE in (select ID_LOTE from sera.COMER_LOTES where ID_EVENTO =' + params.event + ')';
                }
            } else {
                if (LV_VALEVENTO == 0) {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'Si registra un evento como parmetro, debe registrar un lote o a la inversa, para realizar la busqueda';
                    LV_WHERE_EVELOT = '';
                } else {
                    const r = await this.entity.query(` select COUNT(0)as count 
                    from sera.COMER_LOTES
                    where ID_EVENTO     = ${params.event}
                    and LOTE_PUBLICO  = ${params.lot}`)
                    LV_VALLOTE = r[0].count
                    if (LV_VALLOTE == 0) {
                        P_EST_PROCESO = 0;
                        P_MSG_PROCESO = 'El lote ' + params.lot + ' para el evento ' + params.event + ' , no es valido, verifique sus datos';
                    } else {
                        LV_WHERE_EVELOT = ' and ID_LOTE in (select ID_LOTE from sera.COMER_LOTES where LOTE_PUBLICO =' + params.lot + ' and ID_EVENTO =' + params.event + ')';
                    }
                }
            }

            if ((params.preference || 'NRF') == "NRF") {
                LV_WHERE_REFE = '';
            } else {
                LV_WHERE_REFE = `and referencia like '%${params.preference}%'`;
            }

            if ((params.sistemValue || "0") == "0") {
                LV_WHERE_VSIS = '';
            } else {
                if (params.sistemValue == "1") {
                    LV_WHERE_VSIS = ' and VALIDO_SISTEMA is null';
                } else {
                    LV_WHERE_VSIS = ` and VALIDO_SISTEMA ='B'`;
                }
            }

            if ((params.amount || 0) == 0) {

                LV_WHERE_MONTO = '';
            } else {
                if (params.amount < 0) {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'El monto no puedes ser menor de cero ...';
                } else {
                    LV_WHERE_MONTO = ' and MONTO=' + params.amount;
                }
            }

            if (params.typeSearch == 0) {

                LV_TIPO_PAGO = 'Pagos Realizados';
                if ((params.bankKey || 'NCB') == "NCB") {
                    LV_WHERE_BANCO = '';
                } else {
                    var r = await this.entity.query(`select count(0) as count
                    from sera.CAT_BANCOS
                    where CVE_BANCO = '${params.bankKey}'`)


                    LV_VALBANCO = r[0].count
                    if (LV_VALBANCO == 0) {
                        P_EST_PROCESO = 0;
                        P_MSG_PROCESO = 'La clave de Banco ' + params.bankKey + ' , no es valida';
                    } else {
                        LV_WHERE_BANCO = ` and CVE_BANCO = '${params.bankKey}'`;
                    }
                }
                LV_TABLE = ' sera.COMER_PAGOREF ';
                LV_QUERY_INSE = LV_QUERY_INSE + LV_QUERY_PREF;
                LV_WHERE_TBUSQ = LV_WHERE_EVELOT + LV_WHERE_BANCO + LV_WHERE_MONTO + LV_WHERE_REFE + LV_WHERE_VSIS;


            } else if (params.typeSearch == 1) {
                LV_ID_INCONSIS = '1';
                LV_TIPO_PAGO = 'Pagos en Duplicados';
                LV_TABLE = ' sera.COMER_PAGOS_INCONSISTENCIAS ';
                LV_QUERY_INSE = LV_QUERY_INSE + LV_QUERY_INCO;
                LV_WHERE_TBUSQ = ' and ID_INCONSIS = ' + LV_ID_INCONSIS + LV_WHERE_EVELOT + LV_WHERE_REFE + LV_WHERE_VSIS + LV_WHERE_MONTO;

            } else if (params.typeSearch == 2) {
                LV_ID_INCONSIS = '2';
                LV_TIPO_PAGO = 'Pagos No Referenciados';
                LV_QUERY_INSE = LV_QUERY_INSE + LV_QUERY_INCO;
                LV_TABLE = ' sera.COMER_PAGOS_INCONSISTENCIAS ';
                LV_WHERE_TBUSQ = ' and ID_INCONSIS = ' + LV_ID_INCONSIS + LV_WHERE_EVELOT + LV_WHERE_REFE + LV_WHERE_VSIS + LV_WHERE_MONTO;
            } else if (params.typeSearch == 3) {
                LV_TIPO_PAGO = 'Pagos en Efectivo';
                LV_QUERY_INSE = LV_QUERY_INSE + LV_QUERY_PREF;
                LV_TABLE = ' sera.COMER_PAGOREF ';
                LV_WHERE_TBUSQ = ` and REFERENCIA in (select REFERENCIA
                                                        from sera.V_COMER_PAGOS
                                                        where ESTATUS ='EFE')` ;
            } else if (params.typeSearch == 4) {
                LV_ID_INCONSIS = 'in (12,13,4,5,6,7,8,9)';
                LV_TIPO_PAGO = 'Pagos con informacin inconsistente';
                LV_TABLE = ' sera.COMER_PAGOS_INCONSISTENCIAS ';
                LV_QUERY_INSE = LV_QUERY_INSE + LV_QUERY_INCO;
                LV_WHERE_TBUSQ = ' and ID_INCONSIS ' + LV_ID_INCONSIS + LV_WHERE_EVELOT + LV_WHERE_REFE + LV_WHERE_VSIS + LV_WHERE_MONTO;
            }

            if (P_EST_PROCESO == 1) {
                LV_WHERE = LV_WHERE + LV_WHERE_TBUSQ;
                if (LV_WHERE == "where 1=1") {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'Por lo menos un parmetro se debe registrar para realizar la consulta...';
                } else {
                    LV_QUERY_COUN = LV_QUERY_COUN + LV_TABLE + LV_WHERE + ';';
                    var r3 = await this.entity.query(LV_QUERY_COUN)
                    LV_TOTREGQRY = r3[0].count
                    if (LV_TOTREGQRY == 0) {
                        P_EST_PROCESO = 0;
                        P_MSG_PROCESO = 'No se encontraron registros al realizar la consulta...';
                    } else {
                        LV_QUERY = LV_QUERY_INSE + LV_WHERE + ';';

                        await this.entity.query(`DELETE from sera.BUSQUEDA_PAGOS_DET where ID_TBUSQUEDA = ${params.typeSearch}`)
                        var r6 = await this.entity.query(` select count(0) as count 
                        from sera.BUSQUEDA_PAGOS_MAE
                        where ID_TBUSQUEDA = ${params.typeSearch}`)

                        LV_VALMAEBUS = r6[0].count
                        if (LV_VALMAEBUS == 0) {
                            await this.entity.query(`insert into sera.BUSQUEDA_PAGOS_MAE (ID_TBUSQUEDA, DES_TBUSQUEDA) values ('${params.typeSearch}','${LV_TIPO_PAGO}')`)
                        }
                        console.log(LV_QUERY);
                        await this.entity.query(LV_QUERY)
                    }
                }
            }

            return {
                statusCode: 200, message: ["ok"], data: {
                    statusProcess: 0,
                    messageProcess: 'No se encontraron registros al realizar la consulta...'
                }
            }
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: [error.message],
            };
        }

    }

    // procedure PA_PAGOS_VALIDA
    async validPayment(process: number) {
        try {
            var params: ValidPayment = {}
            var P_MSG_PROCESO: string
            var P_EST_PROCESO: number

            var LV_VAL_TSAT: number;
            var LV_VAL_VSIS: number;
            var LV_VAL_SIS_ORG: string;
            var LV_DESVALSIS: string
            var LV_VAL_CBAN: number;
            var LV_ID_LOTE: number;
            var LV_PRECIO_FINAL: number
            var LV_ID_CLIEPRO: number
            var LV_ID_ESTATUSVTA: string
            var LV_VAL_REFALT_GL: number;
            var LV_VALPAGOS: number;
            var LV_NUMPGOREF: number;
            var LV_NUMPGOSSAE: number;
            var LV_ID_CLIEORI: number;
            var LV_REGVIRTUAL: number;
            var LV_SUM_PAGOS: number;
            var C_DATEFEC: any[] = await this.entity.query(`select REFERENCIA,ID_TIPO_SAT,VALIDO_SISTEMA,CVE_BANCO     ,IDORDENINGRESO,ID_PAGO,
                        ID_EVENTO ,ID_LOTE    ,LOTE_PUBLICO  ,REFERENCIA_ALT,ID_PROCESO
                from sera.BUSQUEDA_PAGOS_DET
                where ID_PROCESO = ${process}`);
            for (const element of C_DATEFEC) {
                P_EST_PROCESO = 1;
                P_MSG_PROCESO = 'Proceso finalizado';

                if ((element.id_tipo_sat || 0) == 0) {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'La referencia no tiene un valor para el atributo Tipo SAT';
                } else {
                    const r1 = await this.entity.query(` select count(0) as count 
                    from sera.COMER_CATTIPOPAGO_SAT
                    where ID_TIPO_SAT = '${element.id_tipo_sat}'`)
                    LV_VAL_TSAT = r1[0].count
                    if (LV_VAL_TSAT == 0) {
                        P_EST_PROCESO = 0;
                        P_MSG_PROCESO = 'El atributo Tipo SAT mp es valido';
                    }
                }

                if ((element.valido_sistema || "XX") == "XX") {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'El atributo Valido para Sistema no puede ser nulo.';
                } else {
                    const r1: any[] = await this.entity.query(`select VALSIS_DESCRIPCION as val
                        from sera.COMER_VALIDO_SISTEMA
                        where VALSIS_CLAVE = '${element.valido_sistema}'`);
                    if (r1.length > 0) {
                        LV_DESVALSIS = r1[0].val;
                        LV_VAL_VSIS = 1;
                    } else {
                        LV_DESVALSIS = '';
                        LV_VAL_VSIS = 0;
                    }
                    if (LV_VAL_VSIS == 0) {
                        P_EST_PROCESO = 0;
                        P_MSG_PROCESO = 'El atributo Valido para Sistema no es correcto.';
                    } else {
                        const r2: any[] = await this.entity.query(` select coalesce(VALIDO_SISTEMA,'X') as val
                            from sera.COMER_PAGOREF
                            where REFERENCIA = '${element.referencia}'
                            limit 1`);
                        const LV_VAL_SIS_ORG = r2[0].val

                        if (['A', 'R', 'D', 'B'].includes(LV_VAL_SIS_ORG)) {
                            if (!['A', 'R', 'D', 'B'].includes(element.valido_sistema)) {
                                P_EST_PROCESO = 0;
                                P_MSG_PROCESO = 'El valor del atributo valido para sistema es ' + element.VALIDO_SISTEMA + ' , por lo tanto no se puede hacer el cambio';
                            }
                        } else {
                            P_EST_PROCESO = 0;
                            P_MSG_PROCESO = 'El atributo Valido para Sistema ' + LV_VAL_VSIS + ' - ' + LV_DESVALSIS + ' , no se puede cambiar';
                        }

                    }
                }

                if ((element.CVE_BANCO || 'SCVE') == "SCVE") {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'En algun registro no tiene un valor para el atributo Clave de Banco';
                } else {
                    var r1 = await this.entity.query(` select count(0) as count 
                    from sera.CAT_BANCOS
                where CVE_BANCO = '${element.cve_banco}'`)
                    LV_VAL_CBAN = r1[0].count || 0
                    if (LV_VAL_CBAN == 0) {
                        P_EST_PROCESO = 0;
                        P_MSG_PROCESO = 'La referencia tiene un valor no valido en el atributo Clave de Banco';
                    }
                }

                if ((element.idordeningreso || 0) != 0) {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'Ya exiten orden de ingreso con el numero ' || element.idordeningreso;
                }

                if ((element.id_evento || 11111111111) == 11111111111) {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'El Evento es un valor requerido';
                }
                if ((element.lote_publico || 11111111111) == 11111111111) {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'El lote es un valor requerido';
                }

                var r3: any[] = await this.entity.query(`select coalesce(ID_LOTE,11111111111) as lot,coalesce(PRECIO_FINAL,0) as pfinal,coalesce(ID_CLIENTE,0) as client,ID_ESTATUSVTA  as vta
                    from sera.COMER_LOTES
                    where ID_EVENTO    = ${element.id_evento}
                    and LOTE_PUBLICO = '${element.lote_publico}'`)
                if (r3.length > 0) {
                    LV_ID_LOTE = r3[0].lot;
                    LV_PRECIO_FINAL = r3[0].pfinal;
                    LV_ID_CLIEPRO = r3[0].client;
                    LV_ID_ESTATUSVTA = r3[0].vta;
                } else {
                    LV_ID_LOTE = 11111111111;
                    LV_PRECIO_FINAL = 0;
                    LV_ID_CLIEPRO = 0;
                    LV_ID_ESTATUSVTA = null;
                }

                if (LV_ID_LOTE == 11111111111) {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'El Lote ' + element.lote_publico + ' y Evento ' + element.id_evento + ' no son validos.';
                }
                if (LV_ID_CLIEPRO == 0) {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'No existe Cliente para el Evento ' + element.id_evento + ' y Lote ' + element.lote_publico;
                }
                if (LV_PRECIO_FINAL <= 0) {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'El Lote ' + element.lote_publico + ' y Evento ' + element.id_evento + ' sin precio de venta.';
                }
                params.lot = LV_ID_LOTE;
                var r2 = await this.entity.query(` select count(*) as count
                    from sera.V_COMER_PAGOS
                    where REFERENCIA = '${element.referencia}'`)
                LV_VALPAGOS = r2[0].count || 0
                if (LV_VALPAGOS == 0) {
                    params.client = LV_ID_CLIEPRO;
                    params.reference = (element.referencia_alt || element.referencia);

                    if ((element.referencia_alt || 0) != 0) {
                        var r7: any[] = await this.entity.query(`select count(0) as count
                            from (select REFERENCIAG 
                                from sera.COMER_LOTES
                            where LOTE_PUBLICO = '${element.lote_publico}'
                                and ID_EVENTO    = ${element.id_evento}
                            union
                            select REFERENCIAL
                                from sera.COMER_LOTES
                            where LOTE_PUBLICO = '${element.lote_publico}'
                                and ID_EVENTO    = ${element.id_evento})`)
                        LV_VAL_REFALT_GL = r7[0].count || 0
                        if (LV_VAL_REFALT_GL == 0) {
                            P_EST_PROCESO = 0;
                            P_MSG_PROCESO = 'La referencia asignada ' + element.referencia_alt + ' ya esta asiganda.';
                        }
                    }
                } else {
                    params.reference = element.referencia
                    var r8 = await this.entity.query(`  select count(0) as c1, count(IDORDENINGRESO) as c2
                    
                    from sera.COMER_PAGOREF CP
                where exists (select 1
                                from sera.COMER_PAGOREF_VIRT VI
                                where VI.ID_PAGO = CP.ID_PAGO
                                    and ID_LOTE    = ${LV_ID_LOTE})`)
                    LV_NUMPGOREF = r8[0].c1 || 0
                    LV_NUMPGOSSAE = r8[0].c2 || 0

                    var r9 = await this.entity.query(` select sum(IVA+MONTO_APP_IVA+MONTO_NOAPP_IVA) as sum 
                        from sera.COMER_PAGOSREFGENS
                        where ID_LOTE = ${LV_ID_LOTE}
                        and TIPO = 'N'`)
                    LV_SUM_PAGOS = r9[0].sum || 0

                    if ((LV_NUMPGOREF > 0 && LV_NUMPGOREF == LV_NUMPGOSSAE && LV_SUM_PAGOS == LV_PRECIO_FINAL) ||
                        ((LV_ID_ESTATUSVTA || 'VEN') == 'CAN' && LV_NUMPGOREF > 0 && LV_NUMPGOREF == LV_NUMPGOSSAE)) {
                        P_EST_PROCESO = 0;
                        P_MSG_PROCESO = 'Ya estan completas las ordenes de ingreso para esta Referencia.';
                    }
                    var r9 = await this.entity.query(` select coalesce(ID_CLIENTE,0) as client
                    from sera.V_COMER_PAGOS
                    where REFERENCIA ='${element.referencia}'
                    limit 1`)
                    LV_ID_CLIEORI = r9[0].client || 0

                    if (LV_ID_CLIEORI == 0) {
                        P_EST_PROCESO = 0;
                        P_MSG_PROCESO = 'No existe cliente para el Evento : ' + element.id_evento + ' y Lote ' + element.id_lote + ' verifique sus datos';
                    }
                    if (LV_ID_CLIEPRO == LV_ID_CLIEORI) {
                        params.client = LV_ID_CLIEPRO;
                    } else {
                        P_EST_PROCESO = 0;
                        P_MSG_PROCESO = 'El numero de cliente no es igual al hacer el cambio de Lote o Evento, cliente original :' + LV_ID_CLIEORI + ' cliente al cambiar :' + LV_ID_CLIEPRO;
                    }

                }

                if ((element.id_pago || 11111111111) == 11111111111) {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'No existe identificador de pagos (ID_PAGO) en el Evento : ' + element.id_evento + ' , lote : ' + LV_ID_LOTE + ' y Referencia : ' + element.referencia;
                } else {
                    var res = await this.entity.query(` select count(0)as count
                    from sera.COMER_PAGOREF_VIRT
                where ID_PAGO = ${element.id_pago}`)
                    LV_REGVIRTUAL = res[0].count || 0
                    if (LV_REGVIRTUAL > 1) {
                        P_EST_PROCESO = 0;
                        P_MSG_PROCESO = 'La referencia ' + element.referencia + ' ya esta desagregada, revisar su información (COMER_PAGOREF_VIRT)';
                    }
                }
            }

            return { messsage: P_MSG_PROCESO, status: P_EST_PROCESO, data: params }
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
            };
        }
    }


    async selectionPayment(selection: number, typeInconci: number) {
        var P_MSG_PROCESO: string
        var P_EST_PROCESO: number
        var LV_TOTREGIS: number

        var r = await this.entity.query(`select count(0)as count 
        from sera.BUSQUEDA_PAGOS_DET
        where ID_TBUSQUEDA   = ${typeInconci}`)
        LV_TOTREGIS = r[0].count || 0

        if (LV_TOTREGIS == 0) {
            P_EST_PROCESO = 0;
            P_MSG_PROCESO = 'No existe registros para cambiar la caja de selección';
        } else {
            P_MSG_PROCESO = 'Se procesaron ' + LV_TOTREGIS + ' registro(s).';
            await this.entity.query(` update sera.BUSQUEDA_PAGOS_DET
            set ID_SELEC = ${selection}
            where ID_TBUSQUEDA   = ${typeInconci}`)
        }

        return { statusCode: 200, message: [P_MSG_PROCESO], data: [] }
    }

    async masivePaymentVPS(typeInconci: number, systemValue: string) {
        try {
            var P_MSG_PROCESO: string
            var P_EST_PROCESO: number
            var LV_TOTREGIS: number;
            var LV_VAL_SISTEMA: string
            var LV_VAL_SELEC: number;

            if (typeInconci != 0) {
                P_EST_PROCESO = 0;
                P_MSG_PROCESO = 'El tipo de proceso no es "Pagos realizados"';
            } else {
                var r1 = await this.entity.query(`select count(0) as count 
                    from sera.BUSQUEDA_PAGOS_DET
                where ID_TBUSQUEDA   = ${typeInconci}
                and VALIDO_SISTEMA = '${systemValue}'`)
                LV_TOTREGIS = r1[0].count || 0
                if (LV_TOTREGIS == 0) {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'No existe registros con valido para sistema con valor ' + systemValue + ' para procesar ';
                } else {
                    P_MSG_PROCESO = 'Se procesaron ' + LV_TOTREGIS + ' registro(s).';
                    P_EST_PROCESO = 1;
                    LV_VAL_SISTEMA = 'A';
                    LV_VAL_SELEC = 1;
                    var C_DATEFEC: any[] = await this.entity.query(`select ID_PROCESO,CVE_BANCO,VALIDO_SISTEMA,ID_TIPO_SAT,FECHA,REFERENCIA_ALT,LOTE_PUBLICO,ID_PAGO
                    from sera.BUSQUEDA_PAGOS_DET
                    where ID_TBUSQUEDA   = ${typeInconci}
                    and VALIDO_SISTEMA = '${systemValue}'`)
                    C_DATEFEC.forEach(async element => {
                        await this.entity.query(` update  sera.BUSQUEDA_PAGOS_DET
                        set VALIDO_SISTEMA = '${LV_VAL_SISTEMA}',
                            ID_SELEC       = '${LV_VAL_SELEC}'
                            where ID_PROCESO = ${element.id_proceso}
                            and VALIDO_SISTEMA != 'A';
                        `)
                    });
                }
            }
            return { 
                statusCode: 200, 
                message: [P_MSG_PROCESO], 
                data: {
                    LV_VAL_SISTEMA,
                    P_MSG_PROCESO,
                    P_EST_PROCESO
                } 
            }
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
            };
        }
    }

    async filesPayment(typeInconci: number, typeAction: number) {
        const dateNow = LocalDate.getNow();
        var LV_TOTREGIS: number;
        var LV_TIPO_PAGO: string = '';
        var LV_PAGO: number
        var LV_MSJSALID: string;
        var LV_REGISTRO: number
        var LV_FREGISTRO = new Date(dateNow);
        var lv_RESULTADO = 'Referencia Valida';
        var P_MSG_PROCESO: string
        var P_EST_PROCESO: number

        P_EST_PROCESO = 1;

        try {
            if (typeInconci != 6) {
                P_MSG_PROCESO = 'Los Pagos deben ser cargados por arcivo CSV, para ser procesados';
                P_EST_PROCESO = 0;
            } else {
                var r1 = await this.entity.query(`select count(0) as count 
                    from sera.BUSQUEDA_PAGOS_DET
                 where ID_TBUSQUEDA   = ${typeInconci}
                 and ID_SELEC = 1`)
                LV_TOTREGIS = r1[0].count || 0
                if (LV_TOTREGIS == 0) {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'No existe registros para procesar ' + LV_TIPO_PAGO;
                } else {
                    P_MSG_PROCESO = 'Se procesaron ' + LV_TOTREGIS + ' registro(s).';
                    var C_DATEFEC: any[] = await this.entity.query(`select 
                        CODIGO,CUENTA,CVE_BANCO,DESC_INCONSIS,DESCRIPCION,FECHA,ID_CLIENTE,ID_EVENTO,ID_INCONSIS,ID_LOTE,
                        ID_PAGO,ID_PROCESO,ID_SELEC,ID_TBUSQUEDA,ID_TIPO_SAT,IDORDENINGRESO,LOTE_PUBLICO,MONTO,NO_MOVTO,
                        REFERENCIA,REFERENCIAORI,RESULTADO,TIPO,VALIDO_SISTEMA
                        from sera.BUSQUEDA_PAGOS_DET
                        where ID_TBUSQUEDA   = ${typeInconci}
                            and ID_SELEC = 1`)
                    for (const dat of C_DATEFEC) {
                        var r7: any[] = await this.entity.query(`select last_value+1 as id_last from sera.SEQ_COMER_PAGOR`)
                        LV_PAGO = r7[0].id_last
                        var r8: any[] = await this.entity.query(`select last_value+1 as id_last from sera.SEQ_BITACORA`)
                        LV_REGISTRO = r8[0].id_last
                        const result = await this.entity.query(`insert into sera.COMER_PAGOREF(
                                    ID_PAGO,REFERENCIA ,REFERENCIAORI ,NO_MOVIMIENTO ,FECHA    ,CVE_BANCO  ,
                                    MONTO  ,DESCRIPCION,CODIGO        ,IDORDENINGRESO,CUENTA   ,ID_TIPO_SAT,
                                    TIPO   ,RESULTADO  ,VALIDO_SISTEMA,FECHA_REGISTRO,ID_LOTE  ,NO_REGISTRO
                            )
                                values(
                                    ${LV_PAGO}  ,'${dat.referencia}' ,'${dat.referencia}'    ,'${dat.no_movto}'      ,'${dat.fecha}'  ,'${dat.cve_banco}'  ,
                                    '${dat.monto}','${dat.descripcion}','${dat.codigo}'        ,${dat.idordeningreso},'${dat.cuenta}' ,'${dat.id_tipo_sat}',
                                    '${dat.tipo}' ,'${lv_RESULTADO}'   ,'${dat.valido_sistema}','${LV_FREGISTRO}'      ,${dat.id_lote},'${LV_REGISTRO}'    
                            )`)
    
                        await this.entity.query(`delete from sera.BUSQUEDA_PAGOS_DET where ID_PROCESO = '${dat.id_proceso}'`)
    
                    };
                }
            }
            return {
                statusCode: HttpStatus.OK,
                message: [P_MSG_PROCESO],
                data: {
                    P_MSG_PROCESO,
                    P_EST_PROCESO
                }
            }
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
            };
        }
    }

    async changePayments(typeInconci: number, typeAction: number) {
        var LV_TOTREGIS: number
        var LV_INTERA: number
        var LV_TIPOPAGO: number
        var LV_ID_CLIENTE: number;
        var LV_REFERENCIA: string;
        var LV_ID_LOTE: number;
        var LV_MENSAJE: string;
        var LV_ESTATUS: number;
        var P_MSG_PROCESO: string
        var P_EST_PROCESO: number
        P_EST_PROCESO = 1;
        P_MSG_PROCESO = 'Proceso finalizo.';

        try {
            var r1 = await this.entity.query(`select count(0) as count 
                from sera.BUSQUEDA_PAGOS_DET
                where ID_TBUSQUEDA   = ${typeInconci}
                and ID_SELEC = 1`)
            LV_TOTREGIS = r1[0].count || 0
            if (LV_TOTREGIS == 0) {
                P_MSG_PROCESO = 'No existe registros para procesar para realizar cambios';
                P_EST_PROCESO = 0;
            } else {
                if (typeInconci == 0) {
                    LV_INTERA = 1;
                    var C_DATEFEC: any[] = await this.entity.query(`select ID_PROCESO,CVE_BANCO,VALIDO_SISTEMA,ID_TIPO_SAT,FECHA,REFERENCIA_ALT,LOTE_PUBLICO,ID_PAGO
                    from sera.BUSQUEDA_PAGOS_DET
                    where ID_TBUSQUEDA = 0
                    and ID_SELEC     = 1`)
                    for (const dat of C_DATEFEC) {
                        var valid = await this.validPayment(dat.id_proceso)
                        if (valid.status == 1) {
                            await this.entity.query(` update sera.COMER_PAGOREF
                        set CVE_BANCO      = '${dat.cve_banco}',
                            VALIDO_SISTEMA = '${dat.valido_sistema}',
                            FECHA          = '${dat.fecha}',
                            ID_TIPO_SAT    = '${dat.id_tipo_sat}',
                            ID_CLIENTE     = '${valid.data.client}',
                            REFERENCIA     = '${valid.data.reference}', 
                            ID_LOTE        = '${valid.data.lot}'
                        where ID_PAGO = '${dat.id_pago}'`)

                            await this.entity.query(`   UPDATE sera.COMER_REF_GARANTIAS
                        SET ID_LOTE = ${valid.data.lot}
                        WHERE REF_GSAE||REF_GBANCO = (SELECT REFERENCIA
                                                    FROM sera.COMER_PAGOREF
                                                    WHERE ID_PAGO = '${dat.id_pago}');`)
                            await this.entity.query(` delete from sera.BUSQUEDA_PAGOS_DET where ID_PROCESO = '${dat.id_proceso}'`)
                        } else {
                            await this.entity.query(` update sera.BUSQUEDA_PAGOS_DET
                        set ID_INCONSIS   = 19,
                            DESC_INCONSIS = '${valid.messsage}'
                        where ID_PROCESO = '${dat.id_proceso}'`)
                        }
                    }
                } else {
                    P_EST_PROCESO = 0;
                    P_MSG_PROCESO = 'No se elegio el proceso y la acción adecuada';
                }
            }
            return {
                statusCode: HttpStatus.OK,
                message: [P_MSG_PROCESO], 
                data: {
                    P_EST_PROCESO,
                    P_MSG_PROCESO
                }
            }
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
            };
        }
    }

    async paPaymentEfeDupNref(dto: PaPaymentEfeDupNrefDto) {
        let P_TIPO_INCONCI = dto.pTypeInconci;
        let P_TIPO_ACCION = dto.pTypeAction;

        let LV_TIPOOPERA: string = '';
        let LV_DESTIPPAG: string = '';
        let LV_ESTATUS = null; 
        let LV_TOTREGIS: number = null; 
        let LV_VALIDA: number = null;
        let LV_ID_CLIENTE = null; 
        let LV_REFERENCIA = null;
        let LV_ID_LOTE = null;
        let LV_MENSAJE: string = null; 
        let LV_MSJVALIDO: string = null; 
        let LV_NVA_REFER = null; 
        let LV_ID_PAGO = null;  
        let LV_REGISTRO = null; 
        let LV_FREGISTRO = null; 
        let lv_RESULTADO = 'Referencia Valida'; 
        let LV_DES_INCONS = null;
        let errors = [];

        try {
            const C_DATEFEC = await this.entity.query(`
                select ID_PROCESO,REFERENCIA ,MONTO ,ID_EVENTO, ID_TIPO_SAT,TIPO_REFERENCIA,NO_MOVTO ,FECHA,
                    CVE_BANCO ,DESCRIPCION,CODIGO,IDORDENINGRESO,CUENTA, TIPO, VALIDO_SISTEMA         
                from sera.BUSQUEDA_PAGOS_DET
                where ID_TBUSQUEDA = '${P_TIPO_INCONCI}'
                    and ID_SELEC     = 1
            `);
            let P_EST_PROCESO = 1;
            let P_MSG_PROCESO = 'Proceso finalizodo.';
            if(P_TIPO_INCONCI == 1) {
                LV_TIPOOPERA  = 'D';
                LV_DESTIPPAG  = 'Duplicados';
            } else if ([2,4].includes(P_TIPO_INCONCI)) {
                LV_TIPOOPERA  = 'S';
                LV_DESTIPPAG  = 'No referenciados';
            } else if(P_TIPO_INCONCI == 3) {
                LV_TIPOOPERA  = 'E';
                LV_ESTATUS    = 'CAE';
                LV_DESTIPPAG  = 'en Efectivo';
            } else if(P_TIPO_INCONCI == 4) {
                LV_TIPOOPERA  = 'S';
                LV_DESTIPPAG  = 'con Inconsistencia';
            }

            const queryLvTotreg = await this.entity.query(`
                select count(0) AS LV_TOTREGIS
                from sera.BUSQUEDA_PAGOS_DET
                where ID_TBUSQUEDA = '${P_TIPO_INCONCI}'
                    and ID_SELEC = 1
            `);
            const LV_TOTREGIS = queryLvTotreg[0]?.lv_totregis || 0;

            if(LV_TOTREGIS == 0) {
                P_EST_PROCESO = 0;
                P_MSG_PROCESO = 'No existen pagos '+LV_DESTIPPAG+' para procesar';
            } else {
                for(const dat of C_DATEFEC) {
                    LV_VALIDA = 1;
                    if(P_TIPO_INCONCI == 3 && P_TIPO_ACCION == 1) {
                        await this.entity.query(`
                            update sera.COMER_REF_GARANTIAS
                            set ESTATUS = '${LV_ESTATUS}'
                            where REF_GSAE||REF_GBANCO = '${dat.referencia}'
                        `)

                        await this.entity.query(`
                            update sera.COMER_DET_LC
                            set ESTATUS = '${LV_ESTATUS}'
                            where LC_SAE||LC_BANCO = '${dat.referencia}'
                        `)

                        await this.entity.query(`
                            delete sera.BUSQUEDA_PAGOS_DET 
                            where ID_PROCESO = '${dat.id_proceso}'
                        `);
                    } else {
                        if(dat.monto <= 0) {
                            LV_VALIDA  = 0;
                            LV_MENSAJE = 'El monto no puede ser menor o igual a cero.';
                        } else {
                            const validPaymentExe = await this.validPayment(dat.id_proceso);
                            if(validPaymentExe.statusCode && validPaymentExe.statusCode == HttpStatus.INTERNAL_SERVER_ERROR) {
                                errors.push({
                                    validPayment : dat.id_proceso,
                                    message: validPaymentExe.message
                                })
                            } else {
                                LV_ID_CLIENTE = validPaymentExe.data.client;
                                LV_REFERENCIA = validPaymentExe.data.reference;
                                LV_ID_LOTE = validPaymentExe.data.lot;
                                LV_MENSAJE = validPaymentExe.message;
                                LV_VALIDA = validPaymentExe.status;
                            }
                        }
                    }

                    if(LV_VALIDA == 1) {

                        const pAdmPaysEfeDuplicated = await this.pAdmPayEfeDuplicated({
                            pLcOriginal: LV_REFERENCIA,
                            pOperationType: LV_TIPOOPERA,
                            pLotId: LV_ID_LOTE,
                            pCustomerId: LV_ID_CLIENTE,
                            pEventId: dat.id_evento,
                            pLcAmount: dat.monto,
                            pPaymentType: dat.id_tipo_sat,
                            pLcType: dat.tipo_referencia
                        });

                        if(LV_MSJVALIDO = 'OK') {
                            const queryLvIdPago = await this.entity.query(`
                                SELECT NEXTVAL('sera.SEQ_COMER_PAGOR') AS LV_ID_PAGO
                            `);
                            let LV_ID_PAGO = queryLvIdPago[0].lv_id_pago;

                            const queryLvRegistro = await this.entity.query(`
                                SELECT NEXTVAL('sera.SEQ_BITACORA') AS LV_REGISTRO
                            `);
                            let LV_REGISTRO = queryLvRegistro[0].lv_registro;

                            try {
                                await this.entity.query(`
                                    insert into sera.COMER_PAGOREF(
                                        ID_PAGO,REFERENCIA ,REFERENCIAORI ,NO_MOVIMIENTO ,FECHA      ,CVE_BANCO  ,
                                        MONTO  ,DESCRIPCION,CODIGO        ,IDORDENINGRESO,CUENTA     ,ID_TIPO_SAT,
                                        TIPO   ,RESULTADO  ,VALIDO_SISTEMA,FECHA_REGISTRO,NO_REGISTRO,ID_LOTE
                                    )
                                    values(
                                        ${LV_ID_PAGO}, ${LV_NVA_REFER ? `'${LV_NVA_REFER}'`: null}, ${dat.referencia ? `'${dat.referencia}'`: null}, ${dat.no_movto}, 
                                            CAST('${dat.fecha}' AS DATE), '${dat.cve_banco ? `'${dat.cve_banco}'`: null}',
                                        ${dat.monto}, ${dat.descripcion ? `'${dat.descripcion}'` : null}, ${dat.codigo}, ${dat.idordeningreso}, 
                                            ${dat.cuenta ? `'${dat.cuenta}'`: null}, ${dat.id_tipo_sat},
                                        ${dat.tipo ? `'${dat.tipo}'` : null}, ${lv_RESULTADO ? `'${lv_RESULTADO}'` : null}, 
                                            ${dat.valido_sistema ? `'${dat.valido_sistema}'` : null}, CAST('${LV_FREGISTRO}' AS DATE), ${LV_REGISTRO}, ${LV_ID_LOTE}
                                    )
                                `)

                                await this.entity.query(`
                                    delete sera.BUSQUEDA_PAGOS_DET where ID_PROCESO = '${dat.id_proceso}'
                                `) 

                                await this.entity.query(`
                                    delete sera.COMER_PAGOS_INCONSISTENCIAS where ID_PROCESO = '${dat.id_proceso}'
                                `)
                            } catch (error) {
                                LV_DES_INCONS = error.message;
                                await this.entity.query(`
                                    update sera.BUSQUEDA_PAGOS_DET
                                    set ID_INCONSIS = 19,
                                        DESC_INCONSIS = '${LV_DES_INCONS}'
                                    where ID_PROCESO = '${dat.id_proceso}'
                                `)
                            }

                        } else {
                            await this.entity.query(`
                                update sera.BUSQUEDA_PAGOS_DET
                                set ID_INCONSIS = 19,
                                    DESC_INCONSIS = '${LV_MSJVALIDO}'
                                where ID_PROCESO = '${dat.id_proceso}'
                            `)
                        }
                    } else {
                        await this.entity.query(`
                            update sera.BUSQUEDA_PAGOS_DET
                            set ID_INCONSIS   = 19,
                                DESC_INCONSIS = '${LV_MENSAJE}'
                            where ID_PROCESO = '${dat.id_proceso}'
                        `)
                    }
                }
            }

            return {
                statusCode: HttpStatus.OK,
                message: 'Proceso ejecutado correctamente.',
                data: {
                    P_EST_PROCESO,
                    P_MSG_PROCESO,
                    LV_ID_CLIENTE,
                    LV_REFERENCIA,
                    LV_ID_LOTE,
                    LV_MENSAJE,
                    LV_VALIDA,
                    errors
                }
            }
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
            };
        }
    }

    async pAdmPayEfeDuplicated({
        pLcOriginal,
        pOperationType,
        pLotId,
        pCustomerId,
        pEventId,
        pLcAmount,
        pPaymentType,
        pLcType
    }: pAdmPayEfeDuplicatedDto) {

    let pResult: string;
    let pReference: string;
    let n_TPEVENTO: number;
    let n_ID_CLIENTE_GAN: number;
    let n_DIRECCION: string;
    let f_FEC_CIERRE: Date;
    let f_FEC_FALLO: Date;
    let f_FEC_NOTIFICACION: Date;
    let V_DES_LC_TIPO: string;
    let V_FECHA_HOY: any;
    let V_TIPO_REF: number = 0;
    let V_MONTO_FALTANTE: number;
    let V_MONTO_FINAL: number;
    let V_MONTO_PAG_GAR: number;
    let V_MONTO_PAG_LIQ: number;
    let V_MONTO_GARANTIA: number;
    let V_MONTO_LIQUIDACION: number;
    let V_MONTO_NEW_LC: number;
    let n_GARANC: number = 0;
    let n_LIQ: number = 0;
    let e_EXCEPPROC
    let c_RESUL: string;
    let V_ULT_REF: number;
    let V_2: string;
    let V_FEC_FALLO: Date = null;
    let V_NUM_REF_GAR: number;
    let V_NUM_PAGADAS: number;
    let V_ID_REF_GAR: number;
    let V_ID_REF_GAR_GEN: number;
    let V_IMONTO_GAR_GEN: number;
    let V_ID_CLT_REF_GR: number;
    let V_ID_CLT_REF_LC: number;
    let V_ID_CLT_REF: number;
    let V_MONTO_LC_ORI: number;
    let v_fec_max_gar_ser: Date; 
    let v_fec_max_gar_cum: Date;
    let v_fec_max_gar_cum_ext: Date;
    let v_fec_max_liq: Date;
    let v_fec_max_liq_ext: Date; 
    let v_PorcentajeGarantia: number;
    let V_ID_DET_LC_7: number;
    let V_ID_DET_LC_2: number;
    let V_ID_DET_LC_4: number;
    let V_ID_DET_LC_3: number;
    let V_ID_DET_LC_S: number;
    let V_TOTAL_LCS: number;
    let V_MONTO_PENA_LC_7: number;
    let V_MONTO_PENA_LC_4: number;
    let V_MONTO_LC_7: number;
    let V_MONTO_LC_4: number;
    let V_ID_LC: number;
    let V_FECHA_VIG_PENA_LC_7: Date;
    let V_FECHA_VIG_PENA_LC_4: Date;
    let V_DIF_MONTO_PENA: number;
    let V_MONTO_TOTAL_LOTE: number;
    let V_MONTO_GARANTIA_LOTE: number;
    let V_MONTO_LIQUIDACION_LOTE: number;
    let V_MONTOS_LCS_GENYPAG: number;
    let V_MONTOS_LCS_GENYPAG_AUX: number;
    let ID_LC_BUSCADA: number;
    let DE: number;
    let V_MONTO_NUEVA_LC: number;
    let V_MONTO_AUX: number;
    let V_MONTO_AUX2: number;
    let V_MONTO_LC_ADMIN: number;
    let V_FECHA_VIG_ADMIN: Date;
    let V_MONTO_PENA_LC_ADMIN: number;
    let V_ID_EVENTO: number; 
    let V_ID_LOTE: number;
    let V_CLIENTE: number;
    let V_ID_LIN_MOD: number;
    let V_MON: number;
    let V_YA_OPERO: number;
    
    try{

        V_FECHA_HOY = moment.utc(new Date()).tz('America/Mexico_City').format('DD-MM-YYYY')

        V_YA_OPERO = 0;

        const q1 = await this.entity.query(`SELECT ID_CLIENTE, MONTO
            FROM SERA.COMER_REF_GARANTIAS
            WHERE REF_GSAE || REF_GBANCO = '${pLcOriginal}';`)
       
            if (q1.length !== 0) {

                V_ID_REF_GAR = q1[0].id_cliente
                V_MONTO_LC_ORI = q1[0].monto

            } else {


                V_ID_REF_GAR = null

            }

        if (!V_ID_REF_GAR) {

            const q2 = await this.entity.query(`SELECT ID_CLIENTE
                FROM SERA.COMER_LC
                WHERE ID_LC = (SELECT ID_LC
                                FROM SERA.COMER_DET_LC
                                WHERE LC_SAE || LC_BANCO = '${pLcOriginal}');`)

            V_ID_CLT_REF_LC = q2[0].id_cliente

            V_ID_CLT_REF = V_ID_CLT_REF_LC;

            const q3 = await this.entity.query(`SELECT MONTO
                FROM SERA.COMER_DET_LC
                WHERE LC_SAE || LC_BANCO = '${pLcOriginal}'`)

            V_MONTO_LC_ORI = q3[0].monto

            V_ID_CLT_REF = V_ID_CLT_REF_LC;

        } else {

            V_ID_CLT_REF = V_ID_REF_GAR
            
        }

        if (V_ID_CLT_REF) {

            if (V_ID_CLT_REF == pCustomerId) {

                if (pOperationType == 'D') {

                    const q4 = await this.entity.query(`SELECT FEC_FALLO 
                        FROM SERA.COMER_EVENTOS 
                        WHERE ID_EVENTO = ${pEventId};`)

                    V_FEC_FALLO = q4[0].fec_fallo

                    if (!V_FEC_FALLO) {

                        const q5 = await this.entity.query(`SELECT COUNT (ID_LCG)
                            FROM SERA.COMER_REF_GARANTIAS
                            WHERE ID_EVENTO = ${pEventId}
                            AND ID_LOTE = ${pLotId}
                            AND ID_CLIENTE = ${pCustomerId};`)

                        V_NUM_REF_GAR = q5[0].count

                        if (!V_NUM_REF_GAR || V_NUM_REF_GAR == 0) {

                            c_RESUL = 'No se permite crear garantia de seriedad, ya que el cliente no no esta participando en el evento ' + pEventId +'.'

                        } else {

                            const q6 = await this.entity.query(`SELECT COUNT (ID_LCG)
                                FROM SERA.COMER_REF_GARANTIAS
                                WHERE ID_EVENTO = ${pEventId}
                                AND ID_LOTE = ${pLotId}
                                AND ID_CLIENTE = ${pCustomerId}
                                AND ESTATUS IN ('PAG,VAL')`)

                            V_NUM_PAGADAS = q6[0].count

                            if (V_NUM_PAGADAS == 0 || !V_NUM_PAGADAS) {

                                const q7 = await this.entity.query(`SELECT ID_LCG, MONTO
                                    FROM SERA.COMER_REF_GARANTIAS
                                    WHERE ID_EVENTO = ${pEventId}
                                    AND ID_LOTE = ${pLotId}
                                    AND ID_CLIENTE = ${pCustomerId}
                                    AND ESTATUS IN ('GEN'); `)

                                V_ID_REF_GAR_GEN = q7[0].id_lcg
                                V_IMONTO_GAR_GEN = q7[0].monto

                                if (V_MONTO_LC_ORI < V_IMONTO_GAR_GEN) {

                                    c_RESUL = 'No se permite crear garantia de seriedad, ya que el monto de la lc es menor al de la garantia asignada ' + pEventId +'.'

                                } else if (V_MONTO_LC_ORI == V_IMONTO_GAR_GEN) {

                                    await this.entity.query(`UPDATE SERA.COMER_REF_GARANTIAS 
                                        SET ESTATUS = 'PAG' 
                                        WHERE ID_LCG = ${V_ID_REF_GAR_GEN};
                                    `)

                                    const q01 = await this.entity.query(`SELECT REF_GSAE || REF_GBANCO AS P_REFERENCIA_OUT
                                        FROM SERA.COMER_REF_GARANTIAS
                                        WHERE ID_LCG = ${V_ID_REF_GAR_GEN};
                                    `)

                                    pReference = q01[0].p_referencia_out

                                    pResult = 'OK'

                                } else if (V_MONTO_LC_ORI > V_IMONTO_GAR_GEN) {

                                    const spGen01 = await this.captureline.send({ cmd: 'spGenRg' }, 
                                        {
                                            P_ID_LOTE: pLotId, 
                                            P_ID_CLIENTE: pCustomerId, 
                                            P_PARAMETRO: 'GSE',
                                            P_MONTO: pLcAmount,
                                            P_IND_MOV: 'C',
                                            P_FECVIGENCIA: V_FECHA_HOY,
                                            P_NO_CHEQUE: null,
                                            P_EXC_CHEQUE: null,
                                            P_NO_PLAETA: null
                                        });

                                    const q02 = await this.entity.query(`SELECT REF_GSAE || REF_GBANCO AS P_REFERENCIA_OUT
                                        FROM SERA.COMER_REF_GARANTIAS
                                        WHERE ID_LCG =
                                            (SELECT MAX (ID_LCG)
                                                FROM SERA.COMER_REF_GARANTIAS
                                                WHERE MONTO = ${pLcAmount}
                                                AND ID_CLIENTE = ${pCustomerId}
                                                AND ID_LOTE = ${pLotId}
                                                AND ID_EVENTO = ${pEventId})
                                    `)

                                    pReference = q02[0].p_referencia_out

                                    await this.entity.query(`UPDATE sera.COMER_REF_GARANTIAS
                                        SET ESTATUS = 'PAG'
                                        WHERE REF_GSAE || REF_GBANCO = '${pReference}'
                                    `)

                                    c_RESUL = 'No se permite crear garantia de seriedad, ya que el cliente ya pago su garantia de seriedad del evento ' + pEventId +'.'
                                }

                            }

                        }

                    } else {

                        const q3 = await this.entity.query(`SELECT 
                                                            CL.ID_CLIENTE,
                                                            CE.ID_TPEVENTO,
                                                            CE.DIRECCION,
                                                            CE.FECHA_CIERRE_EVENTO,
                                                            CE.FEC_FALLO,
                                                            CE.FECHA_NOTIFICACION,
                                                            COALESCE (CL.GARANTIA_ASIG, 0) AS GARANTIA,
                                                            COALESCE (CL.MONTO_LIQ, 0) AS MONTO
                                                            FROM SERA.COMER_EVENTOS CE, SERA.COMER_LOTES CL
                                                            WHERE CE.ID_EVENTO = ${pEventId}
                                                            AND CL.ID_LOTE = ${pLotId};`)

                        n_ID_CLIENTE_GAN = q3[0].id_cliente
                        n_TPEVENTO = q3[0].id_tpevento
                        n_DIRECCION = q3[0].direccion
                        f_FEC_CIERRE = q3[0].fecha_cierre_evento
                        f_FEC_FALLO = q3[0].fec_fallo
                        f_FEC_NOTIFICACION = q3[0].fecha_notificacion
                        n_GARANC = q3[0].garantia
                        n_LIQ = q3[0].monto

                        const getData = await lastValueFrom(this.captureline.send({ cmd: 'spObtainDateEvent' }, {
                            pTpEvent: n_TPEVENTO,
                            pDirection: n_DIRECCION,
                            pEventId: pEventId
                        }));

                        v_fec_max_gar_ser = getData.data.V_FEC_MAX_GAR_SER
                        v_fec_max_gar_cum = getData.data.V_FEC_MAX_GAR_CUM
                        v_fec_max_gar_cum_ext = getData.data.V_FEC_MAX_GAR_CUM_EXT
                        v_fec_max_liq = getData.data.V_FEC_MAX_LIQ
                        v_fec_max_gar_cum_ext = getData.data.V_FEC_MAX_GAR_CUM_EXT
                        v_fec_max_liq_ext = getData.data.V_FEC_MAX_LIQ_EXT
                        v_PorcentajeGarantia = getData.data.v_PorcentajeGarantia

                        if (n_ID_CLIENTE_GAN !== pCustomerId) {

                            c_RESUL = 'El cliente: ' + pCustomerId + ' es diferente al ganador del lote: ' + pLotId + ' cliente ganador: ' + n_ID_CLIENTE_GAN +'.'

                        } else {

                            if ((n_DIRECCION == 'M' || n_DIRECCION == 'I') && n_TPEVENTO == 4) {

                                const q4 = await this.entity.query(`SELECT PRECIO_FINAL
                                    FROM SERA.COMER_LOTES
                                    WHERE ID_LOTE = ${pLotId}
                                    AND ID_CLIENTE = ${pCustomerId}
                                    AND ID_EVENTO = ${pEventId};
                                `)

                                V_MONTO_TOTAL_LOTE = q4[0].precio_final

                                if (V_MONTO_TOTAL_LOTE == null) {

                                    c_RESUL = 'No se puede obtener el monto final del lote : ' + pLotId + ', cliente : '+ pCustomerId + ', evento : ' + n_ID_CLIENTE_GAN +'.'

                                }

                                if (V_MONTO_TOTAL_LOTE == 0) {

                                    V_MONTO_TOTAL_LOTE = 0

                                } else {

                                    const q4 = await this.entity.query(`SELECT SUM (MONTO)
                                        FROM SERA.COMER_REF_GARANTIAS
                                        WHERE ID_CLIENTE = ${pCustomerId}
                                        AND ID_LOTE = ${pLotId}
                                        AND ID_EVENTO = ${pEventId}
                                        AND ESTATUS IN ('VAL', 'PAG');
                                    `)

                                    V_MONTO_PAG_GAR = q4[0].sum

                                    V_MONTO_GARANTIA_LOTE = (V_MONTO_TOTAL_LOTE *  v_PorcentajeGarantia) - V_MONTO_PAG_GAR;
                                    V_MONTO_LIQUIDACION_LOTE = (V_MONTO_TOTAL_LOTE *  v_PorcentajeGarantia);
                                }

                            } else {

                                const q5 = await this.entity.query(`SELECT SUM (MONTO)
                                        FROM SERA.COMER_REF_GARANTIAS
                                        WHERE ID_CLIENTE = ${pCustomerId}
                                        AND ID_LOTE = ${pLotId}
                                        AND ID_EVENTO = ${pEventId}
                                        AND ESTATUS IN ('VAL', 'PAG');
                                    `)

                                    V_MONTO_PAG_GAR = q5[0].sum

                                const q6 = await this.entity.query(`SELECT SUM (MONTO)
                                    FROM SERA.COMER_DET_LC
                                    WHERE ID_LC = ${V_ID_LC} 
                                    AND ESTATUS IN ('VAL', 'PAG');
                                `)

                                V_MONTO_PAG_LIQ = q6[0].sum

                                const q7 = await this.entity.query(`SELECT COALESCE(${V_MONTO_PAG_GAR},0) + COALESCE(${n_GARANC},0) + COALESCE(${n_LIQ},0) AS V_MONTO_TOTAL_LOTE`)

                                V_MONTO_TOTAL_LOTE = q7[0].v_monto_total_lote

                                const q8 = await this.entity.query(`SELECT COALESCE(${n_GARANC},0) AS n_GARANC`)

                                V_MONTO_GARANTIA_LOTE = q8[0].n_garanc

                                const q9 = await this.entity.query(`SELECT COALESCE(${n_LIQ},0) AS n_LIQ`)

                                V_MONTO_LIQUIDACION_LOTE = q9[0].n_liq

                            }

                        }
                    }

                const q10 = await this.entity.query(`SELECT COUNT(ID_DET_LC)
                    FROM SERA.COMER_DET_LC
                    WHERE  ID_LC =
                            (SELECT ID_LC
                            FROM SERA.COMER_LC
                            WHERE ID_LOTE = ${pLotId}
                            AND ID_CLIENTE = ${pCustomerId}
                            AND ID_EVENTO = ${pEventId});
                `)

                V_TOTAL_LCS = q10[0].count

                if (V_TOTAL_LCS !== 0) {

                    const q11 = await this.entity.query(`SELECT ID_DET_LC 
                        FROM SERA.COMER_DET_LC
                        WHERE ESTATUS = 'GEN' 
                        AND TIPO_REF = 7
                        AND ID_LC =
                                (SELECT ID_LC
                                FROM SERA.COMER_LC
                                WHERE ID_LOTE = ${pLotId}
                                AND ID_CLIENTE = ${pCustomerId}
                                AND ID_EVENTO = ${pEventId});
                    `)

                    if (q11.length !== 0 ) {
                        V_ID_DET_LC_7 = q11[0].id_det_lc
                    } else {
                        V_ID_DET_LC_7 = 0
                    }

                    if (V_ID_DET_LC_7 == 0) {

                        const q12 = await this.entity.query(`SELECT ID_DET_LC 
                            FROM SERA.COMER_DET_LC
                            WHERE ESTATUS = 'GEN' 
                            AND TIPO_REF = 2
                            AND ID_LC =
                                    (SELECT ID_LC
                                        FROM SERA.COMER_LC
                                        WHERE ID_LOTE = ${pLotId}
                                            AND ID_CLIENTE = ${pCustomerId}
                                            AND ID_EVENTO = ${pEventId});
                        `)

                        if (q12.length !== 0 ) {
                            V_ID_DET_LC_2 = q12[0].id_det_lc
                        } else {
                            V_ID_DET_LC_2 = 0
                        }

                        if (V_ID_DET_LC_2 == 0) {

                            const q13 = await this.entity.query(`SELECT ID_DET_LC
                                FROM SERA.COMER_DET_LC
                                WHERE ESTATUS = 'GEN' 
                                AND TIPO_REF = 4
                                AND ID_LC =
                                        (SELECT ID_LC
                                        FROM SERA.COMER_LC
                                        WHERE ID_LOTE = ${pLotId}
                                        AND ID_CLIENTE = ${pCustomerId}
                                        AND ID_EVENTO = ${pEventId});
                            `)

                            if (q13.length !== 0 ) {
                                V_ID_DET_LC_4 = q13[0].id_det_lc
                            } else {
                                V_ID_DET_LC_4 = 0
                            }

                            if (V_ID_DET_LC_4 == 0) {

                                const q14 = await this.entity.query(`SELECT ID_DET_LC
                                    FROM SERA.COMER_DET_LC
                                    WHERE ESTATUS = 'GEN' 
                                    AND TIPO_REF = 3
                                    AND ID_LC =
                                            (SELECT ID_LC
                                            FROM SERA.COMER_LC
                                            WHERE ID_LOTE = ${pLotId}
                                            AND ID_CLIENTE = ${pCustomerId}
                                            AND ID_EVENTO = ${pEventId});
                                `)

                                if (q14.length !== 0 ) {
                                    V_ID_DET_LC_3 = q14[0].id_det_lc
                                } else {
                                    V_ID_DET_LC_3 = 0
                                }

                                if (V_ID_DET_LC_3 == 0) {

                                    c_RESUL = 'VER POR QUE NO TIENE UNA 3'

                                } else {

                                    const q15 = await this.entity.query(`SELECT 
                                            MONTO, 
                                            MONTO_PENA,
                                            FEC_VIGENCIA, 
                                            ID_LC, 
                                            LC_SAE || LC_BANCO AS P_REFERENCIA_OUT
                                        FROM SERA.COMER_DET_LC 
                                        WHERE ID_DET_LC = '${V_ID_DET_LC_3}';
                                    `)

                                    V_MONTO_LC_ADMIN = q15[0].monto
                                    V_MONTO_PENA_LC_ADMIN = q15[0].monto_pena
                                    V_FECHA_VIG_ADMIN = q15[0].fec_vigencia
                                    V_ID_LC = q15[0].id_lc
                                    pReference = q15[0].p_referencia_out

                                    if (V_MONTO_LC_ADMIN == pLcAmount) {

                                        await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                            SET ESTATUS = 'PAG' 
                                            WHERE ID_DET_LC = '${V_ID_DET_LC_3}';
                                        `)

                                        const q16 = await this.entity.query(`SELECT LC_SAE || LC_BANCO AS P_REFERENCIA_OUT
                                            FROM SERA.COMER_DET_LC
                                            WHERE ID_DET_LC = '${V_ID_DET_LC_3}'; 
                                        `)

                                        pReference = q16[0].p_referencia_out
                                        pResult = 'OK'

                                    } else if (V_MONTO_LC_ADMIN > pLcAmount) {

                                        await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                            SET ESTATUS = 'CAN' 
                                            WHERE ESTATUS = 'GEN' 
                                            AND TIPO_REF = 3
                                            AND ID_DET_LC = ${V_ID_LC};
                                        `)

                                        const spGen02 = await this.captureline.send({ cmd: 'spGenLc' }, // SE HACE LA NUEVA REFERENCIA CON SOLO UNA PARTE DE LA PENA QUE FALTA POR PAGAR
                                        {
                                            P_ID_LOTE: pLotId, 
                                            P_ID_CLIENTE: pCustomerId, 
                                            P_PARAMETRO: 'LIQN',
                                            P_MONTO_LC: pLcAmount,
                                            P_IND_MOV: 'C',
                                            P_FECVIGENCIA: V_FECHA_HOY
                                        });                                        

                                        const q17 = await this.entity.query(`SELECT LC_SAE || LC_BANCO AS P_REFERENCIA_OUT
                                        FROM SERA.COMER_DET_LC
                                        WHERE ESTATUS = 'GEN' 
                                        AND TIPO_REF = 3
                                        AND ID_LC = (SELECT ID_LC
                                                    FROM COMER_LC
                                                    WHERE ID_LOTE = ${pLotId}
                                                    AND ID_CLIENTE = ${pCustomerId}
                                                    AND ID_EVENTO = ${pEventId}); 
                                        `)

                                        pReference = q17[0].p_referencia_out

                                        await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                            SET ESTATUS = 'PAG' 
                                            WHERE LC_SAE || LC_BANCO = '${pReference}';
                                        `)

                                        const spGen03 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                        {
                                            P_ID_LOTE: pLotId, 
                                            P_ID_CLIENTE: pCustomerId, 
                                            P_PARAMETRO: 'LIQN',
                                            P_MONTO_LC: V_MONTO_LC_ADMIN - pLcAmount,
                                            P_IND_MOV: 'C',
                                            P_FECVIGENCIA: moment.utc(V_FECHA_VIG_ADMIN).tz('America/Mexico_City').format('DD-MM-YYYY')
                                        });

                                        pResult = 'OK'

                                    } else if (V_MONTO_LC_ADMIN < pLcAmount) {

                                        await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                            SET ESTATUS ='CAN' 
                                            WHERE ESTATUS = 'GEN'  
                                            AND ID_LC = '${V_ID_LC}';
                                        `)

                                        // SE HACE LA NUEVA REFERENCIA CON SOLO UNA PARTE DE LA PENA QUE FALTA POR PAGAR
                                        const spGen04 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                        {
                                            P_ID_LOTE: pLotId, 
                                            P_ID_CLIENTE: pCustomerId, 
                                            P_PARAMETRO: 'LIQN',
                                            P_MONTO_LC: pLcAmount,
                                            P_IND_MOV: 'C',
                                            P_FECVIGENCIA: moment.utc(V_FECHA_VIG_ADMIN).tz('America/Mexico_City').format('DD-MM-YYYY')
                                        });                                        

                                        const q18 = await this.entity.query(`SELECT LC_SAE || LC_BANCO
                                            FROM sera.COMER_DET_LC
                                            WHERE ESTATUS = 'GEN' 
                                            AND TIPO_REF = 3
                                            AND ID_LC = (SELECT ID_LC
                                                        FROM SERA.COMER_LC
                                                        WHERE ID_LOTE = ${pLotId}
                                                        AND ID_CLIENTE = ${pCustomerId}
                                                        AND ID_EVENTO = ${pEventId}); 
                                        `)

                                        pReference = q18[0].p_referencia_out

                                        await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                            SET ESTATUS = 'PAG' 
                                            WHERE LC_SAE || LC_BANCO = '${pReference}';   
                                        `)

                                        pResult = 'OK'

                                    }

                                }

                            } else {

                                const q19 = await this.entity.query(`SELECT MONTO, 
                                        MONTO_PENA,
                                        FEC_VIGENCIA, 
                                        ID_LC 
                                    FROM SERA.COMER_DET_LC 
                                    WHERE ID_DET_LC = ${V_ID_DET_LC_4};
                                `)

                                V_MONTO_LC_4 = q19[0].monto
                                V_MONTO_PENA_LC_4 = q19[0].monto_pena
                                V_FECHA_VIG_PENA_LC_4 = q19[0].fec_vigencia
                                V_ID_LC = q19[0].id_lc

                                if (V_MONTO_PENA_LC_4 > pLcAmount) {

                                    await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                        SET ESTATUS ='CAN' 
                                        WHERE ESTATUS = 'GEN' 
                                        AND TIPO_REF = 4 
                                        AND ID_LC = ${V_ID_LC};   
                                    `)

                                    // SE COBRA UNA PARTE DE LA PENA
                                    const spGen05 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                        {
                                            P_ID_LOTE: pLotId, 
                                            P_ID_CLIENTE: pCustomerId, 
                                            P_PARAMETRO: 'GCE',
                                            P_MONTO_LC: 1,
                                            P_IND_MOV: 'C',
                                            P_FECVIGENCIA: moment.utc(V_FECHA_VIG_PENA_LC_4).tz('America/Mexico_City').format('DD-MM-YYYY')
                                        });

                                    const q20 = await this.entity.query(`SELECT LC_SAE || LC_BANCO AS P_REFERENCIA_OUT
                                        FROM SERA.COMER_DET_LC
                                        WHERE ESTATUS = 'GEN' 
                                        AND MONTO = 1
                                        AND ID_LC = (SELECT ID_LC
                                                    FROM SERA.COMER_LC
                                                    WHERE ID_LOTE = ${pLotId}
                                                    AND ID_CLIENTE = ${pCustomerId}
                                                    AND ID_EVENTO = ${pEventId});
                                    `)

                                    pReference = q20[0].p_referencia_out

                                    await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                        SET ESTATUS = 'PAG', 
                                            MONTO = 0, 
                                            MONTO_PENA = ${pLcAmount} 
                                        WHERE LC_SAE || LC_BANCO = '${pReference}';   
                                    `)

                                    // SE HACE LA NUEVA REFERENCIA CON SOLO UNA PARTE DE LA PENA QUE FALTA POR PAGAR
                                    const spGen06 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                        {
                                            P_ID_LOTE: pLotId, 
                                            P_ID_CLIENTE: pCustomerId, 
                                            P_PARAMETRO: 'GCE',
                                            P_MONTO_LC: V_MONTO_LC_4,
                                            P_IND_MOV: 'C',
                                            P_FECVIGENCIA: moment.utc(V_FECHA_VIG_PENA_LC_4).tz('America/Mexico_City').format('DD-MM-YYYY')
                                        });

                                    const q21 = await this.entity.query(`SELECT LC_SAE || LC_BANCO AS P_REFERENCIA_OUT
                                        FROM SERA.COMER_DET_LC
                                        WHERE ESTATUS = 'GEN'
                                        AND ID_LC = (SELECT MAX (ID_LC)
                                                        FROM SERA.COMER_LC
                                                        WHERE ID_LOTE = ${pLotId}
                                                        AND ID_CLIENTE = ${pCustomerId}
                                                        AND ID_EVENTO = ${pEventId});
                                    `)

                                    pReference = q21[0].p_referencia_out

                                    await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                        SET MONTO_PENA = (MONTO_PENA  - ${pLcAmount}) 
                                        WHERE LC_SAE || LC_BANCO = '${pReference}';   
                                    `)

                                } else {

                                    V_MON = (V_MONTO_PENA_LC_4 + V_MONTO_LC_4)

                                    if (pLcAmount <  V_MON) {

                                        V_YA_OPERO = 1;

                                        await this.entity.query(`UPDATE sera.COMER_DET_LC
                                            SET ESTATUS = 'PAG'
                                            WHERE ID_DET_LC = '${V_ID_DET_LC_4}';   
                                        `)

                                        V_MONTO_NUEVA_LC =  V_MON - pLcAmount;

                                        const spGen07 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                        {
                                            P_ID_LOTE: pLotId, 
                                            P_ID_CLIENTE: pCustomerId, 
                                            P_PARAMETRO: 'GCE',
                                            P_MONTO_LC: V_MONTO_NUEVA_LC,
                                            P_IND_MOV: 'C',
                                            P_FECVIGENCIA: moment.utc(V_FECHA_VIG_PENA_LC_4).tz('America/Mexico_City').format('DD-MM-YYYY')
                                        });

                                        const q22 = await this.entity.query(`SELECT LC_SAE || LC_BANCO AS P_REFERENCIA_OUT
                                            FROM SERA.COMER_DET_LC
                                            WHERE ESTATUS = 'GEN'
                                            AND ID_LC = (SELECT MAX (ID_LC)
                                                        FROM SERA.COMER_LC
                                                        WHERE ID_LOTE = ${pLotId}
                                                        AND ID_CLIENTE = ${pCustomerId}
                                                        AND ID_EVENTO = ${pEventId});
                                        `)

                                        pReference = q22[0].p_referencia_out

                                        await this.entity.query(`UPDATE SERA.COMER_DET_LC
                                            SET MONTO_PENA = 0
                                            WHERE LC_SAE || LC_BANCO = '${pReference}';   
                                        `)

                                    }

                                    if (V_MONTO_PENA_LC_4 > pLcAmount) {

                                        if (V_YA_OPERO == 0) {

                                            V_YA_OPERO = 1;

                                            await this.entity.query(`UPDATE SERA.COMER_DET_LC
                                                SET ESTATUS = 'CAS'
                                                WHERE ID_DET_LC = ${V_ID_DET_LC_4};  
                                            `)

                                            const spGen08 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'GCE',
                                                P_MONTO_LC: V_MONTO_NUEVA_LC,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: moment.utc(V_FECHA_VIG_PENA_LC_4).tz('America/Mexico_City').format('DD-MM-YYYY')
                                            });

                                            const q23 = await this.entity.query(`SELECT MAX (ID_DET_LC)
                                                FROM sera.COMER_DET_LC
                                                WHERE  ID_LC = (SELECT MAX (ID_LC)
                                                                FROM SERA.COMER_LC
                                                                WHERE ID_LOTE = ${pLotId}
                                                                AND ID_CLIENTE = ${pCustomerId}
                                                                AND ID_EVENTO = ${pEventId}) 
                                                AND ESTATUS = 'GEN';
                                            `)

                                            V_ID_LIN_MOD = q23[0].max

                                            await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                                SET ESTATUS = 'PAG', 
                                                    MONTO_PENA = ( ${V_MONTO_PENA_LC_4} - ${pLcAmount}), 
                                                    MONTO = 0 
                                                WHERE ID_DET_LC = ${V_ID_LIN_MOD};  
                                            `)

                                            const spGen09 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'GCE',
                                                P_MONTO_LC: V_MONTO_LC_4,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: moment.utc(V_FECHA_VIG_PENA_LC_4).tz('America/Mexico_City').format('DD-MM-YYYY')
                                            });

                                            const q24 = await this.entity.query(`SELECT MAX(ID_DET_LC),
                                                    LC_SAE || LC_BANCO AS P_REFERENCIA_OUT 
                                                FROM SERA.COMER_DET_LC
                                                WHERE  ID_LC = (SELECT MAX (ID_LC)
                                                                FROM SERA.COMER_LC
                                                                WHERE ID_LOTE = ${pLotId}
                                                                AND ID_CLIENTE = ${pCustomerId}
                                                                AND ID_EVENTO = ${pEventId}) 
                                                AND ESTATUS = 'GEN';
                                            `)

                                            V_ID_LIN_MOD = q24[0].max
                                            pReference = q24[0].p_referencia_out

                                            await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                                SET  MONTO_PENA = (${V_MONTO_PENA_LC_4} - ${pLcAmount}), 
                                                    MONTO = ${V_MONTO_LC_4} 
                                                WHERE ID_DET_LC = '${V_ID_LIN_MOD}';                              
                                            `)
                                        }

                                    } else {

                                        V_YA_OPERO = 1;

                                    }

                                }

                            }

                        } else {
                            // ('SI TIENE UNA 2 VER QUE SE HARA');
                            const q25 = await this.entity.query(`SELECT MONTO, 
                                    MONTO_PENA,
                                    FEC_VIGENCIA, 
                                    ID_LC, 
                                    LC_SAE || LC_BANCO AS P_REFERENCIA_OUT
                                FROM SERA.COMER_DET_LC 
                                WHERE ID_DET_LC = '${V_ID_DET_LC_2}';

                            `)

                            V_MONTO_LC_ADMIN = q25[0].monto
                            V_MONTO_PENA_LC_ADMIN = q25[0].monto_pena
                            V_FECHA_VIG_ADMIN = q25[0].fec_vigencia
                            V_ID_LC = q25[0].id_lc
                            pReference = q25[0].p_referencia_out

                            if (V_MONTO_LC_ADMIN == pLcAmount) { // LOS MONTOS SON IGUALES SOLO SE REMPLAZA

                                await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                    SET ESTATUS = 'PAG' 
                                    WHERE ID_DET_LC = ${V_ID_DET_LC_2};                            
                                `)

                                const q26 = await this.entity.query(`SELECT LC_SAE || LC_BANCO AS P_REFERENCIA_OUT
                                    FROM SERA.COMER_DET_LC
                                    WHERE ID_DET_LC = '${V_ID_DET_LC_2}'; 
                                `)

                                pReference = q26[0].p_referencia_out
                                pResult = 'OK'

                            } else if (V_MONTO_LC_ADMIN > pLcAmount) { // LA LC NUEVA ES MENOR SOLO SE CREA NUEVA Y LA DIFERENCIA

                                await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                    SET ESTATUS ='CAN' 
                                    WHERE ESTATUS = 'GEN' 
                                    AND TIPO_REF = 2 
                                    AND ID_LC = '${V_ID_LC}';                           
                                `)

                                const spGen10 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'GCN',
                                                P_MONTO_LC: pLcAmount,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: moment.utc(V_FECHA_VIG_ADMIN).tz('America/Mexico_City').format('DD-MM-YYYY')
                                            });

                                const q27 = await this.entity.query(`SELECT LC_SAE || LC_BANCO AS P_REFERENCIA_OUT
                                    FROM SERA.COMER_DET_LC
                                    WHERE ESTATUS = 'GEN' 
                                    AND TIPO_REF = 2
                                    AND ID_LC = (SELECT ID_LC
                                                FROM SERA.COMER_LC
                                                WHERE ID_LOTE = ${pLotId}
                                                AND ID_CLIENTE = ${pCustomerId}
                                                AND ID_EVENTO = ${pEventId}); 
                                `)

                                pReference = q27[0].p_referencia_out

                                await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                    SET ESTATUS = 'PAG' 
                                    WHERE LC_SAE || LC_BANCO = '${pReference}';                           
                                `)

                                const spGen11 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'GCN',
                                                P_MONTO_LC: V_MONTO_LC_ADMIN - pLcAmount,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: moment.utc(V_FECHA_VIG_ADMIN).tz('America/Mexico_City').format('DD-MM-YYYY')
                                            });

                                pResult = 'OK'

                            } else if (V_MONTO_LC_ADMIN < pLcAmount) { // SE CREA UNA DE TIPO 2 Y LA DIFERENCIA DE LA 3 

                                await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                    SET ESTATUS ='CAN' 
                                    WHERE ESTATUS = 'GEN'  
                                    AND ID_LC = '${V_ID_LC}';                          
                                `)

                                // SE HACE LA NUEVA REFERENCIA CON SOLO UNA PARTE DE LA PENA QUE FALTA POR PAGAR
                                const spGen12 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'GCN',
                                                P_MONTO_LC: pLcAmount,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: moment.utc(V_FECHA_VIG_ADMIN).tz('America/Mexico_City').format('DD-MM-YYYY')
                                            });

                                const q28 = await this.entity.query(`SELECT LC_SAE || LC_BANCO AS P_REFERENCIA_OUT
                                    FROM SERA.COMER_DET_LC
                                    WHERE ESTATUS = 'GEN' 
                                    AND TIPO_REF = 2
                                    AND ID_LC = (SELECT ID_LC
                                                    FROM sera.COMER_LC
                                                    WHERE ID_LOTE = ${pLotId}
                                                    AND ID_CLIENTE = ${pCustomerId}
                                                    AND ID_EVENTO = ${pEventId});
                                `)

                                pReference = q28[0].p_referencia_out

                                await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                    SET ESTATUS = 'PAG' 
                                    WHERE LC_SAE || LC_BANCO = '${pReference}';                         
                                `)

                                V_MONTO_NUEVA_LC = V_MONTO_TOTAL_LOTE - (V_MONTO_PAG_LIQ + V_MONTO_PAG_GAR);

                                if (v_fec_max_liq > V_FECHA_HOY) { // SE GENERA 4

                                    const spGen13 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'LIQE',
                                                P_MONTO_LC: V_MONTO_NUEVA_LC,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: null
                                            });
                                    pResult = 'OK';

                                } else { // SE GENERA 3

                                    const spGen14 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'LIQN',
                                                P_MONTO_LC: V_MONTO_NUEVA_LC,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: null
                                            });
                                    pResult = 'OK';

                                }

                            }

                        }

                    } else { // ('SI TIENE UNA 7 VER QUE SE HARA');

                        const q29 = await this.entity.query(`SELECT 
                            MONTO, 
                            MONTO_PENA,
                            FEC_VIGENCIA, 
                            ID_LC
                        FROM SERA.COMER_DET_LC 
                        WHERE ID_DET_LC = '${V_ID_DET_LC_7}';
                        `)

                        V_MONTO_LC_7 = q29[0].monto
                        V_MONTO_PENA_LC_7 = q29[0].monto_pena
                        V_FECHA_VIG_PENA_LC_7 = q29[0].fec_vigencia
                        V_ID_LC = q29[0].id_lc

                        // SE CREA UNA CON EL MONTO DE LA PENA
                        if (V_MONTO_PENA_LC_7 > pLcAmount) { // LA PENA ES MAYOR AL MONTO

                            await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                SET ESTATUS ='CAN' 
                                WHERE ESTATUS = 'GEN' 
                                AND TIPO_REF = 7 
                                AND ID_LC = '${V_ID_LC}';                         
                            `)

                            // SOLO SE CREA UNA DESCONTADO UNA PARTE DE LA PENA
                            
                            // SE COBRA UNA PARTE DE LA PENA
                            const spGen15 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'GCE',
                                                P_MONTO_LC: 0,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: moment.utc(V_FECHA_VIG_PENA_LC_7).tz('America/Mexico_City').format('DD-MM-YYYY')
                                            });

                            const q30 = await this.entity.query(`SELECT LC_SAE || LC_BANCO AS P_REFERENCIA_OUT
                                FROM SERA.COMER_DET_LC
                                WHERE ESTATUS = 'GEN' AND TIPO_REF = 7
                                AND ID_LC = (SELECT ID_LC
                                            FROM SERA.COMER_LC
                                            WHERE ID_LOTE = ${pLotId}
                                            AND ID_CLIENTE = ${pCustomerId}
                                            AND ID_EVENTO = ${pEventId});
                            `)

                            pReference = q30[0].p_referencia_out

                            await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                SET ESTATUS = 'PAG', 
                                MONTO_PENA = ${pLcAmount} 
                                WHERE LC_SAE || LC_BANCO = '${pReference}';                         
                            `)

                            // SE HACE LA NUEVA REFERENCIA CON SOLO UNA PARTE DE LA PENA QUE FALTA POR PAGAR
                            const spGen16 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'GCE',
                                                P_MONTO_LC: V_MONTO_LC_7,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: moment.utc(V_FECHA_VIG_PENA_LC_7).tz('America/Mexico_City').format('DD-MM-YYYY')
                                            });

                            const q31 = await this.entity.query(`SELECT LC_SAE || LC_BANCO AS P_REFERENCIA_OUT
                                FROM SERA.COMER_DET_LC
                                WHERE ESTATUS = 'GEN' AND TIPO_REF = 7
                                AND  ID_LC = (SELECT ID_LC
                                                FROM SERA.COMER_LC
                                                WHERE ID_LOTE = ${pLotId}
                                                AND ID_CLIENTE = ${pCustomerId}
                                                AND ID_EVENTO = ${pEventId});
                            `)

                            pReference = q31[0].p_referencia_out

                            await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                SET MONTO_PENA = (MONTO_PENA  - ${pLcAmount}) 
                                WHERE LC_SAE || LC_BANCO = '${pReference}';                         
                            `)

                        } else { // SE COBRA LA PENA Y SE LE COBRA EL RESTO

                            V_MONTO_NUEVA_LC = pLcAmount - V_MONTO_PENA_LC_7;

                            // SE CREA NUEVA LC
                            const spGen17 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'GCE',
                                                P_MONTO_LC: V_MONTO_NUEVA_LC,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: moment.utc(V_FECHA_VIG_PENA_LC_7).tz('America/Mexico_City').format('DD-MM-YYYY')
                                            });

                            const q32 = await this.entity.query(`SELECT LC_SAE || LC_BANCO AS P_REFERENCIA_OUT
                                FROM SERA.COMER_DET_LC
                                WHERE ESTATUS = 'GEN' 
                                AND TIPO_REF = 7
                                AND ID_LC= (SELECT MAX(ID_LC)
                                            FROM SERA.COMER_LC
                                            WHERE ID_LOTE = ${pLotId}
                                            AND ID_CLIENTE = ${pCustomerId}
                                            AND ID_EVENTO = ${pEventId});
                            `) // BUSCAMOS LA CREADA

                            pReference = q32[0].p_referencia_out

                            await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                SET ESTATUS = 'PAG', 
                                MONTO_PENA = ${V_MONTO_NUEVA_LC} 
                                WHERE LC_SAE || LC_BANCO = '${pReference}';                         
                            `)

                            if (pLcAmount > (V_MONTO_LC_7 + V_MONTO_PENA_LC_7)) {

                                // ('CREAR UNA 3 O 4 SEGUN SEA EL CASO ')
                                await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                    SET ESTATUS ='CAN' 
                                    WHERE ESTATUS = 'GEN'  
                                    AND ID_LC = '${V_ID_LC}';                         
                                `)

                                V_MONTO_NUEVA_LC = V_MONTO_TOTAL_LOTE - (V_MONTO_PAG_LIQ + V_MONTO_PAG_GAR);

                                if (v_fec_max_liq > V_FECHA_HOY) { // SE GENERA 4

                                    const spGen18 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'LIQE',
                                                P_MONTO_LC: V_MONTO_NUEVA_LC,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: null
                                            });

                                            pResult = 'OK'

                                } else {

                                    const spGen19 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'LIQN',
                                                P_MONTO_LC: V_MONTO_NUEVA_LC,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: null
                                            });

                                    pResult = 'OK'

                                }

                            } else {

                                // LA LINEA ORIGINAL ES MENOR A LO QUE SE DEBE
                                await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                                    SET ESTATUS ='CAN' 
                                    WHERE ESTATUS = 'GEN' 
                                    AND TIPO_REF = 7  
                                    AND ID_LC = ${V_ID_LC};                         
                                `)

                                V_MONTO_AUX = pLcAmount - (V_MONTO_LC_7 + V_MONTO_PENA_LC_7);

                                // SE CREA NUEVA LC
                                const spGen20 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'GCN',
                                                P_MONTO_LC: V_MONTO_AUX,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: moment.utc(V_FECHA_VIG_PENA_LC_7).tz('America/Mexico_City').format('DD-MM-YYYY')
                                            });
                                pResult = 'OK'

                            }

                        }

                    }

                } else { // ('NO TIENE NINGUNA LINEA CREADA SE CREAN LCS')

                    // PRIMERO SE CREA UNA 2 PAGADA 

                    // SE HACE LA NUEVA REFERENCIA CON SOLO UNA PARTE DE LA PENA QUE FALTA POR PAGAR
                    const spGen21 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'GCN',
                                                P_MONTO_LC: pLcAmount,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: null
                                            });
                    
                    const q33 = await this.entity.query(`SELECT LC_SAE || LC_BANCO AS P_REFERENCIA_OUT
                        FROM SERA.COMER_DET_LC
                        WHERE ESTATUS = 'GEN' 
                        AND TIPO_REF = 2
                        AND ID_LC = (SELECT ID_LC
                                    FROM SERA.COMER_LC
                                    WHERE ID_LOTE = ${pLotId}
                                    AND ID_CLIENTE = ${pCustomerId}
                                    AND ID_EVENTO = ${pEventId});
                    `)

                    pReference = q33[0].p_referencia_out

                    // ('Se actualiza a PAG ' || P_REFERENCIA_OUT)
                    await this.entity.query(`UPDATE SERA.COMER_DET_LC 
                        SET ESTATUS = 'PAG' 
                        WHERE LC_SAE || LC_BANCO = '${pReference}';                         
                    `)

                    // OBTENEMOS LOS MONTOS PAGADOS DE LAS GARANTIAS
                    const q34 = await this.entity.query(`SELECT SUM (MONTO)
                        FROM SERA.COMER_REF_GARANTIAS
                        WHERE ID_CLIENTE = ${pCustomerId}
                        AND ID_LOTE = ${pLotId}
                        AND ID_EVENTO = ${pEventId}
                        AND ESTATUS IN ('VAL', 'PAG');
                    `)

                    V_MONTO_PAG_GAR = q34[0].sum

                    // OBTENEMOS LOS MONTOS PAGADOS DE LAS LC
                    const q35 = await this.entity.query(`SELECT SUM (MONTO)
                        FROM SERA.COMER_DET_LC
                        WHERE ID_LC = (SELECT ID_LC 
                                        FROM SERA.COMER_LC 
                                        WHERE ID_LOTE = ${pLotId} 
                                        AND ID_CLIENTE = ${pCustomerId} 
                                        AND ID_EVENTO =  ${pEventId}) 
                        AND ESTATUS IN ('VAL', 'PAG');
                    `)

                    V_MONTO_PAG_LIQ = q35[0].sum

                    // ASIGNAMOS LOS VALORES A LA GARANTIA Y LIQUIDACION
                    V_MONTO_GARANTIA_LOTE = (V_MONTO_TOTAL_LOTE *  v_PorcentajeGarantia);
                    V_MONTO_LIQUIDACION_LOTE = (V_MONTO_TOTAL_LOTE *  v_PorcentajeGarantia);

                    V_MONTO_NUEVA_LC  = 0;
                    V_MONTO_AUX = V_MONTO_PAG_GAR + V_MONTO_PAG_LIQ; // MONTO PAGADO

                    if (V_MONTO_AUX < V_MONTO_GARANTIA_LOTE) { // ES MENOR Y SE GENERA LA GARANTIA

                        V_MONTO_NUEVA_LC = V_MONTO_GARANTIA_LOTE - V_MONTO_AUX;
                        const spGen22 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'GCN',
                                                P_MONTO_LC: V_MONTO_NUEVA_LC,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: null
                                            });

                    }

                    // REVISAR SI LE HACE FALTA MONTO DE LIQUIDACION Y SI ES ASI SE GENERA REFERENCIA
                    if (V_MONTO_AUX < V_MONTO_TOTAL_LOTE) {  // ES MENOR Y SE GENERA LA GARANTIA

                        V_MONTO_NUEVA_LC  = V_MONTO_TOTAL_LOTE - V_MONTO_AUX;

                        const q36 = await this.entity.query(`SELECT SUM (MONTO)
                            FROM SERA.COMER_DET_LC
                            WHERE ID_LC = (SELECT ID_LC
                                            FROM SERA.COMER_LC
                                            WHERE ID_LOTE = ${pLotId}
                                            AND ID_CLIENTE = ${pCustomerId}
                                            AND ID_EVENTO = ${pEventId})
                            AND ESTATUS IN ('GEN');
                        `)

                        V_MONTO_AUX2 = q36[0].sum
                        V_MONTO_NUEVA_LC =  V_MONTO_NUEVA_LC -  V_MONTO_AUX2; 

                        if (V_MONTO_NUEVA_LC > 0) {

                            const spGen23 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: 'LIQN',
                                                P_MONTO_LC: V_MONTO_NUEVA_LC,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: null
                                            });

                        }

                    }

                    pResult = 'OK';
                }

            } else if (pOperationType == 'E') {

                const q37 = await this.entity.query(`SELECT TIPO_REF 
                    FROM SERA.COMER_DET_LC 
                    WHERE LC_SAE || LC_BANCO = '${pLcOriginal}';
                `)

                V_TIPO_REF = q37[0].tipo_ref

                if (!V_TIPO_REF) {

                    c_RESUL = 'Ingresar una referencia valida.'

                }

                if (V_TIPO_REF == 2) {

                    V_DES_LC_TIPO = 'GCN';

                }

                if (V_TIPO_REF == 7) {

                    V_DES_LC_TIPO = 'GCE';

                }

                if (V_TIPO_REF == 3) {

                    V_DES_LC_TIPO = 'LIQN';

                }

                if (V_TIPO_REF == 4) {

                    V_DES_LC_TIPO = 'LIQE';

                }

                const q38 = await this.entity.query(`SELECT 
                    MONTO, 
                    ID_LC,
                    FEC_VIGENCIA
                    FROM SERA.COMER_DET_LC
                    WHERE LC_SAE || LC_BANCO = '${pLcOriginal}';
                `)

                V_MONTO_LC_ADMIN = q38[0].monto
                V_ID_LC = q38[0].id_lc
                V_FECHA_VIG_ADMIN = q38[0].fec_vigencia

                const q39 = await this.entity.query(`SELECT 
                    ID_EVENTO, 
                    ID_LOTE, 
                    ID_CLIENTE
                    FROM SERA.COMER_LC
                    WHERE ID_LC = '${V_ID_LC}';
                `)

                V_ID_EVENTO = q39[0].id_evento
                V_ID_LOTE = q39[0].id_lote
                V_CLIENTE = q39[0].id_cliente

                const spGen24 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: V_DES_LC_TIPO,
                                                P_MONTO_LC: V_MONTO_LC_ADMIN,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: moment.utc(V_FECHA_VIG_ADMIN).tz('America/Mexico_City').format('DD-MM-YYYY')
                                            });
                pResult = 'OK'

            } else if (pOperationType == 'S') {

                if (pLcType == 2) {

                    V_DES_LC_TIPO = 'GCN'

                }

                if (pLcType == 7) {

                    V_DES_LC_TIPO = 'GCE'

                }

                if (pLcType == 3) {

                    V_DES_LC_TIPO = 'LIQN'

                }

                if (pLcType == 4) {

                    V_DES_LC_TIPO = 'LIQE'

                }

                if (pLcType == 1) {

                    const spGen25 = await this.captureline.send({ cmd: 'spGenRg' }, 
                                        {
                                            P_ID_LOTE: pLotId, 
                                            P_ID_CLIENTE: pCustomerId, 
                                            P_PARAMETRO: 'GSE',
                                            P_MONTO: pLcAmount,
                                            P_IND_MOV: 'C',
                                            P_FECVIGENCIA: V_FECHA_HOY,
                                            P_NO_CHEQUE: null,
                                            P_EXC_CHEQUE: null,
                                            P_NO_PLAETA: null
                                        });

                    const q40 = await this.entity.query(`SELECT MAX (ID_LCG)
                        FROM SERA.COMER_REF_GARANTIAS
                        WHERE MONTO = ${pLcAmount}
                        AND ESTATUS = 'GEN'
                        AND ID_CLIENTE = ${pCustomerId}
                        AND ID_LOTE = ${pLotId}
                        AND ID_EVENTO = ${pEventId};
                    `)

                    if (q40.length !== 0){

                        V_ID_DET_LC_S = q40[0].max

                    } else {

                        V_ID_DET_LC_S = 0

                    }

                    if (V_ID_DET_LC_S == 0) {

                        await this.entity.query(`UPDATE SERA.COMER_REF_GARANTIAS
                            SET ESTATUS = 'PAG'
                            WHERE ID_LCG = ${V_ID_DET_LC_S};                         
                        `)

                        const q41 = await this.entity.query(`SELECT REF_GSAE || REF_GBANCO AS P_REFERENCIA_OUT
                            FROM SERA.COMER_REF_GARANTIAS
                            WHERE ID_LCG = '${V_ID_DET_LC_S}';
                        `)

                        pReference = q41[0].p_referencia_out

                        pResult = 'OK'

                    }

                } else {

                    const spGen24 = await this.captureline.send({ cmd: 'spGenLc' }, 
                                            {
                                                P_ID_LOTE: pLotId, 
                                                P_ID_CLIENTE: pCustomerId, 
                                                P_PARAMETRO: V_DES_LC_TIPO,
                                                P_MONTO_LC: pLcAmount,
                                                P_IND_MOV: 'C',
                                                P_FECVIGENCIA: V_FECHA_HOY
                                            });

                    const q42 = await this.entity.query(`SELECT MAX(ID_DET_LC)
                        FROM SERA.COMER_DET_LC
                        WHERE ID_LC = (SELECT ID_LC
                                        FROM SERA.COMER_LC
                                        WHERE     ID_LOTE = ${pLotId}
                                        AND ID_CLIENTE = ${pCustomerId}
                                        AND ID_EVENTO = ${pEventId})
                        AND ESTATUS = 'GEN'
                        AND MONTO = ${pLcAmount} ;
                    `)

                    if (q42.length !== 0){

                        V_ID_DET_LC_S = q42[0].max

                    } else {

                        V_ID_DET_LC_S = 0

                    }

                    if (V_ID_DET_LC_S > 0) {

                        await this.entity.query(`UPDATE SERA.COMER_DET_LC
                            SET ESTATUS = 'PAG'
                            WHERE ID_DET_LC = ${V_ID_DET_LC_S};                       
                        `)

                        const q43 = await this.entity.query(`SELECT LC_SAE || LC_BANCO AS P_REFERENCIA_OUT
                            FROM SERA.COMER_DET_LC
                            WHERE ID_DET_LC = '${V_ID_DET_LC_S}';
                        `)

                        pReference = q43[0].p_referencia_out

                        pResult = 'OK'

                    }

                }

            }

        } else {

            c_RESUL = 'El cliente ingresado es diferente al de la referencia original : ' + pLcOriginal;

        }

    } else {

        c_RESUL = 'No se encontro el cliente de la referencia : ' + pLcOriginal;

    }

    return {

        statusCode: HttpStatus.OK,
        message: ['Procedimiento ejecutado correctamente'],
        data: {c_RESUL, pResult, pReference}

    }

    } catch (error) {
        console.log(error)
        return {
            statusCode: HttpStatus.OK,
            message: [error.message]
        }
    }
    }

}
