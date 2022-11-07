import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PupPreviewCsvDataService } from './pup-preview-csv-data.service';

@Controller('pup-preview-csv-data')
export class PupPreviewCsvDataController {

    constructor(
        private readonly service: PupPreviewCsvDataService,
    ) { }


    
    @MessagePattern({ cmd: 'pupPreviewCsvData' })
    async pupPreviewCsvData(file:any){
        var rows = await this.service.previewData(file);
       /* if(rows.count == 0) return {status:404,message:'No results found'}
        return  rows*/
        return rows
    }


}
