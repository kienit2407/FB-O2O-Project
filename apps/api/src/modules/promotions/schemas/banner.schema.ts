import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BannerDocument = Banner & Document;

export enum BannerActionType {
  OPEN_PROMOTION = 'open_promotion',
  OPEN_MERCHANT = 'open_merchant',
  OPEN_PRODUCT = 'open_product',
  OPEN_CATEGORY = 'open_category',
  OPEN_URL = 'open_url',
  NONE = 'none',
}

export enum BannerDisplayPosition {
  HOME_CAROUSEL = 'home_carousel',
  HOME_MIDDLE = 'home_middle',
  HOME_BOTTOM = 'home_bottom',
  CATEGORY_TOP = 'category_top',
  POPUP = 'popup',
  SPLASH = 'splash',
}

export enum BannerTargetAudience {
  ALL = 'all',
  NEW_USER = 'new_user',
  INACTIVE_USER = 'inactive_user',
  LOGGED_IN = 'logged_in',
  GUEST = 'guest',
}

@Schema({ collection: 'banners', timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Banner {
  _id: Types.ObjectId;

  @Prop()
  title: string;

  @Prop()
  subtitle: string;

  @Prop({ required: true })
  image_url: string;

  @Prop()
  image_url_mobile: string;

  @Prop({ type: String, enum: BannerActionType, default: BannerActionType.NONE })
  action_type: BannerActionType;

  @Prop({
    type: {
      promotion_id: Types.ObjectId,
      merchant_id: Types.ObjectId,
      product_id: Types.ObjectId,
      category_id: Types.ObjectId,
      url: String,
      deep_link: String
    },
    default: {}
  })
  action_data: {
    promotion_id?: Types.ObjectId;
    merchant_id?: Types.ObjectId;
    product_id?: Types.ObjectId;
    category_id?: Types.ObjectId;
    url?: string;
    deep_link?: string;
  };

  @Prop({ type: String, enum: BannerDisplayPosition, required: true })
  display_position: BannerDisplayPosition;

  @Prop({ type: String, enum: BannerTargetAudience, default: BannerTargetAudience.ALL })
  target_audience: BannerTargetAudience;

  @Prop({ type: [String], default: [] })
  target_platforms: string[];

  @Prop({ type: [String], default: [] })
  geo_fence: string[];

  @Prop()
  start_date: Date;

  @Prop()
  end_date: Date;

  @Prop({
    type: [{
      start: String,
      end: String
    }],
    default: []
  })
  time_slots: {
    start: string;
    end: string;
  }[];

  @Prop({
    type: {
      show_once_per_day: Boolean,
      show_on_first_open: Boolean,
      delay_seconds: Number,
      dismissible: Boolean
    },
    default: {}
  })
  popup_settings: {
    show_once_per_day?: boolean;
    show_on_first_open?: boolean;
    delay_seconds?: number;
    dismissible?: boolean;
  };

  @Prop({ default: 0 })
  sort_order: number;

  @Prop({ default: true })
  is_active: boolean;

  @Prop({
    type: {
      impressions: Number,
      clicks: Number,
      ctr: Number
    },
    default: {}
  })
  stats: {
    impressions?: number;
    clicks?: number;
    ctr?: number;
  };

  @Prop({ type: Types.ObjectId, ref: 'User' })
  created_by: Types.ObjectId;

  @Prop({ type: Date, default: null })
  deleted_at: Date | null;

  created_at: Date;
  updated_at: Date;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);

BannerSchema.index({ display_position: 1, is_active: 1, sort_order: 1 });
BannerSchema.index({ start_date: 1, end_date: 1, is_active: 1 });
BannerSchema.index({ target_audience: 1, is_active: 1 });
