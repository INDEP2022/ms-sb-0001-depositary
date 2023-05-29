import { Column, Entity, PrimaryColumn } from "typeorm";
@Entity("sae_items_dest_tmp_v_b", { schema: "nsbddb" })
export class SaeItemsDestVBEntity {
  @Column({
    type: "character varying",
    name: "cve_inventario",
    length: "3",
  })
  cve_inventario: string;

  @Column({
    type: "character varying",
    name: "item",
    length: "163",
  })
  item: string;

  @Column({
    type: "character varying",
    name: "numero_inventario",
    length: "80",
  })
  numero_inventario: string;

  @Column({
    type: "numeric",
    name: "no_bien_siab",
  })
  no_bien_siab: number;

  @Column({
    type: "numeric",
    name: "cantidad",
  })
  cantidad: number;

  @Column({
    type: "character varying",
    name: "uom_code",
    length: "3",
  })
  uom_code: string;

  @Column({
    type: "character varying",
    name: "subinventario",
    length: "10",
  })
  subinventario: string;

  @Column({
    type: "character varying",
    name: "localizador",
    length: "286",
  })
  localizador: string;

  @Column({
    type: "date",
    name: "fecha_efectiva_transaccion",
  })
  fecha_efectiva_transaccion: Date;

  @Column({
    type: "character varying",
    name: "numero_gestion",
    length: "150",
  })
  numero_gestion: string;

  @Column({
    type: "character varying",
    name: "bien_relacionado",
    length: "150",
  })
  bien_relacionado: string;

  @Column({
    type: "character varying",
    name: "solicitud_transferencia",
    length: "150",
  })
  solicitud_transferencia: string;

  @Column({
    type: "date",
    name: "fecha_solicitud",
  })
  fecha_solicitud: Date;

  @Column({
    type: "character varying",
    name: "numero_expediente",
    length: "150",
  })
  numero_expediente: string;

  @Column({
    type: "date",
    name: "fecha_expediente",
  })
  fecha_expediente: Date;

  @Column({
    type: "character varying",
    name: "via_recepcion_solicitud",
    length: "150",
  })
  via_recepcion_solicitud: string;

  @Column({
    type: "numeric",
    name: "del_regional_recepcion",

    precision: 2,
  })
  del_regional_recepcion: number;

  @Column({
    type: "numeric",
    name: "autoridad",
  })
  autoridad: number;

  @Column({
    type: "numeric",
    name: "emisora",
  })
  emisora: number;

  @Column({
    type: "numeric",
    name: "entidad_transferente",
  })
  entidad_transferente: number;

  @Column({
    type: "character varying",
    name: "expediente_transferente",
    length: "150",
  })
  expediente_transferente: string;

  @Column({
    type: "character varying",
    name: "clave_unica",
    length: "150",
  })
  clave_unica: string;

  @Column({
    type: "numeric",
    name: "capitulo_partida",
  })
  capitulo_partida: number;

  @Column({
    type: "character varying",
    name: "c_attribute1",
    length: "150",
  })
  c_attribute1: string;

  @Column({
    type: "character varying",
    name: "c_attribute2",
    length: "150",
  })
  c_attribute2: string;

  @Column({
    type: "character varying",
    name: "c_attribute3",
    length: "150",
  })
  c_attribute3: string;

  @Column({
    type: "character varying",
    name: "c_attribute4",
    length: "150",
  })
  c_attribute4: string;

  @Column({
    type: "character varying",
    name: "c_attribute5",
    length: "150",
  })
  c_attribute5: string;

  @Column({
    type: "character varying",
    name: "c_attribute6",
    length: "150",
  })
  c_attribute6: string;

  @Column({
    type: "character varying",
    name: "c_attribute7",
    length: "150",
  })
  c_attribute7: string;

  @Column({
    type: "character varying",
    name: "c_attribute8",
    length: "150",
  })
  c_attribute8: string;

  @Column({
    type: "character varying",
    name: "c_attribute9",
    length: "150",
  })
  c_attribute9: string;

  @Column({
    type: "character varying",
    name: "c_attribute10",
    length: "150",
  })
  c_attribute10: string;

  @Column({
    type: "character varying",
    name: "c_attribute11",
    length: "150",
  })
  c_attribute11: string;

