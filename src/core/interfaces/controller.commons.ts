import { Query } from '@nestjs/common';
import { Body, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ResponseDataDTO } from './response.data.dto';

import { QueryParams } from './query-params';
import { BaseService } from './service.commons';

export abstract class BaseController<T> {
  abstract getService(): BaseService<T>;

  @Post()
  create(@Body() dto: T) {
    return this.getService().create(dto);
  }
  @Get()
  findAll(@Query() queryParams: QueryParams): Promise<ResponseDataDTO<T>> {
    // console.log(queryParams);
    return this.getService().findAll(queryParams);
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getService().findOneById(id);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: T) {
    return this.getService().update(id, dto);
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.getService().remove(id);
  }
}
