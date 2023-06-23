import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { StateOfRepublicEntity } from './state.entity';
import { AppointmentDepositoryEntity } from 'src/modules/infrastructure/entities/appointment-depository.entity';

@Entity('cat_personas', { schema: 'sera' })
export class PersonEntity {
  @Column('character varying', { name: 'nom_persona', length: 30 })
  personName: string;

  @Column('character varying', { name: 'nombre', length: 200 })
  name: string | null;

  @Column('character varying', { name: 'calle', length: 200, nullable: true })
  street: string | null;

  @Column('character varying', {
    name: 'no_exterior',
    length: 10,
    nullable: true,
  })
  streetNumber: string | null;

  @Column('character varying', {
    name: 'no_interior',
    length: 10,
    nullable: true,
  })
  apartmentNumber: string | null;

  @Column('character varying', { name: 'colonia', length: 100, nullable: true })
  suburb: string | null;

  @Column('character varying', {
    name: 'deleg_munic',
    length: 60,
    nullable: true,
  })
  delegation: string | null;

  @Column('numeric', { name: 'codigo_postal', precision: 5, nullable: true })
  zipCode: number | null;

  @Column('character varying', { name: 'rfc', length: 20, nullable: true })
  rfc: string | null;

  @Column('character varying', { name: 'curp', length: 20, nullable: true })
  curp: string | null;

  @Column('character varying', { name: 'telefono', length: 20, nullable: true })
  phone: string | null;

  @Column('character varying', { name: 'tipo_persona', length: 1 })
  typePerson: string;

  @Column('character varying', { name: 'tipo_responsable', length: 1 })
  typeResponsible: string;

  @Column('character varying', {
    name: 'representante',
    length: 60,
    nullable: true,
  })
  manager: string | null;

  @Column('character varying', {
    name: 'no_escritura',
    length: 20,
    nullable: true,
  })
  numberDeep: string | null;

  @Column('character varying', {
    name: 'profesion',
    length: 60,
    nullable: true,
  })
  profesion: string | null;

  @Column('character varying', {
    name: 'curriculum',
    length: 1,
    nullable: true,
  })
  curriculum: string | null;

  @Column('character varying', {
    name: 'cve_entfed',
    length: 15,
    nullable: true,
  })
  keyEntFed: string | null;

  @Column('character varying', { name: 'cve_giro', length: 15, nullable: true })
  keyOperation: string | null;

  @Column('character varying', {
    name: 'observaciones',
    length: 100,
    nullable: true,
  })
  observations: string | null;

  @Column('character varying', { name: 'perfil', length: 500, nullable: true })
  profile: string | null;

  @Column('character varying', {
    name: 'antecedentes_secodam',
    length: 500,
    nullable: true,
  })
  precedentSecodam: string | null;

  @Column('character varying', {
    name: 'antecedentes_pgr',
    length: 500,
    nullable: true,
  })
  precedentPgr: string | null;

  @Column('character varying', {
    name: 'antecedentes_pff',
    length: 500,
    nullable: true,
  })
  precedentPff: string | null;

  @Column('character varying', {
    name: 'antecedentes_sera',
    length: 500,
    nullable: true,
  })
  precedentSera: string | null;

  @Column('character varying', {
    name: 'antecedentes_otros',
    length: 500,
    nullable: true,
  })
  precedent0ther: string | null;

  @Column('integer', { name: 'no_registro', nullable: true })
  registryNumber: number | null;

  @PrimaryGeneratedColumn({ type: 'numeric', name: 'no_persona' })
  id?: number;

  @Column('character varying', { name: 'email', length: 60, nullable: true })
  email: string | null;

  @Column('character varying', {
    name: 'lista_negra',
    length: 2,
    nullable: true,
  })
  blackList: string | null;

  @JoinColumn()
  state: StateOfRepublicEntity

  @OneToOne(() => AppointmentDepositoryEntity, (e) => e.personNumber) // specify inverse side as a second parameter 
  personNumber: AppointmentDepositoryEntity
}
