import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'pagoref_depositarias', schema: 'sera' })
export class refpayDepositoriesEntity {
  @PrimaryColumn({ type: 'numeric', precision: 10, name: 'id_pago' })
  payId: number;

  @Column({ type: 'character varying', length: 30, name: 'referencia' })
  reference: string;

  @Column({ type: 'numeric', precision: 10, name: 'no_movimiento' })
  movementNumber: number;

  @Column({ type: 'date', name: 'fecha' })
  date: Date;

  @Column({ type: 'numeric', precision: 15, scale: 2, name: 'monto' })
  amount: number;

  @Column({ type: 'character varying', length: 10, nullable: true, name: 'cve_banco' })
  cve_bank: string;

  @Column({ type: 'numeric', precision: 3, nullable: true, name: 'codigo' })
  code: number;

  @Column({ type: 'numeric', precision: 10, nullable: true, name: 'no_bien' })
  noGood: number;

  @Column({ type: 'character varying', length: 1, nullable: true, name: 'valido_sistema' })
  validSystem: string;

  @Column({ type: 'character varying', length: 200, nullable: true, name: 'descripcion' })
  description: string;

  @Column({ type: 'character varying', length: 1, nullable: true, name: 'tipo' })
  type: string;

  @Column({ type: 'numeric', precision: 10, nullable: true, name: 'idordeningreso' })
  entryorderid: number;

  @Column({ type: 'character varying', length: 200, nullable: true, name: 'resultado' })
  result: string;

  @Column({ type: 'numeric', precision: 6, nullable: true, name: 'sucursal' })
  sucursal: number;

  @Column({ type: 'character varying', length: 1, nullable: true, name: 'conciliado' })
  reconciled: string;

  @Column({ type: 'date', nullable: true, name: 'fecha_registro' })
  registrationDate: Date;

  @Column({ type: 'character varying', length: 30, nullable: true, name: 'referenciaori' })
  referenceori: string;


  @Column({ type: 'date', nullable: true, name: 'fecha_oi' })
  oiDate: Date;

  @Column({ type: 'character varying', length: 2, nullable: true, name: 'aplicadoa' })
  appliedto: string;

  @Column({ type: 'numeric', precision: 10, nullable: true, name: 'id_cliente' })
  client_id: number;

  @Column({ type: 'numeric', nullable: true, name: 'no_registro' })
  registerNumber: number;

  @Column({ type: 'character varying', length: 1, nullable: true, name: 'envio_oi' })
  sent_oi: string;

  @Column({ type: 'numeric', precision: 9, nullable: true, name: 'folio_oi' })
  invoice_oi: number; //folio

  @Column({ type: 'numeric', nullable: true, name: 'indicador' })
  indicator: number;

  @Column({ type: 'date', nullable: true, name: 'fecha_val_sistema' })
  system_val_date: Date;

  @Column({
    type: "character varying",
    name: "nb_origen",
  })
  nbOrigin: string;
}
