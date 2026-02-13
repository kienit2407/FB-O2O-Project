import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  ORDER_UPDATE = 'order_update',
  PROMOTION = 'promotion',
  SYSTEM = 'system',
}

@Schema({ collection: 'notifications', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Notification {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: String, enum: NotificationType, required: true })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  body: string;

  @Prop({
    type: {
      action: String,
      order_id: Types.ObjectId,
      promotion_id: Types.ObjectId
    },
    default: {}
  })
  data: {
    action?: string;
    order_id?: Types.ObjectId;
    promotion_id?: Types.ObjectId;
  };

  @Prop({ default: false })
  is_read: boolean;

  @Prop()
  read_at: Date;

  created_at: Date;
  updated_at: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ user_id: 1, created_at: -1 });
NotificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });
