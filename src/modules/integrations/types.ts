export type MarketingEventType =
  | 'lead.created'
  | 'lead.scored'
  | 'campaign.approved'
  | 'social.post.scheduled'
  | 'social.post.published'
  | 'email.queued'
  | 'email.sent'
  | 'whatsapp.message.sent'
  | 'review.received'
  | 'review.responded'
  | 'workflow.run.completed';

export interface MarketingEvent<T = any> {
  id: string;
  type: MarketingEventType;
  organizationId: string;
  payload: T;
  timestamp: string;
}

export type QueueJobStatus = 'WAITING' | 'ACTIVE' | 'COMPLETED' | 'FAILED' | 'DELAYED';

export interface QueueJob<T = any> {
  id: string;
  queueName: string;
  organizationId: string;
  data: T;
  status: QueueJobStatus;
  attempts: number;
  maxAttempts: number;
  error?: string;
  createdAt: string;
  processedAt?: string;
  finishedAt?: string;
}

export interface SocialPostPayload {
  platform: 'LINKEDIN' | 'INSTAGRAM' | 'FACEBOOK' | 'X';
  content: string;
  mediaUrls?: string[];
  scheduledTime?: string;
  postMode: 'IMMEDIATE' | 'SCHEDULED';
}

export interface EmailDispatchPayload {
  to: string;
  subject: string;
  htmlContent: string;
  senderName: string;
  senderEmail: string;
  organizationAddress: string;
  unsubscribeUrl: string;
}

export interface WhatsAppDispatchPayload {
  toPhone: string;
  templateName: string;
  parameters: Record<string, string>;
}

export interface ReviewItem {
  id: string;
  platform: 'GOOGLE_BUSINESS' | 'TRUSTPILOT' | 'YELP';
  authorName: string;
  rating: number; // 1-5
  reviewText: string;
  reviewDate: string;
  autoResponse?: string;
}
