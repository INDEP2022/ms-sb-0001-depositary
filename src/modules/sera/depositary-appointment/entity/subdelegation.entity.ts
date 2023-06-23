import { 
    Column, 
    Entity, 
    JoinColumn, 
    OneToOne, 
    PrimaryColumn, 
  } from "typeorm"; 
import { DelegationEntity } from './delegation.entity';
   
  @Entity("cat_subdelegaciones", { schema: "sera" }) 
  export class SubdelegationEntity { 
   
    @PrimaryColumn({type:'numeric',name:'no_subdelegacion'})
    id?: number;
    @PrimaryColumn("numeric", { name: "etapa_edo"}) 
    phaseEdo: number; 
    @PrimaryColumn("numeric", { name: "no_delegacion"}) 
    delegationNumber : number;
    @Column("character varying",{name:'descripcion',length:30})
    description:string;
    @Column("numeric", { name: "no_consecutivo_diario"}) 
    dailyConNumber : number;
    @Column("timestamp without time zone", { name: "fec_consecutivo_diario", default:()=>'CURRENT_TIMESTAMP'}) 
    dateDailyCon : Date
    @Column("numeric", { name: "no_registro"}) 
    registerNumber: number;
    
    @OneToOne(() => DelegationEntity)
    @JoinColumn([{ name: "no_delegacion", referencedColumnName: "id" }, { name: "etapa_edo", referencedColumnName: "etapaEdo" }])
    delegationDetail: DelegationEntity
  }