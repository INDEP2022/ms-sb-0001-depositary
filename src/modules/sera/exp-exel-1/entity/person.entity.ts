import { AppointmentDepositoryEntity } from "src/modules/infrastructure/entities/appointment-depository.entity";
import { 
    Column, 
    Entity, 
    OneToOne, 
    PrimaryGeneratedColumn, 
  } from "typeorm"; 
   
  @Entity("cat_personas", { schema: "sera" }) 
  export class PersonEntity { 
   
    @PrimaryGeneratedColumn({type:'integer',name:'no_persona'})
    id?: number;

    @Column("character varying",{name:'nom_persona',length:30})
    nom_persona:string; 

    @Column("character varying",{name:'nombre',length:200})
    nombre:string;

    

    @Column("character varying",{name:'calle',length:200})
    calle:string;
    

    @Column("character varying",{name:'no_exterior',length:10})
    no_exterior: string;

    @Column("character varying",{name:'no_interior',length:10})
    no_interior: string;
    
    
    @Column("character varying",{name:'colonia',length:100})
    colonia: string;

    @Column("character varying",{name:'deleg_munic',length:60})
    deleg_munic: string;

    @Column("integer", { name: "codigo_postal"}) 
    codigo_postal : number;

    @Column("character varying",{name:'rfc',length:20})
    rfc: string;

    @Column("character varying",{name:'curp',length:20})
    curp: string;

    @Column("character varying",{name:'telefono',length:20})
    telefono: string;


    @Column("character varying",{name:'tipo_persona',length:1})
    tipo_persona: string;

    @Column("character varying",{name:'tipo_responsable',length:1})
    tipo_responsable: string;

    @Column("character varying",{name:'representante',length:60})
    representante: string;

    @Column("character varying",{name:'no_escritura',length:20})
    no_escritura: string;

    @Column("character varying",{name:'profesion',length:60})
    profesion: string;


    @Column("character varying",{name:'curriculum',length:1})
    curriculum: string;

    @Column("character varying",{name:'cve_entfed',length:15})
    cve_entfed: string;

    @Column("character varying",{name:'cve_giro',length:15})
    cve_giro: string;


    
    @Column("character varying",{name:'observaciones',length:100})
    observaciones: string;
    
    @Column("character varying",{name:'perfil',length:500})
    perfil: string;
    
    @Column("character varying",{name:'antecedentes_secodam',length:500})
    antecedentes_secodam: string;
    
    @Column("character varying",{name:'antecedentes_pgr',length:500})
    antecedentes_pgr: string;
    
    @Column("character varying",{name:'antecedentes_pff',length:500})
    antecedentes_pff: string;
    
    @Column("character varying",{name:'antecedentes_sera',length:500})
    antecedentes_sera: string;
    
    @Column("character varying",{name:'antecedentes_otros',length:500})
    antecedentes_otros: string;
  

    @Column("integer", { name: "no_registro"}) 
    no_registro : number;

    @Column("character varying",{name:'email',length:60})
    email: string;

    @Column("character varying", { name: "lista_negra", length: 2 }) 
    lista_negra : string

  

    @OneToOne(() => AppointmentDepositoryEntity, (e) => e.personNumber) // specify inverse side as a second parameter 
    personNumber: AppointmentDepositoryEntity

  }