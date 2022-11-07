import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ValidBlackListService } from './valid-black-list.service';

@Controller('valid-black-list')
export class ValidBlackListController {

    constructor(
        private readonly service: ValidBlackListService,
    ) { }


    
    @MessagePattern({ cmd: 'validBlackList' })
    async validBlackList( eventId:number){
        var rows = await this.service.validBlackList(eventId);
        return  rows
    }
}
