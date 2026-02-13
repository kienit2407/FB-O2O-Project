import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { ConfigService } from '../../../config/config.service';
import { UsersService } from '../../users/services/users.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    // chặn nhầm refresh token
    if (payload?.type && payload.type !== 'access') {
      throw new UnauthorizedException('Invalid access token type');
    }

    //  lấy userId từ sub
    const userId = payload.sub;
    if (!userId) throw new UnauthorizedException('Missing sub');

    const user = await this.usersService.findById(userId); // nhớ check hàm này query đúng _id
    if (!user) throw new UnauthorizedException('User not found');

    return {
      sub: userId,        // ✅ thêm sub để đồng bộ
      userId,             // ✅ giữ userId cho code hiện tại
      email: payload.email,
      role: payload.role,
      aud: payload.aud,
      sid: payload.sid,
      type: payload.type,
    };

  }
}
