import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
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
import type { LoginDto } from '../dtos/common/login.dto';
import { MerchantBasicInfoDto, MerchantRegisterDto } from '../dtos/merchant/merchant-register.dto';
import { UsersService } from '../../users/services/users.service';
import { MerchantsService } from '../../merchants/services/merchants.service';
import { MerchantApprovalStatus } from '../../merchants/schemas/merchant.schema';
import { UserStatus } from '../../users/schemas/user.schema';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { CloudinaryService } from 'src/common/services/cloudinary.service';
import { MerchantRefreshGuard } from '../guards/refresh.guard';
import { RefreshSessionService } from '../services/refresh-session-service';

@Controller('auth/merchant')
@Client('merchant_web')
export class MerchantAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService,
    private readonly merchantsService: MerchantsService,
    private readonly cloudinaryService: CloudinaryService, //  thêm dòng này
    private readonly refreshSessionService: RefreshSessionService, //  thêm dòng này
  ) { }

  /**
   * POST /auth/merchant/register
   * Đăng ký merchant mới
   * - Tạo User với role='merchant', status='pending'
   * - Tạo Merchant record với approval_status='pending_approval'
   * - Auto login sau đăng ký (trả về tokens)
   */
  @Post('register')
  async register(
    @Body() dto: MerchantRegisterDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const app: ClientApp = 'merchant_web';
    const deviceId = req.headers['x-device-id'] as string;

    console.log('[MerchantRegister] Starting registration for:', dto.email);

    // Check if email already exists
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      console.log('[MerchantRegister] Email already exists:', dto.email);
      throw new BadRequestException('Email đã được đăng ký');
    }

    // Create user
    console.log('[MerchantRegister] Creating user...');
    const user = await this.authService.createMerchantUser({
      email: dto.email,
      password: dto.password,
      full_name: dto.full_name,
      phone: dto.phone,
    });

    console.log('[MerchantRegister] User created:', { id: (user as any)._id?.toString(), email: (user as any).email });

    // Create merchant record
    const merchant = await this.merchantsService.create({
      owner_user_id: (user as any)._id,
      email: dto.email,
      phone: dto.phone,
      approval_status: MerchantApprovalStatus.DRAFT,
      onboarding_step: 1,
    });

    console.log('[MerchantRegister] Merchant created:', { id: merchant._id?.toString() });

    // Generate tokens
    const userDoc = user as any;
    const uid = userDoc._id.toString();

    console.log('[MerchantRegister] Signing tokens with userId:', uid);

    const { access_token } = await this.tokenService.signAccessToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'merchant',
      aud: app,
      sid: undefined,
    });

    const { refresh_token } = await this.tokenService.signRefreshToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'merchant',
      aud: app,
      sid: undefined,
    });

    console.log('[MerchantRegister] Tokens generated, returning success');

    // Set refresh cookie - use root path so it's sent to all endpoints
    res.cookie(REFRESH_COOKIE_NAME[app], refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    return {
      success: true,
      message: 'Đăng ký thành công',
      data: {
        access_token,
        user: {
          id: userDoc._id?.toString(),
          email: userDoc.email,
          full_name: userDoc.full_name,
          role: userDoc.role,
          status: userDoc.status,
        },
        onboarding: {
          has_onboarding: true,
          current_step: 'basic_info',
          step_number: 1,
          merchant_approval_status: merchant.approval_status,
        },
      },
    };
  }

  /**
   * POST /auth/merchant/login
   * Đăng nhập merchant
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const app: ClientApp = 'merchant_web';
    const deviceId = req.headers['x-device-id'] as string;

    const user = await this.authService.validateUser(dto.email, dto.password);
    const userDoc = user as any;

    // Check role
    if (userDoc.role !== 'merchant') {
      throw new BadRequestException('Tài khoản không phải là merchant');
    }

    // Get merchant info
    const merchant = await this.merchantsService.findByOwnerUserId(userDoc._id.toString());

    // Map approval status to onboarding step
    const approvalStatus = merchant?.approval_status || MerchantApprovalStatus.DRAFT;
    let currentStep = 'basic_info';
    let stepNumber = 1;

    if (approvalStatus === MerchantApprovalStatus.PENDING_APPROVAL) {
      currentStep = 'waiting_approval';
      stepNumber = 4;
    } else if (approvalStatus === MerchantApprovalStatus.APPROVED) {
      currentStep = 'approved';
      stepNumber = 4;
    }
    const sid = await this.refreshSessionService.createSession({
      userId: userDoc._id.toString(),
      deviceId,
      aud: app,
      role: 'merchant',
    });
    // Generate tokens
    const { access_token } = await this.tokenService.signAccessToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'merchant',
      aud: app,
      sid: sid,
    });

    const { refresh_token } = await this.tokenService.signRefreshToken({
      userId: userDoc._id.toString(),
      email: userDoc.email,
      role: 'merchant',
      aud: app,
      sid: sid,
    });

    // Set refresh cookie - use root path so it's sent to all endpoints
    res.cookie(REFRESH_COOKIE_NAME[app], refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        access_token,
        user: {
          id: userDoc._id,
          email: userDoc.email,
          full_name: userDoc.full_name,
          role: userDoc.role,
          status: userDoc.status,
        },
        onboarding: {
          has_onboarding: true,
          current_step: currentStep,
          step_number: stepNumber,
          merchant_approval_status: approvalStatus,
          basic_info: merchant?.name ? {
            store_name: merchant.name,
            store_phone: merchant.phone,
            store_address: merchant.address,
            store_category: merchant.category,
            description: merchant.description,
          } : undefined,
        },
      },
    };
  }

  /**
   * POST /auth/merchant/refresh
   * Refresh token từ cookie
   */


  @Post('refresh')
  @UseGuards(MerchantRefreshGuard)
  async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const app: ClientApp = 'merchant_web';
    const user = req.user; // payload from refresh guard
    const deviceId = req.headers['x-device-id'] as string;

    // rotate
    const newSid = await this.refreshSessionService.rotateSession(user.sid, {
      userId: user.userId,
      deviceId,
      aud: app,
      role: user.role,
    });

    const { access_token } = await this.tokenService.signAccessToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
      aud: app,
      sid: newSid,
    });

    const { refresh_token } = await this.tokenService.signRefreshToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
      aud: app,
      sid: newSid,
    });

    res.cookie(REFRESH_COOKIE_NAME[app], refresh_token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
    });

    return { success: true, data: { access_token } };
  }


  /**
   * POST /auth/merchant/logout
   * Đăng xuất
   */
  @UseGuards(JwtAuthGuard, RolesGuard, ClientGuard)
  @Roles('merchant')
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) {
    const app: ClientApp = 'merchant_web';
    const sid = req.user?.sid;
    if (sid) await this.refreshSessionService.revokeSession(sid);

    res.clearCookie(REFRESH_COOKIE_NAME[app], { path: '/' });
    return { success: true, message: 'Đăng xuất thành công' };
  }

  /**
   * GET /auth/merchant/me
   * Lấy thông tin user hiện tại
   */
  @UseGuards(JwtAuthGuard, RolesGuard, ClientGuard)
  @Roles('merchant')
  @Get('me')
  async me(@Req() req: any) {
    const user = req.user;

    const merchant = await this.merchantsService.findByOwnerUserId(user.userId);
    if (!merchant) {
      return {
        success: true,
        data: {
          id: user.userId,
          email: user.email,
          full_name: user.email?.split('@')[0],
          role: user.role,
          status: 'active',
          merchant: null,
          onboarding: {
            has_onboarding: false,
            current_step: 'basic_info',
            step_number: 1,
            merchant_approval_status: 'draft',
          },
        },
      };
    }

    // --- Map onboarding step đúng theo DB ---
    const approval = merchant.approval_status;
    const stepNum = merchant.onboarding_step ?? 1;

    let currentStep: any = 'basic_info';
    if (approval === MerchantApprovalStatus.PENDING_APPROVAL) currentStep = 'waiting_approval';
    else if (approval === MerchantApprovalStatus.APPROVED) currentStep = 'approved';
    else if (stepNum === 1) currentStep = 'basic_info';
    else if (stepNum === 2) currentStep = 'documents';
    else if (stepNum >= 3) currentStep = 'ready_to_submit';

    return {
      success: true,
      data: {
        id: user.userId,
        email: user.email,
        full_name: merchant.name || user.email?.split('@')[0],
        role: user.role,
        status: 'active',

        // FULL merchant (trả thẳng doc từ mongoose)
        merchant: {
          id: merchant._id?.toString(),
          owner_user_id: merchant.owner_user_id?.toString?.() ?? merchant.owner_user_id,
          name: merchant.name,
          description: merchant.description,
          phone: merchant.phone,
          email: merchant.email,
          category: merchant.category,
          address: merchant.address,

          is_accepting_orders: merchant.is_accepting_orders,
          approval_status: merchant.approval_status,
          rejection_reason: merchant.rejection_reason,
          onboarding_step: merchant.onboarding_step,
          submitted_at: merchant.submitted_at,
          rejected_at: merchant.rejected_at,
          commission_rate: merchant.commission_rate,

          documents: merchant.documents,
          business_hours: merchant.business_hours,
          total_orders: merchant.total_orders,
          average_rating: merchant.average_rating,
          total_reviews: merchant.total_reviews,
          deleted_at: merchant.deleted_at,
          created_at: merchant.created_at,
          updated_at: (merchant as any).updated_at,
        },

        // onboarding đầy đủ + kèm documents
        onboarding: {
          has_onboarding: true,
          current_step: currentStep,
          step_number: stepNum,
          merchant_approval_status: approval,
          basic_info: {
            store_name: merchant.name,
            store_phone: merchant.phone,
            store_address: merchant.address,
            store_category: merchant.category,
            description: merchant.description,
          },
          documents: merchant.documents,
        },
      },
    };
  }
  // auth/merchant-auth.controller.ts
  @Post('onboarding/basic-info')
  @UseGuards(JwtAuthGuard, RolesGuard, ClientGuard)
  @Roles('merchant')
  async saveBasicInfo(@Req() req: any, @Body() dto: MerchantBasicInfoDto) {
    const userId = req.user.userId;
    console.log('[saveBasicInfo] Called with userId:', userId);

    const merchant = await this.merchantsService.findByOwnerUserId(userId);
    console.log('[saveBasicInfo] Merchant found:', merchant ? 'yes' : 'no', merchant?._id?.toString());
    if (!merchant) throw new BadRequestException('Merchant not found');

    // cập nhật merchant
    await this.merchantsService.updateById(merchant._id.toString(), {
      name: dto.store_name,
      phone: dto.store_phone,
      address: dto.store_address,
      category: dto.store_category,
      description: dto.description ?? null,
      onboarding_step: Math.max(merchant.onboarding_step ?? 1, 2),
      approval_status: MerchantApprovalStatus.DRAFT,
    });

    return { success: true, data: { ok: true } };
  }

  @Post('onboarding/documents')
  @UseGuards(JwtAuthGuard, RolesGuard, ClientGuard)
  @Roles('merchant')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDoc(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    const userId = req.user.userId;
    const { documentType } = body;

    if (!file) throw new BadRequestException('File is required');
    if (!documentType) throw new BadRequestException('documentType is required');

    const merchant = await this.merchantsService.findByOwnerUserId(userId);
    if (!merchant) throw new BadRequestException('Merchant not found');

    const uploaded = await this.cloudinaryService.uploadMerchantDocument(
      file,
      userId,
      documentType,
    );
    const url = uploaded.secure_url || uploaded.url;

    const fieldMap: Record<string, string> = {
      id_card_front: 'id_card_front_url',
      id_card_back: 'id_card_back_url',
      business_license: 'business_license_url',
      store_front: 'store_front_image_url',
    };

    const field = fieldMap[documentType];
    if (!field) throw new BadRequestException('Invalid documentType');

    const patch: any = {
      onboarding_step: Math.max(merchant.onboarding_step ?? 1, 3),
    };
    patch[`documents.${field}`] = url;

    const updated = await this.merchantsService.updateById(
      merchant._id.toString(),
      patch,
    );

    return { success: true, data: { documents: updated.documents } };
  }
  @Post('onboarding/submit')
  @UseGuards(JwtAuthGuard, RolesGuard, ClientGuard)
  @Roles('merchant')
  async submit(@Req() req: any) {
    const userId = req.user.userId;

    const merchant = await this.merchantsService.findByOwnerUserId(userId);
    if (!merchant) throw new BadRequestException('Merchant not found'); // ✅ thêm dòng này

    // validate đủ 4 giấy tờ
    const d = merchant.documents || ({} as any);
    const ok =
      d.id_card_front_url &&
      d.id_card_back_url &&
      d.business_license_url &&
      d.store_front_image_url;

    if (!ok) throw new BadRequestException('Thiếu giấy tờ');

    await this.merchantsService.updateById(merchant._id.toString(), {
      approval_status: MerchantApprovalStatus.PENDING_APPROVAL,
      submitted_at: new Date(),
      onboarding_step: 4,
    });

    return {
      success: true,
      data: {
        onboarding: {
          has_onboarding: true,
          current_step: 'waiting_approval',
          step_number: 4,
          merchant_approval_status: 'pending_approval',
        },
      },
    };
  }


  @Get('onboarding/status')
  @UseGuards(JwtAuthGuard, RolesGuard, ClientGuard)
  @Roles('merchant')
  async status(@Req() req: any) {
    const userId = req.user.userId;
    const merchant = await this.merchantsService.findByOwnerUserId(userId);

    // map step
    const approval = merchant?.approval_status ?? 'draft';
    let current_step: any = 'basic_info';
    if (approval === MerchantApprovalStatus.PENDING_APPROVAL) current_step = 'waiting_approval';
    else if (approval === MerchantApprovalStatus.APPROVED) current_step = 'approved';
    else if ((merchant?.onboarding_step ?? 1) === 2) current_step = 'documents';
    else if ((merchant?.onboarding_step ?? 1) >= 3) current_step = 'ready_to_submit';
    else current_step = 'basic_info';

    return {
      success: true,
      data: {
        has_onboarding: !!merchant,
        current_step,
        step_number: merchant?.onboarding_step ?? 1,
        merchant_approval_status: approval,
        basic_info: merchant?.name ? {
          store_name: merchant.name,
          store_phone: merchant.phone,
          store_address: merchant.address,
          store_category: merchant.category,
          description: merchant.description,
        } : undefined,
        documents: merchant?.documents,
      },
    };
  }

}
