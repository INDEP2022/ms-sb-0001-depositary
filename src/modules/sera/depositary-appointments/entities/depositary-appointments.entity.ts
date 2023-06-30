import {Column, Entity, PrimaryColumn, PrimaryGeneratedColumn} from "typeorm";
    @Entity("nombramientos_depositaria", { schema: "sera" })
    export class depositaryAppointmentsEntity {
        
      @PrimaryGeneratedColumn({
          type: 'numeric',
          name: 'no_nombramiento',
          
          //precision: 5
      })
      appointmentNum: number;
      
      @Column({
          type: 'date',
          name: 'fec_nomb_prov',
          nullable: true
          
      })
      nameProvDete: Date;
      
      @Column({
          type: 'date',
          name: 'fec_revocacion',
          nullable: true
          
      })
      revocationDate: Date;
      
      @Column({
          type: 'character varying',
          name: 'revocacion',
          length: '1',
          nullable: true
          
      })
      revocation: string;
      
      @Column({
          type: 'character varying',
          name: 'cve_contrato',
          length: '60',
          nullable: true
      })
      contractKey: string;
      
      @Column({
          type: 'date',
          name: 'fec_ini_contrato',
          nullable: true
          
      })
      startContractDate: Date;
      
      @Column({
          type: 'date',
          name: 'fec_fin_contrato',
          nullable: true
          
      })
      endContractDate: Date;
      
      @Column({
          type: 'numeric',
          name: 'cantidad',
          nullable: true,
          precision: 9
      })
      amount: number;
      
      @Column({
          type: 'character varying',
          name: 'cve_tipo_nomb',
          length: '1',
          nullable: true,
      })
      nameTypeKey: string;
      
      @Column({
          type: 'character varying',
          name: 'cve_tipo_administrador',
          length: '1',
          nullable: true,
      })
      administratorTypeKey: string;
      
      @Column({
          type: 'date',
          name: 'fec_asignacion',
          nullable: true,
          
      })
      assignmentDate: Date;
      
      @Column({
          type: 'date',
          name: 'fec_nombramiento',
          nullable: true,
          
      })
      appointmentDate: Date;
      
      @Column({
          type: 'character varying',
          name: 'cedula_nombramiento',
          length: '60',
          nullable: true,
      })
      cardAppointmentId: string;
      
      @Column({
          type: 'character varying',
          name: 'tipo_depositaria',
          length: '1',
          nullable: true,
      })
      typeDepositary: string;
      
      @Column({
          type: 'character varying',
          name: 'observaciones',
          length: '1000',
          nullable: true,
      })
      observations: string;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_revocacion',
          length: '20',
          nullable: true,
      })
      jobRevocationNum: string;
      
      @Column({
          type: 'numeric',
          name: 'importe_contraprestacion',
          nullable: true,
          precision: 15
      })
      amountConsideration: number;
      
      @Column({
          type: 'numeric',
          name: 'importe_honorarios',
          nullable: true,
          precision: 15
      })
      amountFee: number;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_provisional',
          length: '20',
          nullable: true,
      })
      jobProvisionalNum: string;
      
      @Column({
          type: 'character varying',
          name: 'anexo',
          length: '20',
          nullable: true,
      })
      exhibit: string;
      
      @Column({
          type: 'date',
          name: 'fec_oficio_junta_gob',
          nullable: true,
          
      })
      jobBoardgovtDate: Date;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_junta_gob',
          length: '20',
          nullable: true,
      })
      jobBoardgovtNum: string;
      
      @Column({
          type: 'date',
          name: 'fec_envio_dir_gral',
          nullable: true,
          
      })
      shipmentDirgralDate: Date;
      
      @Column({
          type: 'date',
          name: 'fec_contestacion_dir_gral',
          nullable: true,
          
      })
      replyDirgralDate: Date;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_turno',
          length: '20',
          nullable: true,
      })
      jobShiftNum: string;
      
      @Column({
          type: 'date',
          name: 'fec_turno',
          nullable: true,
          
      })
      shiftDate: Date;
      
      @Column({
          type: 'date',
          name: 'fec_retorno',
          nullable: true,
          
      })
      returnDate: Date;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_contestacion',
          length: '20',
          nullable: true,
      })
      jobReplyNum: string;
      
      @Column({
          type: 'character varying',
          name: 'acuerdo_nombramiento',
          length: '2000',
          nullable: true,
      })
      agreementAppointment: string;
      
      @Column({
          type: 'character varying',
          name: 'cedula_nombramiento_junta_gob',
          length: '60',
          nullable: true,
      })
      cardAppointmentIdBoardgovt: string;
      
      @Column({
          type: 'character varying',
          name: 'no_oficio_contesta_dir_gral',
          length: '20',
          nullable: true,
      })
      jobAnswerDirgralNum: string;
      
      @Column({
          type: 'character varying',
          name: 'autoridad_ordena_asignacion',
          length: '200',
          nullable: true,
      })
      authorityorderAssignment: string;
      
      @Column({
          type: 'character varying',
          name: 'responsable',
          length: '30',
          nullable: false
      })
      responsible: string;
      
      @Column({
          type: 'character varying',
          name: 'representante_sera',
          length: '30',
          nullable: false
      })
      representativeSera: string;
      
      @Column({
          type: 'numeric',
          name: 'no_bien',
          nullable: false,
          precision: 10
      })
      goodNum: number;
      
      @Column({
          type: 'numeric',
          name: 'no_registro',
          nullable: true,
          
      })
      registryNum: number;
      
      @Column({
          type: 'character varying',
          name: 'vigencia',
          length: '20',
          nullable: true,
      })
      validity: string;
      
      @Column({
          type: 'numeric',
          name: 'importe_iva',
          nullable: true,
          precision: 15
      })
      amountVat: number;
      
      @Column({
          type: 'numeric',
          name: 'folio_universal',
          nullable: true,
          precision: 15
      })
      folioUniversal: number;
      
      @Column({
          type: 'numeric',
          name: 'folio_regreso',
          nullable: true,
          precision: 15
      })
      folioReturn: number;
      
      @Column({
          type: 'numeric',
          name: 'no_persona',
          nullable: false,
          precision: 10
      })
      personNum: number;
      
      @Column({
          type: 'character varying',
          name: 'referencia',
          length: '30',
          nullable: true,
      })
      reference: string;
      
      @Column({
          type: 'numeric',
          name: 'iva',
          nullable: true,
          precision: 5
      })
      vat: number;
      
      @Column({
          type: 'character varying',
          name: 'con_menaje',
          length: '1',
          nullable: true,
      })
      withHousehold: string;
      
      @Column({
          type: 'character varying',
          name: 'nb_origen',
          nullable: true,
          
      })
      nbOrigin: string;
      
    }