import { 
    Column, 
    Entity, 
    PrimaryColumn,
    PrimaryGeneratedColumn, 
  } from "typeorm"; 
   
  @Entity("cat_concepto_pagos", { schema: "sera" }) 
  export class PaymentsConceptEntity { 
   
    @PrimaryGeneratedColumn({type:'numeric',name:'cve_concepto_pago'})
    id: number;

    @Column("character varying",{name:'descripcion',length:100})
    description:string;

    @Column("numeric", { name: "no_registro"}) 
    numRegister: number; 
  }