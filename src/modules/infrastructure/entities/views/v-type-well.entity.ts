import {Column, ViewEntity, PrimaryColumn} from "typeorm";
    @ViewEntity("v_tipo_bien", { schema: "sera" })
    export class VTypeWellEntity {
        
      @Column({
          type: 'numeric',
          name: 'no_clasif_bien',
          
          precision: 5
      })
      classifyGoodNumber: number;
      
      @Column({
          type: 'numeric',
          name: 'no_tipo',
          
          precision: 4
      })
      Type: number;
      
      @Column({
          type: 'character varying',
          name: 'desc_tipo',
          length: '70',
          
      })
      downloadType: string;
      
      @Column({
          type: 'numeric',
          name: 'no_subtipo',
          
          precision: 4
      })
      subtypeNumber: number;
      
      @Column({
          type: 'character varying',
          name: 'desc_subtipo',
          length: '70',
          
      })
      downloadsubtype: string;
      
      @Column({
          type: 'numeric',
          name: 'no_ssubtipo',
          
          precision: 4
      })
      ssubtypeNumber: number;
      
      @Column({
          type: 'character varying',
          name: 'desc_ssubtipo',
          length: '70',
          
      })
      downloadSsubtype: string;
      
      @Column({
          type: 'numeric',
          name: 'no_sssubtipo',
          
          precision: 4
      })
      sssubtypeNumber: number;
      
      @Column({
          type: 'character varying',
          name: 'desc_sssubtipo',
          length: '70',
          
      })
      downloadsssubtype: string;
      
    }