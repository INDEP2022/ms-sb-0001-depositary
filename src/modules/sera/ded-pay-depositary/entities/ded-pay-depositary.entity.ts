import {Column, Entity, PrimaryColumn} from "typeorm";
    @Entity("detpago_depositarias", { schema: "sera" })
    export class dedPayDepositaryEntity {
        
      @PrimaryColumn({
          type: 'numeric',
          name: 'no_nombramiento',
          
          precision: 5
      })
      appointmentNum: number;
      
      @PrimaryColumn({
          type: 'date',
          name: 'fec_pago',
          
          
      })
      datePay: Date;
      
      @PrimaryColumn({
          type: 'numeric',
          name: 'cve_concepto_pago',
          
          precision: 4
      })
      conceptPayKey: number;
      
      @Column({
          type: 'numeric',
          name: 'importe',
          
          precision: 15
      })
      amount: number;
      
      @Column({
          type: 'character varying',
          name: 'observacion',
          length: '4000',
          
      })
      observation: string;
      
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