export class ValuePenaLot{
    ID_CLIENTE        ?:number
    ID_LOTE           ?:number
    LOTE_PUBLICO      ?:number
    NO_TRANSFERENTE   ?:number
    PRECIO_FINAL      ?:number
    MONTO_APLIC       ?:number
    MONTO_PENA        ?:number
    MONTO_GCUMPLE     ?:number
    MONTO_POR_APLIC   ?:number
    SALDO_ANTICIPO    ?:number
    IND_PENA          ?:number
    IND_CANC_SIN_PENA ?:number
    PORC_APP_IVA      ?:number
    IVA_LOTE          ?:number
    MONTO_APP_IVA     ?:number
    MONTO_NOAPP_IVA   ?:number
    PRECIO_GARANTIA ?: number
}

export class ValPenaLot{
    ID_LOTE         ?: number
    PRECIO_FINAL    ?: number
    PRECIO_GARANTIA ?: number
    SALDO_ANTICIPO  ?: number
    MONTO_PENA      ?: number
    MONTO_POR_APLIC ?: number
}