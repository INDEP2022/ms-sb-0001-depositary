import { Injectable, HttpStatus, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ParametersmodDepositoryEntity } from "../../infrastructure/entities/parametersmod-depository.entity";
import { refpayDepositoriesEntity } from "../../infrastructure/entities/refpay-depositories.entity";
import { TmpPagosGensDepEntity } from '../../infrastructure/entities/tmp-pagosgens-dep.entity';
import { paymentsgensDepositaryEntity } from "../../infrastructure/entities/paymentsgens-depositary.entity";
import { ExecDeductionsDto, FillAccreditationsDto, FillPaymentsDto, FullDepositDto, FullPaymentDto, GenericParamsDto, PrepOIDto, RemoveDisperPaymentsRefDto, ValidDep, ValidDepDto, } from "./dto/param.dto";
import { LocalDate } from "src/shared/config/text";
import { Deposito, DispercionAbonos, Dispersion } from "./dto/objects-procedure.dto";
import * as moment from 'moment';
@Injectable()
export class PaymentRefService {
    // TODO: cambiar variables y nombre de funciones a ingles
    //#region Variables Globales
    private gDepositos: Deposito[] = [];
    private gDispercionAbonos: DispercionAbonos[] = [];
    private gDispersion: Dispersion[] = [];
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
    ) {
        // this.prepOI({name:372,description:''})
        //2679
        // this.validDep({ name: 11, date: new Date('02/05/2023') }) 
    }

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
            { param: 'UR', address: 'D', cast: false, globalName: 'gUR' },
            { param: 'TPOPERACION', address: pDirec, cast: true, globalName: 'gTipoOperacion' },
            { param: 'ANEXO', address: pDirec, cast: true, globalName: 'gAnexo' },
            { param: 'TPOINGRESOG', address: pDirec, cast: true, globalName: 'gTipoIngresoG' },
            { param: 'TPOINGRESOT', address: pDirec, cast: true, globalName: 'gTipoIngresoT' },
            { param: 'TPOINGRESOP', address: pDirec, cast: true, globalName: 'gTipoIngresoP' },
            { param: 'TPOINGRESOR', address: pDirec, cast: true, globalName: 'gTipoIngresoR' },
            { param: 'RECOGASTOS', address: pDirec, cast: true, globalName: 'gRecoGastos' },
            { param: 'AREA', address: pDirec, cast: false, globalName: 'gArea' },
            { param: 'TPODOCUMENTO', address: 'D', cast: false, globalName: 'gTipoDoc' },
        ];

        try {

            const parameterQuery = this.ParametersmodDepositoryRepository.createQueryBuilder('par')
                .select(['parametro', 'direccion', 'valor'])
                .where('par.parametro IN (:...parametros)', { parametros: lParameters.map(p => p.param) })
                .andWhere('par.direccion IN (:...direcciones)', { direcciones: lParameters.map(p => p.address) });

            const parameters = await parameterQuery.getRawMany();

            const reducedResponse = parameters.reduce((acc, cur) => {
                const matchingParam = lParameters.find(p => p.param == cur.parametro && p.address == cur.direccion);

                this[matchingParam.globalName] = cur.valor

                if (matchingParam) {
                    const value = cur.valor;
                    if (value !== undefined) {
                        matchingParam.globalName = matchingParam.cast ? parseInt(value) : value;
                        acc.push({ [matchingParam.param]: matchingParam.globalName });
                    } else {
                        acc.push({ [matchingParam.param]: `No existe el parametro ${matchingParam.param} para la dirección ${matchingParam.address}` });
                    }
                }
                return acc;
            }, []);

            response.push(reducedResponse);

            return {
                data: response[0],
                statusCode: HttpStatus.OK,
                message: ['OK']
            };

        } catch (e) {

            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "No existen valores con la direccion " + pDirec,
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
    async fillPayments(dto: FullPaymentDto): Promise<any> {
        let lIdPago: number = 0, //L_IDPAGO
            lMonto: number = 0, //L_MONTO
            lMandato: number = 0, //L_MANDATO
            lBien: number = 0,//L_BIEN
            i: number = -1, //i
            lDepTot: number = 0,//L_DEPTOT
            lContra: number = 0.0, //L_CONTRA
            lIva: number = 0.0, //L_IVA
            lFecha: string; //L_FECHA

        this.gDepositos = []
        try {
            var date = LocalDate.getCustom(dto.date, "MM/DD/YYYY")

            let sql = `
            SELECT RFD.ID_PAGO , RFD.MONTO,
                (SELECT NO_TRANSFERENTE FROM SERA.EXPEDIENTES
                    WHERE NO_EXPEDIENTE = (SELECT NO_EXPEDIENTE FROM SERA.BIEN
                        WHERE NO_BIEN = RFD.NO_BIEN)) NO_TRANSFERENTE,
                RFD.NO_BIEN, ND.IMPORTE_CONTRAPRESTACION, ND.IVA
            FROM SERA.PAGOREF_DEPOSITARIAS RFD, sera.NOMBRAMIENTOS_DEPOSITARIA ND
            WHERE 
            RFD.FECHA_REGISTRO <= '${date}'
            AND RFD.VALIDO_SISTEMA  = 'A'
            AND RFD.NO_BIEN         = ND.NO_BIEN
            AND ND.NO_NOMBRAMIENTO  = ${dto.name}
           -- AND ND.NO_PERSONA       = ${dto.person}
            AND RFD.IDORDENINGRESO  IS NULL
            AND ND.IMPORTE_CONTRAPRESTACION   > 0
            ORDER BY RFD.ID_PAGO, RFD.MONTO DESC
        `
            const l8 = await this.ParametersmodDepositoryRepository.query(sql);

            for (const row of l8) {
                lIdPago = row.id_pago;
                lMonto = row.monto;
                lMandato = row.no_transferente;
                lBien = row.no_bien;
                lContra = row.importe_contraprestacion;
                lIva = row.iva;
                i++;
                this.gDepositos.push({
                    paid: Number(Number(row.monto).toFixed(2)),
                    payId: lIdPago,
                    remainder: lMonto,
                    mandate: lMandato,
                    good: lBien,
                    contra: lContra
                });

                lDepTot += this.round(lMonto);
                this.gContra = this.round(lContra); // CONTRAPRESTACIÓN
                this.gIva = lIva; // IVA TOTAL
                this.gIvaTotal = this.round(await this.xCentIva(this.gContra, this.gIva)); // VALOR DEL % DEL IVA
                this.gIvaContra = this.round((this.gContra + this.gIvaTotal)); // CONTRAPRESTACIÓN CON EL VALOR DEL % DEL IVA
            }


            let response = {
                "rDepositos": this.gDepositos,
                "lDepTot": lDepTot
            }

            return {
                data: response,
                statusCode: HttpStatus.OK,
                message: ['OK']
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
    amountWithoutIva(pMonto: number, pIva: number) {
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
     * @param {number} name
     * @param {number} good
     * @return {*} {Promise<object>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 179-226
     */
    async dispersionAccreditations(name: number, good: number): Promise<object> {
        try {
            const l1 = await this.ParametersmodDepositoryRepository.query(`
                SELECT ID_PAGOGENS,ID_PAGO,NO_BIEN,MONTO,REFERENCIA,TIPOINGRESO,NO_TRANSFERENTE,IVA,MONTO_IVA,ABONO,
                   (SELECT SUM(PAGO_ACT) FROM SERA.PAGOSGENS_DEPOSITARIAS WHERE NO_NOMBRAMIENTO = ${name} AND NO_BIEN = ${good} AND STATUS = 'A' AND (ABONO_CUBIERTO = 0 OR ABONO_CUBIERTO IS NULL))PAGO_ACT,
                   DEDUXCENT,DEDUVALOR,STATUS,NO_NOMBRAMIENTO,FECHA_PROCESO
                 FROM SERA.PAGOSGENS_DEPOSITARIAS
                 WHERE NO_NOMBRAMIENTO = ${name}
                   AND NO_BIEN = ${good}
                   AND STATUS = 'A'
                   AND (ABONO_CUBIERTO = 0 OR ABONO_CUBIERTO IS NULL)
                 ORDER BY ID_PAGOGENS`);



            let ga = 0;

            for (const row of l1) {
                ga++;
                this.gDispercionAbonos.push({
                    payGensId: row.id_pagogens,
                    payId: row.id_pago,
                    noGood: row.no_bien,
                    amount: Number(Number(row.monto).toFixed(2)),
                    reference: row.referencia,
                    typeInput: row.tipoingreso,
                    noTransferable: row.no_transferente,
                    iva: Number(Number(row.iva).toFixed(2)),
                    amountIva: Number(Number(row.monto_iva).toFixed(2)),
                    payment: Number(Number(row.abono).toFixed(2)),
                    paymentAct: row.pago_act ? Number(Number(row.pago_act).toFixed(2)) : null,
                    deduxcent: row.deduxcent,
                    deduValue: Number(Number(row.deduvalor).toFixed(2)),
                    status: row.status,
                    noAppointment: row.no_nombramiento,
                    dateProcess: row.fecha_proceso,
                    type: 'U',
                    insert: 'DB',
                });
            }

            let response = {
                "DispercionAbonos": this.gDispercionAbonos,
            }
            return {
                statusCode: HttpStatus.OK,
                message: ['OK'],
                data: response
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
                if (row.status == 'A') {
                    lStatus += 1;
                } else {
                    lStatus = 0;
                }

                if (
                    (row.origin == 'DB' && ['C', 'A'].includes(row.status)) ||
                    (row.origin == null && row.status !== 'C')
                ) {
                    if (lStatus <= 1) {
                        dG = dG + 1;

                        this.gDispercionAbonos.push({
                            payGensId: row.payGensId,
                            payId: row.payId,
                            noGood: row.noGood,
                            amount: Number(row.amount.toFixed(2)),
                            reference: row.reference,
                            typeInput: Number(row.typeInput),
                            noTransferable: row.noTransferable,
                            iva: Number(row.iva.toFixed(2)),
                            amountIva: Number(row.amountIva.toFixed(2)),
                            paymentAct: row.origin == 'DB' ? Number(row.paymentAct.toFixed(2)) : 0.0,
                            status: row.origin == 'DB' ? row.status : 'A',
                            payment: Number(row.payment.toFixed(2)),
                            deduxcent: row.deduxcent,
                            deduValue: Number(row.deduValue.toFixed(2)),
                            noAppointment: row.noAppointment,
                            dateProcess: row.dateProcess,
                            type: row.type,
                            insert: row.insert,
                            xcentdedu: row.xcentdedu,
                            valuededu: row.valuededu,
                            impWithoutIva: row.impWithoutIva,
                            chkdedu: row.chkDedu ?? 0,
                            origin: row.origin
                        });

                        // TODO: Consultar si se va a guardar en la tabla temporal
                        // await this.TmpPagosGensDepRepository.save(rDispercionAbonos[dG]);

                        if (gAppointment == 0 || gReference == null) {
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
                data: [response],
                statusCode: HttpStatus.OK,
                message: ['OK']
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
            dG: number = -1;
        let lDepositos: any[] = this.gDepositos; //DEPOSITOS
        let lDispercionAbonos: any[] = this.gDispercionAbonos; //DISPER_ABONOS
        let lDispercion: any = [];
        //DISPERSION
        try {
            this.gDispersion = []//LIMPIA LA LISTA

            for (const deposito of lDepositos) {
                for (const disperAbonos of lDispercionAbonos) {
                    if (deposito.paid == 0) {
                        break;
                    }

                    if (disperAbonos.origen == 'DB' && disperAbonos.status != 'X') {
                        dG++;
                        this.gDispersion.push({
                            payId: disperAbonos.payGensId, //ID_PAGO
                            noGood: disperAbonos.noGood, //NO_BIEN
                            amount: disperAbonos.amount, //IMPORTE
                            reference: disperAbonos.reference, //REFERENCIA
                            typeInput: disperAbonos.typeInput, //TIPO_ENTRADA
                            noTransferable: disperAbonos.noTransferable, //NO_TRANSFERIBLE
                            payment: disperAbonos.payment, //ABONO
                            paymentAct: disperAbonos.paymentAct, //ABONO_ACT
                            status: disperAbonos.status, //STATUS
                            impWithoutIva: disperAbonos.impWithoutIva, //IMP_SIN_IVA
                            iva: disperAbonos.iva, //IVA
                            amountIva: disperAbonos.amountIva, //IMPORTE_IVA
                            noAppointment: disperAbonos.noAppointment, //NO_CITA
                            dateProcess: disperAbonos.dateProcess, //FECHA_PROCESO
                            type: disperAbonos.type, //TIPO
                            insert: disperAbonos.insert, //INSERTO
                            payCoverId: disperAbonos.payCoverId, //ID_PAGO_CUBRIO
                            xCover: disperAbonos.xCover, //X_CUBRIR
                            origin: disperAbonos.origin, //ORIGEN
                            deduxcent: disperAbonos.deduxcent, //DEDUXCENT
                            deduValue: disperAbonos.deduValue, //DEDUVALOR
                            chkDedu: disperAbonos.chkDedu, //CHK_DEDU
                        });
                        deposito.paid = deposito.paid - disperAbonos.amount;
                        disperAbonos.status = 'X';
                    } else {
                        if (disperAbonos.status == 'A') {

                            if (disperAbonos.deduxcent == 0 || disperAbonos.deduxcent == null) {
                                if (disperAbonos.insert == 'DB') {
                                    lResto = this.round(this.round(this.gIvaContra) - this.round(disperAbonos.paymentAct));
                                    lPagTot = this.round(lResto) + this.round(disperAbonos.paymentAct);
                                } else {
                                    lResto = this.round(this.gIvaContra);
                                    lPagTot = this.round(this.gIvaContra);
                                }

                                if (deposito.paid < lResto && deposito.paid > 0) {
                                    lMontosSinIva = await this.amountWithoutIva(deposito.paid, disperAbonos.iva);
                                    lXCentIva = await this.xCentIva(lMontosSinIva, disperAbonos.iva);
                                    lXCubrir = this.round(this.gIvaContra) - this.round(this.round(disperAbonos.paymentAct) + this.round(deposito.paid));
                                    dG++;

                                    lDispercion = {
                                        payId: disperAbonos.payGensId, //ID_PAGO
                                        noGood: disperAbonos.noGood, //NO_BIEN
                                        amount: this.round(disperAbonos.paid), //IMPORTE
                                        reference: disperAbonos.reference, //REFERENCIA
                                        noTransferable: disperAbonos.noTransferable, //NO_TRANSFERIBLE
                                        payment: this.round(lMontosSinIva), //ABONO
                                        paymentAct: this.round(disperAbonos.paymentAct), //ABONO_ACT
                                        status: disperAbonos.status, //STATUS
                                        impWithoutIva: this.round(lMontosSinIva), //IMP_SIN_IVA
                                        iva: this.round(disperAbonos.iva), //IVA
                                        amountIva: this.round(lXCentIva), //IMPORTE_IVA
                                        noAppointment: disperAbonos.noAppointment, //NO_CITA
                                        dateProcess: disperAbonos.dateProcess, //FECHA_PROCESO
                                        type: disperAbonos.type, //TIPO
                                        insert: disperAbonos.insert, //INSERTO
                                        payCoverId: disperAbonos.payCoverId, //ID_PAGO_CUBRIO
                                        xCover: this.round(lXCubrir), //X_CUBRIR
                                        deduxcent: disperAbonos.deduxcent, //DEDUXCENT
                                        deduValue: this.round(disperAbonos.deduValue), //DEDUVALOR
                                        chkDedu: disperAbonos.chkDedu, //CHK_DEDU
                                    }

                                    this.gDispersion.push(lDispercion);
                                    disperAbonos.paymentAct = this.round(this.round(disperAbonos.paymentAct) + this.round(deposito.paid));
                                    if (disperAbonos.insert != 'DB') {
                                        disperAbonos.insert = 'DB';
                                    }

                                    deposito.paid = 0;

                                    if (lDispercion.payId == 0 || lDispercion.payId == null) {
                                        disperAbonos.payId = deposito.payId;
                                    }

                                    if (disperAbonos.status == 'A') {
                                        break;
                                    }

                                } else if (deposito.paid >= lResto) {
                                    lMontosSinIva = await this.amountWithoutIva(lResto, disperAbonos.iva);
                                    lXCentIva = await this.xCentIva(lMontosSinIva, disperAbonos.iva);
                                    dG++;

                                    lDispercion = {
                                        payId: disperAbonos.payGensId, //ID_PAGO
                                        noGood: disperAbonos.noGood, //NO_BIEN
                                        amount: this.round(disperAbonos.paid), //IMPORTE
                                        reference: disperAbonos.reference, //REFERENCIA
                                        noTransferable: disperAbonos.noTransferable, //NO_TRANSFERIBLE
                                        payment: disperAbonos.inset == 'DB' ? this.round(lMontosSinIva) : 0, //ABONO
                                        paymentAct: this.round(lResto), //ABONO_ACT
                                        status: disperAbonos.inset == 'DB' ? 'C' : 'P', //STATUS
                                        impWithoutIva: this.round(lMontosSinIva), //IMP_SIN_IVA
                                        iva: this.round(disperAbonos.iva), //IVA
                                        amountIva: this.round(lXCentIva), //MONTO_IVA
                                        noAppointment: disperAbonos.noAppointment, //NO_NOMBRAMIENTO
                                        dateProcess: disperAbonos.dateProcess, //FECHA_PROCESO
                                        type: disperAbonos.type, //TIPO
                                        insert: disperAbonos.insert, //INSERTO
                                        payCoverId: disperAbonos.payCoverId, //ID_PAGO_CUBRIO
                                        xCover: 0, //X_CUBRIR
                                        deduxcent: disperAbonos.deduxcent, //DEDUXCENT
                                        deduValue: this.round(disperAbonos.deduValue), //DEDUVALOR
                                        chkDedu: disperAbonos.chkDedu, //CHK_DEDU
                                    }

                                    this.gDispersion.push(lDispercion);
                                    disperAbonos.status = 'P';
                                    deposito.paid = this.round(this.round(deposito.paid) - this.round(lResto));

                                    if (lDispercion.payId == 0 || lDispercion.payId == null) {
                                        lDispercion.payId = this.round(deposito.payId);
                                    }
                                } else if (deposito.paid == lResto) {
                                    lMontosSinIva = await this.amountWithoutIva(lResto, disperAbonos.iva);
                                    lXCentIva = await this.xCentIva(lMontosSinIva, disperAbonos.iva);
                                    dG++;

                                    lDispercion = {
                                        payId: disperAbonos.payGensId, //ID_PAGO
                                        noGood: disperAbonos.noGood, //NO_BIEN
                                        amount: this.round(disperAbonos.paid), //IMPORTE
                                        reference: disperAbonos.reference, //REFERENCIA
                                        noTransferable: disperAbonos.noTransferable, //NO_TRANSFERIBLE
                                        payment: disperAbonos.inset == 'DB' ? this.round(lMontosSinIva) : 0, //ABONO
                                        paymentAct: this.round(lResto), //ABONO_ACT
                                        status: disperAbonos.inset == 'DB' ? 'C' : 'P', //STATUS
                                        impWithoutIva: this.round(lMontosSinIva), //IMP_SIN_IVA
                                        iva: this.round(disperAbonos.iva), //IVA
                                        amountIva: this.round(lXCentIva), //MONTO_IVA
                                        noAppointment: disperAbonos.noAppointment, //NO_NOMBRAMIENTO
                                        dateProcess: disperAbonos.dateProcess, //FECHA_PROCESO
                                        type: disperAbonos.type, //TIPO
                                        insert: disperAbonos.insert, //INSERTO
                                        payCoverId: deposito.payId, //ID_PAGO_CUBRIO
                                        xCover: 0, //X_CUBRIR
                                        deduxcent: disperAbonos.deduxcent, //DEDUXCENT
                                        deduValue: this.round(disperAbonos.deduValue), //DEDUVALOR
                                        chkDedu: disperAbonos.chkDedu, //CHK_DEDU
                                    }

                                    this.gDispersion.push(lDispercion);
                                    disperAbonos.status = 'P';
                                    deposito.paid = 0;

                                    if (lDispercion.payId == 0 || lDispercion.payId == null) {
                                        lDispercion.payId = this.round(deposito.payId);
                                    }
                                }
                            } else if (disperAbonos.deduxcent > 0) {
                                lXCent = this.round(disperAbonos.deduValue);
                                lNewContra = this.round(this.round(this.gContra) - this.round(lXCent));
                                lNewMont = this.round(lNewContra + this.round(this.gIvaTotal));

                                if (disperAbonos.insert == 'DB') {
                                    lResto = this.round(this.round(lNewMont) - this.round(disperAbonos.paymentAct));
                                    lPagTot = this.round(this.round(lResto) + this.round(disperAbonos.paymentAct));
                                } else {
                                    lResto = this.round(lNewMont);
                                    lPagTot = this.round(lNewMont);
                                }

                                if (disperAbonos.chkDedu == 1) {
                                    lIva = this.round(disperAbonos.iva);
                                } else {
                                    lIva = await this.calculateIva(disperAbonos.iva, disperAbonos.deduxcent ?? 0);
                                }

                                if (deposito.paid < lResto && deposito.paid > 0) {
                                    lMontosSinIva = await this.amountWithoutIva(deposito.paid, lIva);
                                    lXCentIva = await this.xCentIva(lMontosSinIva, lIva);
                                    lXCubrir = this.round(lResto) - this.round(this.round(disperAbonos.paymentAct) + this.round(deposito.paid));
                                    dG++;

                                    lDispercion = {
                                        payId: disperAbonos.payGensId, //ID_PAGO
                                        noGood: disperAbonos.noGood, //NO_BIEN
                                        amount: this.round(disperAbonos.paid), //IMPORTE
                                        reference: disperAbonos.reference, //REFERENCIA
                                        noTransferable: disperAbonos.noTransferable, //NO_TRANSFERIBLE
                                        payment: this.round(lMontosSinIva), //ABONO
                                        paymentAct: this.round(disperAbonos.paymentAct), //ABONO_ACT
                                        status: disperAbonos.status, //STATUS
                                        impWithoutIva: this.round(lMontosSinIva), //IMP_SIN_IVA
                                        iva: this.round(lIva), //IVA
                                        amountIva: this.round(lXCentIva), //IMPORTE_IVA
                                        noAppointment: disperAbonos.noAppointment, //NO_CITA
                                        dateProcess: disperAbonos.dateProcess, //FECHA_PROCESO
                                        type: disperAbonos.type, //TIPO
                                        insert: disperAbonos.insert, //INSERTO
                                        payCoverId: disperAbonos.payCoverId, //ID_PAGO_CUBRIO
                                        xCover: this.round(lXCubrir), //X_CUBRIR
                                        deduxcent: disperAbonos.deduxcent, //DEDUXCENT
                                        deduValue: this.round(disperAbonos.deduValue), //DEDUVALOR
                                        chkDedu: 1, //CHK_DEDU
                                    }

                                    this.gDispersion.push(lDispercion);
                                    disperAbonos.paymentAct = this.round(this.round(disperAbonos.paymentAct) + this.round(deposito.paid));

                                    if (disperAbonos.insert != 'DB') {
                                        disperAbonos.insert = 'DB'
                                    }

                                    deposito.paid = 0;

                                    if (lDispercion.payId == 0 || lDispercion.payId == null) {
                                        lDispercion.payId = deposito.payId;
                                    }

                                    if (disperAbonos.status == 'A') {
                                        break;
                                    }

                                } else if (deposito.paid > lResto) {
                                    lMontosSinIva = await this.amountWithoutIva(lResto, disperAbonos.iva);
                                    lXCentIva = await this.xCentIva(lMontosSinIva, disperAbonos.iva);
                                    dG++;

                                    lDispercion = {
                                        payId: disperAbonos.payGensId, //ID_PAGO
                                        noGood: disperAbonos.noGood, //NO_BIEN
                                        amount: this.round(disperAbonos.paid), //IMPORTE
                                        reference: disperAbonos.reference, //REFERENCIA
                                        noTransferable: disperAbonos.noTransferable, //NO_TRANSFERIBLE
                                        payment: disperAbonos.inset == 'DB' ? this.round(lMontosSinIva) : 0, //ABONO
                                        paymentAct: this.round(lResto), //ABONO_ACT
                                        status: disperAbonos.inset == 'DB' ? 'C' : 'P', //STATUS
                                        impWithoutIva: this.round(lMontosSinIva), //IMP_SIN_IVA
                                        iva: this.round(lIva), //IVA
                                        amountIva: this.round(lXCentIva), //MONTO_IVA
                                        noAppointment: disperAbonos.noAppointment, //NO_NOMBRAMIENTO
                                        dateProcess: disperAbonos.dateProcess, //FECHA_PROCESO
                                        type: disperAbonos.type, //TIPO
                                        insert: disperAbonos.insert, //INSERTO
                                        payCoverId: deposito.payId, //ID_PAGO_CUBRIO
                                        xCover: 0, //X_CUBRIR
                                        deduxcent: disperAbonos.deduxcent, //DEDUXCENT
                                        deduValue: this.round(disperAbonos.deduValue), //DEDUVALOR
                                        chkDedu: 1, //CHK_DEDU
                                    }

                                    this.gDispersion.push(lDispercion);
                                    disperAbonos.status = 'P';
                                    deposito.paid = this.round(this.round(deposito.paid) - this.round(lResto));

                                    if (lDispercion.payId == 0 || lDispercion.payId == null) {
                                        lDispercion.payId = deposito.payId;
                                    }
                                } else if (deposito.paid == lResto) {
                                    lMontosSinIva = await this.amountWithoutIva(lResto, lIva);
                                    lXCentIva = await this.xCentIva(lMontosSinIva, lIva);
                                    dG++;

                                    lDispercion = {
                                        payId: disperAbonos.payGensId, //ID_PAGO
                                        noGood: disperAbonos.noGood, //NO_BIEN
                                        amount: this.round(disperAbonos.paid), //IMPORTE
                                        reference: disperAbonos.reference, //REFERENCIA
                                        noTransferable: disperAbonos.noTransferable, //NO_TRANSFERIBLE
                                        payment: disperAbonos.inset == 'DB' ? this.round(lMontosSinIva) : 0, //ABONO
                                        paymentAct: this.round(deposito.paid), //ABONO_ACT
                                        status: disperAbonos.inset == 'DB' ? 'C' : 'P', //STATUS
                                        impWithoutIva: this.round(lMontosSinIva), //IMP_SIN_IVA
                                        iva: this.round(lIva), //IVA
                                        amountIva: this.round(lXCentIva), //MONTO_IVA
                                        noAppointment: disperAbonos.noAppointment, //NO_NOMBRAMIENTO
                                        dateProcess: disperAbonos.dateProcess, //FECHA_PROCESO
                                        type: disperAbonos.type, //TIPO
                                        insert: disperAbonos.insert, //INSERTO
                                        payCoverId: deposito.payId, //ID_PAGO_CUBRIO
                                        xCover: 0, //X_CUBRIR
                                        deduxcent: disperAbonos.deduxcent, //DEDUXCENT
                                        deduValue: this.round(disperAbonos.deduValue), //DEDUVALOR
                                        chkDedu: 1, //CHK_DEDU
                                    }

                                    this.gDispersion.push(lDispercion);
                                    disperAbonos.status = 'P';
                                    deposito.paid = 0;

                                    if (lDispercion.payId == 0 || lDispercion.payId == null) {
                                        lDispercion.payId = deposito.payId;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return {
                statusCode: HttpStatus.OK,
                message: ['OK']
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
    async execDeductions(dto: ExecDeductionsDto) {
        Logger.debug(`#################  #####################`);
        console.log(dto)
        Logger.debug(`##########################################`);
        let lPago: number,
            lNewMont: number,
            lXcent: number,
            lSobra: number,
            lResto: number,
            lRound: number = 0,
            lMontoSinIva: number,
            lXcentIva: number,
            lXCubrir: number,
            dG: number = -1;

        lXcent = 0.0;
        lNewMont = 0.0;
        lSobra = 0.0;
        lPago = null;
        lResto = 0.0;
        lMontoSinIva = 0.0;
        lXcentIva = 0.0;
        lXCubrir = 0.0;
        const dateNow = LocalDate.getNow();

        this.gSumaTot = await this.fillPayments({ name: dto.pOne, person: dto.pTwo, date: dto.pDate, phase: 1 }).then((res) => {
            return res.data.lDepTot;
        });

        // TODO: validar si las asigno a alguna variable
        await this.dispersionDeductions();
        await this.fillPaymentsDisp();

        let lDepositos = this.gDepositos;
        let rDispercion = this.gDispersion;

        for (let deposito of this.gDepositos) {
            let dispersion: Dispersion
            if (deposito.paid < this.gIvaContra && deposito.paid > 0) {
                lMontoSinIva = await this.amountWithoutIva(deposito.paid, this.gIva);
                lXcentIva = await this.xCentIva(lMontoSinIva, this.gIva);
                lXCubrir = this.round((this.round(this.gIvaContra) - this.round(deposito.paid)));

                dG++;

                dispersion = {
                    payId: deposito.payId,
                    noGood: deposito.good,
                    amount: this.round(this.gIvaContra),
                    reference: this.gReferencia,
                    noTransferable: deposito.mandate,
                    payment: this.round(lMontoSinIva),
                    paymentAct: this.round(deposito.paid),
                    status: 'A',
                    impWithoutIva: this.round(lMontoSinIva),
                    iva: this.round(this.gIva),
                    amountIva: this.round(lXcentIva),
                    noAppointment: this.gNombramiento,
                    dateProcess: new Date(dateNow),
                    type: 'I',
                    insert: 'NW',
                    payCoverId: deposito.payId,
                    xCover: this.round(lXCubrir),
                };
                this.gDispersion.push(dispersion)

            } else if (deposito.paid > this.gIvaContra) {

                lRound = Math.floor(deposito.paid / this.gIvaContra);

                for (let x = 1; x <= lRound || 0; x++) {
                    deposito.payId = this.round(deposito.payId) - this.round(this.gIvaContra);
                    lMontoSinIva = await this.amountWithoutIva(this.gIvaContra, this.gIva);
                    lXcentIva = await this.xCentIva(lMontoSinIva, this.gIva);

                    dG++;

                    dispersion = {
                        payId: deposito.payId,
                        noGood: deposito.good,
                        amount: this.round(this.gIvaContra),
                        reference: this.gReferencia,
                        noTransferable: deposito.mandate,
                        payment: 0,
                        paymentAct: this.round(this.gIvaContra),
                        status: 'P',
                        impWithoutIva: this.round(lMontoSinIva),
                        iva: this.round(this.gIva),
                        amountIva: this.round(lXcentIva),
                        noAppointment: this.gNombramiento,
                        dateProcess: new Date(dateNow),
                        type: 'I',
                        insert: 'NW',
                        payCoverId: deposito.payId,
                        xCover: 0.0,
                    };
                    this.gDispersion.push(dispersion)

                }

                if (deposito.paid < this.gIvaContra && deposito.paid > 0) {
                    lMontoSinIva = await this.amountWithoutIva(deposito.paid, this.gIva);
                    lXcentIva = await this.xCentIva(lMontoSinIva, this.gIva);
                    lXCubrir = this.round((this.round(this.gIvaContra) - this.round(deposito.paid)));

                    dispersion = {
                        payId: deposito.payId,
                        noGood: deposito.good,
                        amount: this.round(this.gIvaContra),
                        reference: this.gReferencia,
                        noTransferable: deposito.mandate,
                        payment: this.round(lMontoSinIva),
                        paymentAct: this.round(deposito.paid),
                        status: 'A',
                        impWithoutIva: this.round(lMontoSinIva),
                        iva: this.round(this.gIva),
                        amountIva: this.round(lXcentIva),
                        noAppointment: this.gNombramiento,
                        dateProcess: new Date(dateNow),
                        type: 'I',
                        insert: 'NW',
                        payCoverId: deposito.payId,
                        xCover: this.round(lXCubrir),
                    };
                    this.gDispersion.push(dispersion)

                    deposito.paid = 0;
                }

            } else if (deposito.paid = this.gIvaContra) {
                lMontoSinIva = await this.amountWithoutIva(this.gIvaContra, this.gIva);
                lXcentIva = await this.xCentIva(lMontoSinIva, this.gIva);

                dG++;

                dispersion = {
                    payId: deposito.payId,
                    noGood: deposito.good,
                    amount: this.round(this.gIvaContra),
                    reference: this.gReferencia,
                    noTransferable: deposito.mandate,
                    payment: 0,
                    paymentAct: this.round(this.gIvaContra),
                    status: 'P',
                    impWithoutIva: this.round(lMontoSinIva),
                    iva: this.round(this.gIva),
                    amountIva: this.round(lXcentIva),
                    noAppointment: this.gNombramiento,
                    dateProcess: new Date(dateNow),
                    type: 'I',
                    insert: 'NW',
                    payCoverId: deposito.payId,
                    xCover: 0.0,
                };
                this.gDispersion.push(dispersion)

                deposito.paid = 0;
            }

            // llena la lista global de dispersiones

            //ejecución del procedimiento
            await this.insertDispersion({ pOne: dto.pOne })
        }
        return {
            statusCode:200,
            message:["OK"]
        }
    }
    //#endregion

    // TODO: Hacer el procedimiento y el DTO
    //#region PROCEDURE LLENA_ABONOS
    /**
     * PROCEDURE LLENA_ABONOS,
     * LLena los pagos que sólo tienen abono
     * @param {number} dto.name
     * @param {number} dto.good
     * @param {number} dto.process
     * @return {*}  {Promise<any>}
     * @memberof PACKAGE BODY SERA.PAGOSREF_DEPOSITARIA lineas 877-1141
     */
    async fillAccreditations(dto: FullDepositDto): Promise<any> {
        var L_RESTO: number = 0.0;
        var L_PAGTOT: number = 0.0;
        var L_XCENT: number = 0.0;
        var L_NEWMONT: number = 0.0;
        var L_MONTOSIN_IVA: number = 0
        var L_XCENTIVA: number = 0
        var L_XCUBRIR: number = 0.0;
        var L_IVA: number = 0
        var L_IVATOTAL: number = 0.0;
        if (dto.process == 1) {
            this.gDispercionAbonos = []

            var r = await this.dispersionAccreditations(dto.name, dto.good)

            L_RESTO = 0.0;
            L_PAGTOT = 0.0;
            L_XCENT = 0.0;
            L_NEWMONT = 0.0;
            L_XCUBRIR = 0.0;
            L_IVA = 0.0;
            L_IVATOTAL = 0.0

            for (const deposito of this.gDepositos) {

                await this.fillAccreditationDisper()

                for (const disperAbonos of this.gDispercionAbonos) {
                    L_MONTOSIN_IVA = 0.0;
                    L_XCENTIVA = 0.0;
                    if (disperAbonos.status == 'A') {
                        let dispersion: any = {}
                        if (!disperAbonos.deduxcent) {
                            L_RESTO = Number((this.gIvaContra - disperAbonos.paymentAct).toFixed(2))
                            L_PAGTOT = Number((L_RESTO + Number(disperAbonos.paymentAct)).toFixed(2))
                            if (deposito.paid < L_RESTO && deposito.paid > 0 && L_RESTO > 0) {
                                L_MONTOSIN_IVA = Number((await this.amountWithoutIva(deposito.paid, disperAbonos.iva)).toFixed(2));
                                L_XCENTIVA = Number((await this.xCentIva(L_MONTOSIN_IVA, disperAbonos.iva)).toFixed(2));
                                L_XCUBRIR = Number((this.gIvaContra - (disperAbonos.paymentAct + deposito.paid)).toFixed(2))

                                dispersion.payId = deposito.payId
                                dispersion.noGood = disperAbonos.noGood
                                dispersion.amount = this.round(disperAbonos.amount);
                                dispersion.reference = disperAbonos.reference
                                dispersion.noTransferable = disperAbonos.noTransferable
                                dispersion.payment = this.round(L_MONTOSIN_IVA)
                                dispersion.paymentAct = this.round(deposito.paid)
                                dispersion.status = 'A'
                                dispersion.impWithoutIva = this.round(L_MONTOSIN_IVA)
                                dispersion.iva = this.round(disperAbonos.iva),
                                    dispersion.amountIva = this.round(L_XCENTIVA)
                                dispersion.deduxcent = disperAbonos.deduxcent
                                dispersion.deduValue = this.round(disperAbonos.deduValue)
                                dispersion.noAppointment = disperAbonos.noAppointment
                                dispersion.dateProcess = LocalDate.getNow()
                                dispersion.type = 'I'
                                dispersion.insert = 'NW'
                                dispersion.payCoverId = deposito.payId
                                dispersion.xCover = L_XCUBRIR
                                dispersion.origin = disperAbonos.insert

                                deposito.paid = 0;
                                disperAbonos.status = 'C';

                                if (dispersion.status == 'A') {
                                    break;
                                }
                            } else if (deposito.paid > L_RESTO && L_RESTO > 0) {
                                L_MONTOSIN_IVA = Number((await this.amountWithoutIva(L_RESTO, disperAbonos.iva)).toFixed(2));
                                L_XCENTIVA = Number((await this.xCentIva(L_MONTOSIN_IVA, disperAbonos.iva)).toFixed(2));


                                dispersion.payId = deposito.payId
                                dispersion.noGood = disperAbonos.noGood
                                dispersion.amount = this.round(disperAbonos.amount);
                                dispersion.reference = disperAbonos.reference
                                dispersion.noTransferable = disperAbonos.noTransferable
                                dispersion.payment = this.round(L_MONTOSIN_IVA)
                                dispersion.paymentAct = this.round(deposito.paid)
                                dispersion.status = 'C'
                                dispersion.impWithoutIva = this.round(L_MONTOSIN_IVA)
                                dispersion.iva = this.round(disperAbonos.iva),
                                    dispersion.amountIva = this.round(L_XCENTIVA)
                                dispersion.deduxcent = disperAbonos.deduxcent
                                dispersion.deduValue = this.round(disperAbonos.deduValue)
                                dispersion.noAppointment = disperAbonos.noAppointment
                                dispersion.dateProcess = LocalDate.getNow()
                                dispersion.type = 'I'
                                dispersion.insert = 'NW'
                                dispersion.payCoverId = deposito.payId
                                dispersion.xCover = 0
                                dispersion.origin = disperAbonos.insert

                                deposito.paid = Number((deposito.paid - L_RESTO).toFixed(2))
                                disperAbonos.status = 'C';

                            } else if (deposito.paid == L_RESTO && L_RESTO > 0) {
                                L_MONTOSIN_IVA = L_MONTOSIN_IVA = Number((await this.amountWithoutIva(L_RESTO, disperAbonos.iva)).toFixed(2));
                                L_XCENTIVA = Number((await this.xCentIva(L_MONTOSIN_IVA, disperAbonos.iva)).toFixed(2));

                                dispersion.payId = deposito.payId
                                dispersion.noGood = disperAbonos.noGood
                                dispersion.amount = this.round(disperAbonos.amount);
                                dispersion.reference = disperAbonos.reference
                                dispersion.noTransferable = disperAbonos.noTransferable
                                dispersion.payment = this.round(L_MONTOSIN_IVA)
                                dispersion.paymentAct = this.round(deposito.paid)
                                dispersion.status = 'C'
                                dispersion.impWithoutIva = this.round(L_MONTOSIN_IVA)
                                dispersion.iva = this.round(disperAbonos.iva),
                                    dispersion.amountIva = this.round(L_XCENTIVA)
                                dispersion.deduxcent = disperAbonos.deduxcent
                                dispersion.deduValue = this.round(disperAbonos.deduValue)
                                dispersion.noAppointment = disperAbonos.noAppointment
                                dispersion.dateProcess = LocalDate.getNow()
                                dispersion.type = 'I'
                                dispersion.insert = 'NW'
                                dispersion.payCoverId = deposito.payId
                                dispersion.xCover = 0
                                dispersion.origin = disperAbonos.insert
                                deposito.paid = 0;
                                disperAbonos.status = 'C';

                            }
                        } else if (disperAbonos.deduxcent > 0) {

                            L_IVATOTAL = Number((await this.xCentIva(this.gContra, this.gIva)).toFixed(2));
                            L_XCENT = Number(((this.gContra) * ((disperAbonos.deduxcent) / 100)).toFixed(2));
                            L_NEWMONT = Number((L_XCENT + L_IVATOTAL).toFixed(2));
                            L_RESTO = Number((L_NEWMONT - disperAbonos.paymentAct).toFixed(2));
                            L_PAGTOT = Number((L_RESTO + Number(disperAbonos.paymentAct || 0)).toFixed(2));
                            L_IVA = disperAbonos.iva;
                            if (deposito.paid < L_RESTO && deposito.paid > 0 && L_RESTO > 0) {
                                L_MONTOSIN_IVA = Number((await this.amountWithoutIva(deposito.paid, L_IVA)).toFixed(2));
                                L_XCENTIVA = Number((await this.xCentIva(L_MONTOSIN_IVA, L_IVA)).toFixed(2));
                                L_XCUBRIR = Number((L_NEWMONT - (disperAbonos.paymentAct + deposito.paid)).toFixed(2))

                                dispersion.payId = deposito.payId
                                dispersion.noGood = disperAbonos.noGood
                                dispersion.amount = this.round(disperAbonos.amount);
                                dispersion.reference = disperAbonos.reference
                                dispersion.noTransferable = disperAbonos.noTransferable
                                dispersion.payment = this.round(L_MONTOSIN_IVA)
                                dispersion.paymentAct = this.round(deposito.paid)
                                dispersion.status = 'A'
                                dispersion.impWithoutIva = this.round(L_MONTOSIN_IVA)
                                dispersion.iva = this.round(L_IVA),
                                    dispersion.amountIva = this.round(L_XCENTIVA)
                                dispersion.deduxcent = disperAbonos.deduxcent
                                dispersion.deduValue = this.round(disperAbonos.deduValue)
                                dispersion.noAppointment = disperAbonos.noAppointment
                                dispersion.dateProcess = LocalDate.getNow()
                                dispersion.type = 'I'
                                dispersion.insert = 'NW'
                                dispersion.payCoverId = deposito.payId
                                dispersion.xCover = L_XCUBRIR
                                dispersion.origin = disperAbonos.insert

                                deposito.paid = 0;
                                disperAbonos.status = 'C'
                                if (dispersion.status == 'A') {
                                    break;
                                }
                            } else if (deposito.paid > L_RESTO && L_RESTO > 0) {
                                L_MONTOSIN_IVA = Number((await this.amountWithoutIva(L_RESTO, L_IVA)).toFixed(2));
                                L_XCENTIVA = Number((await this.xCentIva(L_MONTOSIN_IVA, L_IVA)).toFixed(2));


                                dispersion.payId = deposito.payId
                                dispersion.noGood = disperAbonos.noGood
                                dispersion.amount = this.round(disperAbonos.amount);
                                dispersion.reference = disperAbonos.reference
                                dispersion.noTransferable = disperAbonos.noTransferable
                                dispersion.payment = this.round(L_MONTOSIN_IVA)
                                dispersion.paymentAct = this.round(deposito.paid)
                                dispersion.status = 'C'
                                dispersion.impWithoutIva = this.round(L_MONTOSIN_IVA)
                                dispersion.iva = this.round(L_IVA),
                                    dispersion.amountIva = this.round(L_XCENTIVA)
                                dispersion.deduxcent = disperAbonos.deduxcent
                                dispersion.deduValue = this.round(disperAbonos.deduValue)
                                dispersion.noAppointment = disperAbonos.noAppointment
                                dispersion.dateProcess = LocalDate.getNow()
                                dispersion.type = 'I'
                                dispersion.insert = 'NW'
                                dispersion.payCoverId = deposito.payId
                                dispersion.xCover = 0
                                dispersion.origin = disperAbonos.insert

                                deposito.paid = Number((deposito.paid).toFixed(2))
                                disperAbonos.status = 'C';
                            } else if (deposito.paid == L_RESTO && L_RESTO > 0) {


                                L_MONTOSIN_IVA = Number((await this.amountWithoutIva(L_RESTO, L_IVA)).toFixed(2));
                                L_XCENTIVA = Number((await this.xCentIva(L_MONTOSIN_IVA, L_IVA)).toFixed(2));

                                dispersion.payId = deposito.payId
                                dispersion.noGood = disperAbonos.noGood
                                dispersion.amount = this.round(disperAbonos.amount);
                                dispersion.reference = disperAbonos.reference
                                dispersion.noTransferable = disperAbonos.noTransferable
                                dispersion.payment = this.round(L_MONTOSIN_IVA)
                                dispersion.paymentAct = this.round(deposito.paid)
                                dispersion.status = 'C'
                                dispersion.impWithoutIva = this.round(L_MONTOSIN_IVA)
                                dispersion.iva = this.round(L_IVA),
                                    dispersion.amountIva = this.round(L_XCENTIVA)
                                dispersion.deduxcent = disperAbonos.deduxcent
                                dispersion.deduValue = this.round(disperAbonos.deduValue)
                                dispersion.noAppointment = disperAbonos.noAppointment
                                dispersion.dateProcess = LocalDate.getNow()
                                dispersion.type = 'I'
                                dispersion.insert = 'NW'
                                dispersion.payCoverId = deposito.payId
                                dispersion.xCover = 0
                                dispersion.origin = disperAbonos.insert
                                deposito.paid = 0;
                                disperAbonos.status = 'C';

                            }
                        }
                        this.gDispersion.push(dispersion)
                    }
                }
            }

        }

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
            gK: number = -1;
        const gDepositos = this.gDepositos;
        const gDispercion = this.gDispersion;
        let lDispercion: any = {};
        const dateNow = LocalDate.getNow();

        for (const depos of gDepositos) {
            for (const dispersion of gDispercion) {

                if (dispersion.status == 'A' && dispersion.xCover > 0) {
                    if (!dispersion?.deduxcent) {
                        lResto = this.round(dispersion.xCover);
                        if (depos.paid < lResto && depos.paid > 0) {
                            lMontosinIva = await this.amountWithoutIva(depos.paid, this.gIva);
                            lxCentIva = await this.xCentIva(lMontosinIva, dispersion.iva);
                            lxCubrir = this.round(lResto - depos.paid);
                            gK++;

                            lDispercion = {
                                payId: depos.payId,
                                noGood: dispersion.noGood,
                                amount: this.round(dispersion.amount),
                                reference: dispersion.reference,
                                noTransferable: dispersion.noTransferable,
                                payment: this.round(lMontosinIva),
                                paymentAct: this.round(depos.paid),
                                status: 'A',
                                impWithoutIva: this.round(lMontosinIva),
                                iva: this.round(dispersion.iva),
                                amountIva: this.round(lxCentIva),
                                deduxcent: dispersion.deduxcent,
                                deduValue: this.round(dispersion.deduValue),
                                noAppointment: dispersion.noAppointment,
                                dateProcess: new Date(dateNow),
                                type: 'I',
                                insert: 'NW',
                                payCoverId: depos.payId,
                                xCover: lxCubrir,
                                origin: dispersion.insert,
                            }
                            this.gDispersion.push(lDispercion);

                            depos.paid = 0;
                            dispersion.status = 'X';

                            if (dispersion[gK].status == 'A') {
                                break;
                            }

                        } else if (depos.paid > lResto) {
                            lMontosinIva = await this.amountWithoutIva(lResto, dispersion.iva);
                            lxCentIva = await this.xCentIva(lMontosinIva, dispersion.iva);
                            gK++;

                            lDispercion = {
                                payId: depos.payId,
                                noGood: dispersion.noGood,
                                amount: this.round(dispersion.amount),
                                reference: dispersion.reference,
                                noTransferable: dispersion.noTransferable,
                                payment: this.round(lMontosinIva),
                                paymentAct: this.round(depos.paid),
                                status: 'C',
                                impWithoutIva: this.round(lMontosinIva),
                                iva: this.round(dispersion.iva),
                                amountIva: this.round(lxCentIva),
                                deduxcent: dispersion.deduxcent,
                                deduValue: this.round(dispersion.deduValue),
                                noAppointment: dispersion.noAppointment,
                                dateProcess: new Date(dateNow),
                                type: 'I',
                                insert: 'NW',
                                payCoverId: depos.payId,
                                xCover: 0,
                                origin: dispersion.origin,
                            }
                            this.gDispersion.push(lDispercion);
                            depos.paid = this.round(depos.paid - lResto);
                            dispersion.status = 'X';
                        } else if (depos.paid == lResto) {
                            lMontosinIva = await this.amountWithoutIva(lResto, dispersion.iva);
                            lxCentIva = await this.xCentIva(lMontosinIva, dispersion.iva);
                            gK++;

                            lDispercion = {
                                payId: depos.payId,
                                noGood: dispersion.noGood,
                                amount: this.round(dispersion.amount),
                                reference: dispersion.reference,
                                noTransferable: dispersion.noTransferable,
                                payment: this.round(lMontosinIva),
                                paymentAct: this.round(depos.paid),
                                status: 'A',
                                impWithoutIva: this.round(lMontosinIva),
                                iva: this.round(dispersion.iva),
                                amountIva: this.round(lxCentIva),
                                deduxcent: dispersion.deduxcent,
                                deduValue: this.round(dispersion.deduValue),
                                noAppointment: dispersion.noAppointment,
                                dateProcess: new Date(dateNow),
                                type: 'I',
                                insert: 'NW',
                                payCoverId: depos.payId,
                                xCover: lxCubrir,
                                origin: dispersion.origin,
                            }
                            this.gDispersion.push(lDispercion);

                            depos.paid = 0;
                            dispersion.status = 'X';
                        }
                    }
                }

            }
        }
        return {
            statusCode: 200,
            message: ["OK"]
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
        let lIdprgens: number = 0,
            lIdpgens: number = 0,
            lMespag: number = 0
        let tpm: any = this.TmpPagosGensDepRepository; //TMP_PAGOS_GENS_DEP

        try {

            lIdprgens = await this.PaymentsgensDepositaryRepository
                .createQueryBuilder('pagos')
                .select('COALESCE(MAX(pagos.id_pagogens), 0)', 'max_id_pagogens')
                .execute().then((res) => {
                    return res[0].max_id_pagogens ?? 0;
                });

            lIdpgens = await this.PaymentsgensDepositaryRepository
                .createQueryBuilder('pagos')
                .select('COALESCE(MAX(pagos.id_pago_cubrio), 0)', 'max_id_pago_cubrio')
                .where('pagos.no_nombramiento = :nombramiento', { nombramiento: dto.pOne })
                .execute().then((res) => {
                    return res[0].max_id_pago_cubrio ?? 0;
                });

            //TODO: consultar que debo borrar
            await this.TmpPagosGensDepRepository.delete({});
            for (const dispersion of this.gDispersion) {

                if (dispersion.type == 'U') {
                    dispersion.insert = 'DB';

                    let obj = {
                        payGensId: lIdpgens,
                        payId: dispersion.payId,
                        noGood: dispersion.noGood,
                        amount: this.round(dispersion.amount),
                        reference: dispersion.reference,
                        typeInput: dispersion.typeInput,
                        noTransferable: dispersion.noTransferable,
                        iva: dispersion.iva,
                        insert: dispersion.insert,
                        impWithoutIva: this.round(dispersion.impWithoutIva),
                        origin: dispersion.origin,
                        amountIva: this.round(dispersion.amountIva),
                        payment: this.round(dispersion.payment),
                        deduxcent: dispersion.deduxcent,
                        deduValue: this.round(dispersion.deduValue),
                        status: dispersion.status,
                        noAppointment: dispersion.noAppointment,
                        dateProcess: dispersion.dateProcess,
                        type: dispersion.type,
                        paymentAct: this.round(dispersion.paymentAct),
                        payCoverId: dispersion.payCoverId,
                        chkDedu: dispersion.chkDedu
                    }
                    await this.TmpPagosGensDepRepository.save(obj);

                } else {

                    lIdprgens = Number(lIdprgens) + 1;
                    dispersion.insert = 'NW';

                    if (dispersion.status == 'X') {
                        dispersion.status = 'A';
                    }

                    if (dispersion.status != 'C') {
                        lIdpgens = Number(lIdpgens) + 1;
                    }

                    if (dispersion.status == 'A') {
                        lMespag = lIdpgens;
                    }

                    if (dispersion.status == 'C' && lMespag > 0) {
                        lIdpgens = lMespag
                    }
                    //  console.log(dispersion);

                    var s = {
                        payGensId: lIdprgens,
                        payId: dispersion.payId,
                        noGood: dispersion.noGood,
                        amount: this.round(dispersion.amount),
                        reference: dispersion.reference,
                        typeInput: dispersion.typeInput,
                        noTransferable: dispersion.noTransferable,
                        iva: dispersion.iva,
                        insert: dispersion.insert,
                        impWithoutIva: this.round(dispersion.impWithoutIva),
                        origin: dispersion.origin,
                        amountIva: this.round(dispersion.amountIva),
                        payment: this.round(dispersion.payment),
                        deduxcent: dispersion.deduxcent,
                        deduValue: this.round(dispersion.deduValue),
                        status: dispersion.status,
                        noAppointment: dispersion.noAppointment,
                        dateProcess: dispersion.dateProcess,
                        type: dispersion.type,
                        paymentAct: this.round(dispersion.paymentAct),
                        payCoverId: lIdpgens,
                        chkDedu: dispersion.chkDedu
                    }
                    var res = await this.TmpPagosGensDepRepository.save(s)

                }
            }

            return {
                statusCode: HttpStatus.OK,
                message: ['OK']
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
            .orderBy('id_pagogens', 'ASC')
            .execute().then((res) => {
                return res;
            });
        try {
            for (const i in L2) {
                if (L2[i].type == 'U') {

                    UorIquery = `UPDATE SERA.PAGOSGENS_DEPOSITARIAS
                    SET
                        ID_PAGO          = ${L2[i].payId},
                        NO_BIEN          = ${L2[i].noGood},
                        MONTO            = ${L2[i].amount},
                        REFERENCIA       = ${L2[i].reference},
                        TIPOINGRESO      = ${L2[i].typeInput},
                        NO_TRANSFERENTE  = ${L2[i].noTransferable},
                        IVA              = ${this.round(L2[i].iva)},
                        MONTO_IVA        = ${this.round(L2[i].amountIva)},
                        ABONO            = ${this.round(L2[i].payment)},
                        PAGO_ACT         = ${this.round(L2[i].paymentAct)},
                        DEDUXCENT        = ${L2[i].deduxcent},
                        DEDUVALOR        = ${this.round(L2[i].deduValue)},
                        STATUS           = ${L2[i].status},
                        NO_NOMBRAMIENTO  = ${L2[i].noAppointment},
                        ID_PAGO_CUBRIO   = ${L2[i].payCoverId},
                        FECHA_PROCESO    = ${L2[i].dateProcess},
                        IMP_SIN_IVA      = ${this.round(L2[i].impWithoutIva)},
                        OBSERV_PAGO      = ${L2[i].paymentObserv},
                        OBSERV_DEDU      = ${L2[i].deduObserv},
                        ABONO_CUBIERTO   = 1
                    WHERE
                        ID_PAGOGENS      = ${L2[i].payGensId}
                        AND NO_NOMBRAMIENTO = ${L2[i].noAppointment};`;

                } else if (L2[i].type == 'I') {
                    let noAppointment = L2[i].noAppointment;

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
                                ${L2[i].payId},
                                ${L2[i].noGood},
                                ${this.round(L2[i].amount)},
                                ${L2[i].reference},
                                ${L2[i].typeInput},
                                ${L2[i].noTransferable},
                                ${L2[i].iva},
                                ${this.round(L2[i].impWithoutIva)},
                                ${L2[i].paymentObserv},
                                ${this.round(L2[i].amountIva)},
                                ${this.round(L2[i].payment)},
                                ${L2[i].deduxcent},
                                ${this.round(L2[i].deduValue)},
                                ${L2[i].status},
                                ${L2[i].noAppointment},
                                ${L2[i].dateProcess},
                                ${this.round(L2[i].paymentAct)},
                                ${L2[i].payCoverId},
                                ${L2[i].deduObserv},
                                ${lAbcu}
                            ); `;

                }

                await pGensDep.query(UorIquery).then((result) => {
                    return result;
                });
            }

            //Limpia las listas globales
            this.gDepositos.splice(0, this.gDepositos.length);
            this.gDispersion.splice(0, this.gDispersion.length);
            //TODO: descomentar una ves las cree
            this.updateAccreditationGens({pOne:dto.pOne})
            this.updatePaymentsRef({pOne:dto.pOne})

            return {
                statusCode: HttpStatus.OK,
                message: ['OK']
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
                message: ['OK']
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
                return result;
            });

            return {
                data: [response],
                statusCode: HttpStatus.OK,
                message: ['OK']
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

        const fechaOriginal = dto.pDate
        const fecha = moment.utc(fechaOriginal).tz('UTC');
        const date = fecha.format('MM/DD/YYYY')

        try {
            await this.RefpayDepositoriesRepository.query(
                `UPDATE sera.PAGOREF_DEPOSITARIAS
                SET VALIDO_SISTEMA = 'A',
                    FECHA_VAL_SISTEMA = NULL
                WHERE EXISTS (SELECT ND.NO_BIEN
                            FROM SERA.NOMBRAMIENTOS_DEPOSITARIA ND
                            WHERE ND.NO_NOMBRAMIENTO = ${dto.pOne}
                            AND ND.NO_BIEN != 0
                            AND ND.NO_PERSONA IS NOT NULL
                            AND EXISTS (SELECT 1
                                        FROM SERA.PERSONASXNOM_DEPOSITARIAS PXD
                                        WHERE PXD.NO_NOMBRAMIENTO = ${dto.pOne}
                                        AND PXD.NO_PERSONA = ND.NO_PERSONA::text
                                        AND PXD.PROCESAR = 'S'
                                        AND PXD.ENVIADO_SIRSAE = 'N')
                            )
                    AND EXISTS (SELECT GEN.NO_BIEN
                            FROM SERA.PAGOSGENS_DEPOSITARIAS GEN
                            WHERE GEN.NO_NOMBRAMIENTO = ${dto.pOne}
                            AND GEN.ID_PAGO = sera.PAGOREF_DEPOSITARIAS.ID_PAGO)
                AND VALIDO_SISTEMA = 'S'
                AND FECHA_VAL_SISTEMA = date('${date}')`
            )

            await this.RefpayDepositoriesRepository.query(
                `DELETE FROM SERA.PAGOSGENS_DEPOSITARIAS
                WHERE DATE(FECHA_PROCESO) = DATE('${date}')
                AND NO_NOMBRAMIENTO = ${dto.pOne}`
            )

            return {
                data: true,
                statusCode: HttpStatus.OK,
                message: ['OK']
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
    async validDep(dto: ValidDep): Promise<any> {

        var L_PERSONA = 0;
        var j = 0;
        var i = 0;
        var k = 0;
        var t = 0;
        var COMPRA_TOT = 0.0;
        var PAGADO_TOT = 0.0;
        var L_MONTOPENA = 0.0;
        var L_PARAMETROS: string;
        var PENALTY = 'N';
        var PROP_IVA_CHAT = 0.0;
        var PROP_ISR_CHAT = 0.0;
        var L_RESTA = 0.0;
        var L_ROUND: number
        var L_NOMBRAMIENTO: number
        var L_REFERENCIA: number;
        var L_NO_BIEN: number
        var L_IVA = 0;
        var L_ABONO_X = 0.0;
        var L_MONT_DESC = 0.0;
        var L_BAN = false;
        var L_MONTOSIN_IVA: number
        var L_XCENTIVA: number
        var L_XCUBRIR = 0.0;
        var date = LocalDate.getCustom(dto.date, "MM/DD/YYYY")
        console.log(date);

        var L7: any = await this.RefpayDepositoriesRepository.query(`
            SELECT DISTINCT ND.NO_PERSONA, ND.NO_NOMBRAMIENTO, ND.REFERENCIA, ND.NO_BIEN, COALESCE(ND.IVA, 0) AS IVA
            FROM sera.NOMBRAMIENTOS_DEPOSITARIA ND
            WHERE ND.NO_NOMBRAMIENTO = ${dto.name}
            AND EXISTS (
                SELECT PRF.NO_BIEN
                FROM sera.PAGOREF_DEPOSITARIAS PRF
                WHERE PRF.NO_BIEN = ND.NO_BIEN
                AND PRF.VALIDO_SISTEMA = 'A'
                AND PRF.FECHA <= '${date}'
            )
            AND EXISTS (
                SELECT 1
                FROM sera.PERSONASXNOM_DEPOSITARIAS PXD
                WHERE PXD.NO_NOMBRAMIENTO =  ${dto.name}
                AND PXD.NO_PERSONA = ND.NO_PERSONA::text
                AND PXD.PROCESAR = 'S'
                AND PXD.ENVIADO_SIRSAE = 'N'
            )
            AND ND.IMPORTE_CONTRAPRESTACION > 0
            AND ND.NO_PERSONA IS NOT NULL
        `);

        L_PARAMETROS = await this.paramsDep(dto.name, 'D')
        var GK = 0;
        L_ABONO_X = 0.0
        for (const iterator of L7) {
            L_PERSONA = iterator.no_persona
            L_NOMBRAMIENTO = iterator.no_nombramiento
            L_REFERENCIA = iterator.referencia
            L_NO_BIEN = iterator.no_bien

            L_IVA = iterator.iva
            this.gDispersion = []

            var r = await this.fillPayments({ name: dto.name, person: L_PERSONA, date: dto.date, phase: 1 })

            this.gSumaTot = r.data?.lDepTot || 0
            await this.fillAccreditations({ name: dto.name, good: L_NO_BIEN, process: 1 })
            for (const deposito of this.gDepositos) {



                L_MONTOSIN_IVA = 0.0;
                L_XCENTIVA = 0.0;
                L_XCUBRIR = 0.0;
                var dispersion: any = {}

                if (deposito.paid < this.gIvaContra && deposito.paid > 0) {

                    L_MONTOSIN_IVA = Number((this.amountWithoutIva(deposito.paid, L_IVA)).toFixed(2));
                    L_XCENTIVA = Number((await this.xCentIva(L_MONTOSIN_IVA, L_IVA)).toFixed(2));
                    L_XCUBRIR = Number((this.gIvaContra - (deposito.paid)).toFixed(2))

                    dispersion.payId = deposito.payId;
                    dispersion.noGood = deposito.good;
                    dispersion.amount = this.round(this.gIvaContra);
                    dispersion.reference = L_REFERENCIA;
                    dispersion.noTransferable = deposito.mandate;
                    dispersion.payment = this.round(L_MONTOSIN_IVA);
                    dispersion.paymentAct = this.round(deposito.paid);
                    dispersion.status = 'A';
                    dispersion.impWithoutIva = this.round(L_MONTOSIN_IVA);
                    dispersion.iva = this.round(L_IVA);
                    dispersion.amountIva = this.round(L_XCENTIVA);
                    dispersion.noAppointment = L_NOMBRAMIENTO;
                    dispersion.dateProcess = LocalDate.getNow()
                    dispersion.type = 'I';
                    dispersion.insert = 'NW';
                    dispersion.payCoverId = deposito.payId;
                    dispersion.xCover = this.round(L_XCUBRIR);


                    deposito.paid = 0;
                    this.gDispersion.push(dispersion)
                } else if (deposito.paid > this.gIvaContra) {
                    L_ROUND = parseInt(`${Number(deposito.paid / this.gIvaContra)}`)
                    L_ROUND = L_ROUND > 0 ? L_ROUND : 0
                    for (let index = 0; index < L_ROUND; index++) {
                        deposito.paid = Number((deposito.paid - this.gIvaContra).toFixed(2));
                        L_MONTOSIN_IVA = Number(this.amountWithoutIva(this.gIvaContra, L_IVA).toFixed(2));
                        L_XCENTIVA = Number((await this.xCentIva(L_MONTOSIN_IVA, L_IVA)).toFixed(2));

                        dispersion.payId = deposito.payId;
                        dispersion.noGood = deposito.good;
                        dispersion.amount = this.round(this.gIvaContra);
                        dispersion.reference = L_REFERENCIA;
                        dispersion.noTransferable = deposito.mandate;
                        dispersion.payment = 0;
                        dispersion.paymentAct = this.round(this.gIvaContra);
                        dispersion.status = 'P';
                        dispersion.impWithoutIva = this.round(L_MONTOSIN_IVA);
                        dispersion.iva = this.round(L_IVA);
                        dispersion.amountIva = this.round(L_XCENTIVA);
                        dispersion.noAppointment = L_NOMBRAMIENTO;
                        dispersion.dateProcess = LocalDate.getNow()
                        dispersion.type = 'I';
                        dispersion.insert = 'NW';
                        dispersion.payCoverId = deposito.payId;
                        dispersion.xCover = 0.0;

                        this.gDispersion.push(dispersion)
                    }
                    if (deposito.paid < this.gIvaContra && deposito.paid > 0) {
                        L_MONTOSIN_IVA = Number((this.amountWithoutIva(deposito.paid, L_IVA)).toFixed(2));
                        L_XCENTIVA = Number((await this.xCentIva(L_MONTOSIN_IVA, L_IVA)).toFixed(2));
                        L_XCUBRIR = Number((this.gIvaContra - (deposito.paid)).toFixed(2))

                        dispersion.payId = deposito.payId;
                        dispersion.noGood = deposito.good;
                        dispersion.amount = this.round(this.gIvaContra);
                        dispersion.reference = L_REFERENCIA;
                        dispersion.noTransferable = deposito.mandate;
                        dispersion.payment = this.round(L_MONTOSIN_IVA);
                        dispersion.paymentAct = this.round(deposito.paid);
                        dispersion.status = 'A';
                        dispersion.impWithoutIva = this.round(L_MONTOSIN_IVA);
                        dispersion.iva = this.round(L_IVA);
                        dispersion.amountIva = this.round(L_XCENTIVA);
                        dispersion.noAppointment = L_NOMBRAMIENTO;
                        dispersion.dateProcess = LocalDate.getNow()
                        dispersion.type = 'I';
                        dispersion.insert = 'NW';
                        dispersion.payCoverId = deposito.payId;
                        dispersion.xCover = this.round(L_XCUBRIR);
                        deposito.paid = 0;

                        this.gDispersion.push(dispersion)
                    }
                } else if (deposito.paid == this.gIvaContra) {
                    L_MONTOSIN_IVA = Number((this.amountWithoutIva(this.gIvaContra, L_IVA)).toFixed(2));
                    L_XCENTIVA = Number((await this.xCentIva(L_MONTOSIN_IVA, L_IVA)).toFixed(2));
                    dispersion.payId = deposito.payId;
                    dispersion.noGood = deposito.good;
                    dispersion.amount = this.round(this.gIvaContra);
                    dispersion.reference = L_REFERENCIA;
                    dispersion.noTransferable = deposito.mandate;
                    dispersion.payment = 0;
                    dispersion.paymentAct = this.round(this.gIvaContra);
                    dispersion.status = 'P';
                    dispersion.impWithoutIva = this.round(L_MONTOSIN_IVA);
                    dispersion.iva = this.round(L_IVA);
                    dispersion.amountIva = this.round(L_XCENTIVA);
                    dispersion.noAppointment = L_NOMBRAMIENTO;
                    dispersion.dateProcess = LocalDate.getNow()
                    dispersion.type = 'I';
                    dispersion.insert = 'NW';
                    dispersion.payCoverId = deposito.payId;
                    dispersion.xCover = 0.0;

                    deposito.paid = 0;
                    this.gDispersion.push(dispersion)
                }
                //LLENA_ABONOS_DISPER
                //console.log(this.gDispersion);

                await this.fillAccreditationDisper()

            }

        }

        // INS_DISPERSION(P_NOMBR, L_PERSONA);
        await this.insertDispersion({ pOne: dto.name, pTwo: L_PERSONA })
        return {
            statusCode: 200,
            message: ["OK"],
            data: this.gDispercionAbonos
        }



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
    async prepOI(dto: PrepOIDto): Promise<any> {
        var P_IDPAGO: number;
        var P_RFC: string
        var P_RFCORI: string
        var P_CONCEP: string
        var P_CONAUX: string
        var P_BANCO: string
        var O_IDENTI = 0;
        var O_CONSE = 0;
        var P_FECHAHOY = LocalDate.getNow()
        var P_FECHA: string;
        var P_FECHAOI: string;
        var P_MONIVA: number;
        var P_MOVTO: number;
        var P_REFE: string
        var P_MONTO: number;
        var P_MONTOSIVA: number;
        var P_MONTODEDU: number;
        var P_IVA: number;
        var P_DEPOSITO: number;
        var P_MONTO_TOTAL: number;
        var P_NO_BIEN: number;
        var P_OI: number;
        var LOT_MONTO: number;
        var H_TIPO: string;
        var H_MAND: string;
        var H_MONTO: number;
        var H_REF: string;
        var H_REFEORI: string;
        var H_MONIVA: number;
        var H_MONSIVA: number;
        var H_IVA: number;
        var H_REFE: string
        var H_MOV: number;
        var H_LOTDES: string;
        var H_CONCEP: string
        var H_IDENT = 0;
        var USUARIO: string
        var H_LOTPUB: number;
        var H_DESCTIPO: string;
        var H_MONTOCHAT: number;
        var H_MONTOLOTE: number;
        var H_LOTE: number;
        var AUX_CONT: number;
        var L_PARAMETROS: any;
        var H_INGRESO: string;
        var H_TPINGRESO: string;
        var H_NUMBIENES = 0;
        var H_SIAB: number;
        var H_DEDU: number;
        var H_BIEN: number;
        var H_DESCBIEN: string;
        var H_NOMBRA: number;
        var H_TPOINGRE: number;
        var H_IVAP: number;
        var H_PAGOGEN: number;
        var H_CONCEPTOS: string;
        var H_PORCDEDU: number;
        var L_MANDATOS = 0;
        var D_PCT: number;
        var D_MANDATO: string;
        var D_NOBIEN: number;
        var D_CONCEP: string
        var AUX_CONCEP: string;
        var D_IVA: number;
        var D_MONIVA: number;
        var D_MONSIVA: number;
        var J = 0;
        var errorMessage = []

        L_PARAMETROS = await this.paramsDep(dto.name, 'D');

        await this.TmpPagosGensDepRepository.query(` 
            DELETE from sera.CABECERAS_DEPOSITARIAS
            WHERE NO_NOMBRAMIENTO = ${dto.name}
            AND DEPOSITARIO_RFC IN (SELECT    CP.RFC
                                            FROM    sera.CAT_PERSONAS CP, sera.PERSONASXNOM_DEPOSITARIAS PXD
                                        WHERE    PXD.NO_NOMBRAMIENTO  = sera.CABECERAS_DEPOSITARIAS.NO_NOMBRAMIENTO
                                            AND    CP.NO_PERSONA::text          = PXD.NO_PERSONA
                                            AND    PXD.PROCESAR         = 'S')
            AND IDORDENGRABADA IS NULL
          `);
        await this.TmpPagosGensDepRepository.query(`
            DELETE from sera.DETALLES_DEPOSITARIAS DET
            WHERE NO_NOMBRAMIENTO = ${dto.name}
            AND EXISTS (SELECT 1
                            FROM sera.CAT_PERSONAS CP, sera.PERSONASXNOM_DEPOSITARIAS PXD
                            WHERE PXD.NO_NOMBRAMIENTO  = DET.NO_NOMBRAMIENTO
                            AND CP.NO_PERSONA::text        = PXD.NO_PERSONA
                            AND PXD.PROCESAR         = 'S')
            AND IDORDENGRABADA IS NULL
        `)
        AUX_CONT = (await this.TmpPagosGensDepRepository.query(`
            SELECT coalesce(MAX(IDENTIFICADOR),0) as value
            FROM sera.CABECERAS_DEPOSITARIAS
            WHERE NO_NOMBRAMIENTO = ${dto.name}
        `))[0]?.value || 0

        O_IDENTI = AUX_CONT;

        USUARIO = (await this.TmpPagosGensDepRepository.query(`
            SELECT coalesce(USUARIO_SIRSAE, USER) as us
            FROM sera.SEG_USUARIOS
            WHERE USUARIO = USER
        `))[0]?.us || ""
        USUARIO = USUARIO.trim();

        var C1: any[] = await this.TmpPagosGensDepRepository.query(`
            SELECT PREF.ID_PAGO, CP.RFC, TO_CHAR(PREF.FECHA,'YYYYMMDD') AS FECHA, TO_CHAR(PREF.FECHA_VAL_SISTEMA,'YYYYMMDD') AS FECHA_OI,
            PREF.MONTO, SUBSTR(PREF.REFERENCIAORI,1,30) AS REFERENCIA, PREF.NO_MOVIMIENTO,
            PREF.NO_BIEN, SUBSTR(B.DESCRIPCION,1,380), MOD.VALOR, PREF.IDORDENINGRESO
            FROM sera.PAGOREF_DEPOSITARIAS PREF
            JOIN sera.NOMBRAMIENTOS_DEPOSITARIA ND ON ND.NO_NOMBRAMIENTO = ${dto.name}
            JOIN sera.BIEN B ON B.NO_BIEN = PREF.NO_BIEN
            JOIN sera.CAT_PERSONAS CP ON CP.NO_PERSONA = ND.NO_PERSONA 
            JOIN sera.PARAMETROSMOD_DEPOSITARIAS MOD ON PREF.CVE_BANCO = MOD.PARAMETRO
            JOIN sera.PERSONASXNOM_DEPOSITARIAS PXN ON PXN.NO_NOMBRAMIENTO = ${dto.name}
                                                AND PXN.NO_PERSONA = ND.NO_PERSONA::text 
                                                AND PXN.PROCESAR = 'S'
            WHERE PREF.VALIDO_SISTEMA = 'S'
            AND PREF.IDORDENINGRESO IS NULL
            AND PREF.NO_BIEN != 0
            AND MOD.DIRECCION = 'D'
            AND PREF.IDORDENINGRESO IS NULL
            ORDER BY PREF.ID_PAGO
        `)

        for (const iterator of C1) {
            P_IDPAGO = iterator.id_pago
            P_RFC = iterator.rfc
            P_FECHA = iterator.fecha
            P_FECHAOI = iterator.fecha_oi
            P_MONTO = iterator.monto
            P_REFE = iterator.referencia
            P_MOVTO = iterator.no_movimien
            P_NO_BIEN = iterator.no_bien
            P_CONAUX = iterator.substr
            P_BANCO = iterator.valor
            P_OI = iterator.idordeningre
            // console.log(iterator);

            var sql = `
            SELECT *
            FROM (
                SELECT
                    GEN.ID_PAGOGENS,
                    CAT.CVMAN,
                    (GEN.IMP_SIN_IVA + GEN.MONTO_IVA) AS INGRESO, 
                    GEN.IMP_SIN_IVA + COALESCE(GEN.DEDUVALOR, 0) AS IMPORTE, 
                    COALESCE(GEN.MONTO_IVA, 0) AS IVA, 
                    (CASE GEN.STATUS 
                        WHEN 'P' THEN 0 
                        WHEN 'A' THEN 0 
                        WHEN 'C' THEN 0 
                    END) AS PORC_DEDU,
                   ( CASE GEN.STATUS 
                        WHEN 'P' THEN 0 
                        WHEN 'A' THEN 0 
                        WHEN 'C' THEN 0 
                    END) AS IMPORTE_DEDU, 
                   ( CASE GEN.STATUS 
                        WHEN 'P' THEN 'N' 
                        WHEN 'A' THEN 'N' 
                        WHEN 'C' THEN 'N' 
                    END )AS INDTIPO, 
                    B.NO_BIEN, 
                    ND.NO_NOMBRAMIENTO, 
                    SUBSTR(GEN.REFERENCIA, 1, 30), 
                    0 AS IMPORTE_SIVA, 
                    (CASE GEN.STATUS 
                        WHEN 'G' THEN '${this.gTipoIngresoG}' 
                        WHEN 'P' THEN  '${this.gTipoIngresoT}' 
                        WHEN 'A' THEN  '${this.gTipoIngresoP}'
                        WHEN 'C' THEN  '${this.gTipoIngresoP}' 
                        WHEN 'R' THEN  '${this.gTipoIngresoR}' 
                    END) AS TIPO_INGRESO, 
                    ND.IVA AS PORC_IVA, 
                    SUBSTR(GEN.OBSERV_PAGO, 1, 500) AS CONCEPTO, 
                    SUBSTR(PREF.REFERENCIAORI, 1, 30) as val1
                FROM sera.PAGOSGENS_DEPOSITARIAS GEN 
                JOIN sera.CAT_TRANSFERENTE CAT ON GEN.NO_TRANSFERENTE = CAT.NO_TRANSFERENTE 
                JOIN sera.BIEN B ON B.NO_BIEN = GEN.NO_BIEN 
                JOIN sera.NOMBRAMIENTOS_DEPOSITARIA ND ON GEN.NO_BIEN = ND.NO_BIEN AND GEN.NO_NOMBRAMIENTO = ND.NO_NOMBRAMIENTO 
                JOIN sera.PAGOREF_DEPOSITARIAS PREF ON GEN.ID_PAGO = PREF.ID_PAGO 
                WHERE GEN.ID_PAGO = ${P_IDPAGO}
                    AND EXISTS (
                        SELECT 1 
                        FROM sera.PERSONASXNOM_DEPOSITARIAS PXN 
                        WHERE PXN.NO_NOMBRAMIENTO = GEN.NO_NOMBRAMIENTO 
                            AND PXN.NO_PERSONA = ND.NO_PERSONA::text  
                            AND PXN.PROCESAR = 'S'
                    )
                UNION
                SELECT 
                GEN.ID_PAGOGENS,
				CAT.CVMAN,
				0 AS INGRESO,
				0 AS IMPORTE, 
				0 AS IVA, 
                 GEN.DEDUXCENT AS PORC_DEDU,
				GEN.DEDUVALOR AS IMPORTE_DEDU, 
				(CASE GEN.STATUS 
					WHEN 'P' THEN 'N' 
					WHEN 'A' THEN 'N' 
					WHEN 'C' THEN 'N' 
				END) AS INDTIPO, 
                 B.NO_BIEN, 
                 ND.NO_NOMBRAMIENTO, 
                 SUBSTR(GEN.REFERENCIA, 1, 30), 
                 0 AS IMP,
				'${this.gRecoGastos}' TIPO_INGRESO,
               ND.IVA PORC_IVA,
               SUBSTR(GEN.OBSERV_DEDU||' DE LA '||GEN.OBSERV_PAGO,1,500) CONCEPTO, 
               SUBSTR(PREF.REFERENCIAORI,1,30) as val1
                FROM sera.PAGOSGENS_DEPOSITARIAS GEN 
                    JOIN sera.CAT_TRANSFERENTE CAT ON GEN.NO_TRANSFERENTE = CAT.NO_TRANSFERENTE 
                    JOIN sera.BIEN B ON B.NO_BIEN = GEN.NO_BIEN 
                    JOIN sera.NOMBRAMIENTOS_DEPOSITARIA ND ON GEN.NO_BIEN = ND.NO_BIEN AND GEN.NO_NOMBRAMIENTO = ND.NO_NOMBRAMIENTO 
                    JOIN sera.PAGOREF_DEPOSITARIAS PREF ON GEN.ID_PAGO = PREF.ID_PAGO 
                    WHERE GEN.ID_PAGO = ${P_IDPAGO} 
                        AND EXISTS (
                            SELECT 1 
                            FROM sera.PERSONASXNOM_DEPOSITARIAS PXN 
                            WHERE PXN.NO_NOMBRAMIENTO = GEN.NO_NOMBRAMIENTO 
                                AND PXN.NO_PERSONA = ND.NO_PERSONA::text 
                                AND PXN.PROCESAR = 'S'
                        )
                ) AS subquery
            ORDER BY ID_PAGOGENS, IMPORTE_DEDU`

            O_IDENTI = Number(O_IDENTI) + 1;
            let auxConcep = `DEPOSITO POR DEPOSITARIA ${dto.description} DEL BIEN ${P_CONAUX}`
            P_CONCEP = auxConcep.substring(0, 500);
            try {
                await this.RefpayDepositoriesRepository.query(`INSERT INTO sera.CABECERAS_DEPOSITARIAS
                (IDENTIFICADOR, AREA,            DOCUMENTO,    UNRESPONSABLE, DEPOSITARIO_RFC, CONCEPTO, 
                ANEXO,          FECHA,           TIPOPE,       FORMAPAGO,     FECHAORDEN,      BANCO,           USAUTORIZA, 
                MONTO_TOTAL,    NUMOVTO,         REFERENCIA,   ID_PAGO,        NO_NOMBRAMIENTO, IDORDENGRABADA)
                VALUES
                ('${O_IDENTI.toString().substring(0, 4)}',      '${this.gArea}',          '${this.gTipoDoc}',      '${this.gUR}',          '${P_RFC}',           '${P_CONCEP}',
                '${this.gAnexo}',       '${P_FECHA}',         '${this.gTipoOperacion}', 'R',           ${P_FECHAOI ? `'${P_FECHAOI}'` : null},       '${P_BANCO}',         '${USUARIO}',
                '${P_MONTO}',       ${P_MOVTO || null},         '${P_REFE}',        '${P_IDPAGO}',      '${dto.name}',    ${P_OI ? `'${P_OI}'` : null}
                )`)
            } catch (error) {
                Logger.debug(error.message + " " + O_IDENTI, "PREPOI C1")
                errorMessage.push(`Error al insertar registro con el identificador ${O_IDENTI} en CABECERAS_DEPOSITARIAS`)
            }

            //console.log(sql)
            var C2: any[] = await this.TmpPagosGensDepRepository.query(sql)
            H_IDENT = 0;
            for (const c2 of C2) {
                // console.log(c2)
                H_PAGOGEN = c2.id_pagogens
                H_MAND = c2.cvman
                H_MONTO = c2.ingreso
                H_MONIVA = c2.importe
                H_IVA = c2.iva
                H_PORCDEDU = c2.porc_dedu
                H_DEDU = c2.importe_dedu
                H_TIPO = c2.indtipo
                H_BIEN = c2.no_bien
                H_NOMBRA = c2.no_nombramiento
                H_REFE = c2.substr
                H_MONSIVA = c2.importe_siva
                H_TPOINGRE = c2.tipo_ingreso
                H_IVAP = c2.porc_iva
                H_CONCEPTOS = c2.concepto
                H_REFEORI = c2.val1
                H_IDENT = Number(H_IDENT) + 1;
                try {
                    await this.RefpayDepositoriesRepository.query(`INSERT INTO sera.DETALLES_DEPOSITARIAS
                    (IDENTIFICADOR, CONSECUTIVO, MANDATO,      INGRESO,     IMPORTE,         IVA,        
                    REFERENCIA,     INDTIPO,     NO_BIEN,      DESCRIPCION, NO_NOMBRAMIENTO, UNRESPONSABLE, 
                    PORC_IVA,       PORC_DEDU,   IMPORTE_DEDU, TIPO_INGRESO
                    )
                    VALUES
                    ('${O_IDENTI.toString().substring(0, 4)}',    ${H_IDENT},     '${H_MAND}',     ${H_TPOINGRE || null},   
                     ${H_MONIVA || null},   ${H_IVA || null},        
                       ${H_REFEORI ? `'${H_REFEORI}'` : null},      ${H_TIPO ? `'${H_TIPO}'` : null},      ${H_BIEN || null},    
                       ${H_CONCEPTOS ? `'${H_CONCEPTOS}'` : null},   ${H_NOMBRA || null},    ${this.gUR ? `'${this.gUR}'` : null},        
                       ${H_IVAP || null},      ${H_PORCDEDU || null},   ${H_DEDU || null},     ${H_TPOINGRE || null}
                    )`)
                } catch (error) {
                    errorMessage.push(`Error al insertar registro con el identificador ${O_IDENTI} en DETALLES_DEPOSITARIAS`)
                    Logger.debug(error.message + " " + O_IDENTI, "PREPOI C2")
                }
            }

        }

        return {
            statusCode: 200,
            message: errorMessage,
            data: null
        }

    }
    //#endregion

    //#endregion

}