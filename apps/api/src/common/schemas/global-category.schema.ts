import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GlobalCategoryDocument = GlobalCategory & Document;

@Schema({ collection: 'global_categories', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class GlobalCategory {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  icon_url: string;

  @Prop()
  image_url: string;

  @Prop({ default: 0 })
  sort_order: number;

  @Prop({ default: true })
  is_active: boolean;

  created_at: Date;
  updated_at: Date;
}

export const GlobalCategorySchema = SchemaFactory.createForClass(GlobalCategory);
