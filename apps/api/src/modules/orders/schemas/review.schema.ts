import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

export enum ReviewType {
  ORDER = 'order',
  MERCHANT = 'merchant',
  DRIVER = 'driver',
}

@Schema({ collection: 'reviews', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Review {
  _id: Types.ObjectId;

  @Prop({ type: String, enum: ReviewType, required: true })
  review_type: ReviewType;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  order_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Merchant' })
  merchant_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  driver_id: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  comment: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: {
      content: String,
      replied_at: Date,
      replied_by: Types.ObjectId
    }
  })
  reply?: {
    content: string;
    replied_at: Date;
    replied_by: Types.ObjectId;
  };

  @Prop({ default: true })
  is_visible: boolean;

  created_at: Date;
  updated_at: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

ReviewSchema.index({ review_type: 1, order_id: 1, user_id: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ review_type: 1, merchant_id: 1, user_id: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ review_type: 1, driver_id: 1, user_id: 1 }, { unique: true, sparse: true });
