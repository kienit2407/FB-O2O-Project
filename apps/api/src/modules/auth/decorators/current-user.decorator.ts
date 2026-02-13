import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentUserData {
  userId: string;
  sub: string;
  email: string;
  role: string;
  aud: string;
  sid?: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof CurrentUserData | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) return null;

    if (data) {
      return user[data];
    }

    return {
      userId: user.userId,
      sub: user.sub,
      email: user.email,
      role: user.role,
      aud: user.aud,
      sid: user.sid,
    };
  },
);
