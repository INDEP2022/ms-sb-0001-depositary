import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'pagosgens_depositarias', schema: 'sera' })
export class paymentsgensDepositaryEntity {
    @PrimaryColumn({ type: 'numeric', precision: 10, name: "id_pagogens" })
    payIdGens: number;

    @PrimaryColumn({ type: 'numeric', precision: 10, name: "id_pago" })
    payId: number;

    @Column({ type: 'numeric', nullable: true, name: "no_bien" })
    noGoods: number;

    @Column({ type: 'numeric', precision: 17, scale: 2, nullable: true, name: "monto" })
    amount: number;

    @Column({ type: 'character varying', length: 30, nullable: true, name: "referencia" })
    reference: string;

    @Column({ type: 'numeric', precision: 5, nullable: true, name: "no_transferente" })
    not_transferring: number;

    @Column({ type: 'numeric', precision: 17, scale: 2, nullable: true, name: "iva" })
    iva: number;

    @Column({ type: 'numeric', precision: 17, scale: 2, nullable: true, name: "monto_iva" })
    ivaAmount: number;

    @Column({ type: 'numeric', precision: 17, scale: 2, nullable: true, name: "abono" })
    payment: number;

    @Column({ type: 'numeric', precision: 17, scale: 2, nullable: true, name: "pago_act" })
    actPay: number;

    @Column({ type: 'numeric', nullable: true, name: "deduxcent" })
    deduxcent: number;

    @Column({ type: 'numeric', precision: 17, scale: 2, nullable: true, name: "deduvalor" })
    deduvalue: number;

    @Column({ type: 'character varying', length: 1, nullable: true, name: "status" })
    status: string;

    @Column({ type: 'numeric', precision: 10, name: "no_nombramiento" })
    no_appointment: number;

    @Column({ type: 'date', nullable: true, name: "fecha_proceso" })
    processDate: Date;

    @Column({ type: 'numeric', precision: 10, nullable: true, name: "id_pago_cubrio" })
    cubrioPayId: number;

    @Column({ type: 'numeric', precision: 17, scale: 2, nullable: true, name: "imp_sin_iva" })
    impWithoutIva: number;

    @Column({ type: 'numeric', nullable: true, name: "abono_cubierto" })
    coveredPayment: number;

    @Column({ type: 'character varying', length: 1000, nullable: true, name: "observ_pago" })
    payObserv: string;

    @Column({ type: 'character varying', length: 1000, nullable: true, name: "observ_dedu" })
    deduObserv: string;

    @Column({ type: 'character varying', length: 2, nullable: true, name: "tipoingreso" })
    incometype: string;

    @Column({ type: 'numeric', nullable: true, name: "no_registro" })
    register_number: number;

    @Column({
        type: "character varying",
        name: "nb_origen",
    })
    nbOrigin: string;
}