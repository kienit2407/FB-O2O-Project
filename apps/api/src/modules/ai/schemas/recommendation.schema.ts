import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RecommendationDocument = Recommendation & Document;

export enum RecommendationType {
  PRODUCTS = 'products',
  MERCHANTS = 'merchants',
}

@Schema({ collection: 'recommendations', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Recommendation {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: String, enum: RecommendationType, required: true })
  type: RecommendationType;

  @Prop({
    type: [{
      item_id: Types.ObjectId,
      score: Number,
      reason: String
    }],
    default: []
  })
  items: {
    item_id: Types.ObjectId;
    score: number;
    reason: string;
  }[];

  @Prop()
  generated_at: Date;

  @Prop({ required: true })
  expires_at: Date;

  created_at: Date;
  updated_at: Date;
}

export const RecommendationSchema = SchemaFactory.createForClass(Recommendation);

RecommendationSchema.index({ user_id: 1, expires_at: 1 });
