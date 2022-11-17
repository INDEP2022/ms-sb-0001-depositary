import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RefPagoDTO } from './dto/ref-pago.dto';
import { RefPagoService } from './ref-pago.service';



@Controller('ref-pago')
export class RefPagoController {


    constructor(
        private readonly service: RefPagoService,
    ) { }




    @MessagePattern({ cmd: 'calculateCondensedDate' })
    
    async calculateCondensedDate( data:RefPagoDTO){
        var rows = await this.service.calculateCondensedDate(data)
        return rows
    }

    @MessagePattern({ cmd: 'calculateImpCondensed' })
    async calculateImpCondensed( data:string){
        var rows = await this.service.calculateImpCondensed(data)
        return rows
    }

    @MessagePattern({ cmd: 'checkedDigitCalculation' })
    async checkedDigitCalculation( data:string){
        var rows = await this.service.checkedDigitCalculation(data)
        return rows
    }

    @MessagePattern({ cmd: 'checkedDigitCalculationHSBC' })
    async checkedDigitCalculationHSBC( data:string){
        var rows = await this.service.checkedDigitCalculationHSBC(data)
        return rows
    }

    @MessagePattern({ cmd: 'checkedDigitCalculationScotia' })
    async checkedDigitCalculationScotia( data:string){
        var rows = await this.service.checkedDigitCalculationScotia(data)
        return rows
    }


}
