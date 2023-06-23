import { Type } from 'class-transformer';
import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { Message } from '../utils/message.decorator';

export class PaginationDto {
  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: Message.NUMBER('$property') })
  @IsPositive({
    message: Message.POSITIVE(`$property`),
  })
  page: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber({}, { message: Message.NUMBER('$property') })
  @IsPositive({
    message: Message.POSITIVE(`$property`),
  })
  limit: number;

  @IsOptional()
  @IsString({ message: Message.STRING('$property') })
  text?: string | null;
}
