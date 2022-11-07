import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { DepositaryDetRepoService } from './depositary-det-repo.service';
import { DepositaryDetRepoDTO } from './dto/depositary-det-repo.dto';

@Controller('depositary-det-repo')
export class DepositaryDetRepoController {
    constructor(
        private readonly service: DepositaryDetRepoService,
    ) { }


    
    @MessagePattern({ cmd: 'getAllDepositaryDetRepo' })
    async getAllDepositaryDetRepo( pagination:PaginationDto){
        var rows = await this.service.getAllDepositaryDetRepo(pagination);
        if(rows.count == 0) return {status:404,message:'No results found'}
        return  rows
    }



    @MessagePattern({ cmd: 'depositaryDetRepoFilter' })
    
    async filterDepositaryDetRepo( data:any){
        var rows = await this.service.filterDepositaryDetRepo(data.filter,data.pagination)
        if(rows.count == 0) return {status:404,message:'No results found'}
        return rows
    }
    @MessagePattern({ cmd: 'createDepositaryDetRepo' })
    async createDepositaryDetRepo( depositaryDetRepoDTO:DepositaryDetRepoDTO){

        const task = await this.service.createDepositaryDetRepo(depositaryDetRepoDTO);
        return task?task:
        { statusCode: 503, message: "This depositaryDetRepo was not created", error: "Create Error"};
    }

    @MessagePattern({ cmd: 'updateDepositaryDetRepo' })
    async updateDepositaryDetRepo( depositaryDetRepoDTO:DepositaryDetRepoDTO){

        const {affected} = await this.service.updateDepositaryDetRepo(depositaryDetRepoDTO);
        return affected==1?{status:200,message:'Update succesfull'}:
        { statusCode: 403, message: "This depositaryDetRepo was not update", error: "Update Error"};
    }

}
