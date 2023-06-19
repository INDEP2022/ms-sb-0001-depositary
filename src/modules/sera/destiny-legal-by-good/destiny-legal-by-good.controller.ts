
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaginateQuery } from 'nestjs-paginate';
import { ResponseDataDTO } from 'src/core/interfaces/response.data.dto';
import { destinyLegalByGoodIdDto } from './dto/destiny-legal-by-good-id.dto';
import { destinyLegalByGoodDto } from './dto/destiny-legal-by-good.dto';
import { destinyLegalByGoodEntity } from './entities/destiny-legal-by-good.entity';
import { DestinyLegalByGoodService } from './destiny-legal-by-good.service';

@Controller('destiny-legal-by-good')
export class DestinyLegalByGoodController {
    constructor(private readonly service: DestinyLegalByGoodService) {
        
    }

    @MessagePattern({cmd:'destinyLegalByGood'})
    async destinyLegalByGood(query: PaginateQuery): Promise<ResponseDataDTO<destinyLegalByGoodEntity>> {
        return this.service.destinyLegalByGood(query);
    }

    @MessagePattern({cmd:'destinyLegalByGoodOne'})
    async destinyLegalByGoodOne(body:destinyLegalByGoodIdDto){
        return this.service.destinyLegalByGoodOne(body);
    }

    //============ POST ============
    @MessagePattern({ cmd: 'destinyLegalByGoodPost' })
    async destinyLegalByGoodPost(body: destinyLegalByGoodDto)  {
        return await this.service.destinyLegalByGoodPost(body);
    }

    //============ PUT ============
    @MessagePattern({ cmd: 'destinyLegalByGoodPut' })
    async destinyLegalByGoodPut(body: destinyLegalByGoodDto)  {
        return await this.service.destinyLegalByGoodPut(body);
    }

    //_______________delete
    @MessagePattern({ cmd: 'destinyLegalByGoodDelete' })
    async destinyLegalByGooddelete(body:destinyLegalByGoodIdDto)  {
        return await this.service.destinyLegalByGoodDelete(body);
    }
}
        