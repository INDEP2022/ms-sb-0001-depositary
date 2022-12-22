import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RealStateDispersal } from './dto/dispersal-real-state.dto';
import { RealStateDispersalService } from './real-state-dispersal.service';

@Controller('real-state-dispersal')
export class RealStateDispersalController {

    constructor(private service:RealStateDispersalService){}

    @MessagePattern({ cmd: 'realStateDispersal' })
    async dispersalInmuebles(parameters:RealStateDispersal){
        
        return await this.service.PA_DISPINMUEBLES(parameters.event,parameters.cveEjec,parameters.relLots,parameters.indEnd,parameters.client,parameters.indRepro)
    }

}