  @Column({
    type: "character varying",
    name: "c_attribute12",
    length: "150",
  })
  c_attribute12: string;

  @Column({
    type: "character varying",
    name: "c_attribute13",
    length: "150",
  })
  c_attribute13: string;

  @Column({
    type: "character varying",
    name: "c_attribute14",
    length: "150",
  })
  c_attribute14: string;

  @Column({
    type: "character varying",
    name: "c_attribute15",
    length: "150",
  })
  c_attribute15: string;

  @Column({
    type: "character varying",
    name: "c_attribute16",
    length: "150",
  })
  c_attribute16: string;

  @Column({
    type: "character varying",
    name: "c_attribute17",
    length: "150",
  })
  c_attribute17: string;

  @Column({
    type: "character varying",
    name: "c_attribute18",
    length: "150",
  })
  c_attribute18: string;

  @Column({
    type: "character varying",
    name: "c_attribute19",
    length: "150",
  })
  c_attribute19: string;

  @Column({
    type: "character varying",
    name: "c_attribute20",
    length: "150",
  })
  c_attribute20: string;

  @Column({
    type: "date",
    name: "last_update_date",
  })
  last_update_date: Date;

  @Column({
    type: "numeric",
    name: "last_updated_by",
  })
  last_updated_by: number;

  @Column({
    type: "numeric",
    name: "last_update_login",
  })
  last_update_login: number;

  @Column({
    type: "numeric",
    name: "created_by",
  })
  created_by: number;

  @Column({
    type: "date",
    name: "creation_date",
  })
  creation_date: Date;

  @Column({
    type: "character varying",
    name: "status",
    length: "10",
  })
  status: string;

  @Column({
    type: "character varying",
    name: "validacion",
    length: "150",
  })
  validacion: string;

  @Column({
    type: "character varying",
    name: "instancebpel",
    length: "250",
  })
  instancebpel: string;

  @Column({
    type: "numeric",
    name: "siab_no_bien_ref",

    precision: 10,
  })
  siab_no_bien_ref: number;

  @Column({
    type: "character varying",
    name: "siab_status_bien",
    length: "3",
  })
  siab_status_bien: string;

  @Column({
    type: "character varying",
    name: "desc_bien",
    length: "2000",
  })
  desc_bien: string;

  @Column({
    type: "numeric",
    name: "transaction_type_id",

    precision: 5,
  })
  transaction_type_id: number;

  @Column({
    type: "character varying",
    name: "origen",
    length: "20",
  })
  origen: string;

  @Column({
    type: "character varying",
    name: "status_nsbdb",
    length: "20",
  })
  status_nsbdb: string;

  @Column({
    type: "character varying",
    name: "sat_tipo_expediente",
    length: "50",
  })
  sat_tipo_expediente: string;

  @Column({
    type: "character varying",
    name: "sat_expediente",
    length: "1250",
  })
  sat_expediente: string;

  @Column({
    type: "numeric",
    name: "transaction_id",
  })
  transaction_id: number;

  @Column({
    type: "numeric",
    name: "tipo",

    precision: 4,
  })
  tipo: number;

  @Column({
    type: "numeric",
    name: "sub_tipo",

    precision: 4,
  })
  sub_tipo: number;

  @Column({
    type: "numeric",
    name: "ssub_tipo",

    precision: 4,
  })
  ssub_tipo: number;

  @Column({
    type: "numeric",
    name: "sssub_tipo",

    precision: 4,
  })
  sssub_tipo: number;

  @Column({
    type: "character varying",
    name: "tipo_respaldo",
    length: "50",
  })
  tipo_respaldo: string;

  @Column({
    type: "character varying",
    name: "usuario_ejecuta",
    length: "50",
  })
  usuario_ejecuta: string;

  @Column({
    type: "date",
    name: "fec_ejec_respaldo",
  })
  fec_ejec_respaldo: Date;

  @Column({
    type: "numeric",
    name: "locator_id",
  })
  locator_id: number;

  @Column({
    type: "numeric",
    name: "inventory_item_id",
  })
  inventory_item_id: number;

  @Column({
    type: "numeric",
    name: "organization_id",
  })
  organization_id: number;

  @PrimaryColumn({
    type: "integer",
    name: "id",

    precision: 32,
  })
  id: number;
}
