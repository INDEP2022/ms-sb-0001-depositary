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
        if(rows.count == 0) return {statusCode:404,message:'No results found'}
        return  rows
    }



    @MessagePattern({ cmd: 'depositaryPaymentDetFilter' })
    
    async filterDepositaryPaymentDet( data:any){
        var rows = await this.service.filterDepositaryPaymentDet(data.filter,data.pagination)
        if(rows.count == 0) return {statusCode:404,message:'No results found'}
        return rows
    }
    @MessagePattern({ cmd: 'createDepositaryPaymentDet' })
    async createDepositaryPaymentDet( depositaryPaymentDetDTO:DepositaryPaymentDetDTO){
        const task = await this.service.createDepositaryPaymentDet(depositaryPaymentDetDTO);
        return task['statusCode']?task:{data:task, statusCode:200}
    }

    @MessagePattern({ cmd: 'updateDepositaryPaymentDet' })
    async updateDepositaryPaymentDet( depositaryPaymentDetDTO:DepositaryPaymentDetDTO){

        const {affected} = await this.service.updateDepositaryPaymentDet(depositaryPaymentDetDTO);
        return affected==1?{statusCode:200,message:['Actualizado correctamente!']}:
        { statusCode: 400, message: ["No se realizarón cambios!"]};
    }

}
