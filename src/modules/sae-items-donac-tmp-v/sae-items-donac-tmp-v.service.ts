import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CRUDMessages } from 'src/shared/utils/message.enum';
import { LocalDate } from 'src/shared/config/text';
import { Connection, Repository } from 'typeorm';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { SaeItemsDonacVBEntity } from './entities/sae-items-donac-v-b.entity';

@Injectable()
export class SaeItemsDonacTmpVService {
  #eventId: number = 3106;
  #table: string = 'SAE_ITEMS_DONAC_TMP_V';
  constructor(
    private entity: Connection,
    @InjectRepository(SaeItemsDonacVBEntity)
    private entityB: Repository<SaeItemsDonacVBEntity>,
  ) {}

  async PA_INS_VALI_BIEN_DON(usuario: string) {
    try {
      let V_EXIST_BIENS: number;
      let V_EXISTE_DISP: number;
      let V_BANDERA: number;
      let V_BANDERA_VAL: number;
      let V_CLAVE_UNICA: string;
      let V_DESC_UNIDAD: string;
      let V_UNIDAD: string;
      let VN_STATUS: number;
      const dateNow = LocalDate.getNow();

      const q = `
        SELECT CVE_INVENTARIO, ITEM, NUMERO_INVENTARIO, NO_BIEN_SIAB, CANTIDAD, UOM_CODE, SUBINVENTARIO, LOCALIZADOR, FECHA_EFECTIVA_TRANSACCION,
        NUMERO_GESTION, BIEN_RELACIONADO, SOLICITUD_TRANSFERENCIA, FECHA_SOLICITUD, NUMERO_EXPEDIENTE, FECHA_EXPEDIENTE, VIA_RECEPCION_SOLICITUD,
        DEL_REGIONAL_RECEPCION, AUTORIDAD, EMISORA, ENTIDAD_TRANSFERENTE, EXPEDIENTE_TRANSFERENTE, CLAVE_UNICA, CAPITULO_PARTIDA, C_ATTRIBUTE1,
        C_ATTRIBUTE2, C_ATTRIBUTE3, C_ATTRIBUTE4, C_ATTRIBUTE5, C_ATTRIBUTE6, C_ATTRIBUTE7, C_ATTRIBUTE8, C_ATTRIBUTE9, C_ATTRIBUTE10,
        C_ATTRIBUTE11, C_ATTRIBUTE12, C_ATTRIBUTE13, C_ATTRIBUTE14, C_ATTRIBUTE15, C_ATTRIBUTE16, C_ATTRIBUTE17, C_ATTRIBUTE18, C_ATTRIBUTE19,
        C_ATTRIBUTE20, LAST_UPDATE_DATE, LAST_UPDATED_BY, LAST_UPDATE_LOGIN, CREATED_BY, CREATION_DATE, STATUS, VALIDACION, INSTANCEBPEL,
        SIAB_NO_BIEN_REF, SIAB_STATUS_BIEN, DESC_BIEN, TRANSACTION_TYPE_ID, ORIGEN, STATUS_NSBDB, SAT_TIPO_EXPEDIENTE, SAT_EXPEDIENTE,
        TRANSACTION_ID, TIPO, SUB_TIPO, SSUB_TIPO, SSSUB_TIPO, LOCATOR_ID, INVENTORY_ITEM_ID, ORGANIZATION_ID
        FROM nsbddb.SAE_ITEMS_DONAC_TMP_V
        WHERE 1= 1
            AND STATUS != 1::text
            AND LAST_UPDATE_DATE > TO_DATE('${LocalDate.getCustom(
              LocalDate.getNow(),
              'YYYY-MM-DD',
            )}', 'YYYY-MM-DD') - 1
        `;

        console.log(q);
      const qR = await this.entity.query(q);

      if (!qR.length) {
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: [CRUDMessages.GetNotfound],
        };
      }

      for (const VAL_DON of qR) {
        VN_STATUS = 0;
        let CUR_LOC;

        const insertB = `
        INSERT INTO nsbddb.SAE_ITEMS_DEST_TMP_V_B
        (CVE_INVENTARIO, ITEM, NUMERO_INVENTARIO, NO_BIEN_SIAB, CANTIDAD,
        UOM_CODE, SUBINVENTARIO, LOCALIZADOR, FECHA_EFECTIVA_TRANSACCION, NUMERO_GESTION,
        BIEN_RELACIONADO, SOLICITUD_TRANSFERENCIA, FECHA_SOLICITUD, NUMERO_EXPEDIENTE, FECHA_EXPEDIENTE,
        VIA_RECEPCION_SOLICITUD, DEL_REGIONAL_RECEPCION, AUTORIDAD, EMISORA, ENTIDAD_TRANSFERENTE,
        EXPEDIENTE_TRANSFERENTE, CLAVE_UNICA, CAPITULO_PARTIDA, C_ATTRIBUTE1, C_ATTRIBUTE2,
        C_ATTRIBUTE3, C_ATTRIBUTE4, C_ATTRIBUTE5, C_ATTRIBUTE6, C_ATTRIBUTE7,
        C_ATTRIBUTE8, C_ATTRIBUTE9, C_ATTRIBUTE10, C_ATTRIBUTE11, C_ATTRIBUTE12,
        C_ATTRIBUTE13, C_ATTRIBUTE14, C_ATTRIBUTE15, C_ATTRIBUTE16, C_ATTRIBUTE17,
        C_ATTRIBUTE18, C_ATTRIBUTE19, C_ATTRIBUTE20, LAST_UPDATE_DATE, LAST_UPDATED_BY,
        LAST_UPDATE_LOGIN, CREATED_BY, CREATION_DATE, STATUS, VALIDACION,
        INSTANCEBPEL, SIAB_NO_BIEN_REF, SIAB_STATUS_BIEN, DESC_BIEN, TRANSACTION_TYPE_ID,
        ORIGEN, STATUS_NSBDB, SAT_TIPO_EXPEDIENTE, SAT_EXPEDIENTE, TRANSACTION_ID,
        RESERVATION_ID, TIPO, SUB_TIPO, SSUB_TIPO, SSSUB_TIPO, LOCATOR_ID, ORGANIZATION_ID, INVENTORY_ITEM_ID,
        TIPO_RESPALDO, USUARIO_EJECUTA, FEC_EJEC_RESPALDO)
        VALUES
            (${
              VAL_DON.cve_inventario ? `'${VAL_DON.cve_inventario}'` : 'NULL'
            }, ${VAL_DON.item ? `'${VAL_DON.item}'` : 'NULL'}, ${
          VAL_DON.numero_inventario ? `'${VAL_DON.numero_inventario}'` : 'NULL'
        }, ${VAL_DON.no_bien_siab}, ${VAL_DON.cantidad},
            ${VAL_DON.uom_code ? `'${VAL_DON.uom_code}'` : 'NULL'}, ${
          VAL_DON.subinventario ? `'${VAL_DON.subinventario}'` : 'NULL'
        }, ${VAL_DON.localizador ? `'${VAL_DON.localizador}'` : 'NULL'}, ${
          VAL_DON.fecha_efectiva_transaccion
            ? `'${VAL_DON.fecha_efectiva_transaccion}'`
            : 'NULL'
        }, ${VAL_DON.numero_gestion ? `'${VAL_DON.numero_gestion}'` : 'NULL'},
            ${
              VAL_DON.bien_relacionado
                ? `'${VAL_DON.bien_relacionado}'`
                : 'NULL'
            }, ${
          VAL_DON.solicitud_transferencia
            ? `'${VAL_DON.solicitud_transferencia}'`
            : 'NULL'
        }, ${
          VAL_DON.fecha_solicitud ? `'${VAL_DON.fecha_solicitud}'` : 'NULL'
        }, ${
          VAL_DON.numero_expediente ? `'${VAL_DON.numero_expediente}'` : 'NULL'
        }, ${
          VAL_DON.fecha_expediente ? `'${VAL_DON.fecha_expediente}'` : 'NULL'
        },
            ${
              VAL_DON.via_recepcion_solicitud
                ? `'${VAL_DON.via_recepcion_solicitud}'`
                : 'NULL'
            }, ${VAL_DON.del_regional_recepcion}, ${VAL_DON.autoridad}, ${
          VAL_DON.emisora
        }, ${VAL_DON.entidad_transferente},
            ${
              VAL_DON.expediente_transferente
                ? `'${VAL_DON.expediente_transferente}'`
                : 'NULL'
            }, ${VAL_DON.clave_unica ? `'${VAL_DON.clave_unica}'` : 'NULL'}, ${
          VAL_DON.capitulo_partida
        }, ${VAL_DON.c_attribute1 ? `'${VAL_DON.c_attribute1}'` : 'NULL'}, ${
          VAL_DON.c_attribute2 ? `'${VAL_DON.c_attribute2}'` : 'NULL'
        },
            ${VAL_DON.c_attribute3 ? `'${VAL_DON.c_attribute3}'` : 'NULL'}, ${
          VAL_DON.c_attribute4 ? `'${VAL_DON.c_attribute4}'` : 'NULL'
        }, ${VAL_DON.c_attribute5 ? `'${VAL_DON.c_attribute5}'` : 'NULL'}, ${
          VAL_DON.c_attribute6 ? `'${VAL_DON.c_attribute6}'` : 'NULL'
        }, ${VAL_DON.c_attribute7 ? `'${VAL_DON.c_attribute7}'` : 'NULL'},
            ${VAL_DON.c_attribute8 ? `'${VAL_DON.c_attribute8}'` : 'NULL'}, ${
          VAL_DON.c_attribute9 ? `'${VAL_DON.c_attribute9}'` : 'NULL'
        }, ${VAL_DON.c_attribute10 ? `'${VAL_DON.c_attribute10}'` : 'NULL'}, ${
          VAL_DON.c_attribute11 ? `'${VAL_DON.c_attribute11}'` : 'NULL'
        }, ${VAL_DON.c_attribute12 ? `'${VAL_DON.c_attribute12}'` : 'NULL'},
            ${VAL_DON.c_attribute13 ? `'${VAL_DON.c_attribute13}'` : 'NULL'}, ${
          VAL_DON.c_attribute14 ? `'${VAL_DON.c_attribute14}'` : 'NULL'
        }, ${VAL_DON.c_attribute15 ? `'${VAL_DON.c_attribute15}'` : 'NULL'}, ${
          VAL_DON.c_attribute16 ? `'${VAL_DON.c_attribute16}'` : 'NULL'
        }, ${VAL_DON.c_attribute17 ? `'${VAL_DON.c_attribute17}'` : 'NULL'},
            ${VAL_DON.c_attribute18 ? `'${VAL_DON.c_attribute18}'` : 'NULL'}, ${
          VAL_DON.c_attribute19 ? `'${VAL_DON.c_attribute19}'` : 'NULL'
        }, ${VAL_DON.c_attribute20 ? `'${VAL_DON.c_attribute20}'` : 'NULL'}, ${
          VAL_DON.last_update_date ? `'${VAL_DON.last_update_date}'` : 'NULL'
        }, ${VAL_DON.last_updated_by ? `'${VAL_DON.last_updated_by}'` : 'NULL'},
            ${VAL_DON.last_update_login}, ${VAL_DON.created_by}, '${
          VAL_DON.creation_date
        }', '${VN_STATUS}', ${
          VAL_DON.validacion ? `'${VAL_DON.validacion}'` : 'NULL'
        },
            '${VAL_DON.instancebpel}', ${VAL_DON.siab_no_bien_ref}, ${
          VAL_DON.siab_status_bien ? `${VAL_DON.siab_status_bien}` : 'NULL'
        }, '${VAL_DON.desc_bien}', ${VAL_DON.transaction_type_id},
            '${VAL_DON.origen}', '${VAL_DON.status_nsbdb}', '${
          VAL_DON.sat_tipo_expediente
        }', '${VAL_DON.sat_expediente}', ${VAL_DON.transaction_id},
            ${VAL_DON.reservation_id}, ${VAL_DON.tipo}, ${VAL_DON.sub_tipo}, ${
          VAL_DON.ssub_tipo
        }, ${VAL_DON.sssub_tipo}, ${VAL_DON.locator_id}, ${
          VAL_DON.organization_id
        }, ${VAL_DON.inventory_item_id},
            'INSERT', '${usuario}', '${LocalDate.getCustom(
          LocalDate.getNow(),
          'YYYY-MM-DD',
        )}');
            `;

        await this.entity.query(insertB);

        V_BANDERA = 0;
        V_BANDERA_VAL = 0;

        const searchQ = `
            SELECT  COUNT (0)
            FROM  SERA.BIEN
            WHERE  NO_INVENTARIO = '${VAL_DON.numero_inventario}'
                AND DECLARACION_ABN_SERA = 'NSBDDB'
                AND ESTATUS != 'CAN';
            `;

        const searchCount = await this.entity.query(searchQ);

        V_EXIST_BIENS = searchCount[0].count;

        if (V_EXIST_BIENS == 0 && VAL_DON.status != 9) {
          const q = await this.entity.query(`
                SELECT  NO_INVENTARIO,  NO_GESTION, SUBINVENTORY_CODE,  UOM_CODE UNIDAD_MEDIDA, DISPONIBLE, LOCATOR as LOCALIZADOR
                FROM  NSBDDB.XXSAE_INV_DISPONIBLE_OS
                WHERE  NO_INVENTARIO='${VAL_DON.numero_inventario}'
                    AND SUBINVENTORY_CODE ='${VAL_DON.subinventario}'
                EXCEPT
                SELECT NO_INVENTARIO, NO_GESTION, SUBINVENTORY_CODE,  UNIDAD_MEDIDA, DISPONIBLE,LOCALIZADOR
                FROM NSBDDB.V_BIEN_BAJA_NSBDDB_ESTAUS0
                WHERE NO_INVENTARIO='${VAL_DON.numero_inventario}'
                    AND SUBINVENTORY_CODE = '${VAL_DON.subinventario}'
                `);

          if (!q.length) {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: [
                'No se encontro la informacion requerida V_BIEN_BAJA_NSBDDB_ESTAUS0 & XXSAE_INV_DISPONIBLE_OS',
              ],
            };
          }

          CUR_LOC = q;

          for (const item of CUR_LOC) {
            if (
              VAL_DON.cantidad == item.disponible &&
              VAL_DON.localizador !== item.localizador
            ) {
              VN_STATUS = 12;
              V_BANDERA = 1;
            }
          }
        }

        if (V_BANDERA == 0 && VAL_DON.status != 9) {
          const selectQ = await this.entity.query(`
                        SELECT  COUNT (0)
                        FROM  NSBDDB.XXSAE_INV_DISPONIBLE_OS
                        WHERE  NO_INVENTARIO     ='${VAL_DON.numero_inventario}'
                            AND  DISPONIBLE        = ${VAL_DON.cantidad}
                            AND  SUBINVENTORY_CODE ='${VAL_DON.subinventario}'
                            AND  LOCATOR_ID  = ${VAL_DON.locator_id || 0}
                            AND ORGANIZATION_ID    = ${VAL_DON.organization_id}
                            AND INVENTORY_ITEM_ID  =${
                              VAL_DON.inventory_item_id
                            };
                    `);

          V_EXISTE_DISP = selectQ[0].count || 0;

          if (V_EXISTE_DISP == 0) {
            VN_STATUS = 14;
          } else {
            VN_STATUS = 15;
          }
        }

        await this.entity.query(`
                insert into nsbddb.SAE_ITEMS_DONAC_TMP_V_B
                (CVE_INVENTARIO, ITEM, NUMERO_INVENTARIO, NO_BIEN_SIAB, CANTIDAD,
                 UOM_CODE, SUBINVENTARIO, LOCALIZADOR, FECHA_EFECTIVA_TRANSACCION, NUMERO_GESTION,
                 BIEN_RELACIONADO, SOLICITUD_TRANSFERENCIA, FECHA_SOLICITUD, NUMERO_EXPEDIENTE, FECHA_EXPEDIENTE,
                 VIA_RECEPCION_SOLICITUD, DEL_REGIONAL_RECEPCION, AUTORIDAD, EMISORA, ENTIDAD_TRANSFERENTE,
                 EXPEDIENTE_TRANSFERENTE, CLAVE_UNICA, CAPITULO_PARTIDA, C_ATTRIBUTE1, C_ATTRIBUTE2,
                 C_ATTRIBUTE3, C_ATTRIBUTE4, C_ATTRIBUTE5, C_ATTRIBUTE6, C_ATTRIBUTE7,
                 C_ATTRIBUTE8, C_ATTRIBUTE9, C_ATTRIBUTE10, C_ATTRIBUTE11, C_ATTRIBUTE12,
                 C_ATTRIBUTE13, C_ATTRIBUTE14, C_ATTRIBUTE15, C_ATTRIBUTE16, C_ATTRIBUTE17,
                 C_ATTRIBUTE18, C_ATTRIBUTE19, C_ATTRIBUTE20, LAST_UPDATE_DATE, LAST_UPDATED_BY,
                 LAST_UPDATE_LOGIN, CREATED_BY, CREATION_DATE, STATUS, VALIDACION,
                 INSTANCEBPEL, SIAB_NO_BIEN_REF, SIAB_STATUS_BIEN, DESC_BIEN, TRANSACTION_TYPE_ID,
                 ORIGEN, STATUS_NSBDB, SAT_TIPO_EXPEDIENTE, SAT_EXPEDIENTE, TRANSACTION_ID,
                 RESERVATION_ID, TIPO, SUB_TIPO, SSUB_TIPO, SSSUB_TIPO, LOCATOR_ID, ORGANIZATION_ID, INVENTORY_ITEM_ID,
                 TIPO_RESPALDO, USUARIO_EJECUTA, FEC_EJEC_RESPALDO)
                VALUES
                    ('${VAL_DON.cve_inventario}', '${VAL_DON.item}', '${VAL_DON.numero_inventario}', ${VAL_DON.no_bien_siab}, ${VAL_DON.cantidad},
                    '${VAL_DON.uom_code}', '${VAL_DON.subinventario}', '${VAL_DON.localizador}', '${VAL_DON.fecha_efectiva_transaccion}', '${VAL_DON.numero_gestion}',
                    '${VAL_DON.bien_relacionado}', '${VAL_DON.solicitud_transferencia}', '${VAL_DON.fecha_solicitud}', '${VAL_DON.numero_expediente}', '${VAL_DON.fecha_expediente}',
                    '${VAL_DON.via_recepcion_solicitud}', ${VAL_DON.del_regional_recepcion}, ${VAL_DON.autoridad}, ${VAL_DON.emisora}, ${VAL_DON.entidad_transferente},
                    '${VAL_DON.expeidente_transferente}', '${VAL_DON.clave_unica}', ${VAL_DON.capitulo_partida}, '${VAL_DON.c_attribute1}', '${VAL_DON.c_attribute2}',
                    '${VAL_DON.c_attribute3}', '${VAL_DON.c_attribute4}', '${VAL_DON.c_attribute5}', '${VAL_DON.c_attribute6}', '${VAL_DON.c_attribute7}',
                    '${VAL_DON.c_attribute8}', '${VAL_DON.c_attribute9}', '${VAL_DON.c_attribute10}', '${VAL_DON.c_attribute11}', '${VAL_DON.c_attribute12}',
                    '${VAL_DON.c_attribute13}', '${VAL_DON.c_attribute14}', '${VAL_DON.c_attribute15}', '${VAL_DON.c_attribute16}', '${VAL_DON.c_attribute17}',
                    '${VAL_DON.c_attribute18}', '${VAL_DON.c_attribute19}', '${VAL_DON.c_attribute20}', '${VAL_DON.last_update_date}', ${VAL_DON.last_updated_by},
                    ${VAL_DON.last_udpate_login}, ${VAL_DON.created_by}, '${VAL_DON.creation_date}', '${VN_STATUS}', '${VAL_DON.validacion}',
                    '${VAL_DON.instancebpel}', ${VAL_DON.siab_no_bien_ref}, '${VAL_DON.siab_status_bien}', '${VAL_DON.desc_bien}', ${VAL_DON.transaction_type_id},
                    '${VAL_DON.origen}', '${VAL_DON.status_nsbdb}', '${VAL_DON.sat_tipo_expediente}', '${VAL_DON.sat_expediente}', ${VAL_DON.transaction_id},
                    ${VAL_DON.reservation_id}, ${VAL_DON.tipo}, ${VAL_DON.sub_tipo}, ${VAL_DON.ssub_tipo}, ${VAL_DON.sssub_tipo}, ${VAL_DON.locator_id}, ${VAL_DON.organization_id}, ${VAL_DON.inventory_item_id},
                    'INSERT', '${usuario}', CAST('${dateNow}' AS DATE));
                `);

        const selectCve = await this.entity.query(`
                SELECT CVE_UNICA
                FROM SERA.V_TRANSFERENTES_NIVELES
                    WHERE NO_TRANSFERENTE  = ${VAL_DON.entidad_transferente}
                    AND NO_EMISORA       = ${VAL_DON.emisora}
                    AND NO_AUTORIDAD     = ${VAL_DON.autoridad};
                `);

        if (!selectCve.length) {
          VN_STATUS = 16;
          V_BANDERA_VAL = 1;
        } else {
          const { cve_unica } = selectCve[0];
          V_CLAVE_UNICA = cve_unica;
        }

        const selectUnidad = await this.entity.query(`
                    SELECT DESC_UNIDAD
                    FROM nsbddb.UNIDAD_MED_NSBDDB
                        WHERE CVE_UNIDAD  = '${VAL_DON.uom_code}';
                `);

        if (!selectUnidad.length) {
          VN_STATUS = 16;
          V_BANDERA_VAL = 1;
        } else {
          const { desc_unidad } = selectUnidad[0];
          V_DESC_UNIDAD = desc_unidad;
        }

        const selectVUnidad = await this.entity.query(`
                SELECT XC.UNIDAD
                FROM SERA.UNIDXCLASIF XC
                    WHERE XC.NO_CLASIF_BIEN = (SELECT NO_CLASIF_BIEN FROM SERA.CAT_SSSUBTIPO_BIEN
                                                WHERE NO_TIPO         = ${
                                                  VAL_DON.tipo
                                                }
                                                    AND NO_SUBTIPO      = ${
                                                      VAL_DON.sub_tipo
                                                    }
                                                    AND NO_SSUBTIPO     = ${
                                                      VAL_DON.ssub_tipo
                                                    }
                                                    AND NO_SSSUBTIPO    = ${
                                                      VAL_DON.sssub_tipo
                                                    })
                    AND XC.UNIDAD = '${V_DESC_UNIDAD || ''}';
                `);

        if (!selectVUnidad.length) {
          VN_STATUS = 16;
          V_BANDERA_VAL = 1;
        } else {
          V_UNIDAD = selectUnidad[0].unidad;
        }

        if (
          !VAL_DON.tipo ||
          !VAL_DON.sub_tipo ||
          !VAL_DON.ssub_tipo ||
          !VAL_DON.sssub_tipo
        ) {
          VN_STATUS = 11;
          V_BANDERA_VAL = 1;
        }

        if (
          !VAL_DON.entidad_transferente ||
          !VAL_DON.emisora ||
          !VAL_DON.autoridad
        ) {
          VN_STATUS = 11;
          V_BANDERA_VAL = 1;
        }

        if (!VAL_DON.uom_code) {
          VN_STATUS = 11;
          V_BANDERA_VAL = 1;
        }

        if (!VAL_DON.desc_bien) {
          VN_STATUS = 11;
          V_BANDERA_VAL = 1;
        }

        if (!VAL_DON.numero_inventario) {
          VN_STATUS = 11;
          V_BANDERA_VAL = 1;
        }

        if (V_BANDERA_VAL == 1) {
          await this.entity.query(`
                insert into nsbddb.SAE_ITEMS_DONAC_TMP_V_B
                (CVE_INVENTARIO, ITEM, NUMERO_INVENTARIO, NO_BIEN_SIAB, CANTIDAD,
                 UOM_CODE, SUBINVENTARIO, LOCALIZADOR, FECHA_EFECTIVA_TRANSACCION, NUMERO_GESTION,
                 BIEN_RELACIONADO, SOLICITUD_TRANSFERENCIA, FECHA_SOLICITUD, NUMERO_EXPEDIENTE, FECHA_EXPEDIENTE,
                 VIA_RECEPCION_SOLICITUD, DEL_REGIONAL_RECEPCION, AUTORIDAD, EMISORA, ENTIDAD_TRANSFERENTE,
                 EXPEDIENTE_TRANSFERENTE, CLAVE_UNICA, CAPITULO_PARTIDA, C_ATTRIBUTE1, C_ATTRIBUTE2,
                 C_ATTRIBUTE3, C_ATTRIBUTE4, C_ATTRIBUTE5, C_ATTRIBUTE6, C_ATTRIBUTE7,
                 C_ATTRIBUTE8, C_ATTRIBUTE9, C_ATTRIBUTE10, C_ATTRIBUTE11, C_ATTRIBUTE12,
                 C_ATTRIBUTE13, C_ATTRIBUTE14, C_ATTRIBUTE15, C_ATTRIBUTE16, C_ATTRIBUTE17,
                 C_ATTRIBUTE18, C_ATTRIBUTE19, C_ATTRIBUTE20, LAST_UPDATE_DATE, LAST_UPDATED_BY,
                 LAST_UPDATE_LOGIN, CREATED_BY, CREATION_DATE, STATUS, VALIDACION,
                 INSTANCEBPEL, SIAB_NO_BIEN_REF, SIAB_STATUS_BIEN, DESC_BIEN, TRANSACTION_TYPE_ID,
                 ORIGEN, STATUS_NSBDB, SAT_TIPO_EXPEDIENTE, SAT_EXPEDIENTE, TRANSACTION_ID,
                 RESERVATION_ID, TIPO, SUB_TIPO, SSUB_TIPO, SSSUB_TIPO, LOCATOR_ID, ORGANIZATION_ID, INVENTORY_ITEM_ID,
                 TIPO_RESPALDO, USUARIO_EJECUTA, FEC_EJEC_RESPALDO)
                VALUES
                    ('${VAL_DON.cve_inventario}', '${VAL_DON.item}', '${VAL_DON.numero_inventario}', ${VAL_DON.no_bien_siab}, ${VAL_DON.cantidad},
                    '${VAL_DON.uom_code}', '${VAL_DON.subinventario}', '${VAL_DON.localizador}', '${VAL_DON.fecha_efectiva_transaccion}', '${VAL_DON.numero_gestion}',
                    '${VAL_DON.bien_relacionado}', '${VAL_DON.solicitud_transferencia}', '${VAL_DON.fecha_solicitud}', '${VAL_DON.numero_expediente}', '${VAL_DON.fecha_expediente}',
                    '${VAL_DON.via_recepcion_solicitud}', ${VAL_DON.del_regional_recepcion}, ${VAL_DON.autoridad}, ${VAL_DON.emisora}, ${VAL_DON.entidad_transferente},
                    '${VAL_DON.expeidente_transferente}', '${VAL_DON.clave_unica}', ${VAL_DON.capitulo_partida}, '${VAL_DON.c_attribute1}', '${VAL_DON.c_attribute2}',
                    '${VAL_DON.c_attribute3}', '${VAL_DON.c_attribute4}', '${VAL_DON.c_attribute5}', '${VAL_DON.c_attribute6}', '${VAL_DON.c_attribute7}',
                    '${VAL_DON.c_attribute8}', '${VAL_DON.c_attribute9}', '${VAL_DON.c_attribute10}', '${VAL_DON.c_attribute11}', '${VAL_DON.c_attribute12}',
                    '${VAL_DON.c_attribute13}', '${VAL_DON.c_attribute14}', '${VAL_DON.c_attribute15}', '${VAL_DON.c_attribute16}', '${VAL_DON.c_attribute17}',
                    '${VAL_DON.c_attribute18}', '${VAL_DON.c_attribute19}', '${VAL_DON.c_attribute20}', '${VAL_DON.last_update_date}', ${VAL_DON.last_updated_by},
                    ${VAL_DON.last_udpate_login}, ${VAL_DON.created_by}, '${VAL_DON.creation_date}', '${VN_STATUS}', '${VAL_DON.validacion}',
                    '${VAL_DON.instancebpel}', ${VAL_DON.siab_no_bien_ref}, '${VAL_DON.siab_status_bien}', '${VAL_DON.desc_bien}', ${VAL_DON.transaction_type_id},
                    '${VAL_DON.origen}', '${VAL_DON.status_nsbdb}', '${VAL_DON.sat_tipo_expediente}', '${VAL_DON.sat_expediente}', ${VAL_DON.transaction_id},
                    ${VAL_DON.reservation_id}, ${VAL_DON.tipo}, ${VAL_DON.sub_tipo}, ${VAL_DON.ssub_tipo}, ${VAL_DON.sssub_tipo}, ${VAL_DON.locator_id}, ${VAL_DON.organization_id}, ${VAL_DON.inventory_item_id},
                    'INSERT', '${usuario}', CAST('${dateNow}' AS DATE));
                `);
        }

        await this.entity.query(`
            UPDATE nsbddb.SAE_ITEMS_DONAC_TMP_V 
            SET STATUS = ${VN_STATUS},
                LAST_UPDATE_DATE= CAST('${dateNow}' AS DATE)
            WHERE NUMERO_INVENTARIO    ='${VAL_DON.numero_inventario}'
            AND SUBINVENTARIO        ='${VAL_DON.subinventario}'
            AND CANTIDAD             = ${VAL_DON.cantidad}
            AND LOCALIZADOR = '${VAL_DON.localizador || 0}'
            AND NUMERO_GESTION       = '${VAL_DON.numero_gestion || ''}'
            AND LOCATOR_ID    = ${VAL_DON.locator_id || 0}
            AND ORGANIZATION_ID      = ${VAL_DON.organization_id || 0}
            AND INVENTORY_ITEM_ID    = ${VAL_DON.inventory_item_id || 0}
            AND TRANSACTION_ID= ${VAL_DON.transaction_id || 0}
            AND INSTANCEBPEL  = '${VAL_DON.instancebpel || ''}';
          `);
      }

