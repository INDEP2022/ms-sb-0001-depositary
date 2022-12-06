import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CurrentFullErase } from './dto/full-erase.dto';
import { ParametersValues } from './dto/get-parameters-values.dto';
import { PresencialBM } from './dto/presencial-bm.dto';
import { RealStateSale, RealStateSaleCurrent } from './dto/real-state-sale.dto';
import { ValidatePaymentsRefService } from './validate-payments-ref.service';

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
        
        return await this.service.realStateSale(parameters)
    }
    @MessagePattern({ cmd: 'currentFullErase' })
    async currentFullErase(params:CurrentFullErase){
        return await this.service.currentFullErase(params)
    }

    

    @MessagePattern({ cmd: 'actLotAct' })
    async actLotAct(params:any){
        return await this.service.actLotAct(params)
    }

}
