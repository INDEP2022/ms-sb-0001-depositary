import { Type } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsNumber, IsOptional, IsString, Length } from "class-validator";
import { Message } from "src/shared/utils/message.decorator";

export class GenericParamsDto {
    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    pOne: number;

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    @IsOptional()
    pTwo?: number;
}

export class FillPaymentsDto {
    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    pOne: number;

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    pTwo: number;

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    pThree?: number;

    @Type(() => Date)
    @IsDate({ message: Message.IsDate('$property') })
    pDate: Date;

}

export class ExecDeductionsDto {

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    pOne: number;

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    pTwo: number;

    @Type(() => Date)
    @IsDate({ message: Message.IsDate('$property') })
    pDate: Date;
}

export class FillAccreditationsDto {

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    pOne: number;

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    pTwo: number;

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    pThree: number;

}

export class RemoveDisperPaymentsRefDto {

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    pOne: number;

    @Type(() => Date)
    @IsDate({ message: Message.IsDate('$property') })
    pDate: Date;

}

export class ValidDepDto {

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    pOne: number;

    @Type(() => Date)
    @IsDate({ message: Message.IsDate('$property') })
    pDate: Date;

}

export class PrepOIDto {

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    pOne: number;

    @Type(() => String)
    @IsString({ message: Message.IsDate('$property') })
    pTwo: string;

}