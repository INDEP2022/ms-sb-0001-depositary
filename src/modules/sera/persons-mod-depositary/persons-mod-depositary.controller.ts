
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'sigebi-lib-common';
import { personsModDepositaryIdDto } from './dto/persons-mod-depositary-id.dto';
import { personsModDepositaryDto } from './dto/persons-mod-depositary.dto';
import { personsModDepositaryEntity } from './entities/persons-mod-depositary.entity';
import { PersonsModDepositaryService } from './persons-mod-depositary.service';

@Controller('persons-mod-depositary')
export class PersonsModDepositaryController {
    constructor(private readonly service: PersonsModDepositaryService) {
        
    }

    @MessagePattern({cmd:'personsModDepositary'})
    async personsModDepositary(query: PaginateQuery): Promise<ResponseDataDTO<personsModDepositaryEntity>> {
        return this.service.personsModDepositary(query);
    }

    @MessagePattern({cmd:'personsModDepositaryOne'})
    async personsModDepositaryOne(id:personsModDepositaryIdDto){
        return this.service.personsModDepositaryOne(id);
    }

    //============ POST ============
    @MessagePattern({ cmd: 'personsModDepositaryPost' })
    async personsModDepositaryPost(sendItem: personsModDepositaryDto)  {
        return await this.service.personsModDepositaryPost(sendItem);
    }

    //============ PUT ============
    @MessagePattern({ cmd: 'personsModDepositaryPut' })
    async personsModDepositaryPut(body: personsModDepositaryDto)  {
        return await this.service.personsModDepositaryPut(body);
    }

    //_______________delete
    @MessagePattern({ cmd: 'personsModDepositaryDelete' })
    async personsModDepositarydelete(id:personsModDepositaryIdDto)  {
        return await this.service.personsModDepositaryDelete(id);
    }
}
