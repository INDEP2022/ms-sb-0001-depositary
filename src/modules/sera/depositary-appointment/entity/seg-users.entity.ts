import { AppointmentDepositoryEntity } from "src/modules/infrastructure/entities/appointment-depository.entity";
import {
  Column,
  Entity,
  OneToOne,
  PrimaryColumn,
} from "typeorm";

@Entity("seg_usuarios", { schema: "sera" })
export class SegUsersEntity {

  @PrimaryColumn({ 
    type: "character varying", 
    name: "usuario", 
    nullable: false,
    length: 30
  })
  
  users: string;

  @Column({ 
    type: "character varying", 
    name: "nombre", 
    nullable: false, 
    length: 100 
  })

  name: string;

  @Column({ 
    type: "character varying", 
    name: "rfc", 
    nullable: true, 
    length: 13 
  })

  rfc: string;

  @Column({ 
    type: "character varying", 
    name: "curp", 
    nullable: true,
    length: 20
  })
  
  curp: string;

  @Column({ 
    type: "character varying", 
    name: "calle", 
    nullable: true, 
    length: 30 
  })

  street: string;

  @Column({ 
    type: "character varying", 
    name: "no_interior", 
    nullable: true, 
    length: 10 
  })

  no_inside: string;

  @Column({ 
    type: "character varying", 
    name: "colonia", 
    nullable: true, 
    length: 60 
  })

  suburb: string;

  @Column({ 
    type: "numeric", 
    name: "codigo_postal", 
    nullable: true
  })

  postalCode: number | null;

  @Column({ 
    type: "character varying", 
    name: "telefono", 
    nullable: true, 
    length: 20 
  })

  phone: string | null;

  @Column({ 
    type: "character varying", 
    name: "profesion", 
    nullable: true, 
    length: 60 
  })

  profession: string;

  @Column({ 
    type: "character varying", 
    name: "cve_cargo", 
    nullable: true, 
    length: 20 
  })

  keyPosition: string | null;

  @Column("timestamp without time zone", { 
    name: "fec_ingreso_primera_vez", 
    nullable: true, 
    default: () => "CURRENT_TIMESTAMP" 
  })

  dateFirstTimeLogin: Date | null;

  @Column({ 
    type: "numeric", 
    name: "dias_vigencia_password", 
    nullable: true
  })

  daysValidityPass: number;

  @Column("timestamp without time zone", { 
    name: "fec_ultimo_cambio_password", 
    nullable: true, 
    default: () => "CURRENT_TIMESTAMP" 
  })

  datePassLastChange: Date | null;

  @Column({ 
    type: "character varying", 
    name: "actualizacion_password", 
    nullable: true, 
    length: 1 
  })

  passUpdate: string | null;

  @Column({ 
    type: "numeric", 
    name: "no_registro", 
    nullable: true
  })

  noRegistry: number | null;

  @Column({ 
    type: "character varying", 
    name: "email", 
    nullable: true, 
    length: 50 
  })

  email: string | null;

  @Column({ 
    type: "character varying", 
    name: "usuario_sirsae", 
    nullable: true, 
    length: 30 
  })

  userSirsae: string | null;

  @Column({ 
    type: "numeric", 
    name: "envia_correo", 
    nullable: true
  })

  sendEmail: number | null;

  @Column({ 
    type: "numeric", 
    name: "asigna_atributos", 
    nullable: true 
  })
  
  attribAsign: number | null;

  @Column({ 
    type: "numeric", 
    name: "clkdet_sirsae", 
    nullable: true 
  })
  
  clkdetSirsae: number | null;

  @Column({ 
    type: "character varying", 
    name: "exchange_alias", 
    nullable: true,
    length: 100
  })
  
  penaltyID: number | null;

  @Column({ 
    type: "numeric", 
    name: "clkdet", 
    nullable: true, 
  })

  clkdet: number | null;

  @Column({ 
    type: "character varying", 
    name: "clkid", 
    nullable: true,
    length: 20
  })

  clkid: number | null;

  @Column({ 
    type: "character varying", 
    name: "cve_perfil_mim", 
    nullable: true, 
    length: 30 
  })

  keyProfileMim: string | null;

  @Column({ 
    type: "character varying", 
    name: "name_ad", 
    nullable: true,
    length: 100
  })
  
  nameAd: string | null;

  @Column({ 
    type: "character varying", 
    name: "cve_cargo_ant", 
    nullable: true, 
    length: 15 
  })

  keyPosPrev: string | null;

  @Column({ 
    type: "character varying", 
    name: "nb_origen", 
    nullable: true
  })

  originNb: string | null;

  @OneToOne(() => AppointmentDepositoryEntity, (e) => e.user) // specify inverse side as a second parameter 
  user: AppointmentDepositoryEntity
}