export class Deposito{
    paid: number
    payId: number
    remainder: number
    mandate: number
    good: number
    contra: number
}

export class Dispersion{
    payId:number //ID_PAGO
    noGood: number //NO_BIEN
    amount: number //IMPORTE
    reference: string //REFERENCIA
    noTransferable:number //NO_TRANSFERIBLE
    payment: number //ABONO
    typeInput?:string
    paymentAct: number //ABONO_ACT
    status: string //STATUS
    impWithoutIva: number//IMP_SIN_IVA
    iva: number //IVA
    amountIva: number //IMPORTE_IVA
    noAppointment: number //NO_CITA
    dateProcess:  Date| string //FECHA_PROCESO
    type: string //TIPO
    insert: string //INSERTO
    payCoverId: number //ID_PAGO_CUBRIO
    xCover: number //X_CUBRIR
    deduxcent?: number //DEDUXCENT
    deduValue?: number //DEDUVALOR
    chkDedu?:number //CHK_DEDU
    origin?:string
}

export class DispercionAbonos{
    payGensId:number
    payId: number
    noGood: number
    amount: number
    reference: string
    typeInput: number
    noTransferable:number
    iva: number
    amountIva:number
    payment: number
    paymentAct: number
    deduxcent: number
    deduValue: number
    status: string
    noAppointment: number
    dateProcess: Date | string
    type: string
    insert: string
    xcentdedu? : number
    valuededu?: number
    impWithoutIva?: number
    chkdedu?: number
    origin?:string
    payCoverId?: number
    xCover:number
}