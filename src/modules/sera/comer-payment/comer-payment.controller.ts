import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ComerPaymentService } from './comer-payment.service';
import { SearchPayment } from './dto/search-payment.dto';

@Controller('comer-payment')
export class ComerPaymentController {

    constructor(private service:ComerPaymentService){}

    
   
    @MessagePattern({ cmd: 'paymentProcess' })

    async paymentProcess(){
        return await await this.service.paymentProcess()
    }
    @MessagePattern({ cmd: 'changePaymentProcess' })

    async changePaymentProcess(data:any){
        return await this.service.changePaymentProcess(data.currentSearch, data.newSearch)
    }
    @MessagePattern({ cmd: 'searchPayment' })

    async searchPayment(params:SearchPayment){
        return await this.service.searchPayment(params)
    }
   
 
    @MessagePattern({ cmd: 'selectionPayment' })

    async selectionPayment(data:{selection:number,typeInconci:number}){
        return await this.service.selectionPayment(data.selection,data.typeInconci)
    }
    @MessagePattern({ cmd: 'masivePaymentVPS' })

    async masivePaymentVPS(data:{typeInconci:number,systemValue:string}){
        return await this.service.masivePaymentVPS(data.typeInconci,data.systemValue)
    }
    @MessagePattern({ cmd: 'filesPayment' })

    async filesPayment(data:{typeInconci:number,typeAction:number}){
        return await this.service.filesPayment(data.typeInconci,data.typeAction)
    }
    @MessagePattern({ cmd: 'changePayments' })
        
    async changePayments(data:{typeInconci:number,typeAction:number}){
        return await this.service.changePayments(data.typeInconci,data.typeAction)
    }

}
