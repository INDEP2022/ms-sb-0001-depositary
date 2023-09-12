import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { Message } from 'src/shared/utils/message.decorator';

export class GetFactJurRegDestLegDto {


    id: number;
    description: string;


    
}