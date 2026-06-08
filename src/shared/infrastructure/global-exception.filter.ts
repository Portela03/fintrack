import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { DomainError } from '../domain/domain-errors';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (status >= 500) {
        this.logger.error(
          `[${request.method}] ${request.url} → ${status}`,
          exception instanceof Error ? exception.stack : String(exception),
        );
      }
      response.status(status).json(
        typeof exceptionResponse === 'object'
          ? exceptionResponse
          : { message: exceptionResponse, statusCode: status },
      );
      return;
    }

    if (exception instanceof DomainError) {
      response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: exception.name,
        message: exception.message,
      });
      return;
    }

    // Log all unexpected errors with full stack
    this.logger.error(
      `[${request.method}] ${request.url} → 500 Unhandled exception`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message,
    });
  }
}
