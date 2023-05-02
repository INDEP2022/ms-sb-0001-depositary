import {Column, Entity, PrimaryColumn} from "typeorm";
    @Entity("informes_depositarias", { schema: "sera" })
    export class infoDepositaryEntity {
        
      @PrimaryColumn({
          type: 'date',
          name: 'fecha_informe',
          
          
      })
      reportDate: Date;
      
      @Column({
          type: 'character varying',
          name: 'informe',
          length: '4000',
          
      })
      report: string;
      
      @PrimaryColumn({
          type: 'character varying',
          name: 'no_persona',
          length: '30',
          
      })
      personNum: string;
      
      @Column({
          type: 'bigint',
          name: 'no_bien',
          
          precision: 64
      })
      goodNum: number;
      
      @Column({
          type: 'double precision',
          name: 'no_registro',
          
          precision: 53
      })
      registryNum: number;
      
      @Column({
          type: 'character varying',
          name: 'nb_origen',
          
          
      })
      nbOrigin: string;
      
    }