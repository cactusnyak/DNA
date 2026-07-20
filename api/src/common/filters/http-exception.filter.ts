import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const details =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as Record<string, unknown>)
        : undefined;
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : Array.isArray(details?.message)
          ? details.message
          : typeof details?.message === 'string'
            ? details.message
            : 'Internal server error';

    response.status(status).json({
      success: false,
      data: null,
      error: {
        code: details?.error ?? HttpStatus[status],
        message,
        path: request.url,
      },
    });
  }
}
