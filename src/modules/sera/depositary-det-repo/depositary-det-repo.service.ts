import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { Repository } from 'typeorm';
import { DepositaryDetRepoDTO } from './dto/depositary-det-repo.dto';
import { DepositaryDetRepoEntity } from './entity/depositary-det-repo.entity';
import { Text } from 'src/shared/config/text'
import { SearchDepositaryDetRepoDTO } from './dto/search-depositary-det-repo.dto';


@Injectable()
export class DepositaryDetRepoService {

    constructor(
        @InjectRepository(DepositaryDetRepoEntity) private entity: Repository<DepositaryDetRepoEntity>,
    ) { }


    async createDepositaryDetRepo(depositaryDetRepoDTO: DepositaryDetRepoDTO) {
        const task = await this.entity.findOne({ where: { 
            appointmentNumber:depositaryDetRepoDTO.appointmentNumber,
            cveReport:depositaryDetRepoDTO.cveReport,
            repoDate:depositaryDetRepoDTO.repoDate} });
        if (task) return {status:403,message:'Record already exists'}
        return await this.entity.save(depositaryDetRepoDTO)  ;
    }

    async getAllDepositaryDetRepo({ inicio=1, pageSize=10, text }: PaginationDto) {
        const queryBuilder = await this.entity.createQueryBuilder('table');
        //queryBuilder.innerJoinAndMapOne('table.appointmentNumber','nombramientos_depositaria','fk','table.no_nombramiento=fk.no_nombramiento')

        if (text) {
            queryBuilder.where(`${Text.formatTextDb('table.reporte')} LIKE '%${Text.formatText(text)}%'`)
        }
        queryBuilder.take(pageSize || 10)
        queryBuilder.orderBy("","DESC")
        queryBuilder.skip((inicio - 1) * pageSize || 0)
        const [result, total] = await queryBuilder.getManyAndCount();
        return {    
            data: result,
            count: total
        }
    }

    async filterDepositaryDetRepo(data:SearchDepositaryDetRepoDTO,{ inicio=1, pageSize=10 }:PaginationDto){
        const queryBuilder = this.entity.createQueryBuilder();
        
        queryBuilder.where(`no_nombramiento = coalesce(:nomb,no_nombramiento)`,{nomb:data.appointmentNumber|| null})
        queryBuilder.andWhere(`fec_repo = coalesce(:date,fec_repo)`,{date:data.repoDate || null})
        queryBuilder.andWhere(`cve_reporte = coalesce(:cve,cve_reporte)`,{cve:data.cveReport || null})
       
        queryBuilder.take(pageSize || 10)
        queryBuilder.skip((inicio - 1) * pageSize || 0)
        const [result, total] = await queryBuilder.getManyAndCount();
        return {    
            data: result,
            count: total
        }
    }

    parseNotNull(value:string){
        return value?value.length> 0?`${value}`:null:null
    }


    async updateDepositaryDetRepo(depositaryDetRepoDTO:DepositaryDetRepoDTO) {
        const keys =  { 
            appointmentNumber:depositaryDetRepoDTO.appointmentNumber,
            cveReport:depositaryDetRepoDTO.cveReport,
            repoDate:depositaryDetRepoDTO.repoDate
        }
        return await this.entity.update(keys, depositaryDetRepoDTO);
    }

}
