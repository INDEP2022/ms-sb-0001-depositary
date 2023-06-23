import {Column, Entity, PrimaryColumn} from "typeorm";
    @Entity("nombramientos_depositaria", { schema: "sera" })
    export class AppointmentDepositoryEntity {
        
      @PrimaryColumn({
          type: 'numeric',
          name: 'no_nombramiento',
          
          precision: 5
      })
      numberAppointment: number;
      
      @Column({
          type: 'date',
          name: 'fec_nomb_prov',
          
          
      })
      datenameProv: Date;
      
      @Column({
          type: 'date',
          name: 'fec_revocacion',
          
          
      })
      dateRevocation: Date;
      
      @Column({
          type: 'character varying',
          name: 'revocacion',
          length: '1',
          
      })
      revocation: string;
      
      @Column({
          type: 'character varying',
          name: 'cve_contrato',
          length: '60',
          
      })
      cveContract: string;
      
      @Column({
          type: 'date',
          name: 'fec_ini_contrato',
          
          
      })
      datestartContract: Date;
      
      @Column({
          type: 'date',
          name: 'fec_fin_contrato',
          
          
      })
      dateEndContract: Date;
      
      @Column({
          type: 'numeric',
          name: 'cantidad',
          
          precision: 9
      })
      amount: number;
      
      @Column({
          type: 'character varying',
          name: 'cve_tipo_nomb',
          length: '1',
          
      })
      cveGuyname: string;
      
      @Column({
          type: 'character varying',
          name: 'cve_tipo_administrador',
          length: '1',
          
      })
      cveGuyAdministrator: string;
      
      @Column({
          type: 'date',
          name: 'fec_asignacion',
          
          
      })
      dateAssignment: Date;
      
      @Column({
          type: 'date',
          name: 'fec_nombramiento',
          
          
      })
      dateAppointment: Date;
      
      @Column({
          type: 'character varying',
          name: 'cedula_nombramiento',
          length: '60',
          
      })
      identificationcardAppointment: string;
      
      @Column({
          type: 'character varying',
          name: 'tipo_depositaria',
          length: '1',
          
      })
      guydepositary: string;
      
      @Column({
          type: 'character varying',
          name: 'observaciones',
          length: '1000',
          
      })
      observations: string;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_revocacion',
          length: '20',
          
      })
      numberJobRevocation: string;
      
      @Column({
          type: 'numeric',
          name: 'importe_contraprestacion',
          
          precision: 15
      })
      amountconsideration: number;
      
      @Column({
          type: 'numeric',
          name: 'importe_honorarios',
          
          precision: 15
      })
      amountFee: number;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_provisional',
          length: '20',
          
      })
      numberJobProvisional: string;
      
      @Column({
          type: 'character varying',
          name: 'anexo',
          length: '20',
          
      })
      exhibit: string;
      
      @Column({
          type: 'date',
          name: 'fec_oficio_junta_gob',
          
          
      })
      dateJobBoardgovt: Date;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_junta_gob',
          length: '20',
          
      })
      numberJobBoardgovt: string;
      
      @Column({
          type: 'date',
          name: 'fec_envio_dir_gral',
          
          
      })
      dateShipmentDirgral: Date;
      
      @Column({
          type: 'date',
          name: 'fec_contestacion_dir_gral',
          
          
      })
      dateReplyDirgral: Date;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_turno',
          length: '20',
          
      })
      numberJobShift: string;
      
      @Column({
          type: 'date',
          name: 'fec_turno',
          
          
      })
      dateShift: Date;
      
      @Column({
          type: 'date',
          name: 'fec_retorno',
          
          
      })
      dateReturn: Date;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_contestacion',
          length: '20',
          
      })
      numberJobReply: string;
      
      @Column({
          type: 'character varying',
          name: 'acuerdo_nombramiento',
          length: '2000',
          
      })
      agreementAppointment: string;
      
      @Column({
          type: 'character varying',
          name: 'cedula_nombramiento_junta_gob',
          length: '60',
          
      })
      identificationcardAppointmentBoardgovt: string;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_contesta_dir_gral',
          length: '20',
          
      })
      numberJobAnswerDirgral: string;
      
      @Column({
          type: 'character varying',
          name: 'autoridad_ordena_asignacion',
          length: '200',
          
      })
      authorityorderAssignment: string;
      
      @Column({
          type: 'character varying',
          name: 'responsable',
          length: '30',
          
      })
      responsible: string;
      
      @Column({
          type: 'character varying',
          name: 'representante_sera',
          length: '30',
          
      })
      representativeBe: string;
      
      @Column({
          type: 'numeric',
          name: 'no_bien',
          
          precision: 10
      })
      numberGood: number;
      
      @Column({
          type: 'numeric',
          name: 'no_registro',
          
          
      })
      numberRecord: number;
      
      @Column({
          type: 'character varying',
          name: 'vigencia',
          length: '20',
          
      })
      validity: string;
      
      @Column({
          type: 'numeric',
          name: 'importe_iva',
          
          precision: 15
      })
      amountvat: number;
      
      @Column({
          type: 'numeric',
          name: 'folio_universal',
          
          precision: 15
      })
      InvoiceUniversal: number;
      
      @Column({
          type: 'numeric',
          name: 'folio_regreso',
          
          precision: 15
      })
      InvoiceReturn: number;
      
      @Column({
          type: 'numeric',
          name: 'no_persona',
          
          precision: 10
      })
      numberPerson: number;
      
      @Column({
          type: 'character varying',
          name: 'referencia',
          length: '30',
          
      })
      reference: string;
      
      @Column({
          type: 'numeric',
          name: 'iva',
          
          precision: 5
      })
      vat: number;
      
      @Column({
          type: 'character varying',
          name: 'con_menaje',
          length: '1',
          
      })
      withHousehold: string;
      
      @Column({
          type: 'character varying',
          name: 'nb_origen',
          
          
      })
      nbOrigin: string;
      
    }