

import {
    Column,
    Entity,
    PrimaryColumn,
} from "typeorm";

@Entity("detrepo_depositarias", { schema: "sera" })
export class DepositaryDetRepoEntity {

    @PrimaryColumn({ type: 'integer', name: 'no_nombramiento', nullable: false })
    appointmentNumber: number

    @PrimaryColumn("timestamp without time zone", { name: "fec_repo", nullable: false, default: () => "CURRENT_TIMESTAMP" })
    repoDate: Date;

    @PrimaryColumn("integer", { name: "cve_reporte", nullable: false })
    cveReport: number;

    @Column("character varying", { name: 'reporte', length: 4000 })
    report: string;

    @Column("integer", { name: "no_registro"})
    registerNumber: number;

}