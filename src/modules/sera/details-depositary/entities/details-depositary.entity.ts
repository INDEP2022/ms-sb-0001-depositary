import {Column, Entity, PrimaryColumn} from "typeorm";
    @Entity("detalles_depositarias", { schema: "sera" })
    export class detailsDepositaryEntity {
        
      @PrimaryColumn({
          type: 'numeric',
          name: 'identificador',
          
          precision: 4
      })
      id: number;
      
      @PrimaryColumn({
          type: 'numeric',
          name: 'consecutivo',
          
          precision: 4
      })
      consecutive: number;
      
      @Column({
          type: 'character varying',
          name: 'mandato',
          length: '8',
          
      })
      mandate: string;
      
      @Column({
          type: 'character varying',
          name: 'ingreso',
          length: '8',
          
      })
      income: string;
      
      @Column({
          type: 'numeric',
          name: 'importe',
          
          precision: 17
      })
      amount: number;
      
      @Column({
          type: 'numeric',
          name: 'iva',
          
          precision: 12
      })
      vat: number;
      
      @Column({
          type: 'numeric',
          name: 'importe_dedu',
          
          precision: 17
      })
      amountDedu: number;
      
      @Column({
          type: 'character varying',
          name: 'indtipo',
          length: '1',
          
      })
      indtype: string;
      
      @PrimaryColumn({
          type: 'numeric',
          name: 'no_bien',
          
          precision: 11
      })
      goodNum: number;
      
      @Column({
          type: 'character varying',
          name: 'descripcion',
          length: '500',
          
      })
      description: string;
      
      @Column({
          type: 'character varying',
          name: 'unresponsable',
          length: '6',
          
      })
      aresponsable: string;
      
      @PrimaryColumn({
          type: 'numeric',
          name: 'no_nombramiento',
          
          precision: 10
      })
      appointmentNum: number;
      
      @Column({
          type: 'character varying',
          name: 'referencia',
          length: '30',
          
      })
      reference: string;
      
      @Column({
          type: 'numeric',
          name: 'tipo_ingreso',
          
          precision: 10
      })
      typeIncome: number;
      
      @Column({
          type: 'numeric',
          name: 'porc_iva',
          
          precision: 2
      })
      porcVat: number;
      
      @Column({
          type: 'numeric',
          name: 'porc_dedu',
          
          precision: 5
      })
      porcDedu: number;
      
      @Column({
          type: 'numeric',
          name: 'idordengrabada',
          
          precision: 10
      })
      infoDepositary: number;
      
      @Column({
          type: 'character varying',
          name: 'nb_origen',
          
          
      })
      nbOrigin: string;
      
    }