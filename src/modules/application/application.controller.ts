import { Controller } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { MessagePattern } from '@nestjs/microservices';
import { PbApplyDto } from './dto/pb-apply.dto';

@Controller('application')
export class ApplicationController {
  constructor(private readonly service: ApplicationService) {}
  //---------------------------------------------------------------------------------------------
  @MessagePattern({ cmd: 'validBlacklist' })
  async validBlacklist(validBlacklist: number) {
    return await this.service.validBlacklist(validBlacklist);
  }

  @MessagePattern({ cmd: 'cargaCliente1' })
  async cargaCliente1(no_nombramiento: number) {
    return await this.service.cargaCliente1(no_nombramiento);
  }
  @MessagePattern({ cmd: 'cargaCliente2' })
  async cargaCliente2(no_nombramiento: number) {
    return await this.service.cargaCliente2(no_nombramiento);
  }
  @MessagePattern({ cmd: 'responsable' })
  async responsable(no_bien: number) {
    return await this.service.responsable(no_bien);
  }
  @MessagePattern({ cmd: 'appointmentNumber' })
  async appointmentNumber({goodNumber, pagination}) {
    return await this.service.appointmentNumber(goodNumber, pagination);
  }
}
