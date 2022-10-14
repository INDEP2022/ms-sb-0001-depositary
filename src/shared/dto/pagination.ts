import { IsNumber, IsPositive, IsOptional } from 'class-validator';
export class PaginationDto {
    @IsNumber()
    @IsPositive()
    @IsOptional()
    inicio:number;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    pageSize: number;
}
