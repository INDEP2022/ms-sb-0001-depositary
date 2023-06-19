
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'src/core/interfaces/response.data.dto';
import { detrepoDepositaryIdDto } from './dto/detrepo-depositary-id.dto';
import { detrepoDepositaryDto } from './dto/detrepo-depositary.dto';
import { detrepoDepositaryEntity } from './entities/detrepo-depositary.entity';
import { DetrepoDepositaryService } from './detrepo-depositary.service';

@Controller('detrepo-depositary')
export class DetrepoDepositaryController {
    constructor(private readonly service: DetrepoDepositaryService) {
        
    }

    @MessagePattern({cmd:'detrepoDepositary'})
    async detrepoDepositary(query: PaginateQuery): Promise<ResponseDataDTO<detrepoDepositaryEntity>> {
        return this.service.detrepoDepositary(query);
    }

    @MessagePattern({cmd:'detrepoDepositaryOne'})
    async detrepoDepositaryOne(body:detrepoDepositaryIdDto){
        return this.service.detrepoDepositaryOne(body);
    }

    //============ POST ============
    @MessagePattern({ cmd: 'detrepoDepositaryPost' })
    async detrepoDepositaryPost(body: detrepoDepositaryDto)  {
        return await this.service.detrepoDepositaryPost(body);
    }

    //============ PUT ============
    @MessagePattern({ cmd: 'detrepoDepositaryPut' })
    async detrepoDepositaryPut(body: detrepoDepositaryDto)  {
        return await this.service.detrepoDepositaryPut(body);
    }

    //_______________delete
    @MessagePattern({ cmd: 'detrepoDepositaryDelete' })
    async detrepoDepositarydelete(body:detrepoDepositaryIdDto)  {
        return await this.service.detrepoDepositaryDelete(body);
    }
}
        