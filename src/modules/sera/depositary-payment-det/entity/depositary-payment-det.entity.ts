

import {
    Column,
    Entity,
    PrimaryColumn,
} from "typeorm";

@Entity("detpago_depositarias", { schema: "sera" })
export class DepositaryPaymentDetEntity {

    @PrimaryColumn({ type: 'integer', name: 'no_nombramiento', nullable: false })
    appointmentNumber: number

    @PrimaryColumn("timestamp without time zone", { name: "fec_pago", nullable: false, default: () => "CURRENT_TIMESTAMP" })
    paymentDate: Date;

    @PrimaryColumn("integer", { name: "cve_concepto_pago", nullable: false })
    cvePaymentConcept: number;

    @Column("integer", { name: "importe"})
    amount: number;

    @Column("character varying", { name: 'observacion', length: 4000 })
    observation: string;

    @Column("integer", { name: "no_registro"})
    registerNumber: number;

}