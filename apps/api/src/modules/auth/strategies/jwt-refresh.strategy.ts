import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '../../../config/config.service';
import { ClientApp, REFRESH_COOKIE_NAME } from '../common/auth.constants';
import { UsersService } from 'src/modules/users/services/users.service';

function getClientApp(req: Request): ClientApp {
  const app = (req.headers['x-client-app'] as string) || 'merchant_web';
  return app as ClientApp;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private configService: ConfigService, private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const app = getClientApp(req);
          const cookieName = REFRESH_COOKIE_NAME[app];
          return req?.cookies?.[cookieName];
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.jwtRefreshSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    if (payload?.type && payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token type');
    }
    const userId = payload.sub;
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return {
      sub: userId,        //  thêm sub để đồng bộ
      userId,             //  giữ userId cho code hiện tại
      email: payload.email,
      role: payload.role,
      aud: payload.aud,
      sid: payload.sid,
      type: payload.type,
    };
  }

}
