import {Column, Entity, PrimaryColumn} from "typeorm";
    @Entity("destino_legal_x_bien", { schema: "sera" })
    export class destinyLegalByGoodEntity {
        
      @PrimaryColumn({
          type: 'numeric',
          name: 'no_bien',
          
          precision: 10
      })
      goodNumber: number;
      
      @PrimaryColumn({
          type: 'date',
          name: 'fec_solicitud',
          
          
      })
      dateApplication: Date;
      
      @Column({
          type: 'character varying',
          name: 'tipo_solicitud',
          length: '1',
          
      })
      typeApplication: string;
      
      @Column({
          type: 'character varying',
          name: 'solicitante_sera',
          length: '30',
          
      })
      applicantSera: string;
      
      @Column({
          type: 'numeric',
          name: 'no_delegacion_de_atencion',
          
          precision: 2
      })
      delegationAttentionNum: number;
      
      @Column({
          type: 'numeric',
          name: 'no_subdelegacion_de_atencion',
          
          precision: 2
      })
      subdelegationAttentionNum: number;
      
      @Column({
          type: 'numeric',
          name: 'no_departamento_de_atencion',
          
          precision: 3
      })
      departmentAttentionNum: number;
      
      @Column({
          type: 'date',
          name: 'fec_atencion',
          
          
      })
      dateAttention: Date;
      
      @Column({
          type: 'character varying',
          name: 'usuario_atendio',
          length: '30',
          
      })
      userAttended: string;
      
      @Column({
          type: 'numeric',
          name: 'no_registro',
          
          
      })
      registryNum: number;
      
      @Column({
          type: 'character varying',
          name: 'candidato_propuesto',
          length: '30',
          
      })
      candidateProposed: string;
      
      @Column({
          type: 'character varying',
          name: 'nb_origen',
          
          
      })
      nbOrigin: string;
      
    }