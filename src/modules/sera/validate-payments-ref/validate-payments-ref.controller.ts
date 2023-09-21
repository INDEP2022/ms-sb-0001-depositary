import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CurrentFullErase } from './dto/full-erase.dto';
import { ParametersValues } from './dto/get-parameters-values.dto';
import { PresencialBM } from './dto/presencial-bm.dto';
import { RealStateSale, RealStateSaleCurrent } from './dto/real-state-sale.dto';
import { ValidatePaymentsRefService } from './validate-payments-ref.service';
import { UpdateCurrentGeneralStatus } from './dto/update-current-general-status.dto';
import { PrepOIInmu, PrepOiInmuAct } from './dto/param.dto';

@Controller('validate-payments-ref')
export class ValidatePaymentsRefController {

    constructor(private service:ValidatePaymentsRefService){}

    @MessagePattern({ cmd: 'getParametersValues' })
    async getParametersValues(parameters:ParametersValues){
        
        return await this.service.getParametersValues(parameters)
    }

    @MessagePattern({ cmd: 'getParameters' })
    async getParameter(parameters:ParametersValues){
        
        return await this.service.getParameters(parameters)
    }

    @MessagePattern({ cmd: 'presencialBM' })
    async presencialBM(parameters:PresencialBM){
        
        return await this.service.presencialBM(parameters)
    }

    @MessagePattern({ cmd: 'currentRealStateSale' })
    async currentRealStateSale(parameters:RealStateSaleCurrent){
        
        return await this.service.currentRealStateSale(parameters)
    }
    @MessagePattern({ cmd: 'realStateSale' })
    async realStateSale(parameters:RealStateSale){
        
        return await this.service.realStateSale1(parameters)
    }

    @MessagePattern({ cmd: 'ventaInmu' })
    async ventaInmu(parameters:RealStateSale){
        return await this.service.realStateSate(parameters)
    }

    @MessagePattern({ cmd: 'prepOiInmu' })
    async prepOiInmu(parameters:PrepOIInmu){
        return await this.service.prepOiInmu(parameters)
    }
    @MessagePattern({ cmd: 'prepOiInmuAct' })
    async prepOiInmuAct(parameters:PrepOiInmuAct){
        return await this.service.prepOiInmuAct(parameters)
    }
    

    @MessagePattern({ cmd: 'currentFullErase' })
    async currentFullErase(params:CurrentFullErase){
        return await this.service.currentFullErase(params)
    }

    @MessagePattern({ cmd: 'fullErase' })
    async fullErase(params:CurrentFullErase){
        return await this.service.fullErase(params)
    }

    

    @MessagePattern({ cmd: 'actLotAct' })
    async actLotAct(params:any){
        return await this.service.actLotAct(params)
    }

    @MessagePattern({ cmd: 'updateCurrentGeneralStatus' })
    async updateCurrentGeneralStatus(params:UpdateCurrentGeneralStatus){
        return await this.service.updateCurrentGeneralStatus(params)
    }
    @MessagePattern({ cmd: 'updateCurrentGeneralIStatus' })
    async updateCurrentGeneralIStatus(params:UpdateCurrentGeneralStatus){
        return await this.service.actEstGralIAct(params)
    }
    @MessagePattern({ cmd: 'updateGeneralIStatus' })
    async updateGeneralIStatus(params:UpdateCurrentGeneralStatus){
        return await this.service.actEstGralI(params)
    }

    @MessagePattern({ cmd: 'updateGeneralStatus' })
    async updateGeneralStatus(data:{event:number,user:string}){
        return await this.service.updateGeneralStatus(data.event,data.user)
    }

    @MessagePattern({ cmd: 'updateStatusBase' })
    async updateStatusBase(data:{event:number}){
        return await this.service.updateStatusBase(data.event)
    }

    @MessagePattern({ cmd: 'ventaSbm' })
    async ventaSbm(data:{event:number,date:Date}){
        return await this.service.ventaSbm(data.event,data.date)
    }


    @MessagePattern({ cmd: 'ventaSbmAct' })
    async ventaSbmAct(data:RealStateSaleCurrent){
        return await this.service.ventaSbmAct(data)
    }


    @MessagePattern({ cmd: 'prepOiBaseCa' })
    async prepOiBaseCa(data: { event: number, descrption: string, user?: string }){
        return await this.service.prepOiBaseCa(data)
    }
    @MessagePattern({ cmd: 'validComer' })
    async validComer(data: { event: number, date: string,}){
        return await this.service.validComer(data)
    }
    @MessagePattern({ cmd: 'prepOi' })
    async prepOi(data: { event: number, description: string,user:string}){
        return await this.service.prepOi(data.event,data.description,data.user)
    }

    @MessagePattern({ cmd: 'ejecutaPen' })
    async ejecutaPen({ppos, amount}: any) {
        return this.service.ejecutaPen(ppos, amount);
    }

    @MessagePattern({ cmd: 'validaComerAct' })
    async validaComerAct({ event, date, lot }: any) {
        return this.service.validaComerAct(event, date, lot);
    }
}
