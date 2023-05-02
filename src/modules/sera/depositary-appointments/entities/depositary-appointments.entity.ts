import {Column, Entity, PrimaryColumn} from "typeorm";
    @Entity("nombramientos_depositaria", { schema: "sera" })
    export class depositaryAppointmentsEntity {
        
      @PrimaryColumn({
          type: 'numeric',
          name: 'no_nombramiento',
          
          precision: 5
      })
      appointmentNum: number;
      
      @Column({
          type: 'date',
          name: 'fec_nomb_prov',
          
          
      })
      nameProvDete: Date;
      
      @Column({
          type: 'date',
          name: 'fec_revocacion',
          
          
      })
      revocationDate: Date;
      
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
      contractKey: string;
      
      @Column({
          type: 'date',
          name: 'fec_ini_contrato',
          
          
      })
      startContractDate: Date;
      
      @Column({
          type: 'date',
          name: 'fec_fin_contrato',
          
          
      })
      endContractDate: Date;
      
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
      nameTypeKey: string;
      
      @Column({
          type: 'character varying',
          name: 'cve_tipo_administrador',
          length: '1',
          
      })
      administratorTypeKey: string;
      
      @Column({
          type: 'date',
          name: 'fec_asignacion',
          
          
      })
      assignmentDate: Date;
      
      @Column({
          type: 'date',
          name: 'fec_nombramiento',
          
          
      })
      appointmentDate: Date;
      
      @Column({
          type: 'character varying',
          name: 'cedula_nombramiento',
          length: '60',
          
      })
      cardAppointmentId: string;
      
      @Column({
          type: 'character varying',
          name: 'tipo_depositaria',
          length: '1',
          
      })
      typeDepositary: string;
      
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
      jobRevocationNum: string;
      
      @Column({
          type: 'numeric',
          name: 'importe_contraprestacion',
          
          precision: 15
      })
      amountConsideration: number;
      
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
      jobProvisionalNum: string;
      
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
      jobBoardgovtDate: Date;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_junta_gob',
          length: '20',
          
      })
      jobBoardgovtNum: string;
      
      @Column({
          type: 'date',
          name: 'fec_envio_dir_gral',
          
          
      })
      shipmentDirgralDate: Date;
      
      @Column({
          type: 'date',
          name: 'fec_contestacion_dir_gral',
          
          
      })
      replyDirgralDate: Date;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_turno',
          length: '20',
          
      })
      jobShiftNum: string;
      
      @Column({
          type: 'date',
          name: 'fec_turno',
          
          
      })
      shiftDate: Date;
      
      @Column({
          type: 'date',
          name: 'fec_retorno',
          
          
      })
      returnDate: Date;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_contestacion',
          length: '20',
          
      })
      jobReplyNum: string;
      
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
      cardAppointmentIdBoardgovt: string;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_contesta_dir_gral',
          length: '20',
          
      })
      jobAnswerDirgralNum: string;
      
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
      representativeSera: string;
      
      @Column({
          type: 'numeric',
          name: 'no_bien',
          
          precision: 10
      })
      goodNum: number;
      
      @Column({
          type: 'numeric',
          name: 'no_registro',
          
          
      })
      registryNum: number;
      
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
      amountVat: number;
      
      @Column({
          type: 'numeric',
          name: 'folio_universal',
          
          precision: 15
      })
      folioUniversal: number;
      
      @Column({
          type: 'numeric',
          name: 'folio_regreso',
          
          precision: 15
      })
      folioReturn: number;
      
      @Column({
          type: 'numeric',
          name: 'no_persona',
          
          precision: 10
      })
      personNum: number;
      
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