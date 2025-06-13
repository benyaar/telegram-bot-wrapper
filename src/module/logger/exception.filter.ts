/**
 * Filter for handling HTTP errors
 * @param {HttpException} exception 
 * @param {ArgumentsHost} host 
 * @return {void}
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from './logger.service';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse['message'];

    this.logger.error(`HTTP Exception: ${message}`, {
      path: request.url,
      method: request.method,
      statusCode: status,
      exception: exception.stack,
    });

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
    });
  }
}
