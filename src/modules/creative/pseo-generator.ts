import { PSEOPage } from './types.js';

export interface PSEOMatrixInput {
  baseUrl: string;
  businessName: string;
  city: string;
  services: string[];
  subLocations: string[];
  serviceDescriptions: Record<string, string>;
  landmarkMap?: Record<string, string[]>;
}

export class PSEOGenerator {
  /**
   * Generates a complete programmatic SEO landing page matrix and XML sitemap
   */
  static generateMatrix(input: PSEOMatrixInput): {
    pages: PSEOPage[];
    sitemapXml: string;
    totalPages: number;
  } {
    const pages: PSEOPage[] = [];

    for (const service of input.services) {
      for (const loc of input.subLocations) {
        const slug = `${this.slugify(service)}-${this.slugify(loc)}`;
        const canonicalUrl = `${input.baseUrl.replace(/\/$/, '')}/treatments/${slug}`;
        const landmarks = input.landmarkMap?.[loc] || [`Near central ${loc} transit`, `${loc} commercial hub`];

        const isApp = input.businessName.toLowerCase().includes('engligenious') || service.toLowerCase().includes('english') || service.toLowerCase().includes('learning') || service.toLowerCase().includes('app');
        
        const page: PSEOPage = {
          slug,
          title: isApp
            ? `${service} for Learners in ${loc} | ${input.businessName} Android App`
            : `Top-Rated ${service} in ${loc}, ${input.city} | ${input.businessName}`,
          metaDescription: isApp
            ? `Master ${service.toLowerCase()} in ${loc}. Download ${input.businessName} on Google Play: 10-minute micro lessons, AI speech feedback, 3,000+ words, and 100% offline practice.`
            : `Looking for ${service.toLowerCase()} in ${loc}? Discover ${input.businessName} for reliable solutions and proven results.`,
          canonicalUrl,
          service,
          location: loc,
          h1: isApp ? `Best ${service} App in ${loc}` : `Best ${service} in ${loc}`,
          introText: isApp
            ? `Learners across ${loc} and ${input.city} rely on ${input.businessName} to master spoken English with 10-minute daily micro-lessons, instant AI pronunciation feedback, and 100% offline practice on Android.`
            : `Clients across ${loc} and ${input.city} trust ${input.businessName} for specialized, dependable ${service.toLowerCase()} designed to deliver measurable results.`,
          localLandmarks: landmarks,
          faqs: isApp
            ? [
                {
                  q: `Is ${input.businessName} free to download for users in ${loc}?`,
                  a: `Yes! ${input.businessName} is 100% free to install on the Google Play Store with no required credit card.`,
                },
                {
                  q: `Can I practice ${service.toLowerCase()} offline in ${loc} without mobile data?`,
                  a: `Absolutely. All lessons, words, and pronunciation practice drills work 100% offline on your device.`,
                },
              ]
            : [
                {
                  q: `How long does ${service.toLowerCase()} take to get started?`,
                  a: `Onboarding takes under 15 minutes with our automated setup.`,
                },
                {
                  q: `Is customer support available for ${loc}?`,
                  a: `Yes, dedicated assistance is provided across ${loc} and surrounding regions.`,
                },
              ],
        };

        pages.push(page);
      }
    }

    const sitemapXml = this.generateSitemapXml(pages);

    return {
      pages,
      sitemapXml,
      totalPages: pages.length,
    };
  }

  private static slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private static generateSitemapXml(pages: PSEOPage[]): string {
    const today = new Date().toISOString().split('T')[0];
    const urls = pages
      .map(
        (p) => `  <url>
    <loc>${p.canonicalUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
      )
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  }
}
