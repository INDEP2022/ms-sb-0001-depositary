import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CRUDMessages } from 'sigebi-lib-common';
import { LocalDate } from 'src/shared/config/text';
import { Connection, Repository } from 'typeorm';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { SaeItemsDestVBEntity } from './entities/sae-items-dest-v-b.entity';

@Injectable()
export class SaeItemsDestTmpVService {
  #eventId: number = 3106;
  #table: string = 'SAE_ITEMS_DEST_TMP_V';
  constructor(private entity: Connection, @InjectRepository(SaeItemsDestVBEntity) private entityB: Repository<SaeItemsDestVBEntity>) {}

  // PA_INS_VALI_BIEN_DES
  async PA_INS_VALI_BIEN_DES(usuario: string) {
    try {
      let V_EXIST_BIENS: number;
      let V_EXISTE_DISP: number;
      let V_BANDERA: number;
      let V_BANDERA_VAL: number;
      let V_CLAVE_UNICA: string;
      let V_DESC_UNIDAD: string;
      let V_UNIDAD: string;
      let VN_STATUS: number;
      const q = `
        SELECT CVE_INVENTARIO, ITEM, NUMERO_INVENTARIO, NO_BIEN_SIAB, CANTIDAD, UOM_CODE, SUBINVENTARIO, LOCALIZADOR, FECHA_EFECTIVA_TRANSACCION,
        NUMERO_GESTION, BIEN_RELACIONADO, SOLICITUD_TRANSFERENCIA, FECHA_SOLICITUD, NUMERO_EXPEDIENTE, FECHA_EXPEDIENTE, VIA_RECEPCION_SOLICITUD,
        DEL_REGIONAL_RECEPCION, AUTORIDAD, EMISORA, ENTIDAD_TRANSFERENTE, EXPEDIENTE_TRANSFERENTE, CLAVE_UNICA, CAPITULO_PARTIDA, C_ATTRIBUTE1,
        C_ATTRIBUTE2, C_ATTRIBUTE3, C_ATTRIBUTE4, C_ATTRIBUTE5, C_ATTRIBUTE6, C_ATTRIBUTE7, C_ATTRIBUTE8, C_ATTRIBUTE9, C_ATTRIBUTE10,
        C_ATTRIBUTE11, C_ATTRIBUTE12, C_ATTRIBUTE13, C_ATTRIBUTE14, C_ATTRIBUTE15, C_ATTRIBUTE16, C_ATTRIBUTE17, C_ATTRIBUTE18, C_ATTRIBUTE19,
        C_ATTRIBUTE20, LAST_UPDATE_DATE, LAST_UPDATED_BY, LAST_UPDATE_LOGIN, CREATED_BY, CREATION_DATE, STATUS, VALIDACION, INSTANCEBPEL,
        SIAB_NO_BIEN_REF, SIAB_STATUS_BIEN, DESC_BIEN, TRANSACTION_TYPE_ID, ORIGEN, STATUS_NSBDB, SAT_TIPO_EXPEDIENTE, SAT_EXPEDIENTE,
        TRANSACTION_ID, TIPO, SUB_TIPO, SSUB_TIPO, SSSUB_TIPO, LOCATOR_ID, INVENTORY_ITEM_ID, ORGANIZATION_ID
        FROM nsbddb.SAE_ITEMS_DEST_TMP_V
        WHERE 1= 1
            AND STATUS != 1::text
            AND LAST_UPDATE_DATE > TO_DATE('${LocalDate.getCustom(
              LocalDate.getNow(),
              'YYYY-MM-DD',
            )}', 'YYYY-MM-DD')
        `;

      const qR = await this.entity.query(q);

      if (!qR.length) {
        if (!qR.length) {
          return {
            statusCode: HttpStatus.BAD_REQUEST,
            message: [CRUDMessages.GetNotfound],
          };
        }
      }

      for (const VAL_DES of qR) {
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
              VAL_DES.cve_inventario ? `'${VAL_DES.cve_inventario}'` : 'NULL'
            }, ${VAL_DES.item ? `'${VAL_DES.item}'` : 'NULL'}, ${
          VAL_DES.numero_inventario ? `'${VAL_DES.numero_inventario}'` : 'NULL'
        }, ${VAL_DES.no_bien_siab}, ${VAL_DES.cantidad},
            ${VAL_DES.uom_code ? `'${VAL_DES.uom_code}'` : 'NULL'}, ${
          VAL_DES.subinventario ? `'${VAL_DES.subinventario}'` : 'NULL'
        }, ${VAL_DES.localizador ? `'${VAL_DES.localizador}'` : 'NULL'}, ${
          VAL_DES.fecha_efectiva_transaccion
            ? `'${VAL_DES.fecha_efectiva_transaccion}'`
            : 'NULL'
        }, ${VAL_DES.numero_gestion ? `'${VAL_DES.numero_gestion}'` : 'NULL'},
            ${
              VAL_DES.bien_relacionado
                ? `'${VAL_DES.bien_relacionado}'`
                : 'NULL'
            }, ${
          VAL_DES.solicitud_transferencia
            ? `'${VAL_DES.solicitud_transferencia}'`
            : 'NULL'
        }, ${
          VAL_DES.fecha_solicitud ? `'${VAL_DES.fecha_solicitud}'` : 'NULL'
        }, ${
          VAL_DES.numero_expediente ? `'${VAL_DES.numero_expediente}'` : 'NULL'
        }, ${
          VAL_DES.fecha_expediente ? `'${VAL_DES.fecha_expediente}'` : 'NULL'
        },
            ${
              VAL_DES.via_recepcion_solicitud
                ? `'${VAL_DES.via_recepcion_solicitud}'`
                : 'NULL'
            }, ${VAL_DES.del_regional_recepcion}, ${VAL_DES.autoridad}, ${
          VAL_DES.emisora
        }, ${VAL_DES.entidad_transferente},
            ${
              VAL_DES.expediente_transferente
                ? `'${VAL_DES.expediente_transferente}'`
                : 'NULL'
            }, ${VAL_DES.clave_unica ? `'${VAL_DES.clave_unica}'` : 'NULL'}, ${
          VAL_DES.capitulo_partida
        }, ${VAL_DES.c_attribute1 ? `'${VAL_DES.c_attribute1}'` : 'NULL'}, ${
          VAL_DES.c_attribute2 ? `'${VAL_DES.c_attribute2}'` : 'NULL'
        },
            ${VAL_DES.c_attribute3 ? `'${VAL_DES.c_attribute3}'` : 'NULL'}, ${
          VAL_DES.c_attribute4 ? `'${VAL_DES.c_attribute4}'` : 'NULL'
        }, ${VAL_DES.c_attribute5 ? `'${VAL_DES.c_attribute5}'` : 'NULL'}, ${
          VAL_DES.c_attribute6 ? `'${VAL_DES.c_attribute6}'` : 'NULL'
        }, ${VAL_DES.c_attribute7 ? `'${VAL_DES.c_attribute7}'` : 'NULL'},
            ${VAL_DES.c_attribute8 ? `'${VAL_DES.c_attribute8}'` : 'NULL'}, ${
          VAL_DES.c_attribute9 ? `'${VAL_DES.c_attribute9}'` : 'NULL'
        }, ${VAL_DES.c_attribute10 ? `'${VAL_DES.c_attribute10}'` : 'NULL'}, ${
          VAL_DES.c_attribute11 ? `'${VAL_DES.c_attribute11}'` : 'NULL'
        }, ${VAL_DES.c_attribute12 ? `'${VAL_DES.c_attribute12}'` : 'NULL'},
            ${VAL_DES.c_attribute13 ? `'${VAL_DES.c_attribute13}'` : 'NULL'}, ${
          VAL_DES.c_attribute14 ? `'${VAL_DES.c_attribute14}'` : 'NULL'
        }, ${VAL_DES.c_attribute15 ? `'${VAL_DES.c_attribute15}'` : 'NULL'}, ${
          VAL_DES.c_attribute16 ? `'${VAL_DES.c_attribute16}'` : 'NULL'
        }, ${VAL_DES.c_attribute17 ? `'${VAL_DES.c_attribute17}'` : 'NULL'},
            ${VAL_DES.c_attribute18 ? `'${VAL_DES.c_attribute18}'` : 'NULL'}, ${
          VAL_DES.c_attribute19 ? `'${VAL_DES.c_attribute19}'` : 'NULL'
        }, ${VAL_DES.c_attribute20 ? `'${VAL_DES.c_attribute20}'` : 'NULL'}, ${
          VAL_DES.last_update_date ? `'${VAL_DES.last_update_date}'` : 'NULL'
        }, ${VAL_DES.last_updated_by ? `'${VAL_DES.last_updated_by}'` : 'NULL'},
            ${VAL_DES.last_update_login}, ${VAL_DES.created_by}, '${
          VAL_DES.creation_date
        }', '${VN_STATUS}', ${
          VAL_DES.validacion ? `'${VAL_DES.validacion}'` : 'NULL'
        },
            '${VAL_DES.instancebpel}', ${VAL_DES.siab_no_bien_ref}, ${
          VAL_DES.siab_status_bien ? `${VAL_DES.siab_status_bien}` : 'NULL'
        }, '${VAL_DES.desc_bien}', ${VAL_DES.transaction_type_id},
            '${VAL_DES.origen}', '${VAL_DES.status_nsbdb}', '${
          VAL_DES.sat_tipo_expediente
        }', '${VAL_DES.sat_expediente}', ${VAL_DES.transaction_id},
            ${VAL_DES.reservation_id}, ${VAL_DES.tipo}, ${VAL_DES.sub_tipo}, ${
          VAL_DES.ssub_tipo
        }, ${VAL_DES.sssub_tipo}, ${VAL_DES.locator_id}, ${
          VAL_DES.organization_id
        }, ${VAL_DES.inventory_item_id},
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
            WHERE  NO_INVENTARIO = '${VAL_DES.numero_inventario}'
                AND DECLARACION_ABN_SERA = 'NSBDDB'
                AND ESTATUS != 'CAN';
            `;

        const searchCount = await this.entity.query(searchQ);

        V_EXIST_BIENS = searchCount[0].count;

        if (V_EXIST_BIENS == 0 && VAL_DES.STATUS != 9) {
          const q1 = await this.entity.query(`
                SELECT  NO_INVENTARIO,  NO_GESTION, SUBINVENTORY_CODE,  UOM_CODE UNIDAD_MEDIDA, DISPONIBLE, LOCATOR as LOCALIZADOR
                FROM  NSBDDB.XXSAE_INV_DISPONIBLE_OS
                WHERE  NO_INVENTARIO='${VAL_DES.numero_inventario}'
                    AND SUBINVENTORY_CODE ='${VAL_DES.subinventario}'
                `);

          const q2 = await this.entity.query(`
                SELECT NO_INVENTARIO, NO_GESTION, SUBINVENTORY_CODE,  UNIDAD_MEDIDA, DISPONIBLE,LOCALIZADOR
                FROM NSBDDB.V_BIEN_BAJA_NSBDDB_ESTAUS0
                WHERE NO_INVENTARIO='${VAL_DES.numero_inventario}'
                    AND SUBINVENTORY_CODE = '${VAL_DES.subinventario}'
                `);

          if (!q1.length && !q2.length) {
            return {
              statusCode: HttpStatus.BAD_REQUEST,
              message: [
                'No se encontro la informacion requerida V_BIEN_BAJA_NSBDDB_ESTAUS0 & XXSAE_INV_DISPONIBLE_OS',
              ],
            };
          } else if (q1.length) {
            CUR_LOC = q1;
          } else if (q2.length && !CUR_LOC) {
            CUR_LOC = q2;
          }

          for (const item of CUR_LOC) {
            if (
              VAL_DES.cantidad == item.disponible &&
              VAL_DES.localizador !== item.localizador
            ) {
              VN_STATUS = 12;
              V_BANDERA = 1;
            }
          }
        }

        if (V_BANDERA == 0 && VAL_DES.status != 9) {
          const selectQ = await this.entity.query(`
                          SELECT  COUNT (0)
                          FROM  NSBDDB.XXSAE_INV_DISPONIBLE_OS
                          WHERE  NO_INVENTARIO     ='${
                            VAL_DES.numero_inventario
                          }'
                              AND  DISPONIBLE        = ${VAL_DES.cantidad}
                              AND  SUBINVENTORY_CODE ='${VAL_DES.subinventario}'
                              AND  LOCATOR_ID  = ${VAL_DES.locator_id || 0}
                              AND ORGANIZATION_ID    = ${
                                VAL_DES.organization_id
                              }
                              AND INVENTORY_ITEM_ID  =${
                                VAL_DES.inventory_item_id
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
              VAL_DES.cve_inventario ? `'${VAL_DES.cve_inventario}'` : 'NULL'
            }, ${VAL_DES.item ? `'${VAL_DES.item}'` : 'NULL'}, ${
          VAL_DES.numero_inventario ? `'${VAL_DES.numero_inventario}'` : 'NULL'
        }, ${VAL_DES.no_bien_siab}, ${VAL_DES.cantidad},
            ${VAL_DES.uom_code ? `'${VAL_DES.uom_code}'` : 'NULL'}, ${
          VAL_DES.subinventario ? `'${VAL_DES.subinventario}'` : 'NULL'
        }, ${VAL_DES.localizador ? `'${VAL_DES.localizador}'` : 'NULL'}, ${
          VAL_DES.fecha_efectiva_transaccion
            ? `'${VAL_DES.fecha_efectiva_transaccion}'`
            : 'NULL'
        }, ${VAL_DES.numero_gestion ? `'${VAL_DES.numero_gestion}'` : 'NULL'},
            ${
              VAL_DES.bien_relacionado
                ? `'${VAL_DES.bien_relacionado}'`
                : 'NULL'
            }, ${
          VAL_DES.solicitud_transferencia
            ? `'${VAL_DES.solicitud_transferencia}'`
            : 'NULL'
        }, ${
          VAL_DES.fecha_solicitud ? `'${VAL_DES.fecha_solicitud}'` : 'NULL'
        }, ${
          VAL_DES.numero_expediente ? `'${VAL_DES.numero_expediente}'` : 'NULL'
        }, ${
          VAL_DES.fecha_expediente ? `'${VAL_DES.fecha_expediente}'` : 'NULL'
        },
            ${
              VAL_DES.via_recepcion_solicitud
                ? `'${VAL_DES.via_recepcion_solicitud}'`
                : 'NULL'
            }, ${VAL_DES.del_regional_recepcion}, ${VAL_DES.autoridad}, ${
          VAL_DES.emisora
        }, ${VAL_DES.entidad_transferente},
            ${
              VAL_DES.expediente_transferente
                ? `'${VAL_DES.expediente_transferente}'`
                : 'NULL'
            }, ${VAL_DES.clave_unica ? `'${VAL_DES.clave_unica}'` : 'NULL'}, ${
          VAL_DES.capitulo_partida
        }, ${VAL_DES.c_attribute1 ? `'${VAL_DES.c_attribute1}'` : 'NULL'}, ${
          VAL_DES.c_attribute2 ? `'${VAL_DES.c_attribute2}'` : 'NULL'
        },
            ${VAL_DES.c_attribute3 ? `'${VAL_DES.c_attribute3}'` : 'NULL'}, ${
          VAL_DES.c_attribute4 ? `'${VAL_DES.c_attribute4}'` : 'NULL'
        }, ${VAL_DES.c_attribute5 ? `'${VAL_DES.c_attribute5}'` : 'NULL'}, ${
          VAL_DES.c_attribute6 ? `'${VAL_DES.c_attribute6}'` : 'NULL'
        }, ${VAL_DES.c_attribute7 ? `'${VAL_DES.c_attribute7}'` : 'NULL'},
            ${VAL_DES.c_attribute8 ? `'${VAL_DES.c_attribute8}'` : 'NULL'}, ${
          VAL_DES.c_attribute9 ? `'${VAL_DES.c_attribute9}'` : 'NULL'
        }, ${VAL_DES.c_attribute10 ? `'${VAL_DES.c_attribute10}'` : 'NULL'}, ${
          VAL_DES.c_attribute11 ? `'${VAL_DES.c_attribute11}'` : 'NULL'
        }, ${VAL_DES.c_attribute12 ? `'${VAL_DES.c_attribute12}'` : 'NULL'},
            ${VAL_DES.c_attribute13 ? `'${VAL_DES.c_attribute13}'` : 'NULL'}, ${
          VAL_DES.c_attribute14 ? `'${VAL_DES.c_attribute14}'` : 'NULL'
        }, ${VAL_DES.c_attribute15 ? `'${VAL_DES.c_attribute15}'` : 'NULL'}, ${
          VAL_DES.c_attribute16 ? `'${VAL_DES.c_attribute16}'` : 'NULL'
        }, ${VAL_DES.c_attribute17 ? `'${VAL_DES.c_attribute17}'` : 'NULL'},
            ${VAL_DES.c_attribute18 ? `'${VAL_DES.c_attribute18}'` : 'NULL'}, ${
          VAL_DES.c_attribute19 ? `'${VAL_DES.c_attribute19}'` : 'NULL'
        }, ${VAL_DES.c_attribute20 ? `'${VAL_DES.c_attribute20}'` : 'NULL'}, ${
          VAL_DES.last_update_date ? `'${VAL_DES.last_update_date}'` : 'NULL'
        }, ${VAL_DES.last_updated_by ? `'${VAL_DES.last_updated_by}'` : 'NULL'},
            ${VAL_DES.last_update_login}, ${VAL_DES.created_by}, '${
          VAL_DES.creation_date
        }', '${VN_STATUS}', ${
          VAL_DES.validacion ? `'${VAL_DES.validacion}'` : 'NULL'
        },
            '${VAL_DES.instancebpel}', ${VAL_DES.siab_no_bien_ref}, ${
          VAL_DES.siab_status_bien ? `${VAL_DES.siab_status_bien}` : 'NULL'
        }, '${VAL_DES.desc_bien}', ${VAL_DES.transaction_type_id},
            '${VAL_DES.origen}', '${VAL_DES.status_nsbdb}', '${
          VAL_DES.sat_tipo_expediente
        }', '${VAL_DES.sat_expediente}', ${VAL_DES.transaction_id},
            ${VAL_DES.reservation_id}, ${VAL_DES.tipo}, ${VAL_DES.sub_tipo}, ${
          VAL_DES.ssub_tipo
        }, ${VAL_DES.sssub_tipo}, ${VAL_DES.locator_id}, ${
          VAL_DES.organization_id
        }, ${VAL_DES.inventory_item_id},
            'INSERT', '${usuario}', '${LocalDate.getCustom(
          LocalDate.getNow(),
          'YYYY-MM-DD',
        )}');
                `);

        const selectCve = await this.entity.query(`
                SELECT CVE_UNICA
                FROM SERA.V_TRANSFERENTES_NIVELES
                    WHERE NO_TRANSFERENTE  = ${VAL_DES.entidad_transferente}
                    AND NO_EMISORA       = ${VAL_DES.emisora}
                    AND NO_AUTORIDAD     = ${VAL_DES.autoridad};
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
                        WHERE CVE_UNIDAD  = '${VAL_DES.uom_code}';
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
                                                  VAL_DES.tipo
                                                }
                                                    AND NO_SUBTIPO      = ${
                                                      VAL_DES.sub_tipo
                                                    }
                                                    AND NO_SSUBTIPO     = ${
                                                      VAL_DES.ssub_tipo
                                                    }
                                                    AND NO_SSSUBTIPO    = ${
                                                      VAL_DES.sssub_tipo
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
          !VAL_DES.tipo ||
          !VAL_DES.sub_tipo ||
          !VAL_DES.ssub_tipo ||
          !VAL_DES.sssub_tipo
        ) {
          VN_STATUS = 11;
          V_BANDERA_VAL = 1;
        }

        if (
          !VAL_DES.entidad_transferente ||
          !VAL_DES.emisora ||
          !VAL_DES.autoridad
        ) {
          VN_STATUS = 11;
          V_BANDERA_VAL = 1;
        }

        if (!VAL_DES.uom_code) {
          VN_STATUS = 11;
          V_BANDERA_VAL = 1;
        }

        if (!VAL_DES.desc_bien) {
          VN_STATUS = 11;
          V_BANDERA_VAL = 1;
        }

        if (!VAL_DES.numero_inventario) {
          VN_STATUS = 11;
          V_BANDERA_VAL = 1;
        }

        if (V_BANDERA_VAL == 1) {
          await this.entity.query(`
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
                VAL_DES.cve_inventario ? `'${VAL_DES.cve_inventario}'` : 'NULL'
              }, ${VAL_DES.item ? `'${VAL_DES.item}'` : 'NULL'}, ${
            VAL_DES.numero_inventario
              ? `'${VAL_DES.numero_inventario}'`
              : 'NULL'
          }, ${VAL_DES.no_bien_siab}, ${VAL_DES.cantidad},
              ${VAL_DES.uom_code ? `'${VAL_DES.uom_code}'` : 'NULL'}, ${
            VAL_DES.subinventario ? `'${VAL_DES.subinventario}'` : 'NULL'
          }, ${VAL_DES.localizador ? `'${VAL_DES.localizador}'` : 'NULL'}, ${
            VAL_DES.fecha_efectiva_transaccion
              ? `'${VAL_DES.fecha_efectiva_transaccion}'`
              : 'NULL'
          }, ${VAL_DES.numero_gestion ? `'${VAL_DES.numero_gestion}'` : 'NULL'},
              ${
                VAL_DES.bien_relacionado
                  ? `'${VAL_DES.bien_relacionado}'`
                  : 'NULL'
              }, ${
            VAL_DES.solicitud_transferencia
              ? `'${VAL_DES.solicitud_transferencia}'`
              : 'NULL'
          }, ${
            VAL_DES.fecha_solicitud ? `'${VAL_DES.fecha_solicitud}'` : 'NULL'
          }, ${
            VAL_DES.numero_expediente
              ? `'${VAL_DES.numero_expediente}'`
              : 'NULL'
          }, ${
            VAL_DES.fecha_expediente ? `'${VAL_DES.fecha_expediente}'` : 'NULL'
          },
              ${
                VAL_DES.via_recepcion_solicitud
                  ? `'${VAL_DES.via_recepcion_solicitud}'`
                  : 'NULL'
              }, ${VAL_DES.del_regional_recepcion}, ${VAL_DES.autoridad}, ${
            VAL_DES.emisora
          }, ${VAL_DES.entidad_transferente},
              ${
                VAL_DES.expediente_transferente
                  ? `'${VAL_DES.expediente_transferente}'`
                  : 'NULL'
              }, ${
            VAL_DES.clave_unica ? `'${VAL_DES.clave_unica}'` : 'NULL'
          }, ${VAL_DES.capitulo_partida}, ${
            VAL_DES.c_attribute1 ? `'${VAL_DES.c_attribute1}'` : 'NULL'
          }, ${VAL_DES.c_attribute2 ? `'${VAL_DES.c_attribute2}'` : 'NULL'},
              ${VAL_DES.c_attribute3 ? `'${VAL_DES.c_attribute3}'` : 'NULL'}, ${
            VAL_DES.c_attribute4 ? `'${VAL_DES.c_attribute4}'` : 'NULL'
          }, ${VAL_DES.c_attribute5 ? `'${VAL_DES.c_attribute5}'` : 'NULL'}, ${
            VAL_DES.c_attribute6 ? `'${VAL_DES.c_attribute6}'` : 'NULL'
          }, ${VAL_DES.c_attribute7 ? `'${VAL_DES.c_attribute7}'` : 'NULL'},
              ${VAL_DES.c_attribute8 ? `'${VAL_DES.c_attribute8}'` : 'NULL'}, ${
            VAL_DES.c_attribute9 ? `'${VAL_DES.c_attribute9}'` : 'NULL'
          }, ${
            VAL_DES.c_attribute10 ? `'${VAL_DES.c_attribute10}'` : 'NULL'
          }, ${
            VAL_DES.c_attribute11 ? `'${VAL_DES.c_attribute11}'` : 'NULL'
          }, ${VAL_DES.c_attribute12 ? `'${VAL_DES.c_attribute12}'` : 'NULL'},
              ${
                VAL_DES.c_attribute13 ? `'${VAL_DES.c_attribute13}'` : 'NULL'
              }, ${
            VAL_DES.c_attribute14 ? `'${VAL_DES.c_attribute14}'` : 'NULL'
          }, ${
            VAL_DES.c_attribute15 ? `'${VAL_DES.c_attribute15}'` : 'NULL'
          }, ${
            VAL_DES.c_attribute16 ? `'${VAL_DES.c_attribute16}'` : 'NULL'
          }, ${VAL_DES.c_attribute17 ? `'${VAL_DES.c_attribute17}'` : 'NULL'},
              ${
                VAL_DES.c_attribute18 ? `'${VAL_DES.c_attribute18}'` : 'NULL'
              }, ${
            VAL_DES.c_attribute19 ? `'${VAL_DES.c_attribute19}'` : 'NULL'
          }, ${
            VAL_DES.c_attribute20 ? `'${VAL_DES.c_attribute20}'` : 'NULL'
          }, ${
            VAL_DES.last_update_date ? `'${VAL_DES.last_update_date}'` : 'NULL'
          }, ${
            VAL_DES.last_updated_by ? `'${VAL_DES.last_updated_by}'` : 'NULL'
          },
              ${VAL_DES.last_update_login}, ${VAL_DES.created_by}, '${
            VAL_DES.creation_date
          }', '${VN_STATUS}', ${
            VAL_DES.validacion ? `'${VAL_DES.validacion}'` : 'NULL'
          },
              '${VAL_DES.instancebpel}', ${VAL_DES.siab_no_bien_ref}, ${
            VAL_DES.siab_status_bien ? `${VAL_DES.siab_status_bien}` : 'NULL'
          }, '${VAL_DES.desc_bien}', ${VAL_DES.transaction_type_id},
              '${VAL_DES.origen}', '${VAL_DES.status_nsbdb}', '${
            VAL_DES.sat_tipo_expediente
          }', '${VAL_DES.sat_expediente}', ${VAL_DES.transaction_id},
              ${VAL_DES.reservation_id}, ${VAL_DES.tipo}, ${
            VAL_DES.sub_tipo
          }, ${VAL_DES.ssub_tipo}, ${VAL_DES.sssub_tipo}, ${
            VAL_DES.locator_id
          }, ${VAL_DES.organization_id}, ${VAL_DES.inventory_item_id},
              'INSERT', '${usuario}', '${LocalDate.getCustom(
            LocalDate.getNow(),
            'YYYY-MM-DD',
          )}');
                  `);
        }

        await this.entity.query(`
        UPDATE nsbddb.SAE_ITEMS_DEST_TMP_V 
        SET STATUS = ${VN_STATUS},
            LAST_UPDATE_DATE= CURRENT_DATE
        WHERE NUMERO_INVENTARIO    ='${VAL_DES.numero_inventario}'
        AND SUBINVENTARIO        ='${VAL_DES.subinventario}'
        AND CANTIDAD             = ${VAL_DES.cantidad}
        AND LOCALIZADOR = '${VAL_DES.localizador || 0}'
        AND NUMERO_GESTION       = '${VAL_DES.numero_gestion || ''}'
        AND LOCATOR_ID    = ${VAL_DES.locator_id || 0}
        AND ORGANIZATION_ID      = ${VAL_DES.organization_id || 0}
        AND INVENTORY_ITEM_ID    = ${VAL_DES.inventory_item_id || 0}
        AND TRANSACTION_ID= ${VAL_DES.transaction_id || 0}
        AND INSTANCEBPEL  = '${VAL_DES.instancebpel || ''}';
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
      Logger.debug('TRIGGER', this.#table);
      const result: any[] = await this.entity.query(`
        select * from audit.logged_actions where event_id > ${this.#eventId} and action in ('D', 'U') and table_name = '${this.#table.toLocaleLowerCase()}' order by event_id DESC;
      `)

      this.#eventId = result[0]?.event_id || this.#eventId;

      Logger.log(this.#eventId);
      Logger.log(result[0]);

      for (const loggedAction of result) {
        const client_query = JSON.parse(loggedAction.client_query);

        if(!client_query) continue;
        if(loggedAction.action == 'U') {
          await this.updateSaeItemsDestTmpVB(client_query);
        }

        if(loggedAction.action == 'D') {
          await this.deleteSaeItemsDestTmpVB(client_query.id);
        }
      }
      
      Logger.verbose('Finished Trigger', this.#table);
    } catch (error) {
      console.log(error.message);
      Logger.error(error.message);
    }
  }

  async updateSaeItemsDestTmpVB(data: any) {
    try {
      await this.entityB.update({ id: data.id }, data);
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message],
      };
    }
  }

  async deleteSaeItemsDestTmpVB(id: number) {
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