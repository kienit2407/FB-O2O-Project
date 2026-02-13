import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserInteractionDocument = UserInteraction & Document;

export enum InteractionAction {
  VIEW = 'view',
  ADD_TO_CART = 'add_to_cart',
  ORDER = 'order',
  RATE = 'rate',
}

@Schema({ collection: 'user_interactions', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class UserInteraction {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: String, enum: InteractionAction, required: true })
  action: InteractionAction;

  @Prop({ default: 1 })
  weight: number;

  @Prop({ type: Types.ObjectId, ref: 'Merchant' })
  merchant_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product' })
  product_id: Types.ObjectId;

  @Prop()
  source: string;

  @Prop()
  search_query: string;

  @Prop()
  rating: number;

  created_at: Date;
  updated_at: Date;
}

export const UserInteractionSchema = SchemaFactory.createForClass(UserInteraction);

UserInteractionSchema.index({ user_id: 1, created_at: -1 });
UserInteractionSchema.index({ product_id: 1, action: 1 });
