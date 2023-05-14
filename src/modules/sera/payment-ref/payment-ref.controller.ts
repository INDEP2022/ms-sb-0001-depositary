import { Controller, Get, HttpStatus } from "@nestjs/common";

import { PaymentRefService } from "./payment-ref.service";
import { ExecDeductionsDto, FillAccreditationsDto, FullDepositDto, GenericParamsDto, PrepOIDto, RemoveDisperPaymentsRefDto, ValidDep, ValidDepDto } from "./dto/param.dto";
import { MessagePattern } from "@nestjs/microservices";

@Controller('payment-ref')
export class PaymentRefController {
    constructor(private readonly service: PaymentRefService) { }

    // POST PROCEDURE DISPERCION_ABONOS
    @MessagePattern({ cmd: 'dispersionAccreditations' })
    async dispersionAccreditations(dto: {name:number,good:number}) {
        return this.service.dispersionAccreditations(dto.name,dto.good);
    }

    //Get PROCEDURE DISP_DEDUCCIONES
    @MessagePattern({ cmd: 'dispersionDeductions' })
    async dispersionDeductions() {
        return this.service.dispersionDeductions();
    }

    //Post PROCEDURE EJEC_DEDUCCIONES
    @MessagePattern({ cmd: 'execDeductions' })
    async execDeductions(dto: ExecDeductionsDto) {
        return this.service.execDeductions(dto);
    }

    //Get PROCEDURE LIQ_PAGOS_DISP
    @MessagePattern({ cmd: 'fillPaymentsDisp' })
    async fillPaymentsDisp() {
        return this.service.fillPaymentsDisp();
    }

    //Post PROCEDURE LLENA_ABONOS
    @MessagePattern({ cmd: 'fillAccreditations' })
    async fillAccreditations(dto: FullDepositDto) {
        return this.service.fillAccreditations(dto);
    }

    //Get PROCEDURE LLENA_ABONOS_DISPER
    @MessagePattern({ cmd: 'fillAccreditationDisper' })
    async fillAccreditationDisper() {
        return this.service.fillAccreditationDisper();
    }

    //Post PROCEDURE INS_DISPERSION
    @MessagePattern({ cmd: 'insertDispersion' })
    async insertDispersion(dto: GenericParamsDto) {
        return this.service.insertDispersion(dto);
    }

    //Post PROCEDURE INS_DISPERSIONBD
    @MessagePattern({ cmd: 'insertDispersionDb' })
    async insertDispersionDb(dto: GenericParamsDto) {
        return this.service.insertDispersionDb(dto);
    }

    //Put PROCEDURE ACT_ABONOSGENS
    @MessagePattern({ cmd: 'updateAccreditationGens' })
    async updateAccreditationGens(dto: GenericParamsDto) {
        return this.service.updateAccreditationGens(dto);
    }

    //Put PROCEDURE ACT_PAGOSREF
    @MessagePattern({ cmd: 'updatePaymentsRef' })
    async updatePaymentsRef(dto: GenericParamsDto) {
        return this.service.updatePaymentsRef(dto);
    }

    //Delete PROCEDURE ELIM_DISPER_PAGOREF
    @MessagePattern({ cmd: 'removeDisperPaymentsRef' })
    async removeDisperPaymentsRef(dto: RemoveDisperPaymentsRefDto) {
        return this.service.removeDisperPaymentsRef(dto);
    }

    //Post PROCEDURE VALIDA_DEP
    @MessagePattern({ cmd: 'validDep' })
    async validDep(dto: ValidDep) {
        
        return this.service.validDep(dto);
    }

    //Post PROCEDURE PREP_OI
    @MessagePattern({ cmd: 'prepOI' })
    async prepOI(dto: PrepOIDto) {
        
        return this.service.prepOI(dto);
    }

    //Post PROCEDURE PARAMETROS
    @MessagePattern({ cmd: 'paramsDep' })
    async paramsDep(dto: any) {
        
        return this.service.paramsDep(dto.name,dto.address);
    }
}
