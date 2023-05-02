import { Injectable, HttpStatus } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ParametersmodDepositoryEntity } from "../infrastructure/entities/parametersmod-depository.entity";
import { refpayDepositoriesEntity } from "../infrastructure/entities/refpay-depositories.entity";
import { TmpPagosGensDepEntity } from '../infrastructure/entities/tmp-pagosgens-dep.entity';
import { paymentsgensDepositaryEntity } from "../infrastructure/entities/paymentsgens-depositary.entity";
import { ExecDeductionsDto, FillAccreditationsDto, FillPaymentsDto, GenericParamsDto, PrepOIDto, RemoveDisperPaymentsRefDto, ValidDepDto, } from "./dto/param.dto";

@Injectable()
export class PaymentRefService {
    // TODO: cambiar variables y nombre de funciones a ingles
    //#region Variables Globales
    private gDepositos: any[] = [];
    private gDispercionAbonos: any[] = [];
    private gDispersion: any[] = [];
    private gContra: number; //G_CONTRA
    private gIva: number; //G_IVA
    private gIvaTotal: number; //G_IVATOTAL
    private gIvaContra: number; //G_IVACONTRA
    private gSumaTot: any; //G_SUMATOT
    private gReferencia: any; //G_REFERENCIA
    private gNombramiento: any; //G_NOMBRAMIENTO
    private gUR: any; //G_UR
    private gTipoOperacion: any; //G_TPOPERACION
    private gAnexo: any; //G_ANEXO
    private gTipoIngresoG: any; //G_TPOINGRESOG
    private gTipoIngresoT: any; //G_TPOINGRESOT
    private gTipoIngresoP: any; //G_TPOINGRESOP
    private gTipoIngresoR: any; //G_TPOINGRESOR
    private gRecoGastos: any; //G_RECOGASTOS
    private gArea: any; //G_AREA
    private gTipoDoc: any; //G_TPODOC
    //#endregion

    constructor(
        @InjectRepository(ParametersmodDepositoryEntity) private ParametersmodDepositoryRepository: Repository<ParametersmodDepositoryEntity>,
        @InjectRepository(TmpPagosGensDepEntity) private TmpPagosGensDepRepository: Repository<TmpPagosGensDepEntity>,
        @InjectRepository(refpayDepositoriesEntity) private RefpayDepositoriesRepository: Repository<refpayDepositoriesEntity>,
        @InjectRepository(paymentsgensDepositaryEntity) private PaymentsgensDepositaryRepository: Repository<paymentsgensDepositaryEntity>,
    ) { }

    //#region **PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA**

