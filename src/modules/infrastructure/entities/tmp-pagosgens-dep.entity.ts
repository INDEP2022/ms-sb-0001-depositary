import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('tmp_pagosgens_dep', { schema: 'sera' })
export class TmpPagosGensDepEntity {
  @PrimaryColumn({
    type: 'numeric',
    name: 'id_pagogens',
  })
  payGensId: number;

  @Column({
    type: 'numeric',
    name: 'id_pago',
  })
  payId: number;

  @Column({
    type: 'numeric',
    name: 'id_pago_cubrio',
  })
  payCoverId: number;

  @Column({
    type: 'numeric',
    name: 'no_bien',
  })
  noGood: number;

  @Column({
    type: 'numeric',
    name: 'monto',
  })
  amount: number;

  @Column({
    type: 'character varying',
    name: 'referencia',
    length: 30,
  })
  reference: string;

  @Column({
    type: 'character varying',
    name: 'tipoingreso',
    length: 2,
  })
  typeInput: string;

  @Column({
    type: 'numeric',
    name: 'no_transferente',
  })
  noTransferable: number;

  @Column({
    type: 'numeric',
    name: 'iva',
  })
  iva: number;

  @Column({
    type: 'numeric',
    name: 'monto_iva',
  })
  amountIva: number;

  @Column({
    type: 'numeric',
    name: 'abono',
  })
  payment: number;

  @Column({
    type: 'numeric',
    name: 'pago_act',
  })
  paymentAct: number;

  @Column({
    type: 'numeric',
    name: 'deduxcent',
  })
  deduxcent: number;

  @Column({
    type: 'numeric',
    name: 'deduvalor',
  })
  deduValue: number;

  @Column({
    type: 'character varying',
    name: 'status',
    length: 1,
  })
  status: string;

  @Column({
    type: 'numeric',
    name: 'no_nombramiento',
  })
  noAppointment: number;

  @Column({
    type: 'date',
    name: 'fecha_proceso',
  })
  dateProcess: Date;

  @Column({
    type: 'character varying',
    name: 'tipo',
    length: 1,
  })
  type: string;

  @Column({
    type: 'character varying',
    name: 'inserto',
    length: 2,
  })
  insert: string;

  @Column({
    type: 'numeric',
    name: 'xcentdedu',
  })
  xcentdedu: number;

  @Column({
    type: 'numeric',
    name: 'valordedu',
  })
  valuededu: number;

  @Column({
    type: 'numeric',
    name: 'xcubrir',
  })
  xCover: number;

  @Column({
    type: 'numeric',
    name: 'imp_sin_iva',
  })
  impWithoutIva: number;

  @Column({
    type: 'numeric',
    name: 'chk_dedu',
  })
  chkDedu: number;

  @Column({
    type: 'character varying',
    name: 'origen',
    length: 2,
  })
  origin: string;

  @Column({
    type: 'character varying',
    name: 'observ_pago',
    length: 1000,
  })
  paymentObserv: string;

  @Column({
    type: 'character varying',
    name: 'observ_dedu',
    length: 1000,
  })
  deduObserv: string;

  @Column({
    type: "character varying",
    name: "nb_origen",
  })
  nbOrigin: string;
}
