import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn
} from "typeorm";
import { StateOfRepublicEntity } from "./state.entity";
import { DelegationEntity } from "./delegation.entity";
import { SubdelegationEntity } from "./subdelegation.entity";

@Entity("cat_ciudad", { schema: "sera" })
export class CityEntity {

  @PrimaryGeneratedColumn({type:'numeric', name: 'id_ciudad'  })
  idCity: string;

  @Column("character varying", { name: 'cve_estado', nullable: false })
  state: string;

  @Column("character varying", { name: 'nombre_ciudad', length: 60 })
  nameCity: string;

  @Column({ type: "numeric", name: 'no_delegacion', width: 2 })
  noDelegation: number;

  @Column({ type: "numeric", name: "no_subdelegacion", width: 2 })
  noSubDelegation: number;

  @Column("character varying", { name: "leyenda_oficio", length: 150 })
  legendOffice: string

  @Column({ type: "numeric", name: "no_registro" })
  noRegister: number;

  @Column({ type: "numeric", name: "version" })
  version: number;

  @Column("character varying", {
    name: "usuario_creacion",
    length: 100,
    nullable: false
  })
  creationUser: string;

  @Column({ name: "fecha_creacion", type: "time without time zone" })
  creationDate: Date;

  @Column("character varying", {
    name: "usuario_modificacion",
    length: 100,
    nullable: false
  })
  editionUser: string;

  @Column({ name: "fecha_modificacion", type: "time without time zone" })
  modificationDate: Date;

  @OneToOne(() => StateOfRepublicEntity)
  @JoinColumn([{ name: "cve_estado", referencedColumnName: "id" }])
  stateDetail: StateOfRepublicEntity

  @OneToOne(() => DelegationEntity)
  @JoinColumn([{ name: "no_delegacion", referencedColumnName: "id" }])
  delegationDetail: DelegationEntity

  @OneToOne(() => SubdelegationEntity)
  @JoinColumn([{ name: "no_subdelegacion", referencedColumnName: "id" }])
  SubDelegationDetail: SubdelegationEntity

}