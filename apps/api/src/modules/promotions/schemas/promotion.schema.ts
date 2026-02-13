import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PromotionDocument = Promotion & Document;

export enum PromotionCreatedByType {
  PLATFORM = 'platform',
  MERCHANT = 'merchant',
}

export enum PromotionScope {
  FOOD = 'food',
  DELIVERY = 'delivery',
  DINE_IN = 'dine_in',
}

export enum PromotionType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
}

export enum CampaignType {
  NORMAL = 'normal',
  FLASH_SALE = 'flash_sale',
  DAILY_DEAL = 'daily_deal',
  WEEKEND_DEAL = 'weekend_deal',
  MONTHLY_EVENT = 'monthly_event',
}

@Schema({ collection: 'promotions', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Promotion {
  _id: Types.ObjectId;

  @Prop({ type: String, enum: PromotionCreatedByType, required: true })
  created_by_type: PromotionCreatedByType;

  @Prop({ type: Types.ObjectId, ref: 'Merchant' })
  merchant_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  banner_image_url: string;

  @Prop({ type: String, enum: PromotionScope, required: true })
  scope: PromotionScope;

  @Prop({ type: String, enum: PromotionType, required: true })
  type: PromotionType;

  @Prop({ required: true })
  discount_value: number;

  @Prop({ default: 0 })
  max_discount: number;

  @Prop({ default: 0 })
  min_order_amount: number;

  @Prop({ type: String, enum: CampaignType, default: CampaignType.NORMAL })
  campaign_type: CampaignType;

  @Prop({
    type: {
      countdown_enabled: Boolean,
      show_remaining_qty: Boolean,
      quantity_per_time_slot: {
        type: [{
          start_time: String,
          end_time: String,
          quantity: Number
        }],
        default: []
      },
      total_quantity: Number,
      remaining_quantity: Number,
      claimed_quantity: Number
    },
    default: {}
  })
  flash_sale_settings: {
    countdown_enabled?: boolean;
    show_remaining_qty?: boolean;
    quantity_per_time_slot?: {
      start_time: string;
      end_time: string;
      quantity: number;
    }[];
    total_quantity?: number;
    remaining_quantity?: number;
    claimed_quantity?: number;
  };

  @Prop({
    type: {
      valid_from: Date,
      valid_to: Date,
      time_slots: {
        type: [{
          start: String,
          end: String
        }],
        default: []
      },
      applicable_days: [Number],
      geo_fence: [String],
      service_type: String,
      applicable_merchants: [Types.ObjectId],
      user_segment: String
    },
    default: {}
  })
  conditions: {
    valid_from?: Date;
    valid_to?: Date;
    time_slots?: {
      start: string;
      end: string;
    }[];
    applicable_days?: number[];
    geo_fence?: string[];
    service_type?: string;
    applicable_merchants?: Types.ObjectId[];
    user_segment?: string;
  };

  @Prop({ default: 0 })
  total_usage_limit: number;

  @Prop({ default: 0 })
  per_user_limit: number;

  @Prop({ default: 0 })
  current_usage: number;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({ default: false })
  is_featured: boolean;

  @Prop({ default: false })
  show_as_popup: boolean;

  created_at: Date;
  updated_at: Date;
}

export const PromotionSchema = SchemaFactory.createForClass(Promotion);
