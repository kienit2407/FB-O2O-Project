export interface EventTrace {
  correlation_id: string;
  request_id?: string;
  user_id?: string;
}

export interface EventEnvelope {
  event_id: string;
  event_name: string;
  occurred_at: Date;
  producer: string;
  version: string;
  data: any;
  trace: EventTrace;
}

export interface KafkaConfig {
  brokers: string;
  clientId: string;
  groupId: string;
  enabled: boolean;
}

export interface PublishOptions {
  topic: string;
  key?: string;
  headers?: Record<string, string>;
  retry?: {
    maxAttempts: number;
    backoffMs: number;
  };
}
