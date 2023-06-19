
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'src/core/interfaces/response.data.dto';
import { parametersModDepositaryIdDto } from './dto/parameters-mod-depositary-id.dto';
import { parametersModDepositaryDto } from './dto/parameters-mod-depositary.dto';
import { parametersModDepositaryEntity } from './entities/parameters-mod-depositary.entity';
import { ParametersModDepositaryService } from './parameters-mod-depositary.service';

@Controller('parameters-mod-depositary')
export class ParametersModDepositaryController {
    constructor(private readonly service: ParametersModDepositaryService) {
        
    }

    @MessagePattern({cmd:'parametersModDepositary'})
    async parametersModDepositary(query: PaginateQuery): Promise<ResponseDataDTO<parametersModDepositaryEntity>> {
        return this.service.parametersModDepositary(query);
    }

    @MessagePattern({cmd:'parametersModDepositaryOne'})
    async parametersModDepositaryOne(id:parametersModDepositaryIdDto){
        return this.service.parametersModDepositaryOne(id);
    }

    //============ POST ============
    @MessagePattern({ cmd: 'parametersModDepositaryPost' })
    async parametersModDepositaryPost(sendItem: parametersModDepositaryDto)  {
        return await this.service.parametersModDepositaryPost(sendItem);
    }

    //============ PUT ============
    @MessagePattern({ cmd: 'parametersModDepositaryPut' })
    async parametersModDepositaryPut(body: parametersModDepositaryDto)  {
        return await this.service.parametersModDepositaryPut(body);
    }

    //_______________delete
    @MessagePattern({ cmd: 'parametersModDepositaryDelete' })
    async parametersModDepositarydelete(id:parametersModDepositaryIdDto)  {
        return await this.service.parametersModDepositaryDelete(id);
    }
}
