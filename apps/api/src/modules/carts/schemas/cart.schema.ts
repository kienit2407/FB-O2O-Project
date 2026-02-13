import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CartDocument = Cart & Document;

export enum CartStatus {
  ACTIVE = 'active',
  CHECKED_OUT = 'checked_out',
  ABANDONED = 'abandoned',
}

export enum OrderType {
  DELIVERY = 'delivery',
  DINE_IN = 'dine_in',
}

@Schema({ collection: 'carts', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Cart {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Merchant', required: true })
  merchant_id: Types.ObjectId;

  @Prop({ type: String, enum: OrderType, required: true })
  order_type: OrderType;

  @Prop({ type: String, enum: CartStatus, default: CartStatus.ACTIVE })
  status: CartStatus;

  @Prop()
  source: string;

  @Prop({ type: Types.ObjectId, ref: 'Table' })
  table_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TableSession' })
  table_session_id: Types.ObjectId;

  @Prop({
    type: {
      address_id: Types.ObjectId,
      address: String,
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] }
      },
      receiver_name: String,
      receiver_phone: String,
      note: String
    }
  })
  delivery_address_snapshot?: {
    address_id: Types.ObjectId;
    address: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
    receiver_name: string;
    receiver_phone: string;
    note: string;
  };

  @Prop({
    type: [{
      _id: Types.ObjectId,
      product_id: Types.ObjectId,
      quantity: Number,
      product_name: String,
      product_image: String,
      base_price: Number,
      sale_price: Number,
      selected_options: {
        type: [{
          option_id: Types.ObjectId,
          option_name: String,
          choice_id: Types.ObjectId,
          choice_name: String,
          price_modifier: Number
        }],
        default: []
      },
      note: String,
      item_total_estimated: Number,
      created_at: Date,
      updated_at: Date
    }],
    default: []
  })
  items: {
    _id: Types.ObjectId;
    product_id: Types.ObjectId;
    quantity: number;
    product_name: string;
    product_image: string;
    base_price: number;
    sale_price: number;
    selected_options: {
      option_id: Types.ObjectId;
      option_name: string;
      choice_id: Types.ObjectId;
      choice_name: string;
      price_modifier: number;
    }[];
    note: string;
    item_total_estimated: number;
    created_at: Date;
    updated_at: Date;
  }[];

  @Prop({
    type: {
      subtotal: Number,
      delivery_fee: Number,
      platform_fee: Number,
      discount_estimated: Number,
      total_estimated: Number
    },
    default: {}
  })
  pricing_estimate: {
    subtotal?: number;
    delivery_fee?: number;
    platform_fee?: number;
    discount_estimated?: number;
    total_estimated?: number;
  };

  @Prop({
    type: [{
      voucher_id: Types.ObjectId,
      voucher_code: String,
      scope: String,
      sponsor: String
    }],
    default: []
  })
  selected_vouchers: {
    voucher_id: Types.ObjectId;
    voucher_code: string;
    scope: string;
    sponsor: string;
  }[];

  @Prop()
  expires_at: Date;

  @Prop()
  last_active_at: Date;

  @Prop({ type: Date, default: null })
  deleted_at: Date | null;

  created_at: Date;
  updated_at: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.index(
  { user_id: 1, merchant_id: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: CartStatus.ACTIVE } }
);
CartSchema.index({ user_id: 1, updated_at: -1 });
CartSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
