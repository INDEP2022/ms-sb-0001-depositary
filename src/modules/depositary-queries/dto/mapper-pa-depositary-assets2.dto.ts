import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Message } from 'src/shared/utils/message.decorator';

export class mapperPadepositaryAssets2Dto {

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    @ApiProperty({
        title: 'NO_BIEN',
        example: 'Dato de tipo numerico',
        required: false,
    })
    goodNo: number;

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    @ApiProperty({
        title: 'Tipo_Bien',
        example: 'Dato de tipo numerico',
        required: false,
    })
    goodType: number;

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    @ApiProperty({
        title: 'P_ENTFED',
        example: 'Dato de tipo numerico',
        required: false,
    })
    entFed: number;

    @Type(() => String)
    @IsString({ message: Message.STRING('$property') })
    @ApiProperty({
        title: 'P_CLASIF',
        example: 'Dato de tipo texto',
        required: false,
    })
    pClasif: string;


    
}