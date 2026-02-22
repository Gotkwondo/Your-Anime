import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  success: false;
  error: string;
  statusCode: number;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = '서버 내부 오류가 발생했습니다.';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const errObj = exceptionResponse as Record<string, unknown>;
        if (typeof errObj['error'] === 'string') {
          errorMessage = errObj['error'];
        } else if (typeof errObj['message'] === 'string') {
          errorMessage = errObj['message'];
        } else if (Array.isArray(errObj['message'])) {
          errorMessage = (errObj['message'] as string[]).join(', ');
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.error('Unknown exception', exception);
    }

    const errorBody: ErrorResponse = {
      success: false,
      error: errorMessage,
      statusCode,
    };

    this.logger.warn(
      `[${request.method}] ${request.url} - ${statusCode}: ${errorMessage}`,
    );

    response.status(statusCode).json(errorBody);
  }
}
