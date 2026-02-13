import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { Client } from '../decorators/client.decorator';
import { Roles } from '../decorators/roles.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ClientGuard } from '../guards/client.guard';
import { REFRESH_COOKIE_NAME, ClientApp } from '../common/auth.constants';

@Controller('auth/customer')
@Client('customer_mobile')
export class CustomerAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
  ) {}

  @Post('login-otp')
  @HttpCode(HttpStatus.OK)
  async loginOtp(
    @Body() dto: { phone: string; otp: string },
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const app: ClientApp = 'customer_mobile';
    const deviceId = req.headers['x-device-id'] as string;

    const result = await this.authService.loginCustomerOtp(dto, { app, deviceId });

    res.cookie(REFRESH_COOKIE_NAME[app], result.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/auth/customer/refresh',
    });

    return { data: result };
  }

  @Post('register-otp')
  async registerOtp(
    @Body() dto: { phone: string; otp: string; full_name: string },
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const app: ClientApp = 'customer_mobile';
    const deviceId = req.headers['x-device-id'] as string;

    const result = await this.authService.registerCustomerOtp(dto, { app, deviceId });

    res.cookie(REFRESH_COOKIE_NAME[app], result.refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/auth/customer/refresh',
    });

    return { data: result };
  }

  @UseGuards(JwtAuthGuard, RolesGuard, ClientGuard)
  @Roles('customer')
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const app: ClientApp = 'customer_mobile';
    const user = req.user;

    const { access_token } = await this.tokenService.signAccessToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
      aud: app,
      sid: user.sid,
    });

    const { refresh_token } = await this.tokenService.signRefreshToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
      aud: app,
      sid: user.sid,
    });

    res.cookie(REFRESH_COOKIE_NAME[app], refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/auth/customer/refresh',
    });

    return { data: { access_token } };
  }

  @UseGuards(JwtAuthGuard, RolesGuard, ClientGuard)
  @Roles('customer')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    const app: ClientApp = 'customer_mobile';
    res.clearCookie(REFRESH_COOKIE_NAME[app], { path: '/auth/customer/refresh' });
    return { message: 'Logged out successfully' };
  }
}
