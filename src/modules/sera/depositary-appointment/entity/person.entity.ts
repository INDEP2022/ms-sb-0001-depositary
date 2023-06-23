import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cat_personas', { schema: 'sera' })
export class PersonEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'no_persona' })
  id?: number;

  @Column('character varying', { name: 'nom_persona', length: 30 })
  personName: string;

  @Column('character varying', { name: 'nombre', length: 200 })
  name: string;

  @Column('character varying', { name: 'calle', length: 200 })
  street: string;

  @Column('character varying', { name: 'no_exterior', length: 10 })
  streetNumber: string;

  @Column('character varying', { name: 'no_interior', length: 10 })
  interiorNumber: string;

  @Column('character varying', { name: 'colonia', length: 100 })
  suburb: string;

  @Column('character varying', { name: 'deleg_munic', length: 60 })
  delegation: string;

  @Column('integer', { name: 'codigo_postal' })
  zipCode: number;

  @Column('character varying', { name: 'rfc', length: 20 })
  rfc: string;

  @Column('character varying', { name: 'curp', length: 20 })
  curp: string;

  @Column('character varying', { name: 'telefono', length: 20 })
  phone: string;

  @Column('character varying', { name: 'tipo_persona', length: 1 })
  typePerson: string;

  @Column('character varying', { name: 'tipo_responsable', length: 1 })
  typeResponsible: string;

  @Column('character varying', { name: 'representante', length: 60 })
  manager: string;

  @Column('character varying', { name: 'no_escritura', length: 20 })
  scriptureNumber: string;

  @Column('character varying', { name: 'profesion', length: 60 })
  profesion: string;

  @Column('character varying', { name: 'curriculum', length: 1 })
  curriculum: string;

  @Column('character varying', { name: 'cve_entfed', length: 15 })
  keyEntfed: string;

  @Column('character varying', { name: 'cve_giro', length: 15 })
  keyOperation: string;

  @Column('character varying', { name: 'observaciones', length: 100 })
  observations: string;

  @Column('character varying', { name: 'perfil', length: 500 })
  profile: string;

  @Column('character varying', { name: 'antecedentes_secodam', length: 500 })
  precedentSecodam: string;

  @Column('character varying', { name: 'antecedentes_pgr', length: 500 })
  precedentPgr: string;

  @Column('character varying', { name: 'antecedentes_pff', length: 500 })
  precedentPff: string;

  @Column('character varying', { name: 'antecedentes_sera', length: 500 })
  precedentSera: string;

  @Column('character varying', { name: 'antecedentes_otros', length: 500 })
  precedentOthers: string;

  @Column('integer', { name: 'no_registro' })
  registerNumber: number;

  @Column('character varying', { name: 'email', length: 60 })
  email: string;

  @Column('character varying', { name: 'lista_negra', length: 2 })
  blackList: string;
}
