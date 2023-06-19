
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'src/core/interfaces/response.data.dto';
import { detailsDepositaryIdDto } from './dto/details-depositary-id.dto';
import { detailsDepositaryDto } from './dto/details-depositary.dto';
import { detailsDepositaryEntity } from './entities/details-depositary.entity';
import { DetailsDepositaryService } from './details-depositary.service';

@Controller('details-depositary')
export class DetailsDepositaryController {
    constructor(private readonly service: DetailsDepositaryService) {
        
    }

    @MessagePattern({cmd:'detailsDepositary'})
    async detailsDepositary(query: PaginateQuery): Promise<ResponseDataDTO<detailsDepositaryEntity>> {
        return this.service.detailsDepositary(query);
    }

    @MessagePattern({cmd:'detailsDepositaryOne'})
    async detailsDepositaryOne(body:detailsDepositaryIdDto){
        return this.service.detailsDepositaryOne(body);
    }

    //============ POST ============
    @MessagePattern({ cmd: 'detailsDepositaryPost' })
    async detailsDepositaryPost(body: detailsDepositaryDto)  {
        return await this.service.detailsDepositaryPost(body);
    }

    //============ PUT ============
    @MessagePattern({ cmd: 'detailsDepositaryPut' })
    async detailsDepositaryPut(body: detailsDepositaryDto)  {
        return await this.service.detailsDepositaryPut(body);
    }

    //_______________delete
    @MessagePattern({ cmd: 'detailsDepositaryDelete' })
    async detailsDepositarydelete(body:detailsDepositaryIdDto)  {
        return await this.service.detailsDepositaryDelete(body);
    }
}
        