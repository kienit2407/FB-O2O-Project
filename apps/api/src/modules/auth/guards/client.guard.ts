import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CLIENT_KEY } from '../decorators/client.decorator';

@Injectable()
export class ClientGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const expectedClient = this.reflector.getAllAndOverride<string>(CLIENT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!expectedClient) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      return false;
    }

    if (user.aud !== expectedClient) {
      throw new ForbiddenException(
        `Token not valid for this application. Expected: ${expectedClient}, Got: ${user.aud}`,
      );
    }

    return true;
  }
}
