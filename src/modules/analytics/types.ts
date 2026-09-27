export type MarketingChannel =
  | 'META_ADS'
  | 'GOOGLE_SEARCH'
  | 'SEO_ORGANIC'
  | 'WHATSAPP'
  | 'EMAIL_NURTURE'
  | 'DIRECT';

export interface AnalyticsEvent {
  id: string;
  organizationId: string;
  campaignId?: string;
  eventType: 'PAGEVIEW' | 'AD_CLICK' | 'FORM_SUBMIT' | 'APPOINTMENT_BOOKED' | 'EMAIL_OPEN';
  channel: MarketingChannel;
  userIdOrSession: string;
  device: 'MOBILE' | 'DESKTOP';
  pageUrl: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  revenueUsd?: number;
  timestamp: string;
}

export interface ChannelPerformance {
  channel: MarketingChannel;
  impressions: number;
  clicks: number;
  conversions: number;
  adSpendUsd: number;
  revenueUsd: number;
  ctrPercent: number;
  conversionRatePercent: number;
  cpaUsd: number;
  roasRatio: number;
}

export interface Touchpoint {
  channel: MarketingChannel;
  timestamp: string;
  campaignName?: string;
}

export interface AttributionJourney {
  leadId: string;
  leadName: string;
  totalTouches: number;
  touchpoints: Touchpoint[];
  convertedRevenueUsd: number;
  firstTouchChannel: MarketingChannel;
  lastTouchChannel: MarketingChannel;
}

export interface OptimizationRecommendation {
  id: string;
  organizationId: string;
  title: string;
  channel: MarketingChannel;
  observedAnomaly: string;
  rootCauseAnalysis: string;
  proposedExperiment: {
    variantA: string;
    variantB: string;
    targetMetric: string;
    budgetReallocationPercent?: number;
  };
  estimatedImpact: string;
  riskLevel: 'LOW' | 'MEDIUM';
  requiresApproval: boolean;
  status: 'PENDING_APPROVAL' | 'APPLIED' | 'DISMISSED';
}
