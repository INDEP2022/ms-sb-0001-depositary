import {Column, Entity, PrimaryColumn} from "typeorm";
    @Entity("personasxnom_depositarias", { schema: "sera" })
    export class personsModDepositaryEntity {
        
      @PrimaryColumn({
          type: 'numeric',
          name: 'no_nombramiento',
          
          precision: 5
      })
      appointmentNum: number;
      
      @Column({
          type: 'character varying',
          name: 'no_persona',
          length: '30',
          
      })
      personNum: string;
      
      @Column({
          type: 'character varying',
          name: 'procesar',
          length: '1',
          
      })
      process: string;
      
      @Column({
          type: 'date',
          name: 'fecha_ejecucion',
          
          
      })
      dateExecution: Date;
      
      @Column({
          type: 'character varying',
          name: 'enviado_sirsae',
          length: '1',
          
      })
      sentSirsae: string;
      
      @Column({
          type: 'character varying',
          name: 'modificar_estatus',
          length: '1',
          
      })
      modifyStatus: string;
      
      @Column({
          type: 'character varying',
          name: 'procesado',
          length: '1',
          
      })
      indicted: string;
      
      @Column({
          type: 'date',
          name: 'fecha_envio',
          
          
      })
      dateShipment: Date;
      
      @Column({
          type: 'character varying',
          name: 'enviar_sirsae',
          length: '1',
          
      })
      sendSirsae: string;
      
      @Column({
          type: 'character varying',
          name: 'nb_origen',
          
          
      })
      nbOrigin: string;
      
    }