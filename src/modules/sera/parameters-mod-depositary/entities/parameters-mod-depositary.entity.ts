import {Column, Entity, PrimaryColumn} from "typeorm";
    @Entity("parametrosmod_depositarias", { schema: "sera" })
    export class parametersModDepositaryEntity {
        
      @PrimaryColumn({
          type: 'character varying',
          name: 'parametro',
          length: '20',
          
      })
      parameter: string;
      
      @Column({
          type: 'character varying',
          name: 'valor',
          length: '500',
          
      })
      value: string;
      
      @Column({
          type: 'character varying',
          name: 'descripcion',
          length: '200',
          
      })
      description: string;
      
      @Column({
          type: 'character varying',
          name: 'direccion',
          length: '1',
          
      })
      address: string;
      
      @Column({
          type: 'character varying',
          name: 'nb_origen',
          
          
      })
      nbOrigin: string;
      
    }