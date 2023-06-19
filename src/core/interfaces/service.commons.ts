import { Repository } from 'typeorm';
import { ResponseDataDTO } from './response.data.dto';
import { CRUDMessages } from './messages.enum';
import { HttpStatus } from '@nestjs/common';
import { QueryParams } from './query-params';
import { Comparison, Order } from './constants';
import { Filter } from './filter';
// import { Comparison, Order } from '../constants';
// import { Filter } from '../dtos/filter';
// import { QueryParams } from '../dtos/query-params';
// import { CRUDMessages } from '../messages.enum';
// import { HttpStatus } from '@nestjs/common';
// import { ResponseDataDTO } from '../dtos/response.data.dto';

export abstract class BaseService<T> {
  abstract getRepository(): Repository<T>;

  public async create(data: T | any): Promise<ResponseDataDTO<T>> {
    var message;
    var status;
    var count;
    try {
      var result = await this.getRepository().save(data);
      message = CRUDMessages.CreateSuccess;
      status = HttpStatus.OK;
    } catch (error: any) {
      // message = error.message;
      message = error.message;
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    //generar clase de salida
    const response = new ResponseDataDTO<T>(
      new QueryParams(Order.DESC, 1, 1),
      count,
      result,
      status,
      message,
    );
    return response;
  }

  public async update(id: string | any, data: T | any): Promise<ResponseDataDTO<T>> {


    var count;
    try {
      const { affected } = await this.getRepository().update(id, data);
      var message = affected > 0 ? CRUDMessages.UpdateSuccess : CRUDMessages.UpdateError;
      var status = affected > 0 ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
      var result = await this.getRepository().findOneById(id);
    } catch (error: any) {
      message = error.message;
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    //generar clase de salida
    const response = new ResponseDataDTO<T>(
      new QueryParams(Order.DESC, 1, 1),
      count,
      result,
      status,
      message,
    );
    return response;
  }

  public async findOneById(id: string | any): Promise<ResponseDataDTO<T>> {
    var result = await this.getRepository().findOne(id);
    result ? result : null;
    var status = result ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
    var message = result ? CRUDMessages.GetSuccess : CRUDMessages.GetNotfound;
    var count = result ? 1 : 0;
    //generar clase de salida
    const response = new ResponseDataDTO<T>(
      new QueryParams(Order.DESC, 1, 1),
      count,
      result,
      status,
      message,
    );
    return response;
  }

  public async findAll(queryParams: QueryParams): Promise<ResponseDataDTO<T>> {
    let selectString = '';
    const queryBuilder = this.getRepository().createQueryBuilder('table');
    const skip = (queryParams.page - 1) * queryParams.take;
    // console.log(queryParams.orderColumn);
    if (queryParams.orderColumn) {
      const ids = queryParams.orderColumn
        ? [queryParams.orderColumn]
        : this.getRepository().metadata.primaryColumns.map(
          (column) => column.propertyName,
        );
      //iterar por cada una de las propiedades de ordenamiento
      ids.forEach((id) => queryBuilder.addOrderBy(id, queryParams.order));
    }
    //iterar por cada una de las propiedades de busqueda
    // console.log(queryParams.filters);
    // if (queryParams.filters) {
    //   queryParams.filters.forEach((filter) => {
    //     let newFilter: Filter = JSON.parse(filter.toString());
    //     let comparison = this.getComparer(newFilter.comparison);
    //     // console.log(comparison);
    //     let selectString = `${newFilter.property} ${comparison} '${newFilter.comparison === Comparison.LIKE ? '%' : ''
    //       }${newFilter.value}${newFilter.comparison === Comparison.LIKE ? '%' : ''
    //       }'`;
    //     queryBuilder.where(selectString);
    //   });
    // }

    if (queryParams.filters) {
      let cont = queryParams.filters.length;
      queryParams.filters.forEach((filter) => {
        let newFilter: Filter = JSON.parse(filter.toString());
        let comparison = this.getComparer(newFilter.comparison);
        selectString = selectString + `${newFilter.property} ${comparison} '${newFilter.comparison === Comparison.LIKE ? '%' : ''
          }${newFilter.value}${newFilter.comparison === Comparison.LIKE ? '%' : ''
          }'`;
        if (cont > 1) {
          selectString = selectString + ' AND ';
          cont--;
        }
      });
      queryBuilder.where(selectString);
    }
    //paginar
    queryBuilder.skip(skip ? skip : 0).take(queryParams.take || 10);
    // queryBuilder.skip(skip ? skip -1 : 0).take(queryParams.take || 10);
    try {
      var itemsCount = await queryBuilder.getCount();
      var { entities } = await queryBuilder.getRawAndEntities();
    } catch (error: any) {
      message = error.message;
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    const array = entities;
    var status = array.length > 0 ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
    var message = array.length > 0 ? CRUDMessages.GetSuccess : CRUDMessages.GetNotfound;
    //generar clase de salida
    const response = new ResponseDataDTO<T>(
      queryParams,
      itemsCount,
      entities,
      status,
      message,
    );
    return response;
  }

  public async remove(id: string | any): Promise<ResponseDataDTO<T>> {
    var count;
    var message; var status
    var ok = 0;
    try {
      const { affected } = await this.getRepository().delete(id);
      message = affected > 0 ? CRUDMessages.DeleteSuccess : CRUDMessages.DeleteError;
      status = affected > 0 ? HttpStatus.OK : HttpStatus.BAD_REQUEST;
      ok = affected;
    } catch (error: any) {
      message = error.message;
      status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    const response = new ResponseDataDTO<T>(
      new QueryParams(Order.DESC, 1, 1),
      count,
      ok,
      status,
      message,
    );
    return response;
  }
  //metodo para regresar el simbolo comparador los where de las consultas
  protected getComparer(comparerStr: string): string {
    let compare = '=';
    // console.log(comparerStr);
    switch (comparerStr) {
      case Comparison.LIKE:
        compare = 'like';
        break;
      case Comparison.LESS_THAN:
        compare = '<';
        break;
      case Comparison.MORE_THAN:
        compare = '>';
        break;
      case Comparison.NOT:
        compare = '<>';
        break;
      case Comparison.IS_NOT:
        compare = 'IS NOT'
        break;
      default:
        compare = '=';
        break;
    }
    return compare;
  }
}
