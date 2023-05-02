import {Column, Entity, PrimaryColumn} from "typeorm";
    @Entity("solicitudes_depositaria", { schema: "sera" })
    export class requestsDepositaryEntity {
        
      @PrimaryColumn({
          type: 'numeric',
          name: 'no_solicitud',
          
          precision: 5
      })
      applicationNum: number;
      
      @Column({
          type: 'date',
          name: 'fec_solicitud',
          
          
      })
      dateApplication: Date;
      
      @Column({
          type: 'numeric',
          name: 'area_de_atencion',
          
          precision: 3
      })
      areaOfAttention: number;
      
      @Column({
          type: 'character varying',
          name: 'cve_tipo_sol',
          length: '1',
          
      })
      typeApplicationKey: string;
      
      @Column({
          type: 'date',
          name: 'fec_atencion',
          
          
      })
      dateAttention: Date;
      
      @Column({
          type: 'character varying',
          name: 'persona_atendio',
          length: '30',
          
      })
      personAttended: string;
      
      @Column({
          type: 'character varying',
          name: 'solicitante_sera',
          length: '30',
          
      })
      applicantSera: string;
      
      @Column({
          type: 'numeric',
          name: 'no_registro',
          
          
      })
      registryNum: number;
      
      @Column({
          type: 'character varying',
          name: 'no_persona',
          length: '30',
          
      })
      personNum: string;
      
      @Column({
          type: 'character varying',
          name: 'nb_origen',
          
          
      })
      nbOrigin: string;
      
    }