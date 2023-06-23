import { Zone_geographicEntity } from "./zone-geo.entity";
import { 
    Column, 
    Entity, 
    JoinColumn, 
    ManyToOne, 
    OneToOne, 
    PrimaryColumn, 
    PrimaryGeneratedColumn
  } from "typeorm"; 
import { SubdelegationEntity } from "./subdelegation.entity";
   
  @Entity("cat_delegacion", { schema: "sera" }) 
  export class DelegationEntity { 
   
    @PrimaryGeneratedColumn({type:'numeric',name:'id_delegacion'})
    id: number;

    @PrimaryColumn({type:'numeric',name:'etapa_edo'})
    etapaEdo: number;

    @Column({type:'character varying',name:'cve_estado',length:30})
    stateKey: string;

    @Column("character varying",{name:'descripcion',length:150})
    description:string;

    @Column("character varying",{name:'domicilio_oficina',length:200})
    addressOffice:string;

    @Column("character varying",{name:'delegado_regional',length:200})
    regionalDelegate:string;

    @Column("character varying",{name:'cve_zona',length:150})
    zoneKey:string;

    @Column("character varying",{name:'ciudad',length:100})
    city:string;

    @Column("numeric",{name:'status'})
    status : number;

    @Column("numeric",{name:'iva'})
    iva : number;    

    @Column("numeric",{name:'no_registro'})
    noRegister : number;

    @Column("numeric",{name:'cve_zona_contrato'})
    zoneContractKey : number;

    @Column("integer", { name: "cve_zona_vigilancia" }) 
    zoneVigilanceKey : number

    @Column("numeric", { name: "dif_hora"}) 
    diffHours : number;    

    @Column("numeric", { name: "version"}) 
    version : number;

    @Column("character varying", {name: "usuario_creacion", length: 100, nullable: false})
    creationUser: string;

    @Column({type: Date, name: "fecha_creacion"})  
    creationDate: Date;

    @Column("character varying", {name: "usuario_modificacion", length: 100,nullable: false})
    editionUser: string;

    @Column({type: Date, name: "fecha_modificacion"})
    modificationDate: Date;

    @Column({type: "numeric", name: "id_zona_geografica"})
    idZoneGeographic: number;


    @OneToOne(() => SubdelegationEntity, (e) => e.delegationDetail) // specify inverse side as a second parameter
    subDelegationDetail: SubdelegationEntity

    
    @OneToOne(() => DelegationEntity, (e) => e.delegationDetail) // specify inverse side as a second parameter
    delegationDetail: DelegationEntity


    @OneToOne(() => Zone_geographicEntity)
    @JoinColumn([{ name: "id_zona_geografica", referencedColumnName: "id" }])
    expedient: Zone_geographicEntity
  }