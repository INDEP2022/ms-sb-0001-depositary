import { Injectable, HttpStatus, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { CRUDMessages } from 'src/shared/utils/message.enum';
import { LocalDate } from 'src/shared/config/text';
import { Connection, Repository } from 'typeorm';
import { SaeInvSalesTBEntity } from './entities/sae-inv-sales-t-b.dto';

@Injectable()
export class SaeInvVentasTService {
  #eventId: number = 3106;
  #table: string = 'SAE_INV_VENTAS_T';
  constructor(
    private entity: Connection,
    @InjectRepository(SaeInvSalesTBEntity)
    private entityB: Repository<SaeInvSalesTBEntity>,
  ) {}

  transformDateToString(obj: any) {
    for (const field in obj) {
      const value = obj[field];
      console.log(field, value);
      if (!value) continue;

      if (typeof value === 'object') {
        obj[field] = LocalDate.getCustom(value, 'YYYY-MM-DD');
      }
    }

    return obj;
  }

  // NSBDDB.PA_INS_VALI_BIEN_VEN
  async PA_INS_VALI_BIEN_VEN(usuario: string) {
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
        TRANSACTION_ID, RESERVATION_ID, TIPO, SUB_TIPO, SSUB_TIPO, SSSUB_TIPO, LOCATOR_ID, INVENTORY_ITEM_ID, ORGANIZATION_ID
        FROM nsbddb.SAE_INV_VENTAS_T
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

      for (let index = 0; index < qR.length; index++) {
        const VAL_VEN = this.transformDateToString(qR[index]);

        console.log(VAL_VEN.clave_unica);

        VN_STATUS = 0;
        let CUR_LOC;

        const insertB = `
        INSERT INTO nsbddb.SAE_INV_VENTAS_T_B
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
              VAL_VEN.cve_inventario ? `'${VAL_VEN.cve_inventario}'` : 'NULL'
            }, ${VAL_VEN.item ? `'${VAL_VEN.item}'` : 'NULL'}, ${
          VAL_VEN.numero_inventario ? `'${VAL_VEN.numero_inventario}'` : 'NULL'
        }, ${VAL_VEN.no_bien_siab}, ${VAL_VEN.cantidad},
            ${VAL_VEN.uom_code ? `'${VAL_VEN.uom_code}'` : 'NULL'}, ${
          VAL_VEN.subinventario ? `'${VAL_VEN.subinventario}'` : 'NULL'
        }, ${VAL_VEN.localizador ? `'${VAL_VEN.localizador}'` : 'NULL'}, ${
          VAL_VEN.fecha_efectiva_transaccion
            ? `'${VAL_VEN.fecha_efectiva_transaccion}'`
            : 'NULL'
        }, ${VAL_VEN.numero_gestion ? `'${VAL_VEN.numero_gestion}'` : 'NULL'},
            ${
              VAL_VEN.bien_relacionado
                ? `'${VAL_VEN.bien_relacionado}'`
                : 'NULL'
            }, ${
          VAL_VEN.solicitud_transferencia
            ? `'${VAL_VEN.solicitud_transferencia}'`
            : 'NULL'
        }, ${
          VAL_VEN.fecha_solicitud ? `'${VAL_VEN.fecha_solicitud}'` : 'NULL'
        }, ${
          VAL_VEN.numero_expediente ? `'${VAL_VEN.numero_expediente}'` : 'NULL'
        }, ${
          VAL_VEN.fecha_expediente ? `'${VAL_VEN.fecha_expediente}'` : 'NULL'
        },
            ${
              VAL_VEN.via_recepcion_solicitud
                ? `'${VAL_VEN.via_recepcion_solicitud}'`
                : 'NULL'
            }, ${VAL_VEN.del_regional_recepcion}, ${VAL_VEN.autoridad}, ${
          VAL_VEN.emisora
        }, ${VAL_VEN.entidad_transferente},
            ${
              VAL_VEN.expediente_transferente
                ? `'${VAL_VEN.expediente_transferente}'`
                : 'NULL'
            }, ${VAL_VEN.clave_unica ? `'${VAL_VEN.clave_unica}'` : 'NULL'}, ${
          VAL_VEN.capitulo_partida
        }, ${VAL_VEN.c_attribute1 ? `'${VAL_VEN.c_attribute1}'` : 'NULL'}, ${
          VAL_VEN.c_attribute2 ? `'${VAL_VEN.c_attribute2}'` : 'NULL'
        },
            ${VAL_VEN.c_attribute3 ? `'${VAL_VEN.c_attribute3}'` : 'NULL'}, ${
          VAL_VEN.c_attribute4 ? `'${VAL_VEN.c_attribute4}'` : 'NULL'
        }, ${VAL_VEN.c_attribute5 ? `'${VAL_VEN.c_attribute5}'` : 'NULL'}, ${
          VAL_VEN.c_attribute6 ? `'${VAL_VEN.c_attribute6}'` : 'NULL'
        }, ${VAL_VEN.c_attribute7 ? `'${VAL_VEN.c_attribute7}'` : 'NULL'},
            ${VAL_VEN.c_attribute8 ? `'${VAL_VEN.c_attribute8}'` : 'NULL'}, ${
          VAL_VEN.c_attribute9 ? `'${VAL_VEN.c_attribute9}'` : 'NULL'
        }, ${VAL_VEN.c_attribute10 ? `'${VAL_VEN.c_attribute10}'` : 'NULL'}, ${
          VAL_VEN.c_attribute11 ? `'${VAL_VEN.c_attribute11}'` : 'NULL'
        }, ${VAL_VEN.c_attribute12 ? `'${VAL_VEN.c_attribute12}'` : 'NULL'},
            ${VAL_VEN.c_attribute13 ? `'${VAL_VEN.c_attribute13}'` : 'NULL'}, ${
          VAL_VEN.c_attribute14 ? `'${VAL_VEN.c_attribute14}'` : 'NULL'
        }, ${VAL_VEN.c_attribute15 ? `'${VAL_VEN.c_attribute15}'` : 'NULL'}, ${
          VAL_VEN.c_attribute16 ? `'${VAL_VEN.c_attribute16}'` : 'NULL'
        }, ${VAL_VEN.c_attribute17 ? `'${VAL_VEN.c_attribute17}'` : 'NULL'},
            ${VAL_VEN.c_attribute18 ? `'${VAL_VEN.c_attribute18}'` : 'NULL'}, ${
          VAL_VEN.c_attribute19 ? `'${VAL_VEN.c_attribute19}'` : 'NULL'
        }, ${VAL_VEN.c_attribute20 ? `'${VAL_VEN.c_attribute20}'` : 'NULL'}, ${
          VAL_VEN.last_update_date ? `'${VAL_VEN.last_update_date}'` : 'NULL'
        }, ${VAL_VEN.last_updated_by ? `'${VAL_VEN.last_updated_by}'` : 'NULL'},
            ${VAL_VEN.last_update_login}, ${VAL_VEN.created_by}, '${
          VAL_VEN.creation_date
        }', ${VAL_VEN.status ? `'${VAL_VEN.status}'` : 'NULL'}, ${
          VAL_VEN.validacion ? `'${VAL_VEN.validacion}'` : 'NULL'
        },
            '${VAL_VEN.instancebpel}', ${VAL_VEN.siab_no_bien_ref}, ${
          VAL_VEN.siab_status_bien ? `${VAL_VEN.siab_status_bien}` : 'NULL'
        }, '${VAL_VEN.desc_bien}', ${VAL_VEN.transaction_type_id},
            '${VAL_VEN.origen}', '${VAL_VEN.status_nsbdb}', '${
          VAL_VEN.sat_tipo_expediente
        }', '${VAL_VEN.sat_expediente}', ${VAL_VEN.transaction_id},
            ${VAL_VEN.reservation_id}, ${VAL_VEN.tipo}, ${VAL_VEN.sub_tipo}, ${
          VAL_VEN.ssub_tipo
        }, ${VAL_VEN.sssub_tipo}, ${VAL_VEN.locator_id}, ${
          VAL_VEN.organization_id
        }, ${VAL_VEN.inventory_item_id},
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
            WHERE  NO_INVENTARIO = '${VAL_VEN.numero_inventario}'
                AND DECLARACION_ABN_SERA = 'NSBDDB'
                AND ESTATUS != 'CAN';
            `;

        const searchCount = await this.entity.query(searchQ);

        V_EXIST_BIENS = searchCount[0].count;

        if (V_EXIST_BIENS == 0 && VAL_VEN.STATUS != 9) {
          const q = await this.entity.query(`
                SELECT  NO_INVENTARIO,  NO_GESTION, SUBINVENTORY_CODE,  UOM_CODE UNIDAD_MEDIDA, DISPONIBLE, LOCATOR as LOCALIZADOR
                FROM  NSBDDB.XXSAE_INV_DISPONIBLE_OS
                WHERE  NO_INVENTARIO='${VAL_VEN.numero_inventario}'
                    AND SUBINVENTORY_CODE ='${VAL_VEN.subinventario}'
                EXCEPT
                SELECT NO_INVENTARIO, NO_GESTION, SUBINVENTORY_CODE,  UNIDAD_MEDIDA, DISPONIBLE,LOCALIZADOR
                FROM NSBDDB.V_BIEN_BAJA_NSBDDB_ESTAUS0
                WHERE NO_INVENTARIO='${VAL_VEN.numero_inventario}'
                    AND SUBINVENTORY_CODE = '${VAL_VEN.subinventario}'
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
              VAL_VEN.cantidad == item.disponible &&
              VAL_VEN.localizador !== item.localizador
            ) {
              VN_STATUS = 12;
              V_BANDERA = 1;
            }
          }
        }

        if (V_BANDERA == 0 && VAL_VEN.status != 9) {
          const selectQ = await this.entity.query(`
                        SELECT  COUNT (0)
                        FROM  NSBDDB.XXSAE_INV_DISPONIBLE_OS
                        WHERE  NO_INVENTARIO     ='${VAL_VEN.numero_inventario}'
                            AND  DISPONIBLE        = ${VAL_VEN.cantidad}
                            AND  SUBINVENTORY_CODE ='${VAL_VEN.subinventario}'
                            AND  LOCATOR_ID  = ${VAL_VEN.locator_id || 0}
                            AND ORGANIZATION_ID    = ${VAL_VEN.organization_id}
                            AND INVENTORY_ITEM_ID  =${
                              VAL_VEN.inventory_item_id
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
        INSERT INTO nsbddb.SAE_INV_VENTAS_T_B
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
              VAL_VEN.cve_inventario ? `'${VAL_VEN.cve_inventario}'` : 'NULL'
            }, ${VAL_VEN.item ? `'${VAL_VEN.item}'` : 'NULL'}, ${
          VAL_VEN.numero_inventario ? `'${VAL_VEN.numero_inventario}'` : 'NULL'
        }, ${VAL_VEN.no_bien_siab}, ${VAL_VEN.cantidad},
            ${VAL_VEN.uom_code ? `'${VAL_VEN.uom_code}'` : 'NULL'}, ${
          VAL_VEN.subinventario ? `'${VAL_VEN.subinventario}'` : 'NULL'
        }, ${VAL_VEN.localizador ? `'${VAL_VEN.localizador}'` : 'NULL'}, ${
          VAL_VEN.fecha_efectiva_transaccion
            ? `'${VAL_VEN.fecha_efectiva_transaccion}'`
            : 'NULL'
        }, ${VAL_VEN.numero_gestion ? `'${VAL_VEN.numero_gestion}'` : 'NULL'},
            ${
              VAL_VEN.bien_relacionado
                ? `'${VAL_VEN.bien_relacionado}'`
                : 'NULL'
            }, ${
          VAL_VEN.solicitud_transferencia
            ? `'${VAL_VEN.solicitud_transferencia}'`
            : 'NULL'
        }, ${
          VAL_VEN.fecha_solicitud ? `'${VAL_VEN.fecha_solicitud}'` : 'NULL'
        }, ${
          VAL_VEN.numero_expediente ? `'${VAL_VEN.numero_expediente}'` : 'NULL'
        }, ${
          VAL_VEN.fecha_expediente ? `'${VAL_VEN.fecha_expediente}'` : 'NULL'
        },
            ${
              VAL_VEN.via_recepcion_solicitud
                ? `'${VAL_VEN.via_recepcion_solicitud}'`
                : 'NULL'
            }, ${VAL_VEN.del_regional_recepcion}, ${VAL_VEN.autoridad}, ${
          VAL_VEN.emisora
        }, ${VAL_VEN.entidad_transferente},
            ${
              VAL_VEN.expediente_transferente
                ? `'${VAL_VEN.expediente_transferente}'`
                : 'NULL'
            }, ${VAL_VEN.clave_unica ? `'${VAL_VEN.clave_unica}'` : 'NULL'}, ${
          VAL_VEN.capitulo_partida
        }, ${VAL_VEN.c_attribute1 ? `'${VAL_VEN.c_attribute1}'` : 'NULL'}, ${
          VAL_VEN.c_attribute2 ? `'${VAL_VEN.c_attribute2}'` : 'NULL'
        },
            ${VAL_VEN.c_attribute3 ? `'${VAL_VEN.c_attribute3}'` : 'NULL'}, ${
          VAL_VEN.c_attribute4 ? `'${VAL_VEN.c_attribute4}'` : 'NULL'
        }, ${VAL_VEN.c_attribute5 ? `'${VAL_VEN.c_attribute5}'` : 'NULL'}, ${
          VAL_VEN.c_attribute6 ? `'${VAL_VEN.c_attribute6}'` : 'NULL'
        }, ${VAL_VEN.c_attribute7 ? `'${VAL_VEN.c_attribute7}'` : 'NULL'},
            ${VAL_VEN.c_attribute8 ? `'${VAL_VEN.c_attribute8}'` : 'NULL'}, ${
          VAL_VEN.c_attribute9 ? `'${VAL_VEN.c_attribute9}'` : 'NULL'
        }, ${VAL_VEN.c_attribute10 ? `'${VAL_VEN.c_attribute10}'` : 'NULL'}, ${
          VAL_VEN.c_attribute11 ? `'${VAL_VEN.c_attribute11}'` : 'NULL'
        }, ${VAL_VEN.c_attribute12 ? `'${VAL_VEN.c_attribute12}'` : 'NULL'},
            ${VAL_VEN.c_attribute13 ? `'${VAL_VEN.c_attribute13}'` : 'NULL'}, ${
          VAL_VEN.c_attribute14 ? `'${VAL_VEN.c_attribute14}'` : 'NULL'
        }, ${VAL_VEN.c_attribute15 ? `'${VAL_VEN.c_attribute15}'` : 'NULL'}, ${
          VAL_VEN.c_attribute16 ? `'${VAL_VEN.c_attribute16}'` : 'NULL'
        }, ${VAL_VEN.c_attribute17 ? `'${VAL_VEN.c_attribute17}'` : 'NULL'},
            ${VAL_VEN.c_attribute18 ? `'${VAL_VEN.c_attribute18}'` : 'NULL'}, ${
          VAL_VEN.c_attribute19 ? `'${VAL_VEN.c_attribute19}'` : 'NULL'
        }, ${VAL_VEN.c_attribute20 ? `'${VAL_VEN.c_attribute20}'` : 'NULL'}, ${
          VAL_VEN.last_update_date ? `'${VAL_VEN.last_update_date}'` : 'NULL'
        }, ${VAL_VEN.last_updated_by ? `'${VAL_VEN.last_updated_by}'` : 'NULL'},
            ${VAL_VEN.last_update_login}, ${VAL_VEN.created_by}, '${
          VAL_VEN.creation_date
        }', '${VN_STATUS}', ${
          VAL_VEN.validacion ? `'${VAL_VEN.validacion}'` : 'NULL'
        },
            '${VAL_VEN.instancebpel}', ${VAL_VEN.siab_no_bien_ref}, ${
          VAL_VEN.siab_status_bien ? `${VAL_VEN.siab_status_bien}` : 'NULL'
        }, '${VAL_VEN.desc_bien}', ${VAL_VEN.transaction_type_id},
            '${VAL_VEN.origen}', '${VAL_VEN.status_nsbdb}', '${
          VAL_VEN.sat_tipo_expediente
        }', '${VAL_VEN.sat_expediente}', ${VAL_VEN.transaction_id},
            ${VAL_VEN.reservation_id}, ${VAL_VEN.tipo}, ${VAL_VEN.sub_tipo}, ${
          VAL_VEN.ssub_tipo
        }, ${VAL_VEN.sssub_tipo}, ${VAL_VEN.locator_id}, ${
          VAL_VEN.organization_id
        }, ${VAL_VEN.inventory_item_id},
            'INSERT', '${usuario}', '${LocalDate.getCustom(
          LocalDate.getNow(),
          'YYYY-MM-DD',
        )}');
                `);

        const selectCve = await this.entity.query(`
                SELECT CVE_UNICA
                FROM SERA.V_TRANSFERENTES_NIVELES
                    WHERE NO_TRANSFERENTE  = ${VAL_VEN.entidad_transferente}
                    AND NO_EMISORA       = ${VAL_VEN.emisora}
                    AND NO_AUTORIDAD     = ${VAL_VEN.autoridad};
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
                        WHERE CVE_UNIDAD  = '${VAL_VEN.uom_code}';
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
                                                  VAL_VEN.tipo
                                                }
                                                    AND NO_SUBTIPO      = ${
                                                      VAL_VEN.sub_tipo
                                                    }
                                                    AND NO_SSUBTIPO     = ${
                                                      VAL_VEN.ssub_tipo
                                                    }
                                                    AND NO_SSSUBTIPO    = ${
                                                      VAL_VEN.sssub_tipo
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
          !VAL_VEN.tipo ||
          !VAL_VEN.sub_tipo ||
          !VAL_VEN.ssub_tipo ||
          !VAL_VEN.sssub_tipo
        ) {
          VN_STATUS = 11;
          V_BANDERA_VAL = 1;
        }

        if (
          !VAL_VEN.entidad_transferente ||
          !VAL_VEN.emisora ||
          !VAL_VEN.autoridad
        ) {
          VN_STATUS = 11;
          V_BANDERA_VAL = 1;
        }

        if (!VAL_VEN.uom_code) {
          VN_STATUS = 11;
          V_BANDERA_VAL = 1;
        }

        if (!VAL_VEN.desc_bien) {
          VN_STATUS = 11;
          V_BANDERA_VAL = 1;
        }

        if (!VAL_VEN.numero_inventario) {
          VN_STATUS = 11;
          V_BANDERA_VAL = 1;
        }

        if (V_BANDERA_VAL == 1) {
          await this.entity.query(`
          INSERT INTO nsbddb.SAE_INV_VENTAS_T_B
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
                VAL_VEN.cve_inventario ? `'${VAL_VEN.cve_inventario}'` : 'NULL'
              }, ${VAL_VEN.item ? `'${VAL_VEN.item}'` : 'NULL'}, ${
            VAL_VEN.numero_inventario
              ? `'${VAL_VEN.numero_inventario}'`
              : 'NULL'
          }, ${VAL_VEN.no_bien_siab}, ${VAL_VEN.cantidad},
              ${VAL_VEN.uom_code ? `'${VAL_VEN.uom_code}'` : 'NULL'}, ${
            VAL_VEN.subinventario ? `'${VAL_VEN.subinventario}'` : 'NULL'
          }, ${VAL_VEN.localizador ? `'${VAL_VEN.localizador}'` : 'NULL'}, ${
            VAL_VEN.fecha_efectiva_transaccion
              ? `'${VAL_VEN.fecha_efectiva_transaccion}'`
              : 'NULL'
          }, ${VAL_VEN.numero_gestion ? `'${VAL_VEN.numero_gestion}'` : 'NULL'},
              ${
                VAL_VEN.bien_relacionado
                  ? `'${VAL_VEN.bien_relacionado}'`
                  : 'NULL'
              }, ${
            VAL_VEN.solicitud_transferencia
              ? `'${VAL_VEN.solicitud_transferencia}'`
              : 'NULL'
          }, ${
            VAL_VEN.fecha_solicitud ? `'${VAL_VEN.fecha_solicitud}'` : 'NULL'
          }, ${
            VAL_VEN.numero_expediente
              ? `'${VAL_VEN.numero_expediente}'`
              : 'NULL'
          }, ${
            VAL_VEN.fecha_expediente ? `'${VAL_VEN.fecha_expediente}'` : 'NULL'
          },
              ${
                VAL_VEN.via_recepcion_solicitud
                  ? `'${VAL_VEN.via_recepcion_solicitud}'`
                  : 'NULL'
              }, ${VAL_VEN.del_regional_recepcion}, ${VAL_VEN.autoridad}, ${
            VAL_VEN.emisora
          }, ${VAL_VEN.entidad_transferente},
              ${
                VAL_VEN.expediente_transferente
                  ? `'${VAL_VEN.expediente_transferente}'`
                  : 'NULL'
              }, ${
            VAL_VEN.clave_unica ? `'${VAL_VEN.clave_unica}'` : 'NULL'
          }, ${VAL_VEN.capitulo_partida}, ${
            VAL_VEN.c_attribute1 ? `'${VAL_VEN.c_attribute1}'` : 'NULL'
          }, ${VAL_VEN.c_attribute2 ? `'${VAL_VEN.c_attribute2}'` : 'NULL'},
              ${VAL_VEN.c_attribute3 ? `'${VAL_VEN.c_attribute3}'` : 'NULL'}, ${
            VAL_VEN.c_attribute4 ? `'${VAL_VEN.c_attribute4}'` : 'NULL'
          }, ${VAL_VEN.c_attribute5 ? `'${VAL_VEN.c_attribute5}'` : 'NULL'}, ${
            VAL_VEN.c_attribute6 ? `'${VAL_VEN.c_attribute6}'` : 'NULL'
          }, ${VAL_VEN.c_attribute7 ? `'${VAL_VEN.c_attribute7}'` : 'NULL'},
              ${VAL_VEN.c_attribute8 ? `'${VAL_VEN.c_attribute8}'` : 'NULL'}, ${
            VAL_VEN.c_attribute9 ? `'${VAL_VEN.c_attribute9}'` : 'NULL'
          }, ${
            VAL_VEN.c_attribute10 ? `'${VAL_VEN.c_attribute10}'` : 'NULL'
          }, ${
            VAL_VEN.c_attribute11 ? `'${VAL_VEN.c_attribute11}'` : 'NULL'
          }, ${VAL_VEN.c_attribute12 ? `'${VAL_VEN.c_attribute12}'` : 'NULL'},
              ${
                VAL_VEN.c_attribute13 ? `'${VAL_VEN.c_attribute13}'` : 'NULL'
              }, ${
            VAL_VEN.c_attribute14 ? `'${VAL_VEN.c_attribute14}'` : 'NULL'
          }, ${
            VAL_VEN.c_attribute15 ? `'${VAL_VEN.c_attribute15}'` : 'NULL'
          }, ${
            VAL_VEN.c_attribute16 ? `'${VAL_VEN.c_attribute16}'` : 'NULL'
          }, ${VAL_VEN.c_attribute17 ? `'${VAL_VEN.c_attribute17}'` : 'NULL'},
              ${
                VAL_VEN.c_attribute18 ? `'${VAL_VEN.c_attribute18}'` : 'NULL'
              }, ${
            VAL_VEN.c_attribute19 ? `'${VAL_VEN.c_attribute19}'` : 'NULL'
          }, ${
            VAL_VEN.c_attribute20 ? `'${VAL_VEN.c_attribute20}'` : 'NULL'
          }, ${
            VAL_VEN.last_update_date ? `'${VAL_VEN.last_update_date}'` : 'NULL'
          }, ${
            VAL_VEN.last_updated_by ? `'${VAL_VEN.last_updated_by}'` : 'NULL'
          },
              ${VAL_VEN.last_update_login}, ${VAL_VEN.created_by}, '${
            VAL_VEN.creation_date
          }', '${VN_STATUS}', ${
            VAL_VEN.validacion ? `'${VAL_VEN.validacion}'` : 'NULL'
          },
              '${VAL_VEN.instancebpel}', ${VAL_VEN.siab_no_bien_ref}, ${
            VAL_VEN.siab_status_bien ? `${VAL_VEN.siab_status_bien}` : 'NULL'
          }, '${VAL_VEN.desc_bien}', ${VAL_VEN.transaction_type_id},
              '${VAL_VEN.origen}', '${VAL_VEN.status_nsbdb}', '${
            VAL_VEN.sat_tipo_expediente
          }', '${VAL_VEN.sat_expediente}', ${VAL_VEN.transaction_id},
              ${VAL_VEN.reservation_id}, ${VAL_VEN.tipo}, ${
            VAL_VEN.sub_tipo
          }, ${VAL_VEN.ssub_tipo}, ${VAL_VEN.sssub_tipo}, ${
            VAL_VEN.locator_id
          }, ${VAL_VEN.organization_id}, ${VAL_VEN.inventory_item_id},
              'INSERT', '${usuario}', '${LocalDate.getCustom(
            LocalDate.getNow(),
            'YYYY-MM-DD',
          )}');
                `);
        }

        await this.entity.query(`
            UPDATE nsbddb.SAE_INV_VENTAS_T 
            SET STATUS = ${VN_STATUS},
                LAST_UPDATE_DATE= CAST('${dateNow}' AS DATE)
            WHERE NUMERO_INVENTARIO    ='${VAL_VEN.numero_inventario}'
            AND SUBINVENTARIO        ='${VAL_VEN.subinventario}'
            AND CANTIDAD             = ${VAL_VEN.cantidad}
            AND LOCALIZADOR = '${VAL_VEN.localizador || 0}'
            AND NUMERO_GESTION       = '${VAL_VEN.numero_gestion || ''}'
            AND LOCATOR_ID    = ${VAL_VEN.locator_id || 0}
            AND ORGANIZATION_ID      = ${VAL_VEN.organization_id || 0}
            AND INVENTORY_ITEM_ID    = ${VAL_VEN.inventory_item_id || 0}
            AND TRANSACTION_ID= ${VAL_VEN.transaction_id || 0}
            AND INSTANCEBPEL  = '${VAL_VEN.instancebpel || ''}';
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
        select * from audit.logged_actions where event_id > ${this.#eventId} and action in ('D', 'U') and table_name = '${this.#table.toLocaleLowerCase()}' order by event_id DESC;
      `)

      this.#eventId = result[0]?.event_id || this.#eventId;

      //Logger.log(this.#eventId);
      //Logger.log(result[0]);

      for (const loggedAction of result) {
        const client_query = JSON.parse(loggedAction.client_query);

        if(!client_query) continue;
        if(loggedAction.action == 'U') {
          await this.updateSaeInvVentasTB(client_query);
        }

        if(loggedAction.action == 'D') {
          await this.deleteSaeInVentasTB(client_query.id);
        }
      }
      
      //Logger.verbose('Finished Trigger', this.#table);
    } catch (error) {
      console.log(error.message);
      Logger.error(error.message);
    }
  }

  async updateSaeInvVentasTB(data: any) {
    try {
      await this.entityB.update({ id: data.id }, data);
    } catch (error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message],
      };
    }
  }

  async deleteSaeInVentasTB(id: number) {
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
