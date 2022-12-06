import { Column, Entity, Index, OneToMany, PrimaryColumn } from 'typeorm';

@Entity('comer_parametrosmod', { schema: 'sera' })
export class ComerParameterModEntity {
  @PrimaryColumn('character varying', { name: 'parametro', primary: true, length: 20 })
  parameter: string;

  @PrimaryColumn('character varying', { name: 'valor', primary: true, length: 500 })
  value: string;

  @Column('character varying', {
    name: 'descripcion',
    nullable: true,
    length: 200,
  })
  description: string | null;

  @PrimaryColumn('character varying', { name: 'direccion', primary: true, length: 1 })
  address: string;

  @Column('numeric', {
    name: 'id_tpevento',
    nullable: true,
    precision: 3,
    scale: 0,
  })
  tpeventId: number | null;
}
