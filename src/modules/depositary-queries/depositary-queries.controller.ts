import { Controller, Get, } from '@nestjs/common';
import {
    ApiBody,
    ApiCreatedResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
  } from '@nestjs/swagger';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { DepositaryQueriesService } from './depositary-queries.service';
import { MessagePattern } from '@nestjs/microservices';
import { GetByParamMapperMenajeDto } from './dto/get-by-param-mapper-menaje.dto';
import { mapperPadepositaryAssets2Dto } from './dto/mapper-pa-depositary-assets2.dto';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { FmaSinsPagDepositariasDto, FmaSinsPagDepositariasMassiveDto } from './dto/fma-sins-pag-depositarias.dto';
@Controller('depositary-queries')
export class DepositaryQueriesController {
    constructor(private readonly service: DepositaryQueriesService) {}
    /*@ApiOperation({ summary: 'Paginación de todos los registros' })
    @ApiResponse({
      status: 200
    })
    @ApiQuery({
      name: 'page',
      description: 'Número de página',
      type: Number,
      required: false,
    })
    @ApiQuery({
      name: 'limit',
      description: 'Limite de elementos',
      type: Number,
      required: false,
    })
    @ApiQuery({
      name: 'search',
      description: 'Texto a buscar',
      type: String,
      required: false,
    })
    @Get()*/
    @MessagePattern({ cmd: 'GetByParamMappervSSSTipoBien' })
    async GetByParamMappervSSSTipoBien(query: PaginateQuery) {
      return await this.service.GetByParamMappervSSSTipoBien(query);
    }

    @MessagePattern({ cmd: 'GetByParamMapperMenaje' })
    async GetByParamMapperMenaje(dto: GetByParamMapperMenajeDto) {
      return await this.service.GetByParamMapperMenaje(dto);
    }

    @MessagePattern({ cmd: 'querysOracleCatFed' })
    async querysOracleCatFed() {
      return await this.service.querysOracleCatFed();
    }

    @MessagePattern({ cmd: 'mapperPadepositaryAssets1' })
    async mapperPadepositaryAssets1(dto: GetByParamMapperMenajeDto) {
      return await this.service.mapperPadepositaryAssets1(dto);
    }

    @MessagePattern({ cmd: 'mapperPadepositaryAssets2' })
    async mapperPadepositaryAssets2(dto: mapperPadepositaryAssets2Dto) {
      return await this.service.mapperPadepositaryAssets2(dto);
    }

    @MessagePattern({cmd:'getFactJurRegDestLegCustom'})
    async getFactJurRegDestLegCustom(pagination: PaginateQuery){
      return await this.service.getFactJurRegDestLegCustom(pagination)
    }

    
    @MessagePattern({ cmd: 'getFmaSinsPagDepositarias' })
    async getFmaSinsPagDepositarias(dto: FmaSinsPagDepositariasMassiveDto) {
      return await this.service.getFmaSinsPagDepositarias(dto);
    }

    @MessagePattern({cmd:'getFactJurRegDestLegV2'})
    async getFactJurRegDestLegV2({dto, pagination}){
      return await this.service.getFactJurRegDestLegV2(dto, pagination)
    }
}
