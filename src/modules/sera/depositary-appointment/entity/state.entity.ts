import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { CityEntity } from "./city.entity";
import { PersonEntity } from "./person.entity";

@Entity("cat_estado", { schema: "sera" })
export class StateOfRepublicEntity {

  @PrimaryColumn({ type:"numeric",name: "cve_estado" })
  id: string;

  @Column("character varying", { name: "desc_estado", length: 200 })
  descCondition: string;

  @Column("character varying", { name: "code_estado", length: 30 })
  codeCondition: string;

  @Column("numeric", { name: "no_registro", nullable: true })
  registrationNumber: number;

  @Column("numeric", { name: "nmtabla", nullable: true, precision: 5, scale: 0, })
  nmtable: number;

  @Column("character varying", { name: "abreviatura", nullable: true, length: 3, })
  abbreviation: string

  @Column("character varying", { name: "riesgo", nullable: true, length: 2 })
  risk: string

  @Column("numeric", { name: "version", nullable: true })
  version: number

  @Column("character varying", { name: "zona_horaria_std", nullable: true, length: 20, })
  zoneHourlyStd: string

  @Column("character varying", { name: "zona_horaria_ver", nullable: true, length: 20, })
  zoneHourlyVer: string

  @Column("character varying", { name: "usuario_creacion", length: 100 })
  userCreation: string;

  @Column("date", { name: "fecha_creacion" })
  creationDate: Date;

  @Column("character varying", { name: "usuario_modificacion", length: 100 })
  userModification: string;

  @Column("date", { name: "fecha_modificacion" })
  modificationDate: Date;


  @OneToOne(() => CityEntity, (e) => e.stateDetail) // specify inverse side as a second parameter
  stateDetail: CityEntity


  /* @OneToOne(() => DelegationStateEntity, (e) => e.stateCodeDetail) // specify inverse side as a second parameter 
  stateCodeDetail: DelegationStateEntity */

  /* @OneToOne(() => DelegationStateEntity) 
  @JoinColumn([{ name: "code_estado", referencedColumnName: "stateCode" }]) 
  stateCodeDetail: DelegationStateEntity */

}