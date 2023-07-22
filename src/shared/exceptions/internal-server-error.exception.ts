import { HttpStatus } from "@nestjs/common";


class InternalServerErrorException {
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    message?: string = 'Internal Server Error';

    constructor(message?: string) {
        this.message = message ?? this.message;
    }
}

export default InternalServerErrorException;