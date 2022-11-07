import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { DepositaryPaymentDetService } from './depositary-payment-det.service';
import { DepositaryPaymentDetDTO } from './dto/depositary-payment-det.dto';

@Controller('depositary-payment-det')
export class DepositaryPaymentDetController {

    constructor(
        private readonly service: DepositaryPaymentDetService,
    ) { }


    
    @MessagePattern({ cmd: 'getAllDepositaryPaymentDet' })
    async getAllDepositaryPaymentDet( pagination:PaginationDto){
        var rows = await this.service.getAllDepositaryPaymentDet(pagination);
        if(rows.count == 0) return {status:404,message:'No results found'}
        return  rows
    }



    @MessagePattern({ cmd: 'depositaryPaymentDetFilter' })
    
    async filterDepositaryPaymentDet( data:any){
        var rows = await this.service.filterDepositaryPaymentDet(data.filter,data.pagination)
        if(rows.count == 0) return {status:404,message:'No results found'}
        return rows
    }
    @MessagePattern({ cmd: 'createDepositaryPaymentDet' })
    async createDepositaryPaymentDet( depositaryPaymentDetDTO:DepositaryPaymentDetDTO){

        const task = await this.service.createDepositaryPaymentDet(depositaryPaymentDetDTO);
        return task?task:
        { statusCode: 503, message: "This depositaryPaymentDet was not created", error: "Create Error"};
    }

    @MessagePattern({ cmd: 'updateDepositaryPaymentDet' })
    async updateDepositaryPaymentDet( depositaryPaymentDetDTO:DepositaryPaymentDetDTO){

        const {affected} = await this.service.updateDepositaryPaymentDet(depositaryPaymentDetDTO);
        return affected==1?{status:200,message:'Update succesfull'}:
        { statusCode: 403, message: "This depositaryPaymentDet was not update", error: "Update Error"};
    }

}
