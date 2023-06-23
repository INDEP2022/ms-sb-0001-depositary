import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';

@Injectable()
export class CommonFilterQueryService {

      constructor(@InjectEntityManager() private readonly entityManager: EntityManager) { }

      async callView(paginador, sql: string, ocurrencia?: number) {

            let fromIndex = -1;
            for (let i = 0; i < ocurrencia; i++) {
                  fromIndex = sql.toUpperCase().indexOf('from'.toUpperCase(), fromIndex + 1);
                  if (fromIndex === -1) {
                        return {
                              statusCode: HttpStatus.BAD_REQUEST,
                              message: 'Error en la busqueda',
                              data: null,
                        }
                  }
            }

            const newSqlCount = 'select count(0) as count ' + sql.substring(fromIndex)
            const q: any[] = await this.entityManager.query(`${sql} limit ${paginador.limit || 10} offset ${(paginador.page - 1) * paginador.limit || 0}`)
            const countPaginate: any[] = await this.entityManager.query(newSqlCount)

            return {
                  statusCode: q.length > 0 && Object.entries(q[0]).length > 0 ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
                  message: q.length > 0 && Object.entries(q[0]).length > 0 ? 'Busqueda existosa!' : 'No se encontraron registros',
                  data: q.length > 0 && Object.entries(q[0]).length > 0 ? q : null,
                  count: q.length > 0 && Object.entries(q[0]).length > 0 ? Number(countPaginate[0].count) : 0
            }
      }

}

