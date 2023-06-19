
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'src/core/interfaces/response.data.dto';
import { infoDepositaryIdDto } from './dto/info-depositary-id.dto';
import { infoDepositaryDto } from './dto/info-depositary.dto';
import { infoDepositaryEntity } from './entities/info-depositary.entity';
import { InfoDepositaryService } from './info-depositary.service';

@Controller('info-depositary')
export class InfoDepositaryController {
    constructor(private readonly service: InfoDepositaryService) {
        
    }

    @MessagePattern({cmd:'infoDepositary'})
    async infoDepositary(query: PaginateQuery): Promise<ResponseDataDTO<infoDepositaryEntity>> {
        return this.service.infoDepositary(query);
    }

    @MessagePattern({cmd:'infoDepositaryOne'})
    async infoDepositaryOne(body:infoDepositaryIdDto){
        return this.service.infoDepositaryOne(body);
    }

    //============ POST ============
    @MessagePattern({ cmd: 'infoDepositaryPost' })
    async infoDepositaryPost(body: infoDepositaryDto)  {
        return await this.service.infoDepositaryPost(body);
    }

    //============ PUT ============
    @MessagePattern({ cmd: 'infoDepositaryPut' })
    async infoDepositaryPut(body: infoDepositaryDto)  {
        return await this.service.infoDepositaryPut(body);
    }

    //_______________delete
    @MessagePattern({ cmd: 'infoDepositaryDelete' })
    async infoDepositarydelete(body:infoDepositaryIdDto)  {
        return await this.service.infoDepositaryDelete(body);
    }
}
        