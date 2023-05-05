import { Controller } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller('application')
export class ApplicationController {
    constructor(
        private readonly service: ApplicationService
    ) { }
    //---------------------------------------------------------------------------------------------
    @MessagePattern({ cmd: 'validBlacklist' })
    async validBlacklist(validBlacklist: number) {
        return await this.service.validBlacklist(validBlacklist);
    }
}
