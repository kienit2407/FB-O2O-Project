import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VoucherDocument = Voucher & Document;

@Schema({ collection: 'vouchers', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Voucher {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Promotion', required: true })
  promotion_id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  discount_value: number;

  @Prop({ default: 0 })
  max_discount: number;

  @Prop({ default: 0 })
  min_order_amount: number;

  @Prop({ default: 0 })
  usage_limit: number;

  @Prop({ default: 0 })
  current_usage: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assigned_to_user: Types.ObjectId;

  @Prop({ default: true })
  is_active: boolean;

  @Prop()
  start_date: Date;

  @Prop()
  end_date: Date;

  created_at: Date;
  updated_at: Date;
}

export const VoucherSchema = SchemaFactory.createForClass(Voucher);

VoucherSchema.index({ code: 1 }, { unique: true });
VoucherSchema.index({ promotion_id: 1 });