      return {
        statusCode: HttpStatus.OK,
        message: ['Procedimiento Terminado'],
      };
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message],
      };
    }
  }

  @Interval((+process.env.CRON_JOB || 60) * 1000)
  async updateAndDeleteTrigger() {
    try {
      //Logger.debug('TRIGGER', this.#table);
      const result: any[] = await this.entity.query(`
        select * from audit.logged_actions where event_id > ${
          this.#eventId
        } and action in ('D', 'U') and table_name = '${this.#table.toLocaleLowerCase()}' order by event_id DESC;
      `);

      this.#eventId = result[0]?.event_id || this.#eventId;

      //Logger.log(this.#eventId);
      //Logger.log(result[0]);

      for (const loggedAction of result) {
        const client_query = JSON.parse(loggedAction.client_query);

        if (!client_query) continue;
        if (loggedAction.action == 'U') {
          await this.updateSaeItemsDonacTmpVB(client_query);
        }

        if (loggedAction.action == 'D') {
          await this.deleteSaeItemsDonacTmpVB(client_query.id);
        }
      }
      //Logger.verbose('Finished Trigger', this.#table);
    } catch (error) {
      console.log(error.message);
      Logger.error(error.message);
    }
  }

  async updateSaeItemsDonacTmpVB(data: any) {
    try {
      await this.entityB.update({ id: data.id }, data);
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message],
      };
    }
  }

  async deleteSaeItemsDonacTmpVB(id: number) {
    try {
      await this.entityB.delete({ id });
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message],
      };
    }
  }
}
