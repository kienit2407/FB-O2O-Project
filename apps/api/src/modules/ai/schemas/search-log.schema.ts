import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SearchLogDocument = SearchLog & Document;

@Schema({ collection: 'search_logs', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class SearchLog {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true })
  search_query: string;

  @Prop()
  geo_cell: string;

  @Prop()
  timestamp: Date;

  @Prop({ default: 0 })
  num_results: number;

  @Prop({ type: Types.ObjectId })
  clicked_result_id: Types.ObjectId;

  @Prop()
  clicked_position: number;

  @Prop({
    type: {
      rating_gte: Number,
      distance_lte_km: Number,
      price_range: {
        min: Number,
        max: Number
      }
    },
    default: {}
  })
  filters_applied: {
    rating_gte?: number;
    distance_lte_km?: number;
    price_range?: {
      min?: number;
      max?: number;
    };
  };

  @Prop()
  source: string;

  created_at: Date;
  updated_at: Date;
}

export const SearchLogSchema = SchemaFactory.createForClass(SearchLog);

SearchLogSchema.index({ search_query: 1, created_at: -1 });
SearchLogSchema.index({ geo_cell: 1, created_at: -1 });
