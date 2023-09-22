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

export class FullPaymentDto {
    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    name: number;

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    person: number;

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    phase?: number;

    @Type(() => Date)
    @IsDate({ message: Message.IsDate('$property') })
    date: Date;

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


export class FullDepositDto{
    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    name: number;

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    good: number;

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    process: number;
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
export class ValidDep {

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    name: number;

    @Type(() => String)
    @IsDate({ message: Message.IsDate('$property') })
    date: Date;

}

export class PrepOIDto {

    @Type(() => Number)
    @IsNumber({}, { message: Message.NUMBER('$property') })
    name: number;

    @Type(() => String)
    @IsString({ message: Message.IsDate('$property') })
    description: string;

}

export class PrepOIInmu{
    event:number
    descriptionEvent:string
    inmueble:string
    lot:number
    phase:number
    usuario?:string
}
export class PrepOiInmuAct{
    event:number
    descriptionEvent:string
    inmueble:string
    publicLot:number
    lot:number
    phase:number
    user?:string
}