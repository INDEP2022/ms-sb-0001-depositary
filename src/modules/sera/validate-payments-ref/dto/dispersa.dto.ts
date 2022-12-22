export class Dispersa{
    CLIENTE  ?     :number
    LOTE     ?     :number
    MANDATO  ?     :number
    PRECIO   ?     :number
    ID_PAGO  ?     :number
    ABONADO  ?     :number
    MONSIVA  ?     :number
    IVA      ?     :number
    GARATIA  ?     :number
    MEFALTA  ?     :number
    TIPO     ?     :string
    MONCHATA ?     :number
}

export class DISPERPENA{
    ID_PAGOREFGENS   ?: number
    ID_PAGO          ?: number
    ID_EVENTO        ?: number
    ID_LOTE          ?: number
    MONTO            ?: number
    REFERENCIA       ?:string
    NO_TRANSFERENTE  ?:number
    IVA              ?:number
    MONTO_APP_IVA    ?:number
    MONTO_NOAPP_IVA  ?:number
    TIPO             ?:string
    FECHA_PROCESO    ?:Date
    MONTO_CHATARRA   ?:number
    ACCION           ?:string
}