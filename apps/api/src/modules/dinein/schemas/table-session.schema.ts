import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TableSessionDocument = TableSession & Document;

export enum TableSessionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Schema({ collection: 'table_sessions', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class TableSession {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Table', required: true })
  table_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Merchant', required: true })
  merchant_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  customer_id: Types.ObjectId;

  @Prop()
  guest_name: string;

  @Prop({ type: String, enum: TableSessionStatus, default: TableSessionStatus.ACTIVE })
  status: TableSessionStatus;

  @Prop()
  started_at: Date;

  @Prop()
  ended_at: Date;

  @Prop({ default: 0 })
  total_amount: number;

  created_at: Date;
  updated_at: Date;
}

export const TableSessionSchema = SchemaFactory.createForClass(TableSession);

TableSessionSchema.index({ merchant_id: 1, started_at: -1 });
