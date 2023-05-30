import {Column, Entity, PrimaryColumn} from "typeorm";
    @Entity("cat_entfed", { schema: "sera" })
    export class CatEntfedEntity {
        
      @Column({
          type: 'numeric',
          name: 'nmtabla',
          
          precision: 5
      })
      nmtable: number;
      
      @PrimaryColumn({
          type: 'character varying',
          name: 'otclave',
          length: '15',
          
      })
      otkey: string;
      
      @Column({
          type: 'character varying',
          name: 'otvalor',
          length: '200',
          
      })
      otvalor: string;
      
      @Column({
          type: 'numeric',
          name: 'no_registro',
          
          
      })
      recordNumber: number;
      
      @Column({
          type: 'character varying',
          name: 'abreviatura',
          length: '3',
          
      })
      abbreviation: string;
      
      @Column({
          type: 'character varying',
          name: 'riesgo',
          length: '2',
          
      })
      risk: string;
      
      @Column({
          type: 'character varying',
          name: 'nb_origen',
          
          
      })
      nbOrigin: string;
      
    }