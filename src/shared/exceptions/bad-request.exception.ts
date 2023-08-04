import { HttpStatus } from "@nestjs/common/enums";

class BadRequestException {
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST;
    message: string = 'Bad Request';

    constructor(message?: string) {
        this.message = message ?? this.message;
    }
}

export default BadRequestException;