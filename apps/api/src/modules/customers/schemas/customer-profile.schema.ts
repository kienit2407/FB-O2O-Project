import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CustomerProfileDocument = CustomerProfile & Document;

@Schema({ collection: 'customer_profiles', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class CustomerProfile {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user_id: Types.ObjectId;

  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: { type: [Number] },
    address: String,
    updated_at: Date
  })
  current_location?: {
    type: string;
    coordinates: [number, number];
    address?: string;
    updated_at?: Date;
  };

  @Prop({
    type: [{
      _id: Types.ObjectId,
      label: String,
      address: String,
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] }
      },
      address_details: {
        street_number: String,
        street: String,
        ward: String,
        district: String,
        city: String,
        country: String
      },
      address_source: String,
      delivery_note: String,
      receiver_name: String,
      receiver_phone: String,
      is_default: Boolean,
      created_at: Date,
      updated_at: Date
    }],
    default: []
  })
  saved_addresses: {
    _id: Types.ObjectId;
    label: string;
    address: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
    address_details?: {
      street_number?: string;
      street?: string;
      ward?: string;
      district?: string;
      city?: string;
      country?: string;
    };
    address_source?: string;
    delivery_note?: string;
    receiver_name?: string;
    receiver_phone?: string;
    is_default?: boolean;
    created_at?: Date;
    updated_at?: Date;
  }[];

  @Prop({ default: 0 })
  total_orders: number;

  @Prop({ default: 0 })
  total_spent: number;

  created_at: Date;
  updated_at: Date;
}

export const CustomerProfileSchema = SchemaFactory.createForClass(CustomerProfile);

CustomerProfileSchema.index({ user_id: 1 }, { unique: true });
CustomerProfileSchema.index({ current_location: '2dsphere' });
