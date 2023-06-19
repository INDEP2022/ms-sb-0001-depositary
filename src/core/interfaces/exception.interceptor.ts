import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
//import { __ } from '@squareboat/nestjs-localization/dist/src';
import { Response, Request } from 'express';
import { IncomingMessage } from 'http';

export interface HttpExceptionResponse {
  statusCode: number;
  message: any;
  error: string;
}

export const getStatusCode = <T>(exception: T): number => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

export const getErrorMessage = <T>(exception: T): any => {

  if (exception instanceof HttpException) {

    const errorResponse = exception.getResponse();
    const errorMessage = (errorResponse as HttpExceptionResponse).message || exception.message;

    return errorMessage;
  } else {
    return String(exception);
  }
};

@Catch()
export class AllExceptionsFilter<T> implements ExceptionFilter {
  catch(exception: T, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<IncomingMessage>();
    let statusCode = getStatusCode<T>(exception);
    statusCode == 404 ? statusCode = 400 : statusCode;
    let message = getErrorMessage<T>(exception);
    if (!Array.isArray(message)){
      message =[message];
    }
    response.status(statusCode).json({
      //error: {
      //timestamp: new Date().toISOString(),
      //path: request.url,
      statusCode,
      message,
      data: []
      //},
    });
  }
}

// import {
//   ExceptionFilter,
//   Catch,
//   ArgumentsHost,
//   HttpException,
//   HttpStatus,
// } from '@nestjs/common';
// //import { __ } from '@squareboat/nestjs-localization/dist/src';
// import { Response, Request } from 'express';

// @Catch(HttpException)
// export class AllExceptionsFilter implements ExceptionFilter {
//   async catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const context = host.switchToHttp();
//     const response = context.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//     const statusCode =
//       exception instanceof HttpException
//         ? exception.getStatus()
//         : HttpStatus.INTERNAL_SERVER_ERROR;
//     const message = exception['response'].message || exception.message || 'Internal server error';
//     const data = null;

//     response.status(statusCode).json({
//       statusCode,
//       message,
//       data
//     });
//   }
// }
