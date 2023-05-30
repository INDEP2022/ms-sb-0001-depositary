import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Message } from 'src/shared/utils/message.decorator';

export class GetByParamMapperMenajeDto {

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    @ApiProperty({
        title: 'NO_BIEN',
        example: 'Dato de tipo numerico',
        required: false,
    })
    GoodNo: number;

}