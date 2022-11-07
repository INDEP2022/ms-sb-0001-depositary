

import {
    Column,
    Entity,
    PrimaryColumn,
} from "typeorm";

@Entity("destino_legal_x_bien", { schema: "sera" })
export class LegalDestinationForPropertyEntity {

    @PrimaryColumn({ type: 'integer', name: 'no_bien', nullable: false })
    propertyNumber: number

    @PrimaryColumn("timestamp without time zone", { name: "fec_solicitud", nullable: false, default: () => "CURRENT_TIMESTAMP" })
    requestDate: Date;

    @Column("character varying", { name: 'tipo_solicitud', length: 1 })
    requestType: string;

    @Column("character varying", { name: 'solicitante_sera', length: 30 })
    applicantSera: string;

    @Column("integer", { name: "no_delegacion_de_atencion", nullable: false })
    attentionDelegationNumber: number;

    @Column("integer", { name: "no_subdelegacion_de_atencion", nullable: false })
    attentionSubDelegationNumber: number;

    @Column("integer", { name: "no_departamento_de_atencion", nullable: false })
    attentionDepartmentNumber: number;
    @Column("timestamp without time zone", { name: "fec_atencion", nullable: false, default: () => "CURRENT_TIMESTAMP" })
    attentionDate: Date;


    @Column("character varying", { name: 'usuario_atendio', length: 30 })
    attentionUser: string;

    @Column("integer", { name: "no_registro"})
    registerNumber: number;

    @Column("character varying", { name: 'candidato_propuesto', length: 30 })
    proposedCandidate:string

}

