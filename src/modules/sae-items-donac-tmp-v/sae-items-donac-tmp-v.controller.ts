import { Controller } from "@nestjs/common";
import { SaeItemsDonacTmpVService } from "./sae-items-donac-tmp-v.service";
import { MessagePattern } from "@nestjs/microservices";


@Controller('sae-items-donac-tmp-v')
export class SaeItemsDonacTmpVController {
    constructor(private service: SaeItemsDonacTmpVService) {}

    @MessagePattern({ cmd: 'PA_INS_VALI_BIEN_DON' })
    async PA_INS_VALI_BIEN_DON(usuario: string) {
        return await this.service.PA_INS_VALI_BIEN_DON(usuario);
    }
}