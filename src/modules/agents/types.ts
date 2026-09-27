import { z } from 'zod';
import { AttributedCitation } from '../rag/types.js';

// 1. Strategist Output Schema
export const StrategicPlanSchema = z.object({
  campaignName: z.string(),
  primaryObjective: z.string(),
  targetPersonas: z.array(z.object({
    name: z.string(),
    demographics: z.string(),
    painPoints: z.array(z.string()),
    motivation: z.string(),
  })),
  coreValueProposition: z.string(),
  budgetAllocation: z.record(z.string(), z.string()).optional(), // e.g. { "Meta Ads": "40%", "Google Ads": "35%", "SEO Content": "25%" }
  targetKPIs: z.array(z.object({
    metric: z.string(),
    targetValue: z.string(),
  })),
});
export type StrategicPlan = z.infer<typeof StrategicPlanSchema>;

// 2. SEO & pSEO Output Schema
export const SEOStrategySchema = z.object({
  primaryKeywordClusters: z.array(z.object({
    clusterName: z.string(),
    searchIntent: z.enum(['INFORMATIONAL', 'NAVIGATIONAL', 'COMMERCIAL', 'TRANSACTIONAL']),
    keywords: z.array(z.string()),
  })),
  localSEOTactics: z.array(z.string()),
  programmaticSEOMatrix: z.object({
    services: z.array(z.string()),
    locations: z.array(z.string()),
    totalGeneratedPagesTarget: z.number(),
    samplePageTitles: z.array(z.string()),
  }),
});
export type SEOStrategy = z.infer<typeof SEOStrategySchema>;

// 3. Content & Creative Output Schema
export const ContentPlanSchema = z.object({
  blogPost: z.object({
    title: z.string(),
    seoMetaDescription: z.string(),
    targetKeyword: z.string(),
    outline: z.array(z.string()),
  }),
  socialPosts: z.array(z.object({
    platform: z.enum(['LINKEDIN', 'INSTAGRAM', 'FACEBOOK', 'X']),
    hook: z.string(),
    content: z.string(),
    hashtags: z.array(z.string()),
    callToAction: z.string(),
  })),
  shortFormVideoReel: z.object({
    title: z.string(),
    durationSeconds: z.number(),
    hookVisualAndAudio: z.string(),
    bodyScenes: z.array(z.object({
      sceneNumber: z.number(),
      visualPrompt: z.string(),
      spokenScript: z.string(),
      onScreenText: z.string(),
    })),
    cta: z.string(),
  }),
});
export type ContentPlan = z.infer<typeof ContentPlanSchema>;

// 4. Omnichannel Campaign Output Schema
export const CampaignPlanSchema = z.object({
  funnelStages: z.object({
    tofuAwareness: z.string(),
    mofuConsideration: z.string(),
    bofuConversion: z.string(),
  }),
  adCopies: z.object({
    metaAds: z.object({
      primaryText: z.string(),
      headline: z.string(),
      visualDescription: z.string().default('App mockup with glowing streak badge'),
      ctaButton: z.string().default('Install Now'),
      callToAction: z.string().optional(),
    }),
    googleSearchAd: z.object({
      headlines: z.array(z.string()),
      descriptions: z.array(z.string()),
      displayUrl: z.string().optional(),
    }),
  }),
  emailNurtureSequence: z.array(z.object({
    emailNumber: z.number(),
    delayDays: z.number(),
    subjectLine: z.string(),
    previewText: z.string(),
    bodyOutline: z.string(),
    primaryCTA: z.string(),
  })),
});
export type CampaignPlan = z.infer<typeof CampaignPlanSchema>;

// 5. Competitor Counter-Strategy Output Schema
export const CompetitorCounterStrategySchema = z.object({
  competitorWeaknessesIdentified: z.array(z.string()),
  differentiationPillars: z.array(z.string()),
  counterMessagingAction: z.string(),
});
export type CompetitorCounterStrategy = z.infer<typeof CompetitorCounterStrategySchema>;

// Master Complete Marketing Plan Schema
export const MasterMarketingPlanSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  userPrompt: z.string(),
  generatedAt: z.string(),
  strategy: StrategicPlanSchema,
  seo: SEOStrategySchema,
  content: ContentPlanSchema,
  campaign: CampaignPlanSchema,
  competitorRadar: CompetitorCounterStrategySchema,
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE']),
});
export type MasterMarketingPlan = z.infer<typeof MasterMarketingPlanSchema>;

// LangGraph Orchestration State
export interface AgentState {
  organizationId: string;
  userPrompt: string;
  businessContext: {
    businessName: string;
    industry: string;
    city: string;
    country: string;
    services: any[];
    usps: string[];
    competitors: string[];
    brandTone: string;
  };
  ragContext: string;
  citations: AttributedCitation[];
  strategy?: StrategicPlan;
  seo?: SEOStrategy;
  content?: ContentPlan;
  campaign?: CampaignPlan;
  competitorRadar?: CompetitorCounterStrategy;
  errors: string[];
}