    //#region FUNCTION PARAMETROS_DEP
    /**
     * FUNCTION PARAMETROS_DEP,
     * Se obtiene parametros globales para el proceso de calculo
     * @param {number} pOne
     * @param {string} pDirec
     * @return {*}  {Promise<any>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 6-123
     */
    async paramsDep(pOne: number, pDirec: string): Promise<any> {
        const response: any[] = [];
        const lParameters: any[] = [
            { param: 'UR', adderss: 'D', cast: false, globalName: this.gUR },
            { param: 'TPOPERACION', adderss: pDirec, cast: true, globalName: this.gTipoOperacion },
            { param: 'ANEXO', adderss: pDirec, cast: true, globalName: this.gAnexo },
            { param: 'TPOINGRESOG', adderss: pDirec, cast: true, globalName: this.gTipoIngresoG },
            { param: 'TPOINGRESOT', adderss: pDirec, cast: true, globalName: this.gTipoIngresoT },
            { param: 'TPOINGRESOP', adderss: pDirec, cast: true, globalName: this.gTipoIngresoP },
            { param: 'TPOINGRESOR', adderss: pDirec, cast: true, globalName: this.gTipoIngresoR },
            { param: 'RECOGASTOS', adderss: pDirec, cast: true, globalName: this.gRecoGastos },
            { param: 'AREA', adderss: pDirec, cast: false, globalName: this.gArea },
            { param: 'TPODOC', adderss: 'D', cast: false, globalName: this.gTipoDoc },
        ];

        try {

            const parameterQuery = this.ParametersmodDepositoryRepository.createQueryBuilder('par')
                .select([ 'parametro', 'direccion', 'valor' ])
                .where('par.parametro IN (:...parametros)', { parametros: lParameters.map(p => p.param) })
                .andWhere('par.direccion IN (:...direcciones)', { direcciones: lParameters.map(p => p.address) });

            const parameters = await parameterQuery.getRawMany();

            const reducedResponse = parameters.reduce((acc, cur) => {
                const matchingParam = lParameters.find(p => p.param === cur.parametro && p.address === cur.direccion);
                if (matchingParam) {
                    const value = cur.valor;
                    if (value !== undefined) {
                        matchingParam.globalName = matchingParam.cast ? parseInt(value) : value;
                        acc.push({ [ matchingParam.param ]: matchingParam.globalName });
                    } else {
                        acc.push({ [ matchingParam.param ]: `No existe el parametro ${matchingParam.param} para la dirección ${matchingParam.address}` });
                    }
                }
                return acc;
            }, []);

            response.push(reducedResponse);

            return {
                data: [ response ],
                statusCode: HttpStatus.OK,
                message: [ 'OK' ]
            };

        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            };
        }
    }
    //#endregion

    //#region FUNCTION LLENA_PAGOS
    /**
     * FUNCTION LLENA_PAGOS,
     * Llena los rDepositos hechos por el depositario
     * @param {number} dto.pOne
     * @param {number} dto.pTwo
     * @param {number} dto.pThree
     * @param {Date} dto.pDate
     * @return {*}  {(Promise<any> | rDepositos )}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 128-174
     */
    async fillPayments(dto: FillPaymentsDto): Promise<any> {
        let lIdPago: number = 0, //L_IDPAGO
            lMonto: number = 0.0, //L_MONTO
            lMandato: number = 0, //L_MANDATO
            lBien: number = 0,//L_BIEN
            i: number = 0, //i
            lDepTot: number = 0.0,//L_DEPTOT
            lContra: number = 0.0, //L_CONTRA
            lIva: number = 0.0, //L_IVA
            lFecha: string; //L_FECHA

        let rDepositos: any[] = this.gDepositos;

        try {
            rDepositos.slice(0, rDepositos.length); //limpia el arreglo

            const l8 = await this.ParametersmodDepositoryRepository.query(`
                        SELECT RFD.ID_PAGO, RFD.MONTO,
                            (SELECT NO_TRANSFERENTE FROM SERA.EXPEDIENTES
                                WHERE NO_EXPEDIENTE = (SELECT NO_EXPEDIENTE FROM SERA.BIENES
                                    WHERE NO_BIEN = RFD.NO_BIEN)) NO_TRANSFERENTE,
                            RFD.NO_BIEN, ND.IMPORTE_CONTRAPRESTACION, ND.IVA
                        FROM SERA.PAGOREF_DEPOSITARIAS RFD, NOMBRAMIENTOS_DEPOSITARIA ND
                        WHERE RFD.FECHA_REGISTRO <= TO_DATE(${dto.pDate}, 'YYYY-MM-DD')
                        AND RFD.VALIDO_SISTEMA  = 'A'
                        AND RFD.NO_BIEN         = ND.NO_BIEN
                        AND ND.NO_NOMBRAMIENTO  = ${dto.pOne}
                        AND ND.NO_PERSONA       = ${dto.pTwo}
                        AND RFD.IDORDENINGRESO  IS NULL
                        AND ND.IMPORTE_CONTRAPRESTACION   > 0
                        ORDER BY RFD.ID_PAGO, RFD.MONTO DESC
                    `);

            for (const row of l8) {
                lIdPago = row.ID_PAGO;
                lMonto = row.MONTO;
                lMandato = row.NO_TRANSFERENTE;
                lBien = row.NO_BIEN;
                lContra = row.IMPORTE_CONTRAPRESTACION;
                lIva = row.IVA;
                i++;
                rDepositos[ i ].push({
                    paid: this.round(row.MONTO),
                    payId: lIdPago,
                    remainder: lMonto,
                    mandate: lMandato,
                    good: lBien,
                    contra: lContra
                });
                lDepTot += lMonto;
                this.gContra = this.round(lContra); // CONTRAPRESTACIÓN
                this.gIva = lIva; // IVA TOTAL
                this.gIvaTotal = this.round(await this.xCentIva(this.gContra, this.gIva)); // VALOR DEL % DEL IVA
                this.gIvaContra = this.round((this.gContra + this.gIvaTotal)); // CONTRAPRESTACIÓN CON EL VALOR DEL % DEL IVA
            }

            let response = {
                "rDepositos": rDepositos,
                "lDepTot": lDepTot
            }

            return {
                data: [ response ],
                statusCode: HttpStatus.OK,
                message: [ 'OK' ]
            };

        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            };
        }
    }
    //#endregion

    //#region FUNCION MON_SIN_IVA
    /**
    * FUNCTION MON_SIN_IVA,
    * Saca el monto sin IVA
    * @param {number} pMonto
    * @param {number} pIva
    * @return {*}  {Promise<number>}
    * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 1658-1675
    */
    async amountWithoutIva(pMonto: number, pIva: number): Promise<number> {
        let lMontoSinIva: number = 0;
        try {
            lMontoSinIva = pMonto / (1 + pIva / 100);
        } catch (error) {
            console.error(error);
            return 0;
        }
        return Math.round(lMontoSinIva * 100) / 100;
    }
    //#endregion

    //#region FUNCION XCENT_IVA
    /**
     * FUNCTION XCENT_IVA,
     * Saca el % del IVA
     * @param {number} pMonto
     * @param {number} pIva
     * @return {*}  {Promise<number>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 1680-1697
     */
    async xCentIva(pMonto: number, pIva: number): Promise<number> {
        let lXcentIva: number = 0;

        try {
            lXcentIva = Math.round(pMonto * (pIva / 100) * 100) / 100;
        } catch (error) {
            return 0;
        }
        return Math.round(lXcentIva * 100) / 100;
    }
    //#endregion

    //#region FUNCION CALCULA_IVA
    /**
     * FUNCTION CALCULA_IVA,
     * Saca el monto sin IVA
     * @param {number} pIva
     * @param {number} pDeduc
     * @return {*}  {Promise<any>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 1702-1719
     */
    async calculateIva(pIva: number, pDeduc: number): Promise<number> {
        let lIva: number = 0;

        try {
            const deduc = pDeduc ?? 0;
            lIva = Math.round((pIva * ((50 + deduc) / 50)) * 100) / 100;
        } catch (error) {
            return 0;
        }

        return Math.round(lIva * 100) / 100;
    }
    //#endregion

    //#region FUNCION ROUND
    /**
     * FUNCION ROUND,
     * Redondea un numero a dos decimales
     * @param {number} value
     * @return {*}  {number}
     * @memberof PaymentRefService
     */
    public round(value: number): number {
        return Number(Math.round(value * 100) / 100);
    }
    //#endregion

    //#region PROCEDURES DISPERCION_ABONOS
    /**
     * PROCEDURE DISPERCION_ABONOS
     * Llena la dispersión de los Abonos
     * @param {number} dto.pOne
     * @param {number} dto.pTwo
     * @return {*} {Promise<object>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 179-226
     */
    async dispersionAccreditations(dto: GenericParamsDto): Promise<object> {
        try {
            const l1 = await this.ParametersmodDepositoryRepository.query(`SELECT ID_PAGOGENS,ID_PAGO,NO_BIEN,MONTO,REFERENCIA,TIPOINGRESO,NO_TRANSFERENTE,IVA,MONTO_IVA,ABONO,
                   (SELECT SUM(PAGO_ACT) FROM SERA.PAGOSGENS_DEPOSITARIAS WHERE NO_NOMBRAMIENTO = :dto.pOne AND NO_BIEN = :pTwo AND STATUS = 'A' AND (ABONO_CUBIERTO = 0 OR ABONO_CUBIERTO IS NULL))PAGO_ACT,
                   DEDUXCENT,DEDUVALOR,STATUS,NO_NOMBRAMIENTO,FECHA_PROCESO
                 FROM SERA.PAGOSGENS_DEPOSITARIAS
                 WHERE NO_NOMBRAMIENTO = ${dto.pOne}
                   AND NO_BIEN = ${dto.pTwo}
                   AND STATUS = 'A'
                   AND (ABONO_CUBIERTO = 0 OR ABONO_CUBIERTO IS NULL)
                 ORDER BY ID_PAGOGENS`);

            let ga = 0;
            let rDispercionAbonos: any[] = this.gDispercionAbonos;

            for (const row of l1) {
                ga++;
                rDispercionAbonos[ ga ].push({
                    payGensId: row.ID_PAGOGENS,
                    payId: row.ID_PAGO,
                    noGood: row.NO_BIEN,
                    amount: row.MONTO.toFixed(2),
                    reference: row.REFERENCIA,
                    typeInput: row.TIPOINGRESO,
                    noTransferable: row.NO_TRANSFERENTE,
                    iva: row.IVA.toFixed(2),
                    amountIva: row.MONTO_IVA.toFixed(2),
                    payment: row.ABONO.toFixed(2),
                    paymentAct: row.PAGO_ACT ? row.PAGO_ACT.toFixed(2) : null,
                    deduxcent: row.DEDUXCENT,
                    deduValue: row.DEDUVALOR.toFixed(2),
                    status: row.STATUS,
                    noAppointment: row.NO_NOMBRAMIENTO,
                    dateProcess: row.FECHA_PROCESO,
                    type: 'U',
                    insert: 'DB',
                });
            }

            let response = {
                "DispercionAbonos": rDispercionAbonos,
            }
            return {
                data: [ response ],
                statusCode: HttpStatus.OK,
                message: [ 'OK' ]
            };
        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            };
        }
    }
    //#endregion

    //#region PROCEDURE DISP_DEDUCCIONES
    /**
     * PROCEDURE DISP_DEDUCCIONES,
     * Llena la dispersión de las Deducciones
     * @return {*}  {Promise<object>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 231-300
     */
    async dispersionDeductions(): Promise<object> {
        let lStatus: number = 0; //L_STATUS
        let dG: number = 0;
        let rDispercionAbonos: any[] = this.gDispercionAbonos;
        let gAppointment = 0; //G_NOMBRAMIENTO
        let gReference = null; //G_REFERENCIA
        try {
            const L3 = await this.TmpPagosGensDepRepository.find({
                order: { payGensId: 'ASC' },
            });

            for (const row of L3) {
                if (row.status === 'A') {
                    lStatus += 1;
                } else {
                    lStatus = 0;
                }

                if (
                    (row.origin === 'DB' && [ 'C', 'A' ].includes(row.status)) ||
                    (row.origin === null && row.status !== 'C')
                ) {
                    if (lStatus <= 1) {
                        dG = dG + 1;

                        rDispercionAbonos[ dG ].push({
                            payGensId: row.payGensId,
                            payId: row.payId,
                            noGood: row.noGood,
                            amount: row.amount.toFixed(2),
                            reference: row.reference,
                            typeInput: row.typeInput,
                            noTransferable: row.noTransferable,
                            iva: row.iva.toFixed(2),
                            amountIva: row.amountIva.toFixed(2),
                            paymentAct: row.origin === 'DB' ? row.paymentAct.toFixed(2) : `0.0`,
                            status: row.origin === 'DB' ? row.status : 'A',
                            payment: row.payment.toFixed(2),
                            deduxcent: row.deduxcent,
                            deduValue: row.deduValue.toFixed(2),
                            noAppointment: row.noAppointment,
                            dateProcess: row.dateProcess,
                            type: row.type,
                            insert: row.insert,
                            xcentdedu: row.xcentdedu,
                            valuededu: row.valuededu,
                            impWithoutIva: row.impWithoutIva,
                            chkDedu: row.chkDedu ?? 0,
                            origin: row.origin
                        });

                        // TODO: Consultar si se va a guardar en la tabla temporal
                        // await this.TmpPagosGensDepRepository.save(rDispercionAbonos[dG]);

                        if (gAppointment === 0 || gReference === null) {
                            gAppointment = row.noAppointment;
                            gReference = row.reference;
                        }
                    }
                }
            }

            let response = {
                "rDispercionAbonos": rDispercionAbonos,
            };

            return {
                data: [ response ],
                statusCode: HttpStatus.OK,
                message: [ 'OK' ]
            };
        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            };
        }
    }
    //#endregion

    //#region PROCEDURES LIQ_PAGOS_DISP
    /**
     * PROCEDURE LIQ_PAGOS_DISP,
     * LLena los pagos que sólo tienen abono
     * @return {*}  {Promise<object>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 305-717
     */
    async fillPaymentsDisp(): Promise<object> {
        let lResto: number = 0.0, //L_RESTO
            lPagTot: number = 0.0, // L_PAGTOT
            lXCent: number = 0.0, // L_XCENT
            lNewMont: number = 0.0, // L_NEWMONT
            lMontosSinIva: number = 0.0, // L_MONTOSIN_IVA
            lXCentIva: number, // L_XCENTIVA;
            lXCubrir: number = 0.0, // L_XCUBRIR
            lIva: number, // L_IVA
            lNewContra: number = 0.0, // L_NEWCONTRA
            dG: number = 0;
        let lDepositos: any[] = this.gDepositos; //DEPOSITOS
        let lDispercionAbonos: any[] = this.gDispercionAbonos; //DISPER_ABONOS
        let lDispercion: any = [];
        let rDispercion: any[] = this.gDispersion; //DISPERSION
        try {
            rDispercion.splice(0, rDispercion.length); //LIMPIA LA LISTA

            for (const x in lDepositos) {
                for (const d in lDispercionAbonos) {
                    if (lDepositos[ x ].paid == 0) {
                        break;
                    }

                    if (lDispercionAbonos[ d ].origen == 'DB' && lDispercionAbonos[ d ].status != 'X') {
                        dG++;
                        rDispercion[ dG ].push({
                            payId: lDispercionAbonos[ d ].payGensId, //ID_PAGO
                            noGood: lDispercionAbonos[ d ].noGood, //NO_BIEN
                            amount: lDispercionAbonos[ d ].amount, //IMPORTE
                            reference: lDispercionAbonos[ d ].reference, //REFERENCIA
                            typeInput: lDispercionAbonos[ d ].typeInput, //TIPO_ENTRADA
                            noTransferable: lDispercionAbonos[ d ].noTransferable, //NO_TRANSFERIBLE
                            payment: lDispercionAbonos[ d ].payment, //ABONO
                            paymentAct: lDispercionAbonos[ d ].paymentAct, //ABONO_ACT
                            status: lDispercionAbonos[ d ].status, //STATUS
                            impWithoutIva: lDispercionAbonos[ d ].impWithoutIva, //IMP_SIN_IVA
                            iva: lDispercionAbonos[ d ].iva, //IVA
                            amountIva: lDispercionAbonos[ d ].amountIva, //IMPORTE_IVA
                            noAppointment: lDispercionAbonos[ d ].noAppointment, //NO_CITA
                            dateProcess: lDispercionAbonos[ d ].dateProcess, //FECHA_PROCESO
                            type: lDispercionAbonos[ d ].type, //TIPO
                            insert: lDispercionAbonos[ d ].insert, //INSERTO
                            payCoverId: lDispercionAbonos[ d ].payCoverId, //ID_PAGO_CUBRIO
                            xCover: lDispercionAbonos[ d ].xCover, //X_CUBRIR
                            origin: lDispercionAbonos[ d ].origin, //ORIGEN
                            deduxcent: lDispercionAbonos[ d ].deduxcent, //DEDUXCENT
                            deduValue: lDispercionAbonos[ d ].deduValue, //DEDUVALOR
                            chkDedu: lDispercionAbonos[ d ].chkDedu, //CHK_DEDU
                        });
                        lDepositos[ x ].paid = lDepositos[ x ].paid - lDispercionAbonos[ d ].amount;
                        lDispercionAbonos[ d ].status = 'X';
                    } else {
                        if (lDispercionAbonos[ d ].status == 'A') {

                            if (lDispercionAbonos[ d ].deduxcent == 0 || lDispercionAbonos[ d ].deduxcent == null) {
                                if (lDispercionAbonos[ d ].insert == 'DB') {
                                    lResto = this.round(this.round(this.gIvaContra) - this.round(lDispercionAbonos[ d ].paymentAct));
                                    lPagTot = this.round(lResto) + this.round(lDispercionAbonos[ d ].paymentAct);
                                } else {
                                    lResto = this.round(this.gIvaContra);
                                    lPagTot = this.round(this.gIvaContra);
                                }

                                if (lDepositos[ x ].paid < lResto && lDepositos[ x ].paid > 0) {
                                    lMontosSinIva = await this.amountWithoutIva(lDepositos[ x ].paid, lDispercionAbonos[ d ].iva);
                                    lXCentIva = await this.xCentIva(lMontosSinIva, lDispercionAbonos[ d ].iva);
                                    lXCubrir = this.round(this.gIvaContra) - this.round(this.round(lDispercionAbonos[ d ].paymentAct) + this.round(lDepositos[ x ].paid));
                                    dG++;

                                    lDispercion = {
                                        payId: lDispercionAbonos[ d ].payGensId, //ID_PAGO
                                        noGood: lDispercionAbonos[ d ].noGood, //NO_BIEN
                                        amount: this.round(lDispercionAbonos[ d ].paid), //IMPORTE
                                        reference: lDispercionAbonos[ d ].reference, //REFERENCIA
                                        noTransferable: lDispercionAbonos[ d ].noTransferable, //NO_TRANSFERIBLE
                                        payment: this.round(lMontosSinIva), //ABONO
                                        paymentAct: this.round(lDispercionAbonos[ d ].paymentAct), //ABONO_ACT
                                        status: lDispercionAbonos[ d ].status, //STATUS
                                        impWithoutIva: this.round(lMontosSinIva), //IMP_SIN_IVA
                                        iva: this.round(lDispercionAbonos[ d ].iva), //IVA
                                        amountIva: this.round(lXCentIva), //IMPORTE_IVA
                                        noAppointment: lDispercionAbonos[ d ].noAppointment, //NO_CITA
                                        dateProcess: lDispercionAbonos[ d ].dateProcess, //FECHA_PROCESO
                                        type: lDispercionAbonos[ d ].type, //TIPO
                                        insert: lDispercionAbonos[ d ].insert, //INSERTO
                                        payCoverId: lDispercionAbonos[ d ].payCoverId, //ID_PAGO_CUBRIO
                                        xCover: this.round(lXCubrir), //X_CUBRIR
                                        deduxcent: lDispercionAbonos[ d ].deduxcent, //DEDUXCENT
                                        deduValue: this.round(lDispercionAbonos[ d ].deduValue), //DEDUVALOR
                                        chkDedu: lDispercionAbonos[ d ].chkDedu, //CHK_DEDU
                                    }

                                    rDispercion[ dG ].push(lDispercion);
                                    lDispercionAbonos[ d ].paymentAct = this.round(this.round(lDispercionAbonos[ d ].paymentAct) + this.round(lDepositos[ x ].paid));
                                    if (lDispercionAbonos[ d ].insert != 'DB') {
                                        lDispercionAbonos[ d ].insert = 'DB';
                                    }

                                    lDepositos[ x ].paid = 0;

                                    if (rDispercion[ dG ].payId == 0 || rDispercion[ dG ].payId == null) {
                                        rDispercion[ dG ].payId = lDepositos[ x ].payId;
                                    }

                                    if (lDispercionAbonos[ d ].status == 'A') {
                                        break;
                                    }

                                } else if (lDepositos[ x ].paid >= lResto) {
                                    lMontosSinIva = await this.amountWithoutIva(lResto, lDispercionAbonos[ d ].iva);
                                    lXCentIva = await this.xCentIva(lMontosSinIva, lDispercionAbonos[ d ].iva);
                                    dG++;

                                    lDispercion = {
                                        payId: lDispercionAbonos[ d ].payGensId, //ID_PAGO
                                        noGood: lDispercionAbonos[ d ].noGood, //NO_BIEN
                                        amount: this.round(lDispercionAbonos[ d ].paid), //IMPORTE
                                        reference: lDispercionAbonos[ d ].reference, //REFERENCIA
                                        noTransferable: lDispercionAbonos[ d ].noTransferable, //NO_TRANSFERIBLE
                                        payment: lDispercionAbonos[ d ].inset == 'DB' ? this.round(lMontosSinIva) : 0, //ABONO
                                        paymentAct: this.round(lResto), //ABONO_ACT
                                        status: lDispercionAbonos[ d ].inset == 'DB' ? 'C' : 'P', //STATUS
                                        impWithoutIva: this.round(lMontosSinIva), //IMP_SIN_IVA
                                        iva: this.round(lDispercionAbonos[ d ].iva), //IVA
                                        amountIva: this.round(lXCentIva), //MONTO_IVA
                                        noAppointment: lDispercionAbonos[ d ].noAppointment, //NO_NOMBRAMIENTO
                                        dateProcess: lDispercionAbonos[ d ].dateProcess, //FECHA_PROCESO
                                        type: lDispercionAbonos[ d ].type, //TIPO
                                        insert: lDispercionAbonos[ d ].insert, //INSERTO
                                        payCoverId: lDispercionAbonos[ d ].payCoverId, //ID_PAGO_CUBRIO
                                        xCover: 0, //X_CUBRIR
                                        deduxcent: lDispercionAbonos[ d ].deduxcent, //DEDUXCENT
                                        deduValue: this.round(lDispercionAbonos[ d ].deduValue), //DEDUVALOR
                                        chkDedu: lDispercionAbonos[ d ].chkDedu, //CHK_DEDU
                                    }

                                    rDispercion[ dG ].push(lDispercion);
                                    lDispercionAbonos[ d ].status = 'P';
                                    lDepositos[ x ].paid = this.round(this.round(lDepositos[ x ].paid) - this.round(lResto));

                                    if (rDispercion[ dG ].payId == 0 || rDispercion[ dG ].payId == null) {
                                        rDispercion[ dG ].payId = this.round(lDepositos[ x ].payId);
                                    }
                                } else if (lDepositos[ x ].paid == lResto) {
                                    lMontosSinIva = await this.amountWithoutIva(lResto, lDispercionAbonos[ d ].iva);
                                    lXCentIva = await this.xCentIva(lMontosSinIva, lDispercionAbonos[ d ].iva);
                                    dG++;

                                    lDispercion = {
                                        payId: lDispercionAbonos[ d ].payGensId, //ID_PAGO
                                        noGood: lDispercionAbonos[ d ].noGood, //NO_BIEN
                                        amount: this.round(lDispercionAbonos[ d ].paid), //IMPORTE
                                        reference: lDispercionAbonos[ d ].reference, //REFERENCIA
                                        noTransferable: lDispercionAbonos[ d ].noTransferable, //NO_TRANSFERIBLE
                                        payment: lDispercionAbonos[ d ].inset == 'DB' ? this.round(lMontosSinIva) : 0, //ABONO
                                        paymentAct: this.round(lResto), //ABONO_ACT
                                        status: lDispercionAbonos[ d ].inset == 'DB' ? 'C' : 'P', //STATUS
                                        impWithoutIva: this.round(lMontosSinIva), //IMP_SIN_IVA
                                        iva: this.round(lDispercionAbonos[ d ].iva), //IVA
                                        amountIva: this.round(lXCentIva), //MONTO_IVA
                                        noAppointment: lDispercionAbonos[ d ].noAppointment, //NO_NOMBRAMIENTO
                                        dateProcess: lDispercionAbonos[ d ].dateProcess, //FECHA_PROCESO
                                        type: lDispercionAbonos[ d ].type, //TIPO
                                        insert: lDispercionAbonos[ d ].insert, //INSERTO
                                        payCoverId: lDepositos[ x ].payId, //ID_PAGO_CUBRIO
                                        xCover: 0, //X_CUBRIR
                                        deduxcent: lDispercionAbonos[ d ].deduxcent, //DEDUXCENT
                                        deduValue: this.round(lDispercionAbonos[ d ].deduValue), //DEDUVALOR
                                        chkDedu: lDispercionAbonos[ d ].chkDedu, //CHK_DEDU
                                    }

                                    rDispercion[ dG ].push(lDispercion);
                                    lDispercionAbonos[ d ].status = 'P';
                                    lDepositos[ x ].paid = 0;

                                    if (rDispercion[ dG ].payId == 0 || rDispercion[ dG ].payId == null) {
                                        rDispercion[ dG ].payId = this.round(lDepositos[ x ].payId);
                                    }
                                }
                            } else if (lDispercionAbonos[ d ].deduxcent > 0) {
                                lXCent = this.round(lDispercionAbonos[ d ].deduValue);
                                lNewContra = this.round(this.round(this.gContra) - this.round(lXCent));
                                lNewMont = this.round(lNewContra + this.round(this.gIvaTotal));

                                if (lDispercionAbonos[ d ].insert == 'DB') {
                                    lResto = this.round(this.round(lNewMont) - this.round(lDispercionAbonos[ d ].paymentAct));
                                    lPagTot = this.round(this.round(lResto) + this.round(lDispercionAbonos[ d ].paymentAct));
                                } else {
                                    lResto = this.round(lNewMont);
                                    lPagTot = this.round(lNewMont);
                                }

                                if (lDispercionAbonos[ d ].chkDedu == 1) {
                                    lIva = this.round(lDispercionAbonos[ d ].iva);
                                } else {
                                    lIva = await this.calculateIva(lDispercionAbonos[ d ].iva, lDispercionAbonos[ d ].deduxcent ?? 0);
                                }

                                if (lDepositos[ x ].paid < lResto && lDepositos[ x ].paid > 0) {
                                    lMontosSinIva = await this.amountWithoutIva(lDepositos[ x ].paid, lIva);
                                    lXCentIva = await this.xCentIva(lMontosSinIva, lIva);
                                    lXCubrir = this.round(lResto) - this.round(this.round(lDispercionAbonos[ d ].paymentAct) + this.round(lDepositos[ x ].paid));
                                    dG++;

                                    lDispercion = {
                                        payId: lDispercionAbonos[ d ].payGensId, //ID_PAGO
                                        noGood: lDispercionAbonos[ d ].noGood, //NO_BIEN
                                        amount: this.round(lDispercionAbonos[ d ].paid), //IMPORTE
                                        reference: lDispercionAbonos[ d ].reference, //REFERENCIA
                                        noTransferable: lDispercionAbonos[ d ].noTransferable, //NO_TRANSFERIBLE
                                        payment: this.round(lMontosSinIva), //ABONO
                                        paymentAct: this.round(lDispercionAbonos[ d ].paymentAct), //ABONO_ACT
                                        status: lDispercionAbonos[ d ].status, //STATUS
                                        impWithoutIva: this.round(lMontosSinIva), //IMP_SIN_IVA
                                        iva: this.round(lIva), //IVA
                                        amountIva: this.round(lXCentIva), //IMPORTE_IVA
                                        noAppointment: lDispercionAbonos[ d ].noAppointment, //NO_CITA
                                        dateProcess: lDispercionAbonos[ d ].dateProcess, //FECHA_PROCESO
                                        type: lDispercionAbonos[ d ].type, //TIPO
                                        insert: lDispercionAbonos[ d ].insert, //INSERTO
                                        payCoverId: lDispercionAbonos[ d ].payCoverId, //ID_PAGO_CUBRIO
                                        xCover: this.round(lXCubrir), //X_CUBRIR
                                        deduxcent: lDispercionAbonos[ d ].deduxcent, //DEDUXCENT
                                        deduValue: this.round(lDispercionAbonos[ d ].deduValue), //DEDUVALOR
                                        chkDedu: 1, //CHK_DEDU
                                    }

                                    rDispercion[ dG ].push(lDispercion);
                                    lDispercionAbonos[ d ].paymentAct = this.round(this.round(lDispercionAbonos[ d ].paymentAct) + this.round(lDepositos[ x ].paid));

                                    if (lDispercionAbonos[ d ].insert != 'DB') {
                                        lDispercionAbonos[ d ].insert = 'DB'
                                    }

                                    lDepositos[ x ].paid = 0;

                                    if (rDispercion[ dG ].payId == 0 || rDispercion[ dG ].payId == null) {
                                        rDispercion[ dG ].payId = lDepositos[ x ].payId;
                                    }

                                    if (lDispercionAbonos[ d ].status == 'A') {
                                        break;
                                    }

                                } else if (lDepositos[ x ].paid > lResto) {
                                    lMontosSinIva = await this.amountWithoutIva(lResto, lDispercionAbonos[ d ].iva);
                                    lXCentIva = await this.xCentIva(lMontosSinIva, lDispercionAbonos[ d ].iva);
                                    dG++;

                                    lDispercion = {
                                        payId: lDispercionAbonos[ d ].payGensId, //ID_PAGO
                                        noGood: lDispercionAbonos[ d ].noGood, //NO_BIEN
                                        amount: this.round(lDispercionAbonos[ d ].paid), //IMPORTE
                                        reference: lDispercionAbonos[ d ].reference, //REFERENCIA
                                        noTransferable: lDispercionAbonos[ d ].noTransferable, //NO_TRANSFERIBLE
                                        payment: lDispercionAbonos[ d ].inset == 'DB' ? this.round(lMontosSinIva) : 0, //ABONO
                                        paymentAct: this.round(lResto), //ABONO_ACT
                                        status: lDispercionAbonos[ d ].inset == 'DB' ? 'C' : 'P', //STATUS
                                        impWithoutIva: this.round(lMontosSinIva), //IMP_SIN_IVA
                                        iva: this.round(lIva), //IVA
                                        amountIva: this.round(lXCentIva), //MONTO_IVA
                                        noAppointment: lDispercionAbonos[ d ].noAppointment, //NO_NOMBRAMIENTO
                                        dateProcess: lDispercionAbonos[ d ].dateProcess, //FECHA_PROCESO
                                        type: lDispercionAbonos[ d ].type, //TIPO
                                        insert: lDispercionAbonos[ d ].insert, //INSERTO
                                        payCoverId: lDepositos[ x ].payId, //ID_PAGO_CUBRIO
                                        xCover: 0, //X_CUBRIR
                                        deduxcent: lDispercionAbonos[ d ].deduxcent, //DEDUXCENT
                                        deduValue: this.round(lDispercionAbonos[ d ].deduValue), //DEDUVALOR
                                        chkDedu: 1, //CHK_DEDU
                                    }

                                    rDispercion[ dG ].push(lDispercion);
                                    lDispercionAbonos[ d ].status = 'P';
                                    lDepositos[ x ].paid = this.round(this.round(lDepositos[ x ].paid) - this.round(lResto));

                                    if (rDispercion[ dG ].payId == 0 || rDispercion[ dG ].payId == null) {
                                        rDispercion[ dG ].payId = lDepositos[ x ].payId;
                                    }
                                } else if (lDepositos[ x ].paid == lResto) {
                                    lMontosSinIva = await this.amountWithoutIva(lResto, lIva);
                                    lXCentIva = await this.xCentIva(lMontosSinIva, lIva);
                                    dG++;

                                    lDispercion = {
                                        payId: lDispercionAbonos[ d ].payGensId, //ID_PAGO
                                        noGood: lDispercionAbonos[ d ].noGood, //NO_BIEN
                                        amount: this.round(lDispercionAbonos[ d ].paid), //IMPORTE
                                        reference: lDispercionAbonos[ d ].reference, //REFERENCIA
                                        noTransferable: lDispercionAbonos[ d ].noTransferable, //NO_TRANSFERIBLE
                                        payment: lDispercionAbonos[ d ].inset == 'DB' ? this.round(lMontosSinIva) : 0, //ABONO
                                        paymentAct: this.round(lDepositos[ x ].paid), //ABONO_ACT
                                        status: lDispercionAbonos[ d ].inset == 'DB' ? 'C' : 'P', //STATUS
                                        impWithoutIva: this.round(lMontosSinIva), //IMP_SIN_IVA
                                        iva: this.round(lIva), //IVA
                                        amountIva: this.round(lXCentIva), //MONTO_IVA
                                        noAppointment: lDispercionAbonos[ d ].noAppointment, //NO_NOMBRAMIENTO
                                        dateProcess: lDispercionAbonos[ d ].dateProcess, //FECHA_PROCESO
                                        type: lDispercionAbonos[ d ].type, //TIPO
                                        insert: lDispercionAbonos[ d ].insert, //INSERTO
                                        payCoverId: lDepositos[ x ].payId, //ID_PAGO_CUBRIO
                                        xCover: 0, //X_CUBRIR
                                        deduxcent: lDispercionAbonos[ d ].deduxcent, //DEDUXCENT
                                        deduValue: this.round(lDispercionAbonos[ d ].deduValue), //DEDUVALOR
                                        chkDedu: 1, //CHK_DEDU
                                    }

                                    rDispercion[ dG ].push(lDispercion);
                                    lDispercionAbonos[ d ].status = 'P';
                                    lDepositos[ x ].paid = 0;

                                    if (rDispercion[ dG ].payId == 0 || rDispercion[ dG ].payId == null) {
                                        rDispercion[ dG ].payId = lDepositos[ x ].payId;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return {
                statusCode: HttpStatus.OK,
                message: [ 'OK' ]
            };
        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            };
        }
    }
    //#endregion

    //#region PROCEDURE EJEC_DEDUCCIONES
    /**
     * PROCEDURE EJEC_DEDUCCIONES,
     * Ejecuta la dispersión de las Deducciones
     * @param {number} dto.pOne
     * @param {number} dto.pTwo
     * @param {Date} dto.pDate
     * @return {*}  {Promise<void>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 722-872
     */
    async execDeductions(dto: ExecDeductionsDto): Promise<void> {
        let lPago: number,
            lNewMont: number,
            lXcent: number,
            lSobra: number,
            lResto: number,
            lRound: number = 0,
            lMontoSinIva: number,
            lXcentIva: number,
            lXCubrir: number,
            dG: number = 0,
            lDispercion: any[] = [];

        lXcent = 0.0;
        lNewMont = 0.0;
        lSobra = 0.0;
        lPago = null;
        lResto = 0.0;
        lMontoSinIva = 0.0;
        lXcentIva = 0.0;
        lXCubrir = 0.0;

        this.gSumaTot = await this.fillPayments({ pOne: dto.pOne, pTwo: dto.pTwo, pDate: dto.pDate, pThree: 1 }).then((res) => {
            console.log(res)
            return res.data.lDepTot;
        });

        // TODO: validar si las asigno a alguna variable
        await this.dispersionDeductions();
        await this.fillPaymentsDisp();

        let lDepositos = this.gDepositos;
        let rDispercion = this.gDispersion;

        for (let [ i, deposito ] of lDepositos.entries()) {
            if (deposito[ i ].paid < this.gIvaContra && deposito[ i ].paid > 0) {
                lMontoSinIva = await this.amountWithoutIva(deposito[ i ].paid, this.gIva);
                lXcentIva = await this.xCentIva(lMontoSinIva, this.gIva);
                lXCubrir = this.round((this.round(this.gIvaContra) - this.round(deposito[ i ].paid)));

                dG++;

                lDispercion[ dG ] = {
                    payId: deposito[ i ].payId,
                    noGood: deposito[ i ].good,
                    amount: this.round(this.gIvaContra),
                    reference: this.gReferencia,
                    noTransferable: deposito[ i ].mandate,
                    payment: this.round(lMontoSinIva),
                    paymentAct: this.round(deposito[ i ].paid),
                    status: 'A',
                    impWithoutIva: this.round(lMontoSinIva),
                    iva: this.round(this.gIva),
                    amountIva: this.round(lXcentIva),
                    noAppointment: this.gNombramiento,
                    dateProcess: new Date(),
                    type: 'I',
                    insert: 'NW',
                    payCoverId: deposito[ i ].payId,
                    xCover: this.round(lXCubrir),
                };
            } else if (deposito[ i ].paid > this.gIvaContra) {

                lRound = Math.floor(deposito[ i ].paid / this.gIvaContra);

                for (let x = 1; x <= lRound || 0; x++) {
                    deposito[ i ].payId = this.round(deposito[ i ].payId) - this.round(this.gIvaContra);
                    lMontoSinIva = await this.amountWithoutIva(this.gIvaContra, this.gIva);
                    lXcentIva = await this.xCentIva(lMontoSinIva, this.gIva);

                    dG++;

                    lDispercion[ dG ] = {
                        payId: deposito[ i ].payId,
                        noGood: deposito[ i ].good,
                        amount: this.round(this.gIvaContra),
                        reference: this.gReferencia,
                        noTransferable: deposito[ i ].mandate,
                        payment: 0,
                        paymentAct: this.round(this.gIvaContra),
                        status: 'P',
                        impWithoutIva: this.round(lMontoSinIva),
                        iva: this.round(this.gIva),
                        amountIva: this.round(lXcentIva),
                        noAppointment: this.gNombramiento,
                        dateProcess: new Date(),
                        type: 'I',
                        insert: 'NW',
                        payCoverId: deposito[ i ].payId,
                        xCover: 0.0,
                    };
                }

                if (deposito[ i ].paid < this.gIvaContra && deposito[ i ].paid > 0) {
                    lMontoSinIva = await this.amountWithoutIva(deposito[ i ].paid, this.gIva);
                    lXcentIva = await this.xCentIva(lMontoSinIva, this.gIva);
                    lXCubrir = this.round((this.round(this.gIvaContra) - this.round(deposito[ i ].paid)));

                    lDispercion[ dG ] = {
                        payId: deposito[ i ].payId,
                        noGood: deposito[ i ].good,
                        amount: this.round(this.gIvaContra),
                        reference: this.gReferencia,
                        noTransferable: deposito[ i ].mandate,
                        payment: this.round(lMontoSinIva),
                        paymentAct: this.round(deposito[ i ].paid),
                        status: 'A',
                        impWithoutIva: this.round(lMontoSinIva),
                        iva: this.round(this.gIva),
                        amountIva: this.round(lXcentIva),
                        noAppointment: this.gNombramiento,
                        dateProcess: new Date(),
                        type: 'I',
                        insert: 'NW',
                        payCoverId: deposito[ i ].payId,
                        xCover: this.round(lXCubrir),
                    };

                    deposito[ i ].paid = 0;
                }

            } else if (deposito[ i ].paid = this.gIvaContra) {
                lMontoSinIva = await this.amountWithoutIva(this.gIvaContra, this.gIva);
                lXcentIva = await this.xCentIva(lMontoSinIva, this.gIva);

                dG++;

                lDispercion[ dG ] = {
                    payId: deposito[ i ].payId,
                    noGood: deposito[ i ].good,
                    amount: this.round(this.gIvaContra),
                    reference: this.gReferencia,
                    noTransferable: deposito[ i ].mandate,
                    payment: 0,
                    paymentAct: this.round(this.gIvaContra),
                    status: 'P',
                    impWithoutIva: this.round(lMontoSinIva),
                    iva: this.round(this.gIva),
                    amountIva: this.round(lXcentIva),
                    noAppointment: this.gNombramiento,
                    dateProcess: new Date(),
                    type: 'I',
                    insert: 'NW',
                    payCoverId: deposito[ i ].payId,
                    xCover: 0.0,
                };

                deposito[ i ].paid = 0;
            }

            // llena la lista global de dispersiones
            rDispercion.push(lDispercion);

            //ejecución del procedimiento
            this.insertDispersion({pOne: dto.pOne})
        }
    }
    //#endregion

    // TODO: Hacer el procedimiento y el DTO
    //#region PROCEDURE LLENA_ABONOS
    /**
     * PROCEDURE LLENA_ABONOS,
     * LLena los pagos que sólo tienen abono
     * @param {number} dto.pOne
     * @param {number} dto.pTwo
     * @param {number} dto.pThree
     * @return {*}  {Promise<any>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 877-1141
     */
    async fillAccreditations(dto: FillAccreditationsDto): Promise<any> {

    }
    //#endregion

    // TODO: Hacer el procedimiento y el DTO
    //#region PROCEDURE LLENA_ABONOS_DISPER
    /**
     * PROCEDURE LLENA_ABONOS_DISPER,
     * LLena los pagos que sólo tienen abono en las dispersiones
     * @return {*}  {Promise<any>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 1146-1399
     */
    async fillAccreditationDisper(): Promise<any> {
        let lResto: number = 0.0,
            lPagtot: number = 0.0,
            lXcent: number = 0.0,
            lNewmont: number = 0.0,
            lMontosinIva: number = 0.0,
            lxCentIva: number = 0.0,
            lxCubrir: number = 0.0,
            lIvatotal: number = 0.0,
            gK: number = 0;
        const gDepositos = this.gDepositos;
        const gDispercion = this.gDispersion;
        let lDispercion: any[] = [];

        for (const [ x, depos ] of gDepositos) {
            for (const [ d, dispersion ] of gDispercion) {

                if (dispersion[ d ].status == 'A' && dispersion[ d ].xc == 'A') {
                    if (!dispersion[ d ]?.deduxcent) {
                        lResto = this.round(dispersion[ d ].xCover);
                        if (depos[ x ].paid < lResto && depos[ x ].paid > 0) {
                            lMontosinIva = await this.amountWithoutIva(depos[ x ].paid, this.gIva);
                            lxCentIva = await this.xCentIva(lMontosinIva, dispersion[ d ].iva);
                            lxCubrir = this.round(lResto - depos[ x ].paid);
                            gK++;

                            lDispercion[ gK ] = {
                                payId: depos[ x ].payId,
                                noGood: dispersion[ d ].good,
                                amount: this.round(dispersion[ d ].amount),
                                reference: dispersion[ d ].reference,
                                noTransferable: dispersion[ d ].noTransferable,
                                payment: this.round(lMontosinIva),
                                paymentAct: this.round(depos[ x ].paid),
                                status: 'A',
                                impWithoutIva: this.round(lMontosinIva),
                                iva: this.round(dispersion[ d ].iva),
                                amountIva: this.round(lxCentIva),
                                deduxcent: dispersion[ d ].deduxcent,
                                deduValue: this.round(dispersion[ d ].deduValue),
                                noAppointment: dispersion[ d ].noAppointment,
                                dateProcess: new Date(),
                                type: 'I',
                                insert: 'NW',
                                payCoverId: depos[ x ].payId,
                                xCover: lxCubrir,
                                origin: dispersion[ d ].origin,
                            }

                            depos[ x ].paid = 0;
                            dispersion[ d ].status = 'X';

                            if (dispersion[ gK ].status == 'A') {
                                break;
                            }

                        } else if (depos[ x ].paid > lResto) {
                            lMontosinIva = await this.amountWithoutIva(lResto, dispersion[ d ].iva);
                            lxCentIva = await this.xCentIva(lMontosinIva, dispersion[ d ].iva);
                            gK++;

                            lDispercion[ gK ] = {
                                payId: depos[ x ].payId,
                                noGood: dispersion[ d ].good,
                                amount: this.round(dispersion[ d ].amount),
                                reference: dispersion[ d ].reference,
                                noTransferable: dispersion[ d ].noTransferable,
                                payment: this.round(lMontosinIva),
                                paymentAct: this.round(depos[ x ].paid),
                                status: 'C',
                                impWithoutIva: this.round(lMontosinIva),
                                iva: this.round(dispersion[ d ].iva),
                                amountIva: this.round(lxCentIva),
                                deduxcent: dispersion[ d ].deduxcent,
                                deduValue: this.round(dispersion[ d ].deduValue),
                                noAppointment: dispersion[ d ].noAppointment,
                                dateProcess: new Date(),
                                type: 'I',
                                insert: 'NW',
                                payCoverId: depos[ x ].payId,
                                xCover: 0,
                                origin: dispersion[ d ].origin,
                            }

                            depos[ x ].paid = this.round(depos[ x ].paid - lResto);
                            dispersion[ d ].status = 'X';
                        } else if (depos[ x ].paid == lResto) {
                            lMontosinIva = await this.amountWithoutIva(lResto, dispersion[ d ].iva);
                            lxCentIva = await this.xCentIva(lMontosinIva, dispersion[ d ].iva);
                            gK++;

                            lDispercion[ gK ] = {
                                payId: depos[ x ].payId,
                                noGood: dispersion[ d ].good,
                                amount: this.round(dispersion[ d ].amount),
                                reference: dispersion[ d ].reference,
                                noTransferable: dispersion[ d ].noTransferable,
                                payment: this.round(lMontosinIva),
                                paymentAct: this.round(depos[ x ].paid),
                                status: 'A',
                                impWithoutIva: this.round(lMontosinIva),
                                iva: this.round(dispersion[ d ].iva),
                                amountIva: this.round(lxCentIva),
                                deduxcent: dispersion[ d ].deduxcent,
                                deduValue: this.round(dispersion[ d ].deduValue),
                                noAppointment: dispersion[ d ].noAppointment,
                                dateProcess: new Date(),
                                type: 'I',
                                insert: 'NW',
                                payCoverId: depos[ x ].payId,
                                xCover: lxCubrir,
                                origin: dispersion[ d ].origin,
                            }

                            depos[ x ].paid = 0;
                            dispersion[ d ].status = 'X';
                        }
                    }
                }

                gDispercion.push(lDispercion);
            }
        }
    }
    //#endregion

    //#region PROCEDURE INS_DISPERSION
    /**
     * PROCEDURE INS_DISPERSION,
     * Guarda los datos de la dispersión temporalmente
     * @param {number} dto.pOne
     * @param {number} dtopTwo
     * @return {*}  {Promise<object>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 1404-1473
     */
    async insertDispersion(dto: GenericParamsDto): Promise<object> {
        let lIdprgens: number,
            lIdpgens: number,
            lMespag: number;
        let rDispercion: any[] = this.gDispersion; //DISPERSION
        let tpm: any = this.TmpPagosGensDepRepository; //TMP_PAGOS_GENS_DEP

        try {

            lIdprgens = await this.PaymentsgensDepositaryRepository
                .createQueryBuilder('pagos')
                .select('COALESCE(MAX(pagos.id_pagogens), 0)', 'max_id_pagogens')
                .execute().then((res) => {
                    return res[ 0 ].max_id_pagogens ?? 0;
                });

            lIdpgens = await this.PaymentsgensDepositaryRepository
                .createQueryBuilder('pagos')
                .select('COALESCE(MAX(pagos.id_pago_cubrio), 0)', 'max_id_pago_cubrio')
                .where('pagos.no_nombramiento = :nombramiento', { nombramiento: dto.pOne })
                .execute().then((res) => {
                    return res[ 0 ].max_id_pago_cubrio ?? 0;
                });

            //TODO: consultar que debo borrar
            // await this.TmpPagosGensDepRepository.delete({});
            for (const x in rDispercion) {
                if (rDispercion[ x ].type == 'U') {
                    rDispercion[ x ].insert = 'DB';

                    tpm.create({
                        payIdGens: rDispercion[ x ].payIdGens,
                        payId: rDispercion[ x ].payId,
                        noGoods: rDispercion[ x ].noGoods,
                        amount: this.round(rDispercion[ x ].amount),
                        reference: rDispercion[ x ].reference,
                        incometype: rDispercion[ x ].incometype,
                        not_transferring: rDispercion[ x ].not_transferring,
                        iva: rDispercion[ x ].iva,
                        insert: rDispercion[ x ].insert,
                        impWithoutIva: this.round(rDispercion[ x ].impWithoutIva),
                        origin: rDispercion[ x ].origin,
                        ivaAmount: this.round(rDispercion[ x ].ivaAmount),
                        payment: this.round(rDispercion[ x ].payment),
                        deduxcent: rDispercion[ x ].deduxcent,
                        deduvalue: this.round(rDispercion[ x ].deduvalue),
                        status: rDispercion[ x ].status,
                        no_appointment: rDispercion[ x ].no_appointment,
                        processDate: rDispercion[ x ].processDate,
                        type: rDispercion[ x ].type,
                        actPay: this.round(rDispercion[ x ].actPay),
                        cubrioPayId: rDispercion[ x ].cubrioPayId,
                        chkDedu: rDispercion[ x ].chkDedu
                    }).save();

                } else {
                    lIdprgens = lIdprgens + 1;
                    rDispercion[ x ].insert = 'NW';

                    if (rDispercion[ x ].status == 'X') {
                        rDispercion[ x ].status = 'A';
                    }

                    if (rDispercion[ x ].status != 'C') {
                        lIdpgens = lIdpgens + 1;
                    }

                    if (rDispercion[ x ].status == 'A') {
                        lMespag = lIdpgens;
                    }

                    if (rDispercion[ x ].status == 'C' && lMespag > 0) {
                        lIdpgens = lMespag
                    }

                    tpm.create({
                        payIdGens: lIdprgens,
                        payId: rDispercion[ x ].payId,
                        noGoods: rDispercion[ x ].noGoods,
                        amount: this.round(rDispercion[ x ].amount),
                        reference: rDispercion[ x ].reference,
                        incometype: rDispercion[ x ].incometype,
                        not_transferring: rDispercion[ x ].not_transferring,
                        iva: rDispercion[ x ].iva,
                        insert: rDispercion[ x ].insert,
                        impWithoutIva: this.round(rDispercion[ x ].impWithoutIva),
                        origin: rDispercion[ x ].origin,
                        ivaAmount: this.round(rDispercion[ x ].ivaAmount),
                        payment: this.round(rDispercion[ x ].payment),
                        deduxcent: rDispercion[ x ].deduxcent,
                        deduvalue: this.round(rDispercion[ x ].deduvalue),
                        status: rDispercion[ x ].status,
                        no_appointment: rDispercion[ x ].no_appointment,
                        processDate: rDispercion[ x ].processDate,
                        type: rDispercion[ x ].type,
                        actPay: this.round(rDispercion[ x ].actPay),
                        cubrioPayId: lIdpgens,
                        chkDedu: rDispercion[ x ].chkDedu
                    }).save();
                }
            }

            return {
                statusCode: HttpStatus.OK,
                message: [ 'OK' ]
            };
        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            };
        }
    }
    //#endregion

    //#region PROCEDURE INS_DISPERSIONBD
    /**
     * PROCEDURE INS_DISPERSIONBD,
     * Guarda los datos de la dispersión en la B.D.
     * @param {number} dto.pOne
     * @param {number} dto.pTwo
     * @return {*}  {Promise<object>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 1478-1549
     */
    async insertDispersionDb(dto: GenericParamsDto): Promise<object> {
        let lIdprgens: number = 0,
            lAbcu: number = 0,
            UorIquery: any;
        const tpmRep = this.TmpPagosGensDepRepository;
        const pGensDep = this.PaymentsgensDepositaryRepository;

        const L2 = await tpmRep.createQueryBuilder()
            .orderBy('payGensId', 'ASC')
            .execute().then((res) => {
                return res;
            });
        try {
            for (const i in L2) {
                if (L2[ i ].type == 'U') {

                    UorIquery = `UPDATE SERA.PAGOSGENS_DEPOSITARIAS
                    SET
                        ID_PAGO          = ${L2[ i ].payId},
                        NO_BIEN          = ${L2[ i ].noGood},
                        MONTO            = ${L2[ i ].amount},
                        REFERENCIA       = ${L2[ i ].reference},
                        TIPOINGRESO      = ${L2[ i ].typeInput},
                        NO_TRANSFERENTE  = ${L2[ i ].noTransferable},
                        IVA              = ${this.round(L2[ i ].iva)},
                        MONTO_IVA        = ${this.round(L2[ i ].amountIva)},
                        ABONO            = ${this.round(L2[ i ].payment)},
                        PAGO_ACT         = ${this.round(L2[ i ].paymentAct)},
                        DEDUXCENT        = ${L2[ i ].deduxcent},
                        DEDUVALOR        = ${this.round(L2[ i ].deduValue)},
                        STATUS           = ${L2[ i ].status},
                        NO_NOMBRAMIENTO  = ${L2[ i ].noAppointment},
                        ID_PAGO_CUBRIO   = ${L2[ i ].payCoverId},
                        FECHA_PROCESO    = ${L2[ i ].dateProcess},
                        IMP_SIN_IVA      = ${this.round(L2[ i ].impWithoutIva)},
                        OBSERV_PAGO      = ${L2[ i ].paymentObserv},
                        OBSERV_DEDU      = ${L2[ i ].deduObserv},
                        ABONO_CUBIERTO   = 1
                    WHERE
                        ID_PAGOGENS      = ${L2[ i ].payGensId}
                        AND NO_NOMBRAMIENTO = ${L2[ i ].noAppointment};`;

                } else if (L2[ i ].type == 'I') {
                    let noAppointment = L2[ i ].noAppointment;

                    lIdprgens = await pGensDep
                        .createQueryBuilder()
                        .select("COALESCE(MAX(ID_PAGOGENS), 0) + 1", "id")
                        .from("PAGOSGENS_DEPOSITARIAS", "p")
                        .where("p.NO_NOMBRAMIENTO = :noNombramiento", { noAppointment })
                        .execute().then((result) => {
                            return result ?? 1;
                        });

                    UorIquery = `INSERT INTO SERA.PAGOSGENS_DEPOSITARIAS (
                                ID_PAGOGENS, ID_PAGO, NO_BIEN, MONTO, REFERENCIA,
                                TIPOINGRESO, NO_TRANSFERENTE, IVA, IMP_SIN_IVA, OBSERV_PAGO,
                                MONTO_IVA, ABONO, DEDUXCENT, DEDUVALOR, STATUS, NO_NOMBRAMIENTO,
                                FECHA_PROCESO, PAGO_ACT, ID_PAGO_CUBRIO, OBSERV_DEDU, ABONO_CUBIERTO
                            ) VALUES (
                                ${lIdprgens},
                                ${L2[ i ].payId},
                                ${L2[ i ].noGood},
                                ${this.round(L2[ i ].amount)},
                                ${L2[ i ].reference},
                                ${L2[ i ].typeInput},
                                ${L2[ i ].noTransferable},
                                ${L2[ i ].iva},
                                ${this.round(L2[ i ].impWithoutIva)},
                                ${L2[ i ].paymentObserv},
                                ${this.round(L2[ i ].amountIva)},
                                ${this.round(L2[ i ].payment)},
                                ${L2[ i ].deduxcent},
                                ${this.round(L2[ i ].deduValue)},
                                ${L2[ i ].status},
                                ${L2[ i ].noAppointment},
                                ${L2[ i ].dateProcess},
                                ${this.round(L2[ i ].paymentAct)},
                                ${L2[ i ].payCoverId},
                                ${L2[ i ].deduObserv},
                                ${lAbcu}
                            ); `;

                }

                await pGensDep.query(UorIquery).then((result) => {
                    console.log(result);
                    return result;
                });
            }

            //Limpia las listas globales
            this.gDepositos.splice(0, this.gDepositos.length);
            this.gDispersion.splice(0, this.gDispersion.length);
            //TODO: descomentar una ves las cree
            // updateAccreditationGens(dto.pOne)
            // updatePaymentsRef(dto.pOne)

            return {
                statusCode: HttpStatus.OK,
                message: [ 'OK' ]
            };
        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            };
        }
    }
    //#endregion

    //#region PROCEDURE ACT_ABONOSGENS
    /**
     * PROCEDURE ACT_ABONOSGENS,
     * Actualiza los abonos existenmtes en la db para q ya no se
     * vuelvan a tomar en cuenta.
     * @param {number} dto.pOne
     * @return {*}  {Promise<object>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 1554-1581
     */
    async updateAccreditationGens(dto: GenericParamsDto): Promise<object> {
        let pagoGen: number;

        try {
            pagoGen = (
                await this.PaymentsgensDepositaryRepository
                    .createQueryBuilder('p')
                    .select('MAX(p.ID_PAGOGENS)', 'maxIdPagoGens')
                    .where('p.STATUS = :status', { status: 'C' })
                    .andWhere('p.NO_NOMBRAMIENTO = :nombr', { nombr: dto.pOne })
                    .getRawOne()
            ).maxIdPagoGens || 0;


            await this.PaymentsgensDepositaryRepository
                .createQueryBuilder('p')
                .update('SERA.PAGOSGENS_DEPOSITARIAS')
                .set({ ABONO_CUBIERTO: 1 })
                .where('p.STATUS = :status', { status: 'A' })
                .andWhere('p.ID_PAGOGENS < :pagoGen', { pagoGen })
                .andWhere('p.NO_NOMBRAMIENTO = :nombr', { nombr: dto.pOne })
                .execute();

            return {
                statusCode: HttpStatus.OK,
                message: [ 'OK' ]
            };
        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            };
        }
    }
    //#endregion

    //#region PROCEDURE ACT_PAGOSREF
    /**
     * PROCEDURE ACT_PAGOSREF,
     * Actualiza la validación del los pagos
     * @param {number} dto.pOne
     * @return {*}  {Promise<object>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 1586-1615
     */
    async updatePaymentsRef(dto: GenericParamsDto): Promise<object> {
        try {
            const updateQuery = `UPDATE PAGOREF_DEPOSITARIAS REF
                                SET REF.VALIDO_SISTEMA = 'S', REF.FECHA_VAL_SISTEMA = TRUNC(SYSDATE)
                                WHERE REF.VALIDO_SISTEMA = 'A'
                                AND REF.ID_PAGO IN(SELECT GEN.ID_PAGO
                                    FROM SERA.PAGOSGENS_DEPOSITARIAS GEN
                                    INNER JOIN NOMBRAMIENTOS_DEPOSITARIA ND
                                    ON GEN.NO_NOMBRAMIENTO = ND.NO_NOMBRAMIENTO
                                    INNER JOIN PERSONASXNOM_DEPOSITARIAS PXD
                                    ON ND.NO_PERSONA = PXD.NO_PERSONA AND PXD.PROCESAR = 'S' AND PXD.ENVIADO_SIRSAE = 'N'
                                    WHERE ND.NO_NOMBRAMIENTO = ${dto.pOne} AND ND.NO_BIEN != 0 AND ND.NO_PERSONA IS NOT NULL
            ); `;
            //TODO: consultar que debo borrar
            // await this.TmpPagosGensDepRepository.delete({});

            let response = await this.RefpayDepositoriesRepository.query(updateQuery).then((result) => {
                console.log(result);
                return result;
            });

            return {
                data: [ response ],
                statusCode: HttpStatus.OK,
                message: [ 'OK' ]
            };
        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            };
        }
    }
    //#endregion

    //#region PROCEDURE ELIM_DISPER_PAGOREF
    /**
     * PROCEDURE ELIM_DISPER_PAGOREF,
     * Elimina las dispersiones y regresa a como no validado 'N'
     * los pagos de acuerdo a la fecha de ejec.
     * @param {number} dto.pOne
     * @param {Date} dto.pDate
     * @return {*}  {Promise<object>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 1620-1653
     */
    async removeDisperPaymentsRef(dto: RemoveDisperPaymentsRefDto): Promise<object> {
        const response: any = this.RefpayDepositoriesRepository;

        try {
            await response.query(
                `UPDATE PAGOREF_DEPOSITARIAS REF
                SET REF.VALIDO_SISTEMA = 'A',
                    REF.FECHA_VAL_SISTEMA = NULL
                WHERE EXISTS (SELECT ND.NO_BIEN
                            FROM SERA.NOMBRAMIENTOS_DEPOSITARIA ND
                            WHERE ND.NO_NOMBRAMIENTO = $1
                            AND ND.NO_BIEN != 0
                            AND ND.NO_PERSONA IS NOT NULL
                            AND EXISTS (SELECT 1
                                        FROM SERA.PERSONASXNOM_DEPOSITARIAS PXD
                                        WHERE PXD.NO_NOMBRAMIENTO = $1
                                        AND PXD.NO_PERSONA = ND.NO_PERSONA
                                        AND PXD.PROCESAR = 'S'
                                        AND PXD.ENVIADO_SIRSAE = 'N')
                            )
                AND EXISTS (SELECT GEN.NO_BIEN
                            FROM SERA.PAGOSGENS_DEPOSITARIAS GEN
                            WHERE GEN.NO_NOMBRAMIENTO = $1
                            AND GEN.ID_PAGO = REF.ID_PAGO)
                AND REF.VALIDO_SISTEMA = 'S'
                AND REF.FECHA_VAL_SISTEMA = DATE_TRUNC('day', $2) ;
                DELETE FROM SERA.PAGOSGENS_DEPOSITARIAS
                WHERE DATE_TRUNC('day', FECHA_PROCESO) = DATE_TRUNC('day', $2)
                AND NO_NOMBRAMIENTO = $1`,
                [ dto.pOne, dto.pDate ]
            ).then((result: any) => {
                console.log(result);
                return result;
            });

            return {
                data: [ response ],
                statusCode: HttpStatus.OK,
                message: [ 'OK' ]
            };
        } catch (e) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: e.message,
            };
        }
    }
    //#endregion

    // TODO: Hacer el procedimiento y el DTO
    //#region PROCEDURE VALIDA_DEP
    /**
     * PROCEDURE VALIDA_DEP,
     * Efectua la conciliacion de los pagos
     * @param {number} dto.pOne
     * @param {Date} dto.pDate
     * @return {*}  {Promise<any>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 1724-1924
     */
    async validDep(dto: ValidDepDto): Promise<any> {

    }
    //#endregion

    // TODO: Hacer el procedimiento y el DTO
    //#region PROCEDURE PREP_OI
    /**
     * PROCEDURE PREP_OI,
     * Prepara los datos para enviar a las tablas temporales de
     * SIRSAE
     * @param {number} dto.pOne
     * @param {string} dto.pTwo
     * @return {*}  {Promise<any>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 1930-2160
     */
    async prerpOI(dto: PrepOIDto): Promise<any> {

    }
    //#endregion

    //#endregion

}