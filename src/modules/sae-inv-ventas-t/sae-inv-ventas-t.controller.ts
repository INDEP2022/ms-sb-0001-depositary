import { Controller, } from '@nestjs/common';
import { SaeInvVentasTService } from './sae-inv-ventas-t.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('sae-inv-ventas-t')
export class SaeInvVentasTController {
  constructor(private service: SaeInvVentasTService) {}

  @MessagePattern({ cmd: 'PA_INS_VALI_BIEN_VEN' })
  async PA_INS_VALI_BIEN_VEN(usuario: string) {
    return await this.service.PA_INS_VALI_BIEN_VEN(usuario);
  }
}

