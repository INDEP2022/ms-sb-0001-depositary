import { Controller } from '@nestjs/common';
import { SaeItemsDestTmpVService } from './sae-items-dest-tmp-v.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('sae-items-dest-tmp-v')
export class SaeItemsDestTmpVController {
  constructor(private service: SaeItemsDestTmpVService) {}

  @MessagePattern({ cmd: 'PA_INS_VALI_BIEN_DES' })
  async PA_INS_VALI_BIEN_DES(usuario: string) {
    return await this.service.PA_INS_VALI_BIEN_DES(usuario);
  }
}
