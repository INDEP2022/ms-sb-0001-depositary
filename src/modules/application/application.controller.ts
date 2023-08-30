import { Controller } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('application')
export class ApplicationController {
  constructor(private readonly service: ApplicationService) { }
  //---------------------------------------------------------------------------------------------
  @MessagePattern({ cmd: 'validBlacklist' })
  async validBlacklist(validBlacklist: number) {
    return await this.service.validBlacklist(validBlacklist);
  }

  @MessagePattern({ cmd: 'comerDetLvGrief' })
  async comerDetLvGrief(grief: number) {
    // console.log(grief)
    return await this.service.comerDetLvGrief(grief);
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
  async appointmentNumber({ goodNumber, pagination }) {
    return await this.service.appointmentNumber(goodNumber, pagination);
  }
  @MessagePattern({ cmd: 'vCheca' })
  async vCheca({ conceptPayKey, pagination }) {
    return await this.service.vCheca(conceptPayKey, pagination);
  }
  @MessagePattern({ cmd: 'vChecaPost' })
  async vChecaPost({ dto, pagination }) {
    return await this.service.vChecaPost(dto, pagination);
  }
  @MessagePattern({ cmd: 'vChecaPostReport' })
  async vChecaPostReport({ dto, pagination }) {
    return await this.service.vChecaPostReport(dto, pagination);
  }
  @MessagePattern({ cmd: 'migrateXXSaeInvDisponibleOs' })
  async migrateXXSaeInvDisponibleOs(data:any) {
    return await this.service.migrateXXSaeInvDisponibleOs();
  }
}
