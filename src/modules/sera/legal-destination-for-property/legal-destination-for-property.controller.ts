import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PaginationDto } from 'src/shared/dto/pagination.dto';
import { LegalDestinationForPropertyDTO } from './dto/legal-destination-for-property.dto';
import { LegalDestinationForPropertyService } from './legal-destination-for-property.service';

@Controller('legal-destination-for-property')
export class LegalDestinationForPropertyController {

    
    constructor(
        private readonly service: LegalDestinationForPropertyService,
    ) { }


    
    @MessagePattern({ cmd: 'getAllLegalDestinationForProperty' })
    async getAllLegalDestinationForProperty( pagination:PaginationDto){
        var rows = await this.service.getAllLegalDestinationForProperty(pagination);
        if(rows.count == 0) return {status:404,message:'No results found'}
        return  rows
    }



    @MessagePattern({ cmd: 'legalDestinationForPropertyFilter' })
    
    async filterLegalDestinationForProperty( data:any){
        var rows = await this.service.filterLegalDestinationForPropertyById(data.propertyNumber,data.requestDate)
        if(rows.count == 0) return {status:404,message:'No results found'}
        return rows
    }
    @MessagePattern({ cmd: 'createLegalDestinationForProperty' })
    async createLegalDestinationForProperty( legalDestinationForPropertyDTO:LegalDestinationForPropertyDTO){

        const task = await this.service.createLegalDestinationForProperty(legalDestinationForPropertyDTO);
        return task?task:
        { statusCode: 503, message: "This legalDestinationForProperty was not created", error: "Create Error"};
    }

    @MessagePattern({ cmd: 'updateLegalDestinationForProperty' })
    async updateLegalDestinationForProperty( legalDestinationForPropertyDTO:LegalDestinationForPropertyDTO){

        const {affected} = await this.service.updateLegalDestinationForProperty(legalDestinationForPropertyDTO);
        return affected==1?{status:200,message:'Update succesfull'}:
        { statusCode: 403, message: "This legalDestinationForProperty was not update", error: "Update Error"};
    }


}
