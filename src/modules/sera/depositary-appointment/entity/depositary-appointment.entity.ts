

import {
    Column,
    Entity,
    PrimaryColumn,
    PrimaryGeneratedColumn,
} from "typeorm";

@Entity("nombramientos_depositaria", { schema: "sera" })
export class DepositaryAppointmentEntity {

    @PrimaryGeneratedColumn({
        type: 'integer', name: 'no_nombramiento',
        // nullable: false 
    })
    appointmentNumber: number

    @Column("timestamp without time zone", { name: "fec_nomb_prov", default: () => "CURRENT_TIMESTAMP" })
    nameProvDate: Date;

    @Column("timestamp without time zone", { name: "fec_revocacion", default: () => "CURRENT_TIMESTAMP" })
    revocationDate: Date;

    @Column("character varying", { name: 'revocacion', length: 1 })
    revocation: string;


    @Column("character varying", { name: 'cve_contrato', length: 60 })
    contractKey: string;

    @Column("timestamp without time zone", { name: "fec_ini_contrato", default: () => "CURRENT_TIMESTAMP" })
    contractStartDate: Date;


    @Column("timestamp without time zone", { name: "fec_fin_contrato", default: () => "CURRENT_TIMESTAMP" })
    contractEndDate: Date;

    @Column("numeric", { name: "cantidad", nullable: false })
    quantity: number;

    @Column("character varying", { name: 'cve_tipo_nomb', length: 1 })
    typeNameKey: string;

    @Column("character varying", { name: 'cve_tipo_administrador', length: 1 })
    typeAdminKey: string;

    @Column("timestamp without time zone", { name: "fec_asignacion", default: () => "CURRENT_TIMESTAMP" })
    assignmentDate: Date;

    @Column("timestamp without time zone", { name: "fec_nombramiento", default: () => "CURRENT_TIMESTAMP" })
    appointmentDate: Date;

    @Column("character varying", { name: 'cedula_nombramiento', length: 60 })
    appointmentCard: string;

    @Column("character varying", { name: 'tipo_depositaria', length: 1 })
    depositaryType: string;

    @Column("character varying", { name: 'observaciones', length: 1000 })
    observation: string;

    @Column("character varying", { name: 'no_oficio_revocacion', length: 20 })
    officialRevocationNumber: string;

    @Column("numeric", { name: "importe_contraprestacion" })
    importConsideration: number;

    @Column("numeric", { name: "importe_honorarios" })
    feeAmount: number;

    @Column("character varying", { name: 'no_oficio_provisional', length: 20 })
    provisionalOfficialNumber: string;

    @Column("character varying", { name: 'anexo', length: 20 })
    annexed: string;
    @Column("timestamp without time zone", { name: 'fec_oficio_junta_gob' })
    governmentMeetingOfficialDate: Date
    @Column("character varying", { name: 'no_oficio_junta_gob', length: 20 })
    governmentMeetingOfficialNumber: string
    @Column("timestamp without time zone", { name: 'fec_envio_dir_gral' })
    shippingDateGeneralAddress: Date

    @Column("timestamp without time zone", { name: 'fec_contestacion_dir_gral' })
    replyDateGeneralAddress: Date

    @Column("character varying", { name: 'no_oficio_turno', length: 20 })
    jobShiftNumber: string

    @Column("timestamp without time zone", { name: 'fec_turno' })
    turnDate: Date

    @Column("timestamp without time zone", { name: 'fec_retorno' })
    returnDate: Date

    @Column("character varying", { name: 'no_oficio_contestacion', length: 20 })
    answerOfficeNumber: string

    @Column("character varying", { name: 'acuerdo_nombramiento', length: 2000 })
    appointmentAgreement: string

    @Column("character varying", { name: 'cedula_nombramiento_junta_gob', length: 60 })
    governmentBoardAppointmentCard: string

    @Column("character varying", { name: 'no_oficio_contesta_dir_gral', length: 20 })
    officialNumberAnswerAddressGeneral: string

    @Column("character varying", { name: 'autoridad_ordena_asignacion', length: 200 })
    authorityOrdersAllocation: string

    @Column("character varying", { name: 'responsable', length: 30 })
    responsible: string

    @Column("character varying", { name: 'representante_sera', length: 30 })
    seraRepresentative: string

    @Column("integer", { name: "importe_honorarios" })
    propertyNumber: number;

    @Column("integer", { name: "no_registro" })
    registerNumber: number;
    @Column("character varying", { name: 'vigencia', length: 20 })
    validity: string

    @Column("numeric", { name: "importe_iva" })
    amountIVA: number;
    @Column("numeric", { name: "folio_universal" })
    universalFolio: number;

    @Column("numeric", { name: "folio_regreso" })
    folioReturn: number;

    @Column("integer", { name: "no_persona" })
    personNumber: number;

    @Column("character varying", { name: 'referencia', length: 30 })
    reference: string

    @Column("integer", { name: "iva" })
    iva: number;

    @Column("character varying", { name: 'con_menaje', length: 1 })
    withKitchenware: string

    @Column("numeric", { name: "no_bien" })
    goodNumber: number;


}