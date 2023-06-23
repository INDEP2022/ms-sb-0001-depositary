import { DelegationEntity } from './delegation.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity("cat_zona_geografica", { schema: "sae_nsbdb" })
export class Zone_geographicEntity {

    @PrimaryGeneratedColumn({ type: "numeric", name: "id_zona_geografica" })
    id: number;


    @Column("character varying", { name: "descripcion", length: 200,  nullable: true })
    description: string;


    @Column("numeric", { name: "no_contrato",  nullable: false })
    contractNumber: number;


    @Column("character varying", { name: "usuario_creacion",  nullable: true })
    userCreation: string;

    @Column("date", {
        name: "fecha_creacion",
        default: () => "CURRENT_TIMESTAMP",
    })
    creationDate: Date;

    @Column("character varying", { name: "usuario_modificacion",nullable: true })
    userModification: string;

    @Column("date", {
        name: "fecha_modificacion",
        default: () => "CURRENT_TIMESTAMP",
    })
    modificationDate: Date;

    @Column("numeric", { name: "version",nullable: true })
    version: number;

    @Column("character varying", { name: "tercero_especializado" ,length:20,nullable: true})
    thirdPartySpecialized: string;

    
    @Column("numeric", { name: "iva" ,nullable: true})
    vat: number;

      
    @Column("numeric", { name: "estatus" ,nullable: true})
    status: number;

    @OneToOne(() => DelegationEntity, (e) => e.delegationDetail) // specify inverse side as a second parameter
    delegationDetail: DelegationEntity

}