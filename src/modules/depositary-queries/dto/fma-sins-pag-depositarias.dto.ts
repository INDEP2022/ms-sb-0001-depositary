export class FmaSinsPagDepositariasDto {
    no_bien:number;
    validado:string;
    aplicado:string
    no_nombramiento:number;
    fec_pago:string;
    cve_concepto_pago:number;
    importe:number;
    observacion:string;
    descripcion:string;
    valjur:string;
    apljur:string;
    juridico:string;
    valadm:string;
    apladm:string;
    administra:string
}

export class FmaSinsPagDepositariasMassiveDto{
    data:FmaSinsPagDepositariasDto[]
}