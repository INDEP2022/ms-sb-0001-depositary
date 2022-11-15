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
        return  rows
    }



    @MessagePattern({ cmd: 'depositaryDetRepoFilter' })
    
    async filterDepositaryDetRepo( data:any){
        var rows = await this.service.filterDepositaryDetRepo(data.filter,data.pagination)
        return rows
    }
    @MessagePattern({ cmd: 'createDepositaryDetRepo' })
    async createDepositaryDetRepo( depositaryDetRepoDTO:DepositaryDetRepoDTO){

        const task = await this.service.createDepositaryDetRepo(depositaryDetRepoDTO);
        return task
    }

    @MessagePattern({ cmd: 'updateDepositaryDetRepo' })
    async updateDepositaryDetRepo( depositaryDetRepoDTO:DepositaryDetRepoDTO){

        const {affected} = await this.service.updateDepositaryDetRepo(depositaryDetRepoDTO);
        return affected==1?{statusCode:200,message:['Actualizado correctamente!']}:
        { statusCode: 400, message: ["No se realizarón cambios!"]};
    }

}
