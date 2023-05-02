import {HttpStatus, Injectable} from '@nestjs/common';
import {FilterOperator, paginate, Paginated, PaginateQuery} from "nestjs-paginate";
import {PaginateConfig} from "nestjs-paginate/lib/paginate";
import {CRUDMessages, ResponseDataDTO} from "sigebi-lib-common";
import {Repository} from "typeorm";

@Injectable()
export class CommonFiltersService {
    types = [
        {type:'numeric',value:[FilterOperator.EQ,FilterOperator.NOT,FilterOperator.NULL,FilterOperator.BTW,FilterOperator.GT,FilterOperator.GTE,FilterOperator.LTE,FilterOperator.LT,FilterOperator.IN]},
        {type:'bigint',value:[FilterOperator.EQ,FilterOperator.NOT,FilterOperator.NULL,FilterOperator.BTW,FilterOperator.GT,FilterOperator.GTE,FilterOperator.LTE,FilterOperator.LT,FilterOperator.IN]},
        {type:'character varying', value:[FilterOperator.EQ,FilterOperator.ILIKE,FilterOperator.NULL,FilterOperator.NOT,FilterOperator.IN]},
        {type:'text',value:[FilterOperator.EQ,FilterOperator.ILIKE,FilterOperator.NULL,FilterOperator.NOT,FilterOperator.IN]},
        {type:'character',value:[FilterOperator.EQ,FilterOperator.ILIKE,FilterOperator.NULL,FilterOperator.NOT,FilterOperator.IN]},
        {type:'date',value:[FilterOperator.EQ,FilterOperator.NOT,FilterOperator.NULL,FilterOperator.BTW,FilterOperator.GT,FilterOperator.GTE,FilterOperator.LTE,FilterOperator.LT,FilterOperator.IN]},
        {type:'timestamp',value:[FilterOperator.EQ,FilterOperator.NOT,FilterOperator.NULL,FilterOperator.BTW,FilterOperator.GT,FilterOperator.GTE,FilterOperator.LTE,FilterOperator.LT,FilterOperator.IN]}
    ];

    async callView<T>(query: PaginateQuery,config:PaginateConfig<T>,repository:Repository<T>):Promise<ResponseDataDTO<T>>  {
        let resultQuery:Paginated<T> = null;
        try {
            resultQuery = await paginate(query,repository,config);
        }catch (e) {
            return new ResponseDataDTO<T>(
                JSON.stringify(query),
                0,
                [],
                HttpStatus.BAD_REQUEST,
                CRUDMessages.GetError)
        }
        return new ResponseDataDTO<T>(
            JSON.stringify(query),
            resultQuery.meta.totalItems,
            resultQuery.data,
            resultQuery.meta.totalItems === 0 ?
                HttpStatus.BAD_REQUEST :
                HttpStatus.OK,
            resultQuery.meta.totalItems === 0 ?
                CRUDMessages.GetNotfound :
                CRUDMessages.GetSuccess)
    }

    getColumnsName<T>(entity:Repository<T>):string[] {
        return entity.metadata.columns.map(column => column.propertyName);
    }

    getFilterableColumns<T>(entity:Repository<T>) {
        let filterableColumns = {};
        entity.metadata.columns.forEach( column => {
            let hasFilters = this.types.find( item => item.type === column.type)
            filterableColumns[column.propertyName] = hasFilters ? hasFilters.value : []
        });
        return filterableColumns;
    }

    getSearchableColumns<T>(entity:Repository<T>) {
        let typesText = ['character varying','text','character'];
        return entity.metadata.columns.filter( column => typesText.includes(column.type as string) )
            .map( column => column.propertyName);
    }

    async setAllItem<T>(query: PaginateQuery,repository:Repository<T>) {
        if(query.limit === 0) {
            query.limit = await repository.count();
        }
    }

    async paginateFilter<T>(query: PaginateQuery,repository:Repository<T>,qb:any, nameId:any):Promise<ResponseDataDTO<T>|any> {
        let resultQuery:Paginated<T> = null;
        
        let columnsName:any[] = this.getColumnsName<T>(repository);
        let columnsNameStr:any[] = this.getSearchableColumns<T>(repository);
        let filterableColumns = this.getFilterableColumns<T>(repository);
        
        let config: PaginateConfig<T> = {
        sortableColumns: columnsName,
        //nullSort: 'last',
        searchableColumns: columnsNameStr,
        filterableColumns: filterableColumns,
        defaultSortBy: [[nameId, 'DESC'],],
        defaultLimit: query.limit ? query.limit : 10
        }
        try{
        
        qb?
        resultQuery = await paginate(query,qb,config)
        :resultQuery = await paginate(query,repository,config)
        
        return resultQuery.meta.totalItems>0?
        new ResponseDataDTO<T>(
        JSON.stringify(query),
        resultQuery.meta.totalItems,
        resultQuery.data,
        HttpStatus.OK,
        'Datos obtenidos correctamente.')
        : new ResponseDataDTO<T>(
        JSON.stringify(query),
        0,
        [],
        HttpStatus.BAD_REQUEST,
        'No se encontrarón registros.')
        }catch (error) {
        return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: [error.message]
        }
        }
        }
}
