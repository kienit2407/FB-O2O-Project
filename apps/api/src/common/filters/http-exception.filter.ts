import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  success: false;
  errorCode?: string;
  details?: any;
  timestamp: string;
  path: string;
  correlationId?: string;
  requestId?: string;
  userId?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const correlationId = request.headers['x-correlation-id'] as string;
    const requestId = request.headers['x-request-id'] as string;
    const userId = request.user?.userId;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode: string | undefined;
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || responseObj.error || message;
        details = responseObj.details;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      success: false,
      errorCode,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      correlationId,
      requestId,
      userId,
    };

    const logContext = {
      method: request.method,
      url: request.url,
      status,
      correlationId,
      requestId,
      userId,
      message,
    };

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message} - correlationId: ${correlationId} - requestId: ${requestId}`,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(status).json(errorResponse);
  }
}
