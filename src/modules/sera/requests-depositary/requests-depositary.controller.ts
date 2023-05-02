
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'sigebi-lib-common';
import { requestsDepositaryIdDto } from './dto/requests-depositary-id.dto';
import { requestsDepositaryDto } from './dto/requests-depositary.dto';
import { requestsDepositaryEntity } from './entities/requests-depositary.entity';
import { RequestsDepositaryService } from './requests-depositary.service';

@Controller('requests-depositary')
export class RequestsDepositaryController {
    constructor(private readonly service: RequestsDepositaryService) {
        
    }

    @MessagePattern({cmd:'requestsDepositary'})
    async requestsDepositary(query: PaginateQuery): Promise<ResponseDataDTO<requestsDepositaryEntity>> {
        return this.service.requestsDepositary(query);
    }

    @MessagePattern({cmd:'requestsDepositaryOne'})
    async requestsDepositaryOne(id:requestsDepositaryIdDto){
        return this.service.requestsDepositaryOne(id);
    }

    //============ POST ============
    @MessagePattern({ cmd: 'requestsDepositaryPost' })
    async requestsDepositaryPost(sendItem: requestsDepositaryDto)  {
        return await this.service.requestsDepositaryPost(sendItem);
    }

    //============ PUT ============
    @MessagePattern({ cmd: 'requestsDepositaryPut' })
    async requestsDepositaryPut(body: requestsDepositaryDto)  {
        return await this.service.requestsDepositaryPut(body);
    }

    //_______________delete
    @MessagePattern({ cmd: 'requestsDepositaryDelete' })
    async requestsDepositarydelete(id:requestsDepositaryIdDto)  {
        return await this.service.requestsDepositaryDelete(id);
    }
}
