import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VoucherUsageDocument = VoucherUsage & Document;

export enum VoucherUsageScope {
  FOOD = 'food',
  DELIVERY = 'delivery',
  DINE_IN = 'dine_in',
}

export enum VoucherSponsor {
  PLATFORM = 'platform',
  MERCHANT = 'merchant',
}

@Schema({ collection: 'voucher_usages', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class VoucherUsage {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Voucher', required: true })
  voucher_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  order_id: Types.ObjectId;

  @Prop({ type: String, enum: VoucherUsageScope, required: true })
  scope: VoucherUsageScope;

  @Prop({ type: String, enum: VoucherSponsor, required: true })
  sponsor: VoucherSponsor;

  @Prop({ required: true })
  discount_applied: number;

  created_at: Date;
  updated_at: Date;
}

export const VoucherUsageSchema = SchemaFactory.createForClass(VoucherUsage);

VoucherUsageSchema.index({ user_id: 1, voucher_id: 1, created_at: -1 });
