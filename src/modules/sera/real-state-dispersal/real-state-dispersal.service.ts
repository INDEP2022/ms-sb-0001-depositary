import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ACUMDETALLESOI } from './dto/acum-detalles.dto';
import { SALDO } from './dto/saldos.dto';
import { ValuePenaLot } from './dto/value-pena-lot.dto';
import { ComerLotsEntity } from './entity/comer-lots.entity';

@Injectable()
export class RealStateDispersalService {


    DETOI                       :ACUMDETALLESOI[]=[]
    DETAUX                      :ACUMDETALLESOI[]=[]
    tab_VALPENALOTE             :ValuePenaLot[]=[];
    n_MONTO_DIF_LIQ             :number
    n_MONTO_LIQ                 :number
    tab_SALDOS                  :SALDO[]=[];
    tab_LOTES                   :number[]=[];
    tab_PAGOS                   :number[];
    n_CONT_PAGOS                : 0;
    l_BAN_PAGOS                 :boolean;
    n_ID_EVENTO                 :number;
    n_ORDEN_LOTES               :number; 
    c_ERROR                     :string;
    n_MONTO_TOT_PAGO            :number
    n_MONTO_TOT_CLIE            :number
    n_ID_PAGO                   :number;
    c_REFERENCIA                :string;
    n_NO_MOVIMIENTO             :number;
    f_FECHA                     :Date;
    n_MONTO                     :number;
    c_CVE_BANCO                 :string;
    n_CODIGO                    :number;
    n_ID_LOTE                   :number;
    c_TIPO                      :string;
    f_FECHA_REGISTRO            :Date;
    c_REFERENCIAORI             :string;
    c_CUENTA                    :string;
    n_NO_TRANSFERENTE           :number;
    l_BAN                       :boolean;
    n_ID_PAGOREFGENS            :number;
    n_PORC_IVA                  :number;
    n_TASAIVA                   :number;
    n_TCANT_LOTES               :number;
    n_TLOTE                     :number;
    n_SALDO_GARANT              :number;
    n_MONTO_DIF                 :number;
    n_CVE_EJEC                  :number;
    e_EXCEPPROC                 :any;
    c_REL_LOTES                 :string;
    n_COMA                      :number;
    n_SALDO_PRECIO_FINAL        :number
    n_SALDO_ANTICIPO            :number
    n_SALDO_PRECIO_GARANTIA     :number
    n_SALDO_MONTO_LIQ           :number
    n_SALDO_GARANTIA_ASIG       :number
    n_MONTO_PRECIO_GARANTIA     :number
    n_IND_FINAL                 :number;
    c_CVE_PROCESO               :string;
    n_ID_CLIENTE                :number
    n_LOTE_PUBLICO              :number
    p_MSG_PROCESO               :string
    p_EST_PROCESO               :number;
    n_REL_CLIENTE               :number;
    n_IND_REPRO                 :number;
    c_PARAMETRO                 :string;     
    c_VALOR                     :string;         
    n_ID_TPEVENTO               :number;         
    c_DIRECCION                 :string;           
    c_IND_MOV                   :string;                            
    f_FEC_FALLO                 :Date
    f_FECHA_CIERRE_EVENTO       :Date
    f_FECHA_NOTIFICACION        :Date
    n_NUM_DIAS                  :number;                            
    c_TIPO_LC                   :string;                           
    c_TABLA_APLICA              :string                           
    c_IND_FEC                   :string                           
    c_IND_MONTO                 :string                           
    n_DIAS_GRACIA_CHEQUE        :number                               
    n_DIAS_GRACIA_TRANSF        :number                               
    f_FECHA_GRACIA_GARANT       :Date                                
    f_FECHA_GRACIA_LIQ          :Date                                
    c_LLAVE                     :string                           
    n_VALIDA                    :number;                            
    n_PORPENAIP                 :number                    
    n_PORGARCUMSE               :number                    
    n_MONPENAIP                 :number                   
    n_PFMPENAIP                 :number                   
    n_ADPGPENAIP                :number                   
    n_EXENTAPENA                :number                   
    c_CONIVA                    :string;                             
    l_BANP                      :boolean;                                
    f_FECHA_INI_PENA            :Date;                                   
    G_IVA                       =0 
    G_NUMLOTES                  =0 
    G_UR                        :string
    G_TPOPERACION               = 0;
    G_TPOINGRESO                :string
    G_AREA                      :string
    G_TPODOC                    :string
    G_ANEXO                     :string
    G_PCTCHATARRA               = 0;
    G_TASAIVA                   :number
    G_TPOINGRESOP               :string
    G_TPOINGRESOD               :string
    G_MANDDEV                   :string
    G_USAUTORIZA                :string
    constructor(@InjectRepository(ComerLotsEntity) private entity: Repository<ComerLotsEntity>) {
        this.adjustPaymentRefGens(16,19921)
    }

