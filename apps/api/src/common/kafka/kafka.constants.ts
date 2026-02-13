export const KAFKA_TOPICS = {
  // Orders
  ORDERS_CREATED: 'orders.created',
  ORDERS_UPDATED: 'orders.updated',
  ORDERS_CANCELLED: 'orders.cancelled',
  ORDERS_COMPLETED: 'orders.completed',
  
  // Users
  USERS_REGISTERED: 'users.registered',
  USERS_UPDATED: 'users.updated',
  
  // Merchants
  MERCHANTS_APPROVED: 'merchants.approved',
  MERCHANTS_REJECTED: 'merchants.rejected',
  
  // Drivers
  DRIVERS_APPROVED: 'drivers.approved',
  DRIVERS_REJECTED: 'drivers.rejected',
  
  // Promotions
  PROMOTIONS_CREATED: 'promotions.created',
  PROMOTIONS_UPDATED: 'promotions.updated',
  
  // Vouchers
  VOUCHERS_ISSUED: 'vouchers.issued',
  VOUCHERS_REDEEMED: 'vouchers.redeemed',
  
  // Notifications
  NOTIFICATIONS_SEND_EMAIL: 'notifications.send-email',
  NOTIFICATIONS_SEND_SMS: 'notifications.send-sms',
  NOTIFICATIONS_SEND_PUSH: 'notifications.send-push',
  
  // AI
  AI_TRACK_INTERACTION: 'ai.track-interaction',
  AI_MODEL_RUN: 'ai.model-run',
} as const;

export const KAFKA_PRODUCER = 'fab-o2o-api';
export const KAFKA_VERSION = '1.0.0';
