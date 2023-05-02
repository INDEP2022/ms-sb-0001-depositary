
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'sigebi-lib-common';
import { dedPayDepositaryIdDto } from './dto/ded-pay-depositary-id.dto';
import { dedPayDepositaryDto } from './dto/ded-pay-depositary.dto';
import { dedPayDepositaryEntity } from './entities/ded-pay-depositary.entity';
import { DedPayDepositaryService } from './ded-pay-depositary.service';

@Controller('ded-pay-depositary')
export class DedPayDepositaryController {
    constructor(private readonly service: DedPayDepositaryService) {
        
    }

    @MessagePattern({cmd:'dedPayDepositary'})
    async dedPayDepositary(query: PaginateQuery): Promise<ResponseDataDTO<dedPayDepositaryEntity>> {
        return this.service.dedPayDepositary(query);
    }

    @MessagePattern({cmd:'dedPayDepositaryOne'})
    async dedPayDepositaryOne(body:dedPayDepositaryIdDto){
        return this.service.dedPayDepositaryOne(body);
    }

    //============ POST ============
    @MessagePattern({ cmd: 'dedPayDepositaryPost' })
    async dedPayDepositaryPost(body: dedPayDepositaryDto)  {
        return await this.service.dedPayDepositaryPost(body);
    }

    //============ PUT ============
    @MessagePattern({ cmd: 'dedPayDepositaryPut' })
    async dedPayDepositaryPut(body: dedPayDepositaryDto)  {
        return await this.service.dedPayDepositaryPut(body);
    }

    //_______________delete
    @MessagePattern({ cmd: 'dedPayDepositaryDelete' })
    async dedPayDepositarydelete(body:dedPayDepositaryIdDto)  {
        return await this.service.dedPayDepositaryDelete(body);
    }
}
        