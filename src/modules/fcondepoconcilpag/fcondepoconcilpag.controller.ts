import { Controller } from '@nestjs/common';
import { FcondepoconcilpagService } from './fcondepoconcilpag.service';
import { MessagePattern } from '@nestjs/microservices';
import { cursorCl1Dto } from './dto/cursor-cl1.dto';

@Controller('fcondepoconcilpag')
export class FcondepoconcilpagController {
    constructor(private readonly service: FcondepoconcilpagService) {}
    //---------------------------------------------------------------------------------------------
    //#region carga_clientes
    @MessagePattern({ cmd: 'cursorCl1' })
    async cursorCl1(dto: cursorCl1Dto) {
      return await this.service.cursorCl1(dto);
    }
    //---------------------------------------------------------------------------------------------
    //#region deleteFunction
    @MessagePattern({ cmd: 'deleteFunction' })
    async deleteFunction(dto: cursorCl1Dto) {
      return await this.service.deleteFunction(dto);
    }
    //---------------------------------------------------------------------------------------------
    //#region FUNCTION valida_estatus
    @MessagePattern({ cmd: 'validateStatus' })
    async validateStatus(dto: cursorCl1Dto) {
      return await this.service.validateStatus(dto);
    }
    //---------------------------------------------------------------------------------------------
    //#region FUNCTION VALIDA_LISTANEGRA
    @MessagePattern({ cmd: 'validateBlacklist' })
    async validateBlacklist(dto: cursorCl1Dto) {
      return await this.service.validateBlacklist(dto);
    }
    //---------------------------------------------------------------------------------------------

}
