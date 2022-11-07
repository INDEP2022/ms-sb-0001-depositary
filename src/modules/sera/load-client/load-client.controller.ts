import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { LoadClientService } from './load-client.service';

@Controller('load-client')
export class LoadClientController {

    constructor(
        private readonly service: LoadClientService,
    ) { }


    
    @MessagePattern({ cmd: 'loadClient' })
    async loadClient(appointmentNumber:number){
        var rows = await this.service.loadClient(appointmentNumber);
        return rows
    }


}
