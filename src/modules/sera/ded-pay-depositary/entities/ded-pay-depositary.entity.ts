import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm";
import { PaymentsConceptEntity } from "./payments-concept.entity";
@Entity("detpago_depositarias", { schema: "sera" })
export class dedPayDepositaryEntity {

    @PrimaryColumn({
        type: 'numeric',
        name: 'no_nombramiento',

        precision: 5
    })
    appointmentNum: number;

    @PrimaryColumn({
        type: 'date',
        name: 'fec_pago',


    })
    datePay: Date;

    @PrimaryColumn({
        type: 'numeric',
        name: 'cve_concepto_pago',

        precision: 4
    })
    conceptPayKey: number;

    @Column({
        type: 'numeric',
        name: 'importe',

        precision: 15
    })
    amount: number;

    @Column({
        type: 'character varying',
        name: 'observacion',
        length: '4000',

    })
    observation: string;

    @Column({
        type: 'numeric',
        name: 'no_registro',


    })
    registryNum: number;

    @Column({
        type: 'character varying',
        name: 'nb_origen',


    })
    nbOrigin: string;

    @OneToOne(() => PaymentsConceptEntity, (eventRel) => eventRel.id)
    @JoinColumn([
        { name: "cve_concepto_pago", referencedColumnName: "id" },
    ])
    conceptPay: PaymentsConceptEntity;
}