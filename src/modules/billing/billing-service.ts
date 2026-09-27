import { SubscriptionTier } from '../tenancy/types.js';
import { PLAN_ENTITLEMENTS, PlanEntitlements, UsageRecord } from './types.js';

export class BillingService {
  private orgUsage: Map<string, UsageRecord> = new Map();
  private orgTiers: Map<string, SubscriptionTier> = new Map();

  constructor() {}

  setOrgTier(organizationId: string, tier: SubscriptionTier): void {
    this.orgTiers.set(organizationId, tier);
  }

  getOrgTier(organizationId: string): SubscriptionTier {
    return this.orgTiers.get(organizationId) || 'GROWTH';
  }

  getEntitlements(tier: SubscriptionTier): PlanEntitlements {
    return PLAN_ENTITLEMENTS[tier];
  }

  getUsage(organizationId: string): UsageRecord {
    return (
      this.orgUsage.get(organizationId) || {
        aiOperationsUsed: 0,
        contactsTotal: 0,
        activeCampaignsTotal: 0,
        crawledPagesTotal: 0,
      }
    );
  }

  recordAiOperation(organizationId: string, count: number = 1): void {
    const current = this.getUsage(organizationId);
    current.aiOperationsUsed += count;
    this.orgUsage.set(organizationId, current);
  }

  /**
   * Evaluates if the organization has remaining quota for the requested operation
   */
  checkEntitlement(
    organizationId: string,
    action: 'AI_OPERATION' | 'ADD_CONTACT' | 'CREATE_CAMPAIGN' | 'CRAWL_PAGE',
    quantity: number = 1
  ): { allowed: boolean; reason?: string; current: number; limit: number } {
    const tier = this.getOrgTier(organizationId);
    const entitlements = this.getEntitlements(tier);
    const usage = this.getUsage(organizationId);

    switch (action) {
      case 'AI_OPERATION':
        if (usage.aiOperationsUsed + quantity > entitlements.maxAiOperationsMonthly) {
          return {
            allowed: false,
            reason: `Monthly AI operation quota exceeded (${usage.aiOperationsUsed}/${entitlements.maxAiOperationsMonthly}). Please upgrade your plan.`,
            current: usage.aiOperationsUsed,
            limit: entitlements.maxAiOperationsMonthly,
          };
        }
        return {
          allowed: true,
          current: usage.aiOperationsUsed,
          limit: entitlements.maxAiOperationsMonthly,
        };

      case 'CREATE_CAMPAIGN':
        if (usage.activeCampaignsTotal + quantity > entitlements.maxActiveCampaigns) {
          return {
            allowed: false,
            reason: `Active campaign limit reached (${usage.activeCampaignsTotal}/${entitlements.maxActiveCampaigns}).`,
            current: usage.activeCampaignsTotal,
            limit: entitlements.maxActiveCampaigns,
          };
        }
        return {
          allowed: true,
          current: usage.activeCampaignsTotal,
          limit: entitlements.maxActiveCampaigns,
        };

      default:
        return { allowed: true, current: 0, limit: 999999 };
    }
  }

  /**
   * Processes a Stripe subscription upgrade webhook
   */
  handleStripeWebhook(event: { type: string; organizationId: string; newTier: SubscriptionTier }): {
    success: boolean;
    previousTier: SubscriptionTier;
    newTier: SubscriptionTier;
  } {
    if (event.type === 'customer.subscription.updated' || event.type === 'checkout.session.completed') {
      const prev = this.getOrgTier(event.organizationId);
      this.setOrgTier(event.organizationId, event.newTier);
      return {
        success: true,
        previousTier: prev,
        newTier: event.newTier,
      };
    }
    return {
      success: false,
      previousTier: this.getOrgTier(event.organizationId),
      newTier: this.getOrgTier(event.organizationId),
    };
  }

  formatPrice(tier: SubscriptionTier, currency: string): string {
    const ent = this.getEntitlements(tier);
    switch (currency.toUpperCase()) {
      case 'EUR':
        return `€${ent.priceEurMonthly}/mo`;
      case 'GBP':
        return `£${ent.priceGbpMonthly}/mo`;
      case 'INR':
        return `₹${ent.priceInrMonthly.toLocaleString()}/mo`;
      default:
        return `$${ent.priceUsdMonthly}/mo`;
    }
  }
}
