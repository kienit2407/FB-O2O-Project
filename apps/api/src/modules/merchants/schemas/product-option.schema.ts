import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductOptionDocument = ProductOption & Document;

export enum OptionType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}

@Schema({ collection: 'product_options', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class ProductOption {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product_id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ type: String, enum: OptionType, default: OptionType.SINGLE })
  type: OptionType;

  @Prop({ default: false })
  is_required: boolean;

  @Prop({ default: 1 })
  min_select: number;

  @Prop({ default: 1 })
  max_select: number;

  @Prop({
    type: [{
      _id: Types.ObjectId,
      name: String,
      price_modifier: Number,
      is_default: Boolean,
      is_available: Boolean
    }],
    default: []
  })
  choices: {
    _id: Types.ObjectId;
    name: string;
    price_modifier: number;
    is_default: boolean;
    is_available: boolean;
  }[];

  @Prop({ default: 0 })
  sort_order: number;

  @Prop({ type: Date, default: null })
  deleted_at: Date | null;

  created_at: Date;
  updated_at: Date;
}

export const ProductOptionSchema = SchemaFactory.createForClass(ProductOption);

ProductOptionSchema.index({ product_id: 1, deleted_at: 1 });
