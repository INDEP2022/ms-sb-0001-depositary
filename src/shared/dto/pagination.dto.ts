import { IsNumber, IsPositive, IsOptional } from 'class-validator';

export class PaginationDto {
    @IsNumber()
    @IsPositive()
    @IsOptional()
    page: number;

    @IsNumber()
    @IsPositive()
    @IsOptional()
    limit: number;

    @IsOptional()
    text?:string
}
