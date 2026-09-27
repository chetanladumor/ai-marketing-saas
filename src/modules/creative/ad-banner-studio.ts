import { AdBannerSpec } from './types.js';

export interface BannerInput {
  brandName: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  badgeText?: string;
  primaryColorHex?: string;
  accentColorHex?: string;
  features?: string[];
}

export class AdBannerStudio {
  /**
   * Generates a complete set of multi-aspect ratio ad graphics (1:1, 9:16, 16:9)
   */
  static generateAdSet(input: BannerInput): AdBannerSpec[] {
    const features = Array.isArray(input.features) && input.features.length >= 2 ? input.features : [
      'High-Performance Solution',
      'Dedicated Real-Time Support',
      'Rapid Onboarding & Setup',
      'Proven Guaranteed Results',
    ];

    const filledInput = { ...input, features };

    return [
      this.generateSquare1x1(filledInput),
      this.generateStory9x16(filledInput),
      this.generateDisplay16x9(filledInput),
    ];
  }

  /**
   * 1:1 Square (1080x1080) - Instagram & Facebook Feeds
   */
  static generateSquare1x1(input: BannerInput): AdBannerSpec {
    const primary = input.primaryColorHex || '#0284c7';
    const accent = input.accentColorHex || '#0d9488';
    const badge = input.badgeText || 'VERIFIED SPECIAL OFFER';
    const feats = input.features || ['Top-Rated Solution', 'Instant Access'];

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <linearGradient id="btnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}" />
      <stop offset="100%" stop-color="${accent}" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="40" result="blur" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1080" height="1080" fill="url(#bgGrad)" />

  <!-- Ambient Light Orbs -->
  <circle cx="200" cy="200" r="250" fill="${primary}" opacity="0.15" filter="url(#glow)" />
  <circle cx="880" cy="880" r="300" fill="${accent}" opacity="0.2" filter="url(#glow)" />

  <!-- Subtle Grid Overlay -->
  <g stroke="rgba(255,255,255,0.03)" stroke-width="1">
    <line x1="0" y1="270" x2="1080" y2="270" />
    <line x1="0" y1="540" x2="1080" y2="540" />
    <line x1="0" y1="810" x2="1080" y2="810" />
    <line x1="270" y1="0" x2="270" y2="1080" />
    <line x1="540" y1="0" x2="540" y2="1080" />
    <line x1="810" y1="0" x2="810" y2="1080" />
  </g>

  <!-- Brand Badge Top -->
  <rect x="80" y="80" width="380" height="60" rx="30" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
  <text x="130" y="118" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="20" font-weight="700" fill="#ffffff" letter-spacing="1">✦ ${input.brandName.slice(0, 20).toUpperCase()}</text>

  <!-- Highlight Pill -->
  <rect x="80" y="240" width="460" height="48" rx="24" fill="${primary}22" stroke="${primary}" stroke-width="1.5" />
  <text x="105" y="271" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="15" font-weight="700" fill="${primary}" letter-spacing="1.5">${badge.slice(0, 35)}</text>

  <!-- Headline -->
  <text x="80" y="380" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="60" font-weight="800" fill="#ffffff">
    <tspan x="80" dy="0">${input.headline.slice(0, 24)}</tspan>
    <tspan x="80" dy="75" fill="${accent}">${input.headline.slice(24, 52) || 'Official Release'}</tspan>
  </text>

  <!-- Subheadline -->
  <text x="80" y="580" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-size="26" font-weight="400" fill="#94a3b8">
    <tspan x="80" dy="0">${input.subheadline.slice(0, 50)}</tspan>
    <tspan x="80" dy="42">${input.subheadline.slice(50, 105)}</tspan>
  </text>

  <!-- Visual Feature Cards Grid -->
  <g transform="translate(80, 680)">
    <rect x="0" y="0" width="440" height="110" rx="20" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
    <text x="30" y="48" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="800" fill="#ffffff">✓ ${feats[0]?.slice(0, 22) || 'Instant Access'}</text>
    <text x="30" y="80" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" fill="#64748b">Verified Core Advantage</text>

    <rect x="480" y="0" width="440" height="110" rx="20" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
    <text x="510" y="48" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="800" fill="#ffffff">✓ ${feats[1]?.slice(0, 22) || 'High Performance'}</text>
    <text x="510" y="80" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" fill="#64748b">Direct Customer Satisfaction</text>
  </g>

  <!-- Bottom CTA Button -->
  <rect x="80" y="880" width="920" height="96" rx="48" fill="url(#btnGrad)" />
  <text x="540" y="940" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="32" font-weight="700" fill="#ffffff" letter-spacing="1">
    ${input.ctaText} →
  </text>
</svg>`;

    return {
      aspectRatio: '1:1',
      width: 1080,
      height: 1080,
      headline: input.headline,
      subheadline: input.subheadline,
      ctaText: input.ctaText,
      brandName: input.brandName,
      primaryColor: primary,
      accentColor: accent,
      svgContent,
    };
  }

  /**
   * 9:16 Vertical Story / Reel (1080x1920) - Instagram Stories, Reels & TikTok
   */
  static generateStory9x16(input: BannerInput): AdBannerSpec {
    const primary = input.primaryColorHex || '#0284c7';
    const accent = input.accentColorHex || '#0d9488';
    const feats = input.features || ['Top-Rated Solution', 'Instant Access', 'Proven Results'];

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920">
  <defs>
    <linearGradient id="storyBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#020617" />
      <stop offset="40%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>
    <linearGradient id="btnGradStory" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}" />
      <stop offset="100%" stop-color="${accent}" />
    </linearGradient>
  </defs>

  <rect width="1080" height="1920" fill="url(#storyBg)" />

  <!-- Top Brand Tag -->
  <text x="540" y="200" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="28" font-weight="700" fill="#94a3b8" letter-spacing="3">✦ ${input.brandName.slice(0, 24).toUpperCase()} ✦</text>

  <!-- Big Central Headline -->
  <text x="540" y="480" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="76" font-weight="800" fill="#ffffff">
    <tspan x="540" dy="0">${input.headline.slice(0, 20)}</tspan>
    <tspan x="540" dy="95" fill="${accent}">${input.headline.slice(20, 45) || 'Now Available'}</tspan>
  </text>

  <!-- Subheadline -->
  <text x="540" y="740" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="32" font-weight="400" fill="#cbd5e1">
    <tspan x="540" dy="0">${input.subheadline.slice(0, 45)}</tspan>
    <tspan x="540" dy="50">${input.subheadline.slice(45, 95)}</tspan>
  </text>

  <!-- Visual Feature Bubbles -->
  <g transform="translate(140, 920)">
    <rect x="0" y="0" width="800" height="130" rx="30" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
    <text x="50" y="58" font-family="'Plus Jakarta Sans', sans-serif" font-size="32" font-weight="800" fill="#ffffff">✓ ${feats[0]?.slice(0, 32) || 'Proven Excellence'}</text>
    <text x="50" y="98" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" fill="#94a3b8">Verified Operational Advantage</text>

    <rect x="0" y="160" width="800" height="130" rx="30" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
    <text x="50" y="218" font-family="'Plus Jakarta Sans', sans-serif" font-size="32" font-weight="800" fill="#ffffff">✓ ${feats[1]?.slice(0, 32) || 'Rapid Onboarding'}</text>
    <text x="50" y="258" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" fill="#94a3b8">Immediate Availability & Setup</text>

    <rect x="0" y="320" width="800" height="130" rx="30" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
    <text x="50" y="378" font-family="'Plus Jakarta Sans', sans-serif" font-size="32" font-weight="800" fill="#ffffff">✓ ${feats[2]?.slice(0, 32) || 'Dedicated Assistance'}</text>
    <text x="50" y="418" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" fill="#94a3b8">100% Satisfaction Guaranteed</text>
  </g>

  <!-- Swipe Up / Tap Button -->
  <rect x="140" y="1600" width="800" height="110" rx="55" fill="url(#btnGradStory)" />
  <text x="540" y="1668" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="36" font-weight="800" fill="#ffffff">
    ${input.ctaText} ↑
  </text>
</svg>`;

    return {
      aspectRatio: '9:16',
      width: 1080,
      height: 1920,
      headline: input.headline,
      subheadline: input.subheadline,
      ctaText: input.ctaText,
      brandName: input.brandName,
      primaryColor: primary,
      accentColor: accent,
      svgContent,
    };
  }

  /**
   * 16:9 Landscape (1200x628) - Google Display Ads & Meta Link Previews
   */
  static generateDisplay16x9(input: BannerInput): AdBannerSpec {
    const primary = input.primaryColorHex || '#0284c7';
    const accent = input.accentColorHex || '#0d9488';
    const feats = input.features || ['Top Solution', 'Instant Access', 'Proven Track Record', '100% Guaranteed'];

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 628" width="1200" height="628">
  <defs>
    <linearGradient id="dispBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="btnDisp" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primary}" />
      <stop offset="100%" stop-color="${accent}" />
    </linearGradient>
  </defs>

  <rect width="1200" height="628" fill="url(#dispBg)" />

  <text x="80" y="90" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" font-weight="700" fill="${accent}" letter-spacing="2">✦ ${input.brandName.slice(0, 24).toUpperCase()}</text>

  <text x="80" y="200" font-family="'Plus Jakarta Sans', sans-serif" font-size="50" font-weight="800" fill="#ffffff">
    <tspan x="80" dy="0">${input.headline.slice(0, 32)}</tspan>
    <tspan x="80" dy="65" fill="${primary}">${input.headline.slice(32, 65) || 'Leading Innovation'}</tspan>
  </text>

  <text x="80" y="370" font-family="'Plus Jakarta Sans', sans-serif" font-size="22" font-weight="400" fill="#94a3b8">
    ${input.subheadline.slice(0, 75)}
  </text>

  <rect x="80" y="460" width="380" height="76" rx="38" fill="url(#btnDisp)" />
  <text x="270" y="508" text-anchor="middle" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="700" fill="#ffffff">
    ${input.ctaText} →
  </text>

  <g transform="translate(740, 160)">
    <rect x="0" y="0" width="380" height="340" rx="30" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />
    <text x="40" y="70" font-family="'Plus Jakarta Sans', sans-serif" font-size="34" font-weight="800" fill="#ffffff">Why Choose Us</text>
    <text x="40" y="130" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" fill="#cbd5e1">✓ ${feats[0]?.slice(0, 30) || 'Industry-Leading Standard'}</text>
    <text x="40" y="180" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" fill="#cbd5e1">✓ ${feats[1]?.slice(0, 30) || 'Rapid Implementation'}</text>
    <text x="40" y="230" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" fill="#cbd5e1">✓ ${feats[2]?.slice(0, 30) || 'Proactive Dedicated Support'}</text>
    <text x="40" y="280" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" fill="#cbd5e1">✓ ${feats[3]?.slice(0, 30) || '100% Quality Guaranteed'}</text>
  </g>
</svg>`;

    return {
      aspectRatio: '16:9',
      width: 1200,
      height: 628,
      headline: input.headline,
      subheadline: input.subheadline,
      ctaText: input.ctaText,
      brandName: input.brandName,
      primaryColor: primary,
      accentColor: accent,
      svgContent,
    };
  }
}