    //PROCEDIMIENTO PARA AJUSTAR LOS IMPORTES DE PAGOS VS IMPORTES DE LOTES EN DETALLE MANDATOS
    async detailAdjustMandates(lot:number):Promise<string>{

        var  ni_ID_LOTE         :number
        var  ni_IVA_FINAL       :number
        var  ni_MONTO_APP_IVA   :number
        var  ni_MONTO_NOAPP_IVA :number
        var ni_IDENTIFICADOR    :number;
        var pi_RESUL     = 'OK';
        var ni_ID_LOTE   = lot;
        var re_MAND_DIF:any[] = await this.entity.query(`SELECT A.MANDATO,
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

        var query:any[] = await this.entity.query(`SELECT (BXL_MONTO_APP_IVA - CD_MONTO_APP_IVA) as param1,
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
            if(query.length > 0 ){
                ni_MONTO_APP_IVA = query[0].param1 || 0
                ni_IVA_FINAL =query[0].param2 ||0
                ni_MONTO_NOAPP_IVA=query[0].param3 || 0

                if(ni_MONTO_APP_IVA == 0){
                    ni_IVA_FINAL = 0 
                    ni_MONTO_NOAPP_IVA = 0 
                    const query1:any[] = await this.entity.query(`SELECT MAX(IDENTIFICADOR)  as mx
                        FROM sera.COMER_DETALLES CD
                        WHERE ID_LOTE = ${lot}
                        AND EXISTS (SELECT 1 FROM sera.COMER_CABECERAS CC WHERE CC.IDENTIFICADOR = CD.IDENTIFICADOR AND EXISTS (SELECT 1 FROM sera.COMER_PAGOREF PR WHERE PR.ID_PAGO = CC.IDPAGO AND IDORDENINGRESO IS NULL))
                        AND INDTIPO = 'N'`)
                    ni_IDENTIFICADOR = query1[0]?.mx || null
                    if(ni_IDENTIFICADOR){
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

            }else{
                pi_RESUL = `No se pudieron obtener los importes por Lote ${lot}`
            }
           
        
         return pi_RESUL
    }

    // -- PROCEDIMIENTO PARA AJUSTAR LOS IMPORTES DE PAGOS VS IMPORTES DE LOTES --
    async adjustPaymentRefGens(event:number,lot:number) : Promise<string>{
        var ni_ID_EVENTO        = event
        var ni_ID_LOTE          = lot
        var ni_IVA_LOTE         :number
        var ni_MONTO_APP_IVA    :number
        var ni_MONTO_NOAPP_IVA  :number
        var ni_ID_PAGOREFGENS   :number
        var pi_RESUL = "OK"

        var query:any[] = await this.entity.query(`SELECT SUM(coalesce(IVA,0)) as param1,
                    SUM(coalesce(MONTO_APP_IVA,0)) as param2,
                    SUM(coalesce(MONTO_NOAPP_IVA,0)) as param3

            FROM sera.COMER_PAGOSREFGENS 
            WHERE ID_EVENTO = ${event}
                AND ID_LOTE = ${lot}
                AND TIPO = 'N'`);
        ni_IVA_LOTE = query[0].param1|| 0
        ni_MONTO_APP_IVA = query[0].param2 || 0
        ni_MONTO_NOAPP_IVA = query[0].param3 ||0


        var obj = this.tab_VALPENALOTE.filter(x=>x.ID_LOTE==ni_ID_LOTE)[0];

        if((ni_IVA_LOTE + ni_MONTO_APP_IVA + ni_MONTO_NOAPP_IVA) == (obj.IVA_LOTE + obj.MONTO_APP_IVA +obj.MONTO_NOAPP_IVA)){
            if(ni_IVA_LOTE != obj.IVA_LOTE || ni_MONTO_APP_IVA != obj.MONTO_APP_IVA || ni_MONTO_NOAPP_IVA != obj.MONTO_NOAPP_IVA){
                const query1:any[] = await this.entity.query(` SELECT MAX(ID_PAGOREFGENS) as mx
                    FROM sera.COMER_PAGOSREFGENS PRG
                    WHERE ID_EVENTO = ${ni_ID_EVENTO} 
                        AND ID_LOTE = ${ni_ID_LOTE} 
                        AND EXISTS (SELECT 1 FROM sera.COMER_PAGOREF PR WHERE PR.ID_PAGO = PRG.ID_PAGO AND IDORDENINGRESO IS NULL)
                        AND TIPO = 'N'`)
                 console.log('====================================');
                 console.log(query1);
                 console.log('====================================');
            }
        }

        return pi_RESUL
        
    }    

    //-- CORRIGE LOS DECIMALES Y SIMPLIFICA LOS REGISTRO POR MANDATO DE LO QUE SE ENVIARA A SIRSAE --


    async utitDecGroup(amount:number){
        var PRIMERA_VEZ =1
        var H           =0
        var UD_NUEVO    =1

        this.DETAUX = []

        this.DETOI.forEach(element => {
            if(PRIMERA_VEZ ==1 ){
                H = H + 1;
                var detauxObj:ACUMDETALLESOI = {}
                detauxObj.IDENTIFICADOR =   element.IDENTIFICADOR;
                detauxObj.MANDATO    = element.MANDATO;
                detauxObj.INGRESO    = element.INGRESO;
                detauxObj.IMPORTE    = element.IMPORTE;
                detauxObj.IVA        = element.IVA;
                detauxObj.REFERENCIA    = element.REFERENCIA;
                detauxObj.INDTIPO    = element.INDTIPO;
                detauxObj.LOTESIAB    = element.LOTESIAB;
                detauxObj.DESCRIPCION    = element.DESCRIPCION;
                detauxObj.EVENTO    = element.EVENTO;
                detauxObj.LOTE        = element.LOTE;
                detauxObj.VTALOTE    = element.VTALOTE;
                detauxObj.MONTORET    = element.MONTORET;
                detauxObj.MONSIVA    = element.MONSIVA;
                detauxObj.TIPO_PAGO  = element.TIPO_PAGO;
                this.DETAUX.push(detauxObj)

            }else{
                UD_NUEVO = 1;

                for (let index = 0; index < this.DETAUX.length; index++) {
                    if(this.DETAUX[index].MANDATO == element.MANDATO){
                        this.DETAUX[index].IMPORTE = this.DETAUX[index].IMPORTE + element.IMPORTE;
                        this.DETAUX[index].IVA = this.DETAUX[index].IVA + element.IVA;
                        this.DETAUX[index].MONSIVA = this.DETAUX[index].MONSIVA + element.MONSIVA;
                        this.DETAUX[index].MONTORET = this.DETAUX[index].MONTORET + element.MONTORET;
                      
                        UD_NUEVO = 0;
                        break
                    }
                    
                }

                if( UD_NUEVO ==1){
                   
                    this.DETAUX[H].IDENTIFICADOR     = element.IDENTIFICADOR;
                    this.DETAUX[H].MANDATO           = element.MANDATO;
                    this.DETAUX[H].INGRESO           = element.INGRESO;
                    this.DETAUX[H].IMPORTE           = element.IMPORTE;
                    this.DETAUX[H].IVA               = element.IVA;
                    this.DETAUX[H].REFERENCIA        = element.REFERENCIA;
                    this.DETAUX[H].INDTIPO           = element.INDTIPO;
                    this.DETAUX[H].LOTESIAB          = element.LOTESIAB;
                    this.DETAUX[H].DESCRIPCION       = element.DESCRIPCION;
                    this.DETAUX[H].EVENTO            = element.EVENTO;
                    this.DETAUX[H].LOTE              = element.LOTE;
                    this.DETAUX[H].VTALOTE           = element.VTALOTE;
                    this.DETAUX[H].MONTORET          = element.MONTORET;
                    this.DETAUX[H].MONSIVA           = element.MONSIVA;
                    this.DETAUX[H].TIPO_PAGO         = element.TIPO_PAGO;
                    H = H + 1;
                }
            }
            PRIMERA_VEZ = PRIMERA_VEZ + 1;
        });
    }

}
