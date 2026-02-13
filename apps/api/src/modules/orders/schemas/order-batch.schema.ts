import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderBatchDocument = OrderBatch & Document;

export enum OrderBatchStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Schema({ collection: 'order_batches', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class OrderBatch {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driver_id: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], default: [] })
  order_ids: Types.ObjectId[];

  @Prop({
    type: [{
      type: String,
      order_id: Types.ObjectId,
      location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number] }
      },
      address: String,
      sequence: Number
    }],
    default: []
  })
  optimized_route: {
    type: string;
    order_id: Types.ObjectId;
    location: {
      type: string;
      coordinates: [number, number];
    };
    address: string;
    sequence: number;
  }[];

  @Prop({ default: 0 })
  total_distance: number;

  @Prop({ default: 0 })
  estimated_time: number;

  @Prop({ type: String, enum: OrderBatchStatus, default: OrderBatchStatus.ACTIVE })
  status: OrderBatchStatus;

  created_at: Date;
  updated_at: Date;
}

export const OrderBatchSchema = SchemaFactory.createForClass(OrderBatch);

OrderBatchSchema.index({ driver_id: 1, status: 1, created_at: -1 });
