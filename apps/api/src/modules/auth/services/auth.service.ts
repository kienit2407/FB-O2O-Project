import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { ConfigService } from '../../../config/config.service';
import { TokenService } from './token.service';
import { ClientApp, Role } from '../common/auth.constants';
import * as bcrypt from 'bcryptjs';
import axios from 'axios';

export interface AuthContext {
  app: ClientApp;
  deviceId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private configService: ConfigService,
    private tokenService: TokenService,
  ) {}

  async findUserByEmail(email: string) {
    return this.usersService.findByEmail(email);
  }

  async findUserById(id: string) {
    return this.usersService.findOne(id);
  }

  async createUser(data: {
    email: string;
    phone: string;
    password_hash: string;
    full_name: string;
    role: string;
    status: string;
    auth_methods: string[];
  }) {
    const user = await this.usersService.create({
      email: data.email,
      phone: data.phone,
      password_hash: data.password_hash,
      full_name: data.full_name,
      role: data.role,
      status: data.status,
      auth_methods: data.auth_methods,
    } as any);
    return user;
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const userDoc = user as any;
    if (!userDoc.password_hash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, userDoc.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (userDoc.status === 'blocked') {
      throw new UnauthorizedException('Account is blocked');
    }
    return user;
  }

  async validateEmailLogin(email: string, password: string): Promise<any> {
    return this.validateUser(email, password);
  }

  // ==================== MERCHANT METHODS ====================

  async createMerchantUser(data: {
    email: string;
    password: string;
    full_name: string;
    phone: string;
  }) {
    console.log('[AuthService.createMerchantUser] Starting for:', data.email);
    const existingUser = await this.usersService.findByEmail(data.email);
    if (existingUser) {
      console.log('[AuthService.createMerchantUser] Email already exists');
      throw new BadRequestException('Email đã được đăng ký');
    }

    const password_hash = await bcrypt.hash(data.password, 10);

    console.log('[AuthService.createMerchantUser] Calling usersService.create...');
    const user = await this.usersService.create({
      email: data.email,
      phone: data.phone,
      password_hash,
      full_name: data.full_name,
      role: 'merchant',
      status: 'pending',
      auth_methods: ['password'],
    } as any);

    console.log('[AuthService.createMerchantUser] User created:', { id: (user as any)?._id, email: (user as any)?.email });
    return user;
  }

  async registerMerchant(data: any, ctx: AuthContext) {
    const { email, password, full_name, phone } = data;

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await this.usersService.create({
      email,
      phone,
      password_hash,
      full_name,
      role: 'merchant',
      status: 'pending_onboarding',
      auth_methods: ['password'],
    } as any);

    const userDoc = user as any;

    const { access_token } = await this.tokenService.signAccessToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'merchant',
      aud: ctx.app,
      sid: undefined,
    });

    const { refresh_token } = await this.tokenService.signRefreshToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'merchant',
      aud: ctx.app,
      sid: undefined,
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: userDoc._id,
        email: userDoc.email,
        role: userDoc.role,
        status: userDoc.status,
      },
      onboarding: true,
    };
  }

  async loginMerchant(data: any, ctx: AuthContext) {
    const { email, password } = data;

    const user = await this.validateUser(email, password);
    const userDoc = user as any;

    if (userDoc.role !== 'merchant') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { access_token } = await this.tokenService.signAccessToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'merchant',
      aud: ctx.app,
      sid: undefined,
    });

    const { refresh_token } = await this.tokenService.signRefreshToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'merchant',
      aud: ctx.app,
      sid: undefined,
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: userDoc._id,
        email: userDoc.email,
        role: userDoc.role,
        status: userDoc.status,
      },
      onboarding: userDoc.status === 'pending_onboarding',
    };
  }

  // ==================== CUSTOMER OTP METHODS ====================

  async loginCustomerOtp(data: { phone: string; otp: string }, ctx: AuthContext) {
    // TODO: Implement OTP verification via OtpRedisService
    // const isValid = await this.otpRedisService.verifyOtp(data.phone, data.otp);
    // if (!isValid) throw new UnauthorizedException('Invalid OTP');

    // For now, just find or create user
    let user = await this.usersService.findByPhone(data.phone);
    
    if (!user) {
      user = await this.usersService.create({
        phone: data.phone,
        full_name: '',
        role: 'customer',
        status: 'active',
        auth_methods: ['phone_otp'],
      } as any);
    }

    const userDoc = user as any;

    const { access_token } = await this.tokenService.signAccessToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'customer',
      aud: ctx.app,
      sid: undefined,
    });

    const { refresh_token } = await this.tokenService.signRefreshToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'customer',
      aud: ctx.app,
      sid: undefined,
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: userDoc._id,
        phone: userDoc.phone,
        role: 'customer',
      },
    };
  }

  async registerCustomerOtp(data: { phone: string; otp: string; full_name: string }, ctx: AuthContext) {
    // TODO: Implement OTP verification
    // const isValid = await this.otpRedisService.verifyOtp(data.phone, data.otp);
    // if (!isValid) throw new UnauthorizedException('Invalid OTP');

    const existingUser = await this.usersService.findByPhone(data.phone);
    if (existingUser) {
      throw new BadRequestException('Phone already registered');
    }

    const user = await this.usersService.create({
      phone: data.phone,
      full_name: data.full_name,
      role: 'customer',
      status: 'active',
      auth_methods: ['phone_otp'],
    } as any);

    const userDoc = user as any;

    const { access_token } = await this.tokenService.signAccessToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'customer',
      aud: ctx.app,
      sid: undefined,
    });

    const { refresh_token } = await this.tokenService.signRefreshToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'customer',
      aud: ctx.app,
      sid: undefined,
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: userDoc._id,
        phone: userDoc.phone,
        full_name: userDoc.full_name,
        role: 'customer',
      },
    };
  }

  // ==================== DRIVER OTP METHODS ====================

  async loginDriverOtp(data: { phone: string; otp: string }, ctx: AuthContext) {
    // TODO: Implement OTP verification
    let user = await this.usersService.findByPhone(data.phone);
    
    if (!user) {
      throw new UnauthorizedException('Driver not found');
    }

    const userDoc = user as any;

    if (userDoc.role !== 'driver') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { access_token } = await this.tokenService.signAccessToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'driver',
      aud: ctx.app,
      sid: undefined,
    });

    const { refresh_token } = await this.tokenService.signRefreshToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'driver',
      aud: ctx.app,
      sid: undefined,
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: userDoc._id,
        phone: userDoc.phone,
        role: 'driver',
        status: userDoc.status,
      },
    };
  }

  async registerDriverOtp(data: { phone: string; otp: string; full_name: string }, ctx: AuthContext) {
    // TODO: Implement OTP verification
    const existingUser = await this.usersService.findByPhone(data.phone);
    if (existingUser) {
      throw new BadRequestException('Phone already registered');
    }

    const user = await this.usersService.create({
      phone: data.phone,
      full_name: data.full_name,
      role: 'driver',
      status: 'pending_approval',
      auth_methods: ['phone_otp'],
    } as any);

    const userDoc = user as any;

    const { access_token } = await this.tokenService.signAccessToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'driver',
      aud: ctx.app,
      sid: undefined,
    });

    const { refresh_token } = await this.tokenService.signRefreshToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'driver',
      aud: ctx.app,
      sid: undefined,
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: userDoc._id,
        phone: userDoc.phone,
        full_name: userDoc.full_name,
        role: 'driver',
        status: userDoc.status,
      },
    };
  }

  // ==================== REFRESH TOKEN ====================

  async refresh(user: { userId: string; role: string; aud: string; sid?: string }) {
    const userDoc = await this.usersService.findOne(user.userId);
    if (!userDoc) {
      throw new UnauthorizedException('User not found');
    }

    const userData = userDoc as any;

    const { access_token } = await this.tokenService.signAccessToken({
      userId: user.userId,
      email: userData.email,
      role: user.role as Role,
      aud: user.aud as ClientApp,
      sid: user.sid,
    });

    const { refresh_token } = await this.tokenService.signRefreshToken({
      userId: user.userId,
      email: userData.email,
      role: user.role as Role,
      aud: user.aud as ClientApp,
      sid: user.sid,
    });

    return { access_token, refresh_token };
  }

  // ==================== OAUTH METHODS (giữ nguyên) ====================

  async verifyOAuthToken(provider: string, idToken: string): Promise<any> {
    try {
      let payload: any;
      switch (provider) {
        case 'google':
          payload = await this.verifyGoogleToken(idToken);
          break;
        case 'github':
          payload = await this.verifyGithubToken(idToken);
          break;
        default:
          throw new BadRequestException('Unsupported OAuth provider');
      }
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid OAuth token');
    }
  }

  private async verifyGoogleToken(idToken: string): Promise<any> {
    const response = await axios.get(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`,
    );
    if (response.data.aud !== this.configService.googleClientId) {
      throw new UnauthorizedException('Invalid Google token');
    }
    return {
      provider: 'google',
      provider_id: response.data.sub,
      email: response.data.email,
      full_name: response.data.name,
      avatar_url: response.data.picture,
    };
  }

  private async verifyGithubToken(accessToken: string): Promise<any> {
    const response = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return {
      provider: 'github',
      provider_id: response.data.id.toString(),
      email: response.data.email,
      full_name: response.data.name || response.data.login,
      avatar_url: response.data.avatar_url,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
