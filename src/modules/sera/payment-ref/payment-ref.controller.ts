import { Controller, Get, HttpStatus } from "@nestjs/common";
import { ApiCreatedResponse } from "@nestjs/swagger";
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger/dist";

import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { Body, Delete, Post, Put, Query } from "@nestjs/common/decorators";
import { ResponseDataDTO } from "src/shared/dto/response.data.dto";
import { PaymentRefService } from "./payment-ref.service";
import { ExecDeductionsDto, FillAccreditationsDto, GenericParamsDto, PrepOIDto, RemoveDisperPaymentsRefDto, ValidDepDto } from "./dto/param.dto";
import { Any } from "typeorm";

@ApiCreatedResponse()
@ApiTags('payment-ref')
@Controller('payment-ref')
export class PaymentRefController {
    constructor(private readonly service: PaymentRefService) { }

    @ApiOperation({ summary: 'PROCEDURE DISPERCION_ABONOS' })
    @ApiBody({ type: GenericParamsDto })
    @ApiResponse({
        status: 200,
        description: 'Se ejecuto el procedimiento con exito!',
        type: Object,
    })
    @Post('/dispersionAccreditations')
    async dispersionAccreditations(@Body() dto: GenericParamsDto) {

        return await this.service.dispersionAccreditations(dto);
    }

    @ApiOperation({ summary: 'PROCEDURE DISP_DEDUCCIONES' })
    @ApiResponse({
        status: 200,
        description: 'Se ejecuto el procedimiento con exito!',
        type: Object,
    })
    @Get('/dispersionDeductions')
    async dispersionDeductions() {

        return await this.service.dispersionDeductions();
    }

    @ApiOperation({ summary: 'PROCEDURE EJEC_DEDUCCIONES' })
    @ApiBody({ type: ExecDeductionsDto })
    @ApiResponse({
        status: 200,
        description: 'Se ejecuto el procedimiento con exito!',
        type: Object,
    })
    @Post('/execDeductions')
    async execDeductions(@Body() dto: ExecDeductionsDto) {
        return await this.service.execDeductions(dto);
    }

    @ApiOperation({ summary: 'PROCEDURE LIQ_PAGOS_DISP' })
    @ApiResponse({
        status: 200,
        description: 'Se ejecuto el procedimiento con exito!',
        type: Object,
    })
    @Get('/fillPaymentsDisp')
    async fillPaymentsDisp() {
        return await this.service.fillPaymentsDisp();
    }

    @ApiOperation({ summary: 'PROCEDURE LLENA_ABONOS' })
    @ApiBody({ type: GenericParamsDto })
    @ApiResponse({
        status: 200,
        description: 'Se ejecuto el procedimiento con exito!',
        type: Object,
    })
    @Post('/fillAccreditations')
    async fillAccreditations(@Body() dto: FillAccreditationsDto) {

        return await this.service.fillAccreditations(dto);
    }

    @ApiOperation({ summary: 'PROCEDURE LLENA_ABONOS_DISPER' })
    @ApiResponse({
        status: 200,
        description: 'Se ejecuto el procedimiento con exito!',
        type: Object,
    })
    @Get()
    async fillAccreditationDisper() {

        return await this.service.fillAccreditationDisper();
    }

    @ApiOperation({ summary: 'PROCEDURE INS_DISPERSION' })
    @ApiBody({ type: GenericParamsDto })
    @ApiResponse({
        status: 200,
        description: 'Se ejecuto el procedimiento con exito!',
        type: Object,
    })
    @Post()
    async insertDispersion(@Body() dto: GenericParamsDto) {

        return await this.service.insertDispersion(dto);
    }

    @ApiOperation({ summary: 'PROCEDURE INS_DISPERSIONBD' })
    @ApiBody({ type: GenericParamsDto })
    @ApiResponse({
        status: 200,
        description: 'Se ejecuto el procedimiento con exito!',
        type: Object,
    })
    @Post()
    async insertDispersionDb(@Body() dto: GenericParamsDto) {

        return await this.service.insertDispersionDb(dto);
    }

    @ApiOperation({ summary: 'PROCEDURE ACT_ABONOSGENS' })
    @ApiBody({ type: GenericParamsDto })
    @ApiResponse({
        status: 200,
        description: 'Se ejecuto el procedimiento con exito!',
        type: Object,
    })
    @Put()
    async updateAccreditationGens(@Body() dto: GenericParamsDto) {

        return await this.service.updateAccreditationGens(dto);
    }

    @ApiOperation({ summary: 'PROCEDURE ACT_PAGOSREF' })
    @ApiBody({ type: GenericParamsDto })
    @ApiResponse({
        status: 200,
        description: 'Se ejecuto el procedimiento con exito!',
        type: Object,
    })
    @Put()
    async updatePaymentsRef(@Body() dto: GenericParamsDto) {

        return await this.service.updatePaymentsRef(dto);
    }

    @ApiOperation({ summary: 'PROCEDURE ELIM_DISPER_PAGOREF' })
    @ApiParam({
        name: 'id',
        description: 'Identificador tabla',
    })
    @Delete()
    async removeDisperPaymentsRef(@Body() dto: RemoveDisperPaymentsRefDto) {
        return await this.service.removeDisperPaymentsRef(dto);
    }

    @ApiOperation({ summary: 'PROCEDURE EJEC_DEDUCCIONES' })
    @ApiBody({ type: ValidDepDto })
    @ApiResponse({
        status: 200,
        description: 'Se ejecuto el procedimiento con exito!',
        type: Object,
    })
    @Post('/validDep')
    async validDep(@Body() dto: ValidDepDto) {
        return await this.service.validDep(dto);
    }

    @ApiOperation({ summary: 'PROCEDURE EJEC_DEDUCCIONES' })
    @ApiBody({ type: PrepOIDto })
    @ApiResponse({
        status: 200,
        description: 'Se ejecuto el procedimiento con exito!',
        type: Object,
    })
    @Post('/prerpOI')
    async prerpOI(@Body() dto: PrepOIDto) {
        return await this.service.prerpOI(dto);
    }
}
