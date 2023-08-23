import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchPayment } from './dto/search-payment.dto';
import { ValidPayment } from './dto/valid-payment.dto';
import { ComerLotsEntity } from './entity/comer-lots.entity';
import { LocalDate } from 'src/shared/utils/local-date';
import { PaPaymentEfeDupNrefDto } from './dto/pa-payment-efe-dup-nref.dto';

@Injectable()
export class ComerPaymentService {
    constructor(@InjectRepository(ComerLotsEntity) private entity: Repository<ComerLotsEntity>) { }

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

        var LV_QUERY = ""
        var LV_QUERY_INSE = ""
        var LV_QUERY_PREF = ""
        var LV_QUERY_INCO = ""
        var LV_QUERY_COUN = ""
        var LV_WHERE = ""
        var LV_WHERE_EVELOT = ""
        var LV_WHERE_BANCO = ""
        var LV_WHERE_MONTO = ""
        var LV_WHERE_REFE = ""
        var LV_WHERE_VSIS = ""
        var LV_WHERE_TBUSQ = ""
        var LV_TABLE = ""
        var LV_TIPO_PAGO = ""
        var LV_ID_INCONSIS = ""
        var LV_VALEVENTO = 0
        var LV_VALLOTE = 0
        var LV_VALBANCO = 0
        var LV_VALMAEBUS = 0
        var LV_TOTREGQRY = 0


        try {
            var P_MSG_PROCESO = 'Proceso finalizo satisfactoriamente ...'
            var P_EST_PROCESO = 1
            LV_WHERE = 'where 1=1';

            LV_QUERY_INSE = `insert into sera.BUSQUEDA_PAGOS_DET(
                ID_TBUSQUEDA,ID_PAGO,REFERENCIA,REFERENCIAORI,NO_MOVTO,FECHA,MONTO,
                CVE_BANCO,CODIGO,ID_LOTE,VALIDO_SISTEMA,CUENTA,ID_CLIENTE,DESCRIPCION,
                ID_TIPO_SAT,TIPO,RESULTADO,IDORDENINGRESO,ID_PROCESO,ID_INCONSIS,DESC_INCONSIS,
                ID_SELEC,ID_EVENTO,LOTE_PUBLICO
                ) `;
            LV_QUERY_PREF = `select '${params.typeSearch}',ID_PAGO, REFERENCIA,REFERENCIA,NO_MOVIMIENTO,FECHA, MONTO,
                CVE_BANCO, CODIGO, ID_LOTE, VALIDO_SISTEMA,CUENTA,ID_CLIENTE,DESCRIPCION,
                ID_TIPO_SAT,TIPO,RESULTADO,IDORDENINGRESO,NULL,NULL,NULL,0,
                (select ID_EVENTO    from sera.COMER_LOTES where ID_LOTE = a.ID_LOTE) ID_EVENTO,
                (select LOTE_PUBLICO from sera.COMER_LOTES where ID_LOTE = a.ID_LOTE) LOTE_PUBLICO
        from sera.COMER_PAGOREF a `;
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
                     /* TODO: llamada a procedimiento de BD
                        P_ADM_PAG_EFE_DUPLICADOS(
                            LV_REFERENCIA,
                            LV_TIPOOPERA,
                            LV_ID_LOTE,
                            LV_ID_CLIENTE,
                            dat.id_evento,
                            dat.monto,
                            dat.id_tipo_sat,
                            dat.tipo_referencia,
                            LV_MSJVALIDO,
                            LV_NVA_REFER
                        ); */

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

}
