import { z } from 'zod';

export const SubscriptionTierEnum = z.enum(['STARTER', 'GROWTH', 'AGENCY', 'ENTERPRISE']);
export type SubscriptionTier = z.infer<typeof SubscriptionTierEnum>;

export const UserRoleEnum = z.enum(['OWNER', 'ADMIN', 'MARKETER', 'CONTENT_CREATOR', 'VIEWER']);
export type UserRole = z.infer<typeof UserRoleEnum>;

export const ModelModeEnum = z.enum(['LOCAL_ONLY', 'COST_SAVER_HYBRID', 'MAX_PERFORMANCE']);
export type ModelMode = z.infer<typeof ModelModeEnum>;

// Organization Schema (Global Multi-Tenant)
export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2, 'Organization name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must be URL-safe (lowercase, numbers, dashes)'),
  countryCode: z.string().length(2, 'Country code must be 2-letter ISO (e.g., US, GB, IN, DE)'),
  currency: z.string().length(3, 'Currency must be 3-letter ISO (e.g., USD, EUR, GBP, INR)'),
  timezone: z.string().min(3, 'Timezone must be a valid IANA timezone (e.g., America/New_York)'),
  defaultLanguage: z.string().default('en-US'),
  subscriptionTier: SubscriptionTierEnum.default('GROWTH'),
  modelMode: ModelModeEnum.default('COST_SAVER_HYBRID'),
  compliance: z.object({
    gdprCompliant: z.boolean().default(true),
    ccpaCompliant: z.boolean().default(true),
    canSpamCompliant: z.boolean().default(true),
  }),
  channelsEnabled: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(true),
    whatsapp: z.boolean().default(true),
    metaSocial: z.boolean().default(true),
    linkedIn: z.boolean().default(true),
    xSocial: z.boolean().default(true),
    googleBusiness: z.boolean().default(true),
  }),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type Organization = z.infer<typeof OrganizationSchema>;

// Business Profile Schema
export const ServiceItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  targetAudience: z.string().optional(),
  estimatedPrice: z.string().optional(),
});

export const BusinessProfileSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  businessName: z.string().min(1),
  industry: z.string(),
  websiteUrl: z.string().url().optional(),
  city: z.string(),
  stateOrRegion: z.string(),
  country: z.string(),
  targetAudience: z.string(),
  services: z.array(ServiceItemSchema).default([]),
  uniqueSellingPoints: z.array(z.string()).default([]),
  competitors: z.array(z.string()).default([]),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});
export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;

// Brand Voice Schema
export const BrandVoiceSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  tone: z.enum(['PROFESSIONAL_EMPATHETIC', 'BOLD_ENERGETIC', 'AUTHORITATIVE_EXECUTIVE', 'FRIENDLY_CASUAL', 'INNOVATIVE_TECH']),
  styleGuidelines: z.string(),
  forbiddenWords: z.array(z.string()).default([]),
  keyPhrases: z.array(z.string()).default([]),
  createdAt: z.date().default(() => new Date()),
});
export type BrandVoice = z.infer<typeof BrandVoiceSchema>;
