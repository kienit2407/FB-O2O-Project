import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T = any> {
  statusCode: number;
  message: string;
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

@Injectable()
export class StandardResponseInterceptor<T = any>
  implements NestInterceptor<T, StandardResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<StandardResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data: any) => {
        // Controller returns: { message, success, data, meta }
        // We just pass through - no transformation needed
        if (data && typeof data === 'object' && 'success' in data) {
          // Already in standard format
          return {
            ...data,
            statusCode,
          };
        }

        // Controller returns plain data (e.g., string, number, array)
        return {
          statusCode,
          message: 'Success',
          success: true,
          data,
        };
      }),
    );
  }
}
