import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Order } from './constants';
import { Filter } from './filter';

export class QueryParams {
  // private _orderColumn: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number;
  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  @IsOptional()
  take: number;

  @ApiPropertyOptional({ enum: Order, default: Order.DESC })
  @IsEnum(Order)
  @IsOptional()
  order: Order;
  @ApiPropertyOptional()
  @IsOptional()
  orderColumn: string;
  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  filters: Filter[];
  get skip(): number {
    return (this.page - 1) * this.take;
  }
  constructor(
    order: Order,
    page: number,
    take: number,
    filters: Filter[] = null,
  ) {
    this.page = page;
    this.take = take;
    this.order = order;
    this.filters = filters;
  }
}
