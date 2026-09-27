import fs from "fs";
import path from "path";

export interface BrandProfile {
  companyName: string;
  productType: string;
  industry: string;
  websiteUrl: string;
  playStoreUrl: string;
  targetAudience: string;
  primaryLocation: string;
  valueProposition: string;
  keyFeatures: string[];
  brandTone: string;
}

export interface ChannelIntegrations {
  mode: "SANDBOX" | "PRODUCTION";
  linkedin: {
    enabled: boolean;
    accessToken: string;
    organizationUrn: string;
    status: "CONNECTED" | "DISCONNECTED";
  };
  meta: {
    enabled: boolean;
    pageAccessToken: string;
    instagramAccountId: string;
    status: "CONNECTED" | "DISCONNECTED";
  };
  email: {
    enabled: boolean;
    provider: "SENDGRID" | "RESEND" | "SMTP";
    apiKey: string;
    fromEmail: string;
    fromName: string;
    status: "CONNECTED" | "DISCONNECTED";
  };
  googleAds: {
    enabled: boolean;
    customerId: string;
    conversionId: string;
    status: "CONNECTED" | "DISCONNECTED";
  };
  playStore: {
    enabled: boolean;
    packageName: string;
    playStoreUrl: string;
    status: "CONNECTED" | "DISCONNECTED";
  };
  webhook: {
    enabled: boolean;
    webhookUrl: string;
    status: "CONNECTED" | "DISCONNECTED";
  };
}

export interface SystemSettings {
  brandProfile: BrandProfile;
  integrations: ChannelIntegrations;
}

const SETTINGS_FILE = path.join(process.cwd(), "data", "company_settings.json");

const DEFAULT_SETTINGS: SystemSettings = {
  brandProfile: {
    companyName: "Engligenious",
    productType: "Android Mobile App / EdTech",
    industry: "Spoken English & Micro-Learning",
    websiteUrl: "https://engligenious.app",
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.engligenious.app",
    targetAudience: "Non-native English speakers, job seekers, and college students seeking fluency",
    primaryLocation: "Global (India, LATAM, Southeast Asia, Middle East)",
    valueProposition: "Master spoken English in 10 minutes a day with AI pronunciation feedback, 3,000+ words, and 100% offline practice mode.",
    keyFeatures: [
      "10 Minutes / Day Gamified Daily Streak Lessons",
      "AI-Powered Speech & Pronunciation Evaluation",
      "3,000+ High-Frequency English Words with Audio",
      "100% Offline Mode (No Internet Required)",
    ],
    brandTone: "Inspirational, Friendly & Action-Oriented",
  },
  integrations: {
    mode: "SANDBOX",
    linkedin: {
      enabled: true,
      accessToken: "li_at_sandbox_demo_token",
      organizationUrn: "urn:li:organization:91823746",
      status: "CONNECTED",
    },
    meta: {
      enabled: true,
      pageAccessToken: "eaab_sandbox_meta_graph_token",
      instagramAccountId: "17841400000000001",
      status: "CONNECTED",
    },
    email: {
      enabled: true,
      provider: "RESEND",
      apiKey: "re_sandbox_test_key_84920",
      fromEmail: "growth@engligenious.app",
      fromName: "Engligenious Onboarding Team",
      status: "CONNECTED",
    },
    googleAds: {
      enabled: false,
      customerId: "849-204-1920",
      conversionId: "AW-94819204",
      status: "DISCONNECTED",
    },
    playStore: {
      enabled: true,
      packageName: "com.engligenious.app",
      playStoreUrl: "https://play.google.com/store/apps/details?id=com.engligenious.app",
      status: "CONNECTED",
    },
    webhook: {
      enabled: false,
      webhookUrl: "https://hooks.zapier.com/hooks/catch/sample/marketing/",
      status: "DISCONNECTED",
    },
  },
};

export class SettingsStore {
  private static cachedSettings: SystemSettings | null = null;

  static getSettings(): SystemSettings {
    if (this.cachedSettings) return this.cachedSettings;

    try {
      if (fs.existsSync(SETTINGS_FILE)) {
        const raw = fs.readFileSync(SETTINGS_FILE, "utf-8");
        this.cachedSettings = JSON.parse(raw);
        return this.cachedSettings!;
      }
    } catch (e) {
      console.warn("Failed to load settings file, using defaults:", e);
    }

    this.cachedSettings = { ...DEFAULT_SETTINGS };
    this.saveSettings(this.cachedSettings);
    return this.cachedSettings;
  }

  static saveSettings(settings: SystemSettings): void {
    try {
      const dir = path.dirname(SETTINGS_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), "utf-8");
      this.cachedSettings = settings;
    } catch (e) {
      console.error("Failed to save settings file:", e);
    }
  }

  static updateBrandProfile(profile: Partial<BrandProfile>): BrandProfile {
    const current = this.getSettings();
    current.brandProfile = { ...current.brandProfile, ...profile };
    this.saveSettings(current);
    return current.brandProfile;
  }

  static updateIntegrations(integrations: Partial<ChannelIntegrations>): ChannelIntegrations {
    const current = this.getSettings();
    current.integrations = { ...current.integrations, ...integrations };
    this.saveSettings(current);
    return current.integrations;
  }
}
