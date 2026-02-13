import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SystemConfigDocument = SystemConfig & Document;

@Schema({ collection: 'system_configs', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class SystemConfig {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ type: Object, required: true })
  value: Record<string, any>;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updated_by: Types.ObjectId;

  updated_at: Date;
}

export const SystemConfigSchema = SchemaFactory.createForClass(SystemConfig);
