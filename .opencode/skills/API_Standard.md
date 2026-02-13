# API Standard Skill for NestJS

## Overview
This skill defines the standard REST API practices for NestJS applications in the FaB-O2O project.

## Response Format
All API responses follow a consistent format:

### Success Response
```typescript
{
  statusCode: 200,
  message: "Success message",
  success: true,
  data: any,
  meta?: {
    page?: number,
    limit?: number,
    total?: number,
    totalPages?: number
  }
}
```

### Error Response
```typescript
{
  statusCode: 400,
  message: "Error message",
  success: false,
  errorCode?: string,
  details?: any,
  timestamp: "2024-01-01T00:00:00.000Z",
  path: "/api/endpoint"
}
```

## Implementation

### 1. Standard Response Interceptor
The `StandardResponseInterceptor` automatically wraps all controller responses.

**File:** `src/common/interceptors/standard-response.interceptor.ts`

Usage:
- Automatically applied globally via `ApiStandardModule`
- If controller returns `{ data, meta, message }`, it will be wrapped properly
- For simple returns, interceptor wraps them automatically

### 2. HTTP Exception Filter
The `HttpExceptionFilter` catches and standardizes all exceptions.

**File:** `src/common/filters/http-exception.filter.ts`

Usage:
- Automatically applied globally via `ApiStandardModule`
- Logs errors with context (route, timestamp)
- Handles both `HttpException` and generic `Error`

### 3. API Standard Module
The `ApiStandardModule` provides global interceptor and filter registration.

**File:** `src/common/modules/api-standard.module.ts`

## Best Practices

### Controller Layer
```typescript
@Controller('products')
export class ProductsController {
  @Get()
  async findAll(): Promise<StandardResponse<Product[]>> {
    const products = await this.productsService.findAll();
    return {
      statusCode: 200,
      message: 'Products retrieved successfully',
      success: true,
      data: products,
      meta: { total: products.length }
    };
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    const product = await this.productsService.create(dto);
    return {
      statusCode: 201,
      message: 'Product created successfully',
      success: true,
      data: product
    };
  }
}
```

### Service Layer
```typescript
@Injectable()
export class ProductsService {
  constructor(
    private productModel: Model<Product>,
    private logger: Logger
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    try {
      const product = new this.productModel(dto);
      return await product.save();
    } catch (error) {
      this.logger.error(`Failed to create product: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create product');
    }
  }
}
```

### Error Handling with Logging
```typescript
@Injectable()
export class OrdersService {
  constructor(
    private ordersModel: Model<Order>,
    private cloudinaryService: CloudinaryService,
    private logger: Logger
  ) {}

  async uploadImage(file: Express.Multer.File) {
    try {
      const result = await this.cloudinaryService.uploadFile(file);
      this.logger.log(`Image uploaded successfully: ${result.publicId}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to upload image: ${error.message}`,
        error.stack
      );
      throw new InternalServerErrorException('Failed to upload image');
    }
  }
}
```

### External Service Calls with Retry (Outline)
```typescript
import { retry, catchError, tap } from 'rxjs/operators';
import { retryWhen, delay, take } from 'rxjs';

@Injectable()
export class ExternalApiService {
  async callExternalApi() {
    try {
      const result = await axios.get(url, {
        timeout: 5000,
        retry: 3,
        retryDelay: 1000
      });
      return result.data;
    } catch (error) {
      this.logger.error(`External API call failed: ${error.message}`);
      throw new ServiceUnavailableException('External service unavailable');
    }
  }
}
```

## Integration

### main.ts
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ApiStandardModule } from './common/modules/api-standard.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));
  
  // ApiStandardModule already registers global interceptor and filter
  // No need to manually useGlobalInterceptors() or useGlobalFilters()
  
  await app.listen(3000);
}
bootstrap();
```

### app.module.ts
```typescript
import { Module } from '@nestjs/common';
import { ApiStandardModule } from './common/modules/api-standard.module';

@Module({
  imports: [
    ApiStandardModule,
    // ... other modules
  ],
})
export class AppModule {}
```

## Key Rules

1. **Never use `res: Response`** in controllers (except for streaming/file download)
2. **Always return structured objects** with proper `statusCode`, `message`, `success`, `data`
3. **Log errors** with context in service layer
4. **Use meaningful HTTP status codes** (200, 201, 400, 401, 403, 404, 409, 422, 500, 503)
5. **Include error codes** for client-side handling
6. **Use meta** for pagination information
7. **Avoid Express-specific responses** - let the interceptor handle it

## Migration Guide

Replace existing `sendAsSuccess` and `sendAsFailure` helpers with standard NestJS patterns:

### Before (Old Pattern)
```typescript
import { Response } from 'express';

@Post()
async create(@Body() dto: CreateDto, @Res() res: Response) {
  const result = await this.service.create(dto);
  return sendAsSuccess(res, 201, result, 'Created');
}
```

### After (New Pattern)
```typescript
@Post()
async create(@Body() dto: CreateDto) {
  const result = await this.service.create(dto);
  return {
    statusCode: 201,
    message: 'Created',
    success: true,
    data: result
  };
}
```

### Before (Old Pattern - Error)
```typescript
@Get(':id')
async findOne(@Res() res: Response, @Param('id') id: string) {
  const result = await this.service.findOne(id);
  if (!result) {
    return sendAsFailure(res, 404, 'Not found');
  }
  return sendAsSuccess(res, 200, result);
}
```

### After (New Pattern - Error)
```typescript
@Get(':id')
async findOne(@Param('id') id: string) {
  const result = await this.service.findOne(id);
  if (!result) {
    throw new NotFoundException('Product not found');
  }
  return {
    statusCode: 200,
    message: 'Success',
    success: true,
    data: result
  };
}
```

## HTTP Status Code Reference

| Code | Name | Usage |
|------|------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST (resource created) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid authentication |
| 403 | Forbidden | Authenticated but no permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource, state conflict |
| 422 | Unprocessable Entity | Validation errors |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | External service down |
