import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Merchant, MerchantDocument, MerchantApprovalStatus } from '../schemas/merchant.schema';

export interface CreateMerchantDto {
  owner_user_id: Types.ObjectId | string;
  email: string;
  phone?: string;
  name?: string;
  approval_status?: MerchantApprovalStatus;
  onboarding_step?: number;
}

@Injectable()
export class MerchantsService {
  constructor(
    @InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>,
  ) { }

  async create(data: CreateMerchantDto): Promise<MerchantDocument> {
    const merchant = new this.merchantModel({
      ...data,
      owner_user_id: new Types.ObjectId(data.owner_user_id),
    });
    return merchant.save();
  }

  async findByOwnerUserId(ownerUserId: string): Promise<MerchantDocument | null> {
    console.log('[MerchantsService.findByOwnerUserId] Searching for owner_user_id:', ownerUserId);
    const merchant = await this.merchantModel.findOne({
      owner_user_id: new Types.ObjectId(ownerUserId),
      deleted_at: null,
    }).exec();
    console.log('[MerchantsService.findByOwnerUserId] Result:', merchant ? `found (id: ${merchant._id}, name: ${merchant.name})` : 'not found');
    return merchant;
  }

  async findById(id: string): Promise<MerchantDocument | null> {
    return this.merchantModel.findById(id).exec();
  }
  async updateById(id: string, update: Record<string, any>) {
    const doc = await this.merchantModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true },
    );
    if (!doc) throw new NotFoundException('Merchant not found');
    return doc;
  }
  async updateByOwnerUserId(
    ownerUserId: string,
    data: Partial<Merchant>,
  ): Promise<MerchantDocument | null> {
    return this.merchantModel.findOneAndUpdate(
      { owner_user_id: new Types.ObjectId(ownerUserId) },
      { $set: data },
      { new: true },
    ).exec();
  }

  async updateApprovalStatus(
    ownerUserId: string,
    status: MerchantApprovalStatus,
    approvedBy?: string,
    rejectionReason?: string,
  ): Promise<MerchantDocument | null> {
    const updateData: any = {
      approval_status: status,
    };

    if (status === MerchantApprovalStatus.APPROVED) {
      updateData.approved_at = new Date();
      if (approvedBy) {
        updateData.approved_by = new Types.ObjectId(approvedBy);
      }
    }

    if (status === MerchantApprovalStatus.REJECTED) {
      updateData.rejected_at = new Date();
      updateData.rejection_reason = rejectionReason;
    }

    return this.merchantModel.findOneAndUpdate(
      { owner_user_id: new Types.ObjectId(ownerUserId) },
      { $set: updateData },
      { new: true },
    ).exec();
  }

  async softDelete(id: string): Promise<void> {
    await this.merchantModel.findByIdAndUpdate(id, {
      deleted_at: new Date(),
    });
  }
}
