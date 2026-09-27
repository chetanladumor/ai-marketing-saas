export interface LandingPageInput {
  businessName: string;
  tagline: string;
  heroHeadline: string;
  heroSubheadline: string;
  ctaText: string;
  phone: string;
  address: string;
  services: Array<{
    name: string;
    description: string;
    price: string;
    features: string[];
  }>;
  doctorBio: {
    name: string;
    title: string;
    credentials: string;
  };
  testimonials: Array<{
    patientName: string;
    quote: string;
    rating: number;
    treatment: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  primaryColorHex?: string;
  accentColorHex?: string;
  productType?: string;
  playStoreUrl?: string;
  appRating?: string;
  downloadsCount?: string;
}

export interface AdBannerSpec {
  aspectRatio: '1:1' | '9:16' | '16:9';
  width: number;
  height: number;
  headline: string;
  subheadline: string;
  ctaText: string;
  brandName: string;
  primaryColor: string;
  accentColor: string;
  svgContent: string;
}

export interface PSEOPage {
  slug: string;
  title: string;
  metaDescription: string;
  canonicalUrl: string;
  service: string;
  location: string;
  h1: string;
  introText: string;
  localLandmarks: string[];
  faqs: Array<{ q: string; a: string }>;
}

export interface WhatsAppMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface BookingConfirmation {
  patientName: string;
  phone: string;
  service: string;
  preferredDate: string;
  preferredTime: string;
  status: 'CONFIRMED' | 'PENDING';
  calendarEventId: string;
}
