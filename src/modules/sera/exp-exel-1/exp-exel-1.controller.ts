import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ExpExel1Service } from './exp-exel-1.service';

@Controller('exp-exel-1')
export class ExpExel1Controller {
    constructor(
        private readonly service: ExpExel1Service,
    ) { }


    
    @MessagePattern({ cmd: 'getFileExcel1' })
    async getFileExcel1( data:any){
        var rows = await this.service.createFileExcel(data.propertyNumber,data.paymentId);
        return  rows
    }
}
