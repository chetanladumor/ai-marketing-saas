import { SubscriptionTier } from '../tenancy/types.js';

export interface PlanEntitlements {
  maxAiOperationsMonthly: number;
  maxContacts: number;
  maxActiveCampaigns: number;
  maxTeamSeats: number;
  maxCrawledPages: number;
  canUseLocalOllama: boolean;
  canUseCustomBranding: boolean;
  priceUsdMonthly: number;
  priceEurMonthly: number;
  priceGbpMonthly: number;
  priceInrMonthly: number;
}

export const PLAN_ENTITLEMENTS: Record<SubscriptionTier, PlanEntitlements> = {
  STARTER: {
    maxAiOperationsMonthly: 500,
    maxContacts: 1000,
    maxActiveCampaigns: 3,
    maxTeamSeats: 1,
    maxCrawledPages: 50,
    canUseLocalOllama: true,
    canUseCustomBranding: false,
    priceUsdMonthly: 99,
    priceEurMonthly: 92,
    priceGbpMonthly: 78,
    priceInrMonthly: 8200,
  },
  GROWTH: {
    maxAiOperationsMonthly: 2500,
    maxContacts: 10000,
    maxActiveCampaigns: 15,
    maxTeamSeats: 5,
    maxCrawledPages: 250,
    canUseLocalOllama: true,
    canUseCustomBranding: true,
    priceUsdMonthly: 299,
    priceEurMonthly: 279,
    priceGbpMonthly: 239,
    priceInrMonthly: 24900,
  },
  AGENCY: {
    maxAiOperationsMonthly: 10000,
    maxContacts: 50000,
    maxActiveCampaigns: 999,
    maxTeamSeats: 15,
    maxCrawledPages: 1000,
    canUseLocalOllama: true,
    canUseCustomBranding: true,
    priceUsdMonthly: 799,
    priceEurMonthly: 749,
    priceGbpMonthly: 639,
    priceInrMonthly: 66500,
  },
  ENTERPRISE: {
    maxAiOperationsMonthly: 999999,
    maxContacts: 999999,
    maxActiveCampaigns: 999999,
    maxTeamSeats: 999,
    maxCrawledPages: 10000,
    canUseLocalOllama: true,
    canUseCustomBranding: true,
    priceUsdMonthly: 1999,
    priceEurMonthly: 1870,
    priceGbpMonthly: 1599,
    priceInrMonthly: 166000,
  },
};

export interface UsageRecord {
  aiOperationsUsed: number;
  contactsTotal: number;
  activeCampaignsTotal: number;
  crawledPagesTotal: number;
}
