import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ExpExel2Service } from './exp-exel-2.service';

@Controller('exp-exel-2')
export class ExpExel2Controller {
    constructor(
        private readonly service: ExpExel2Service,
    ) { }


    
    @MessagePattern({ cmd: 'getFileExcel2' })
    async getFileExcel2( eventId:number){
        var rows = await this.service.createFileExcel2(eventId);
        return  rows
    }
}
