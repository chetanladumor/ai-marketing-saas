import { ModelGateway } from '../../model-gateway/cost-router.js';
import { TaskTier } from '../../model-gateway/types.js';
import { AgentState, SEOStrategy, SEOStrategySchema } from '../types.js';

export class SEOAgent {
  constructor(private gateway: ModelGateway) {}

  async execute(state: AgentState): Promise<SEOStrategy> {
    const systemPrompt = `You are a Senior SEO & Programmatic SEO (pSEO) Specialist AI.
Formulate an actionable organic search strategy based on the business services and target location.
Return a STRICT JSON object conforming to this schema:
{
  "primaryKeywordClusters": [
    {
      "clusterName": string,
      "searchIntent": "INFORMATIONAL" | "NAVIGATIONAL" | "COMMERCIAL" | "TRANSACTIONAL",
      "keywords": [string]
    }
  ],
  "localSEOTactics": [string],
  "programmaticSEOMatrix": {
    "services": [string],
    "locations": [string],
    "totalGeneratedPagesTarget": number,
    "samplePageTitles": [string]
  }
}
Do not include any conversational text outside the JSON object.`;

    const userPrompt = `BUSINESS CONTEXT:
Name: ${state.businessContext.businessName}
City: ${state.businessContext.city}, ${state.businessContext.country}
Services: ${state.businessContext.services.map((s) => s.name).join(', ')}
Objective: ${state.userPrompt}

Generate the complete SEO & Programmatic SEO plan.`;

    const result = await this.gateway.routeCompletion<SEOStrategy>({
      tier: TaskTier.TIER_0_LOCAL_UTILITY,
      options: {
        systemPrompt,
        responseFormat: 'json',
        temperature: 0.2,
      },
      messages: [{ role: 'user', content: userPrompt }],
    });

    const parsed = SEOStrategySchema.safeParse(result.data);
    if (parsed.success) {
      return parsed.data;
    }

    const raw = (result.data || {}) as any;
    const name = state.businessContext.businessName;
    const city = state.businessContext.city;
    const isGlobal = city === 'Global' || city.toLowerCase().includes('worldwide');
    const subLocations = isGlobal 
      ? ['North America', 'United Kingdom', 'Europe', 'Asia Pacific']
      : [`Downtown ${city}`, `North ${city}`, `Central ${city}`, `Metro Area`];
    const services = state.businessContext.services.map((s) => s.name).slice(0, 3);
    if (services.length === 0) services.push(`${name} Core Solution`, 'Premium Service');

    const primaryService = services[0];
    const secondaryService = services[1] || `${name} Platform`;

    return {
      primaryKeywordClusters: (Array.isArray(raw.primaryKeywordClusters) && raw.primaryKeywordClusters.length > 0)
        ? raw.primaryKeywordClusters
        : [
            {
              clusterName: `High-Intent ${primaryService} Searches`,
              searchIntent: 'TRANSACTIONAL',
              keywords: [
                `${primaryService.toLowerCase()}`,
                `best ${primaryService.toLowerCase()} ${!isGlobal ? city.toLowerCase() : 'online'}`,
                `${primaryService.toLowerCase()} pricing and reviews`,
              ],
            },
            {
              clusterName: `${secondaryService} Discovery & Inquiries`,
              searchIntent: 'COMMERCIAL',
              keywords: [
                `${secondaryService.toLowerCase()} guide`,
                `how to get started with ${primaryService.toLowerCase()}`,
                `top ${state.businessContext.industry.toLowerCase()} solutions`,
              ],
            },
          ],
      localSEOTactics: (Array.isArray(raw.localSEOTactics) && raw.localSEOTactics.length > 0)
        ? raw.localSEOTactics
        : [
            `Claim and verify digital entity profile for "${name}" under category "${state.businessContext.industry.split('/')[0].trim()}"`,
            `Publish structured weekly thought-leadership posts highlighting real client outcomes`,
            `Deploy Product/Organization Schema.org JSON-LD structured data across all service pages`,
            `Build high-authority directory citations and strategic backlink partnerships in ${state.businessContext.industry}`,
          ],
      programmaticSEOMatrix: {
        services,
        locations: subLocations,
        totalGeneratedPagesTarget: services.length * subLocations.length,
        samplePageTitles: (Array.isArray(raw.programmaticSEOMatrix?.samplePageTitles) && raw.programmaticSEOMatrix.samplePageTitles.length > 0)
          ? raw.programmaticSEOMatrix.samplePageTitles
          : [
              `Top-Rated ${services[0]} in ${subLocations[0]} | ${name}`,
              `Affordable ${secondaryService} in ${subLocations[1]} | Official ${name}`,
              `${services[0]} Solutions across ${subLocations[2]}`,
            ],
      },
    };
  }
}
