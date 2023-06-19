import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Comparison } from './constants';

export class Filter {
  @ApiProperty()
  // @IsOptional()
  property: string;
  @ApiProperty({ enum: Comparison, default: Comparison.EQUAL })
  @IsEnum(Comparison)
  @IsOptional()
  comparison: Comparison;
  @ApiProperty()
  // @IsOptional()
  value: string;
}
