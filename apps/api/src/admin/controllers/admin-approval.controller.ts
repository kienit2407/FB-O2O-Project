import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../modules/auth/decorators/roles.decorator';
import { CurrentUser } from '../../modules/auth/decorators/current-user.decorator';
import { Merchant, MerchantApprovalStatus } from '../../modules/merchants/schemas/merchant.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminApprovalController {
  constructor(
    @InjectModel(Merchant.name) private merchantModel: Model<Merchant>,
  ) {}

  @Get('merchants/pending')
  async getPendingMerchants() {
    const merchants = await this.merchantModel
      .find({ approval_status: MerchantApprovalStatus.PENDING_APPROVAL, deleted_at: null })
      .populate('owner_user_id', 'email full_name phone')
      .exec();
    return { success: true, data: merchants };
  }

  @Get('merchants/all')
  async getAllMerchants() {
    const merchants = await this.merchantModel
      .find({ deleted_at: null })
      .populate('owner_user_id', 'email full_name phone')
      .sort({ created_at: -1 })
      .exec();
    return { success: true, data: merchants };
  }

  @Post('merchants/:userId/approve')
  async approveMerchant(@Param('userId') userId: string, @CurrentUser() user: any) {
    const merchant = await this.merchantModel.findOneAndUpdate(
      { owner_user_id: userId },
      { 
        $set: { 
          approval_status: MerchantApprovalStatus.APPROVED,
          approved_at: new Date(),
          approved_by: user.userId,
        } 
      },
      { new: true },
    ).exec();
    return { success: true, message: 'Merchant approved', data: merchant };
  }

  @Post('merchants/:userId/reject')
  async rejectMerchant(
    @Param('userId') userId: string,
    @Body() body: { reason: string },
    @CurrentUser() user: any,
  ) {
    const merchant = await this.merchantModel.findOneAndUpdate(
      { owner_user_id: userId },
      { 
        $set: { 
          approval_status: MerchantApprovalStatus.REJECTED,
          rejected_at: new Date(),
          rejection_reason: body.reason,
        } 
      },
      { new: true },
    ).exec();
    return { success: true, message: 'Merchant rejected', data: merchant };
  }
}
