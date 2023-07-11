import { HttpStatus, Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { CommonFiltersService } from 'src/shared/common-filters.service';
import { VTypeWellEntity } from '../infrastructure/entities/views/v-type-well.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
//import { PaginateQuery } from 'nestjs-paginate';
import { FilterOperator, PaginateQuery, paginate, Paginated,PaginateConfig } from 'nestjs-paginate';
import { GetByParamMapperMenajeDto } from './dto/get-by-param-mapper-menaje.dto';
import { CatEntfedEntity } from '../infrastructure/entities/cat-entfed.entity';
import { mapperPadepositaryAssets2Dto } from './dto/mapper-pa-depositary-assets2.dto';
import { CommonFilterQueryService } from 'src/shared/service/common-filter-query.service';
import { AppointmentDepositoryEntity } from '../infrastructure/entities/appointment-depository.entity';
import { GoodEntity } from '../infrastructure/entities/good.entity';
import { PersonEntity } from '../sera/depositary-appointment/entity/person.entity';
import { SegUsersEntity } from '../sera/depositary-appointment/entity/seg-users.entity';
import { PaginationDto } from 'src/shared/dto/pagination';
import { FmaSinsPagDepositariasDto, FmaSinsPagDepositariasMassiveDto } from './dto/fma-sins-pag-depositarias.dto';
@Injectable()
export class DepositaryQueriesService {
    constructor(
        private commonFilterQueryService:CommonFilterQueryService,
        private commonFilterService: CommonFiltersService,
        @InjectRepository(VTypeWellEntity) private repository: Repository<VTypeWellEntity>,
        @InjectRepository(CatEntfedEntity) private repositoryCatEntFed: Repository<CatEntfedEntity>,
        @InjectRepository(AppointmentDepositoryEntity) private appointmentDepositoryEntity: Repository<AppointmentDepositoryEntity>,
        @InjectRepository(GoodEntity) private goodEntity: Repository<GoodEntity>,
        @InjectRepository(SegUsersEntity) private segUsersEntity: Repository<SegUsersEntity>,
        @InjectRepository(PersonEntity) private personEntity: Repository<PersonEntity>,


        private readonly entity: Connection
    ) { }

    //#region MappervSSSTipoBien.cs (GetByParam(vSSSTipoBien item))
    async GetByParamMappervSSSTipoBien(query: PaginateQuery): Promise<Paginated<VTypeWellEntity>> {

        return await paginate(query, this.repository, {
            sortableColumns: ['classifyGoodNumber', 'Type', 'subtypeNumber'],
            //nullSort: 'last',
            defaultSortBy: [['downloadsubtype', 'ASC']],
            searchableColumns: ['classifyGoodNumber', 'Type', 'subtypeNumber', 'ssubtypeNumber', 'downloadSsubtype', 'sssubtypeNumber', 'downloadsssubtype'],
            select: ['classifyGoodNumber', 'subtypeNumber', 'ssubtypeNumber', 'downloadsssubtype'],
            filterableColumns: {
                classifyGoodNumber: [FilterOperator.EQ, FilterOperator.IN],
                subtypeNumber: [FilterOperator.EQ, FilterOperator.IN],
                ssubtypeNumber: [FilterOperator.EQ, FilterOperator.IN],
                downloadsssubtype: [FilterOperator.ILIKE],
                Type: [FilterOperator.EQ, FilterOperator.IN],

            },
        })
    }

    //#region GetByParam(MENAJE item) -----  GetClaves(MENAJE item)
    async GetByParamMapperMenaje(dto: GetByParamMapperMenajeDto) {
        try {
            let query = await this.entity.query(`
                SELECT MEN.NO_BIEN, MEN.NO_BIEN_MENAJE, MEN.NO_REGISTRO, BI.DESCRIPCION FROM SERA.MENAJE MEN 
                LEFT JOIN SERA.BIEN BI ON BI.NO_BIEN = MEN.NO_BIEN_MENAJE 
                WHERE MEN.NO_BIEN = ${dto.GoodNo};
            `);
            return {
                statusCode: HttpStatus.OK,
                message: ['OK'],
                data: query,
            };
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: [],
            };
        }

    }
    //#endregion GetByParam(MENAJE item) -----  GetClaves(MENAJE item)

    //#region QuerysOracle.txt -- CAT_ENTFED
    async querysOracleCatFed() {
        const results = await this.repositoryCatEntFed.find({
            select: ["otkey", "otvalor"]
        });
        return {
            statusCode: HttpStatus.OK,
            message: ['OK'],
            data: results,
        };
    }
    //#endregion QuerysOracle.txt -- CAT_ENTFED

    //#region MapperPA_BIENESDEPOSITARIA.cs primera consulta
    async mapperPadepositaryAssets1(dto: GetByParamMapperMenajeDto) {
        try {
            let query = await this.entity.query(`
                SELECT BIEN, ESTATUS_BIEN, PROCESO_EXT_DOM, DESCRIPCION_BIEN, DESTINO, SS_TIPO_BIEN, S_TIPO_BIEN, COORD_ADMIN, TIPO_BIEN, UBICACION_ALMACEN , 
                (SELECT COUNT(1) FROM SERA.MENAJE MEN WHERE MEN.NO_BIEN = BIEN) AS MENAJE 
                FROM SERA.Z_CENTRO_OPERACION_REGIONAL Z 
                WHERE BIEN = ${dto.GoodNo};
            `);
            return {
                statusCode: HttpStatus.OK,
                message: ['OK'],
                data: query,
            };
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: [],
            };
        }

    }

    //#region MapperPA_BIENESDEPOSITARIA.cs Segunda Consulta
    async mapperPadepositaryAssets2(dto: mapperPadepositaryAssets2Dto) {
        try {

            let strlQuery = `SELECT BIEN, ESTATUS_BIEN, PROCESO_EXT_DOM, DESCRIPCION_BIEN, DESTINO, SS_TIPO_BIEN, S_TIPO_BIEN, COORD_ADMIN, TIPO_BIEN, UBICACION_ALMACEN , 
            (SELECT COUNT(1) FROM SERA.MENAJE MEN WHERE MEN.NO_BIEN = BIEN) AS MENAJE , CLASIF, ALMACEN_ID_ENTFED, VAL4
            FROM SERA.Z_CENTRO_OPERACION_REGIONAL Z`;

            if (dto.goodNo > 0) {
                strlQuery += ` WHERE BIEN = '${dto.goodNo}' `;
            } else {
                strlQuery += ` WHERE ESTATUS_BIEN = 'ADM' `;
                strlQuery += `AND CLASIF IN('${dto.pClasif}') `;
                if (dto.entFed > 0 && dto.goodType != 6) {
                    strlQuery += `AND ALMACEN_ID_ENTFED = ${dto.entFed}`;
                }

                if (dto.entFed > 0 && dto.goodType == 6) {
                    strlQuery += `AND EXISTS (SELECT 1 FROM SERA.BIEN
                        WHERE NO_BIEN = Z.BIEN
                          AND (CASE WHEN VAL4 = 'DISTRITO FEDERAL' THEN 'CIUDAD DE MEXICO' ELSE VAL4 END) IN (
                            SELECT OTVALOR
                            FROM SERA.CAT_ENTFED
                            WHERE OTCLAVE = '${dto.entFed}'
                        ));`;
                }
            }

            let query = await this.entity.query(strlQuery);
            return {
                statusCode: HttpStatus.OK,
                message: ['OK'],
                data: query,
            };
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: [],
            };
        }

    }

    //#region MapperPA_BIENESDEPOSITARIA.cs Segunda Consulta


    //#region getFactJurRegDestLeg
    async getFactJurRegDestLeg({ limit, page }: PaginationDto) {
        let count = 0;
        try {
            const subquery = this.goodEntity
                .createQueryBuilder('e')
                .select('b.no_bien')
                .from(GoodEntity, 'b')
                .where('e.no_expediente = b.no_expediente');
            const query = this.appointmentDepositoryEntity
                .createQueryBuilder('nd')
                .where('nd.no_bien IN (' + subquery.getQuery() + ')')
                .orderBy('nd.FEC_INI_CONTRATO', 'DESC')
                .leftJoinAndMapOne('nd.personNumber', PersonEntity, 'p', 'nd.no_persona = p.no_persona')
                .leftJoinAndMapOne('nd.good', GoodEntity, 'tg', 'nd.no_bien = tg.no_bien')
                .leftJoinAndMapOne('nd.user', SegUsersEntity, 'tsu', 'nd.representante_sera = tsu.usuario')
                .orderBy('nd.numberAppointment', 'DESC')
                .take(limit || 10)
                .skip((page - 1) * limit || 0)
            const [result, total] = await query.getManyAndCount()
            return {
                statusCode: HttpStatus.OK,
                message: ['OK'],
                data: result,
                count: total
            }
        } catch (error) {
            console.log(error)
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: [],
            };
        }

    }
    //#endregion getFactJurRegDestLeg

    
    //#region getFactJurRegDestLegCustom
    async getFactJurRegDestLegCustom(query: PaginateQuery) {
        try { 
 
            let columnsName1: any[] = this.commonFilterService.getColumnsName<AppointmentDepositoryEntity>(this.appointmentDepositoryEntity); 
            let filterableColumns1 = this.commonFilterService.getFilterableColumns<AppointmentDepositoryEntity>(this.appointmentDepositoryEntity); 
            console.log(filterableColumns1)
            
            let searchableColumns1: any[] = this.commonFilterService.getSearchableColumns(this.appointmentDepositoryEntity); 
       
            let columnsName2: any[] = this.commonFilterService.getColumnsName2<PersonEntity>(this.personEntity); 
            let filterableColumns2 = this.commonFilterService.getFilterableColumns2<PersonEntity>(this.personEntity); 
            let searchableColumns2: any[] = this.commonFilterService.getSearchableColumns2(this.personEntity); 
       
            let columnsName3: any[] = this.commonFilterService.getColumnsName2<GoodEntity>(this.goodEntity); 
            let filterableColumns3 = this.commonFilterService.getFilterableColumns2<GoodEntity>(this.goodEntity); 
            let searchableColumns3: any[] = this.commonFilterService.getSearchableColumns2(this.goodEntity); 

            let columnsName4: any[] = this.commonFilterService.getColumnsName2<SegUsersEntity>(this.segUsersEntity); 
            let filterableColumns4 = this.commonFilterService.getFilterableColumns2<SegUsersEntity>(this.segUsersEntity); 
            let searchableColumns4: any[] = this.commonFilterService.getSearchableColumns2(this.segUsersEntity); 
       
            let columnsName = columnsName1.concat(columnsName2,columnsName3,columnsName4); 
            let filterableColumns = Object.assign(filterableColumns1, filterableColumns2,filterableColumns3,filterableColumns4); 
            let searchableColumns = Object.assign(searchableColumns1, searchableColumns2,searchableColumns3,searchableColumns4); 
            

            
            await this.commonFilterService.setAllItem(query, this.appointmentDepositoryEntity); 
            
            const queryBuilder = this.appointmentDepositoryEntity.createQueryBuilder('table')

            let config: PaginateConfig<AppointmentDepositoryEntity> = { 
              sortableColumns: columnsName, 
              relations: ['user', 'good', 'personNumber'], 
              nullSort: 'last', 
              searchableColumns: searchableColumns, 
              filterableColumns: filterableColumns, 
            } 
            const res = await paginate<AppointmentDepositoryEntity>(query, queryBuilder, config) 
       
            return { 
              statusCode: res.meta.totalItems > 0 ? HttpStatus.OK : HttpStatus.BAD_REQUEST, 
              message: res.meta.totalItems > 0 ? ["Datos obtenidos correctamente."] : ["No se encontrarón registros."], 
              data: res.meta.totalItems > 0 ? res.data : [], 
              count: res.meta.totalItems 
       
            } 
          } catch (error) { 
            return { 
              statusCode: HttpStatus.INTERNAL_SERVER_ERROR, 
              message: error.message, 
              data: null, 
            } 
          }
    }
    //#endregion getFactJurRegDestLegCustom

    async getFmaSinsPagDepositarias({ data }: FmaSinsPagDepositariasMassiveDto) {
        try {

            let ERRTXT = [];
            let VCONE = 0;
            let VCONC = 0;
            let VCONJ = 0;
            let VCONP = 0;
            let VCONA = 0;

            for (let i = 0; i < data.length; i++) {
                let V_NO_NOMBRAMIENTO: any;
                let V_NO_BIEN: any;
                let V_FEC_PAGO: any;
                let V_CVE_CONCEPTO_PAGO: any;
                let V_IMPORT: any;
                let V_OBSERVACION: any;
                let V_CHECA: any;
                let V_BAN = false;

                const element = data[i];
                if (!element.no_bien) {
                    return {
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: 'El numero bien es obligatorio',
                        data: null,
                    }
                } else {
                    if (element.validado === 'S' && element.aplicado === 'N') {
                        try {
                            await this.entity.query(`
                            INSERT INTO sera.DETPAGO_DEPOSITARIAS ( NO_NOMBRAMIENTO,
                                FEC_PAGO,
                                CVE_CONCEPTO_PAGO,
                                IMPORTE,
                                OBSERVACION
                            )
                    VALUES ( ${element.no_nombramiento},
                                '${element.fec_pago}',
                                ${element.cve_concepto_pago},
                                ${element.importe},
                                ${element.observacion}'
                            );
                        `)

                        } catch (error) {
                            return {
                                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                                message: error.message,
                                data: null,
                            }
                        }
                        element.aplicado = 'S';
                        VCONC = VCONC + 1;
                    } else {
                        ERRTXT.push(`(PAGOS) Registro Bien: ${element.no_bien}, Fecha pago: ${element.fec_pago}, Clave Pago: ${element.cve_concepto_pago}. Error `);
                        VCONE = VCONE + 1;
                        element.validado = 'N'
                    }

                    if (element.valjur === 'S' && element.apljur === 'N') {

                        try {
                            await this.entity.query(`
                            INSERT INTO sera.DETREPO_DEPOSITARIAS ( NO_NOMBRAMIENTO,
                                FEC_REPO,
                                CVE_REPORTE,
                                REPORTE
                            )
                    VALUES ( ${element.no_nombramiento},
                                '${element.fec_pago}',
                                1,
                                '${element.juridico}'
                            );
                    `)


                        } catch (error) {
                            return {
                                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                                message: error.message,
                                data: null,
                            }
                        }
                        element.apljur = 'S';
                        VCONJ = VCONJ + 1;
                    } else {
                        ERRTXT.push(`(JURIDICO) Registro: ${element}. Bien: ${element.no_bien}, Fecha Reporte: ${element.fec_pago}. Error`)
                        element.valjur = 'N'
                    }

                    if (element.valadm === 'S' && element.apladm === 'N') {

                        try {
                            await this.entity.query(`
                            INSERT INTO sera.DETREPO_DEPOSITARIAS ( NO_NOMBRAMIENTO,
                                FEC_REPO,
                                CVE_REPORTE,
                                REPORTE
                              )
                       VALUES ( ${element.no_nombramiento},
                                '${element.fec_pago}',
                                2,
                                '${element.administra}'
                              );
                            `)

                        } catch (error) {
                            return {
                                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                                message: error.message,
                                data: null,
                            }
                        }
                        element.apladm = 'S'
                        VCONA = VCONA + 1;
                    } else {
                        ERRTXT.push(`(ADMINISTRATIVO) Registro: ${element}. Bien: ${element.no_bien}, Fecha Reporte: ${element.fec_pago}. Error`)
                        element.valadm = 'N';
                    }
                    VCONP = VCONP + 1;
                }
            }

            return {
                statusCode: HttpStatus.OK,
                message: 'Datos insertados',
                data: {
                    ERRTXT,
                    VCONE,
                    VCONC,
                    VCONJ,
                    VCONP,
                    VCONA
                }
            }
        } catch (error) {
            return {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message,
                data: null,
            }
        }
    }
}
