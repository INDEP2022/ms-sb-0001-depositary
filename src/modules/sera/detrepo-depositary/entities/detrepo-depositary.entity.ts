import {Column, Entity, PrimaryColumn} from "typeorm";
    @Entity("detrepo_depositarias", { schema: "sera" })
    export class detrepoDepositaryEntity {
        
      @PrimaryColumn({
          type: 'numeric',
          name: 'no_nombramiento',
          
          precision: 5
      })
      appointmentNum: number;
      
      @PrimaryColumn({
          type: 'date',
          name: 'fec_repo',
          
          
      })
      dateRepo: Date;
      
      @PrimaryColumn({
          type: 'numeric',
          name: 'cve_reporte',
          
          
      })
      reportKey: number;
      
      @Column({
          type: 'character varying',
          name: 'reporte',
          length: '4000',
          
      })
      report: string;
      
      @Column({
          type: 'numeric',
          name: 'no_registro',
          
          
      })
      registryNum: number;
      
      @Column({
          type: 'character varying',
          name: 'nb_origen',
          
          
      })
      nbOrigin: string;
      
    }