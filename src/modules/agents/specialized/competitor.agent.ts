import { ModelGateway } from '../../model-gateway/cost-router.js';
import { TaskTier } from '../../model-gateway/types.js';
import { AgentState, CompetitorCounterStrategy, CompetitorCounterStrategySchema } from '../types.js';

export class CompetitorAgent {
  constructor(private gateway: ModelGateway) {}

  async execute(state: AgentState): Promise<CompetitorCounterStrategy> {
    const systemPrompt = `You are a Competitive Intelligence & Market Positioning AI.
Analyze known competitors, extract market gaps, and formulate sharp differentiation angles.
Return a STRICT JSON object conforming to this schema:
{
  "competitorWeaknessesIdentified": [string],
  "differentiationPillars": [string],
  "counterMessagingAction": string
}
Do not include any conversational text outside the JSON object.`;

    const userPrompt = `CLIENT BUSINESS:
Name: ${state.businessContext.businessName}
USPs: ${state.businessContext.usps.join(' | ')}
Known Competitors: ${state.businessContext.competitors.join(', ') || 'General corporate dental chains'}

Generate the competitive counter-positioning strategy in JSON.`;

    const result = await this.gateway.routeCompletion<CompetitorCounterStrategy>({
      tier: TaskTier.TIER_0_LOCAL_UTILITY,
      options: {
        systemPrompt,
        responseFormat: 'json',
        temperature: 0.2,
      },
      messages: [{ role: 'user', content: userPrompt }],
    });

    const parsed = CompetitorCounterStrategySchema.safeParse(result.data);
    if (parsed.success) {
      return parsed.data;
    }

    const raw = (result.data || {}) as any;
    const name = state.businessContext.businessName;
    const competitors = state.businessContext.competitors.length > 0 
      ? state.businessContext.competitors 
      : ['Legacy Alternatives', 'Incumbent Providers'];
    const usps = state.businessContext.usps.length > 0
      ? state.businessContext.usps
      : ['Rapid execution with guaranteed performance', 'Transparent pricing model', 'Dedicated client success'];

    return {
      competitorWeaknessesIdentified: (Array.isArray(raw.competitorWeaknessesIdentified) && raw.competitorWeaknessesIdentified.length > 0)
        ? raw.competitorWeaknessesIdentified
        : [
            `${competitors[0] || 'Competitors'} rely on outdated, cumbersome workflows that delay time-to-value`,
            `Opaque pricing structures and hidden charges commonly reported across legacy market alternatives`,
            `Slow customer feedback loops and lack of modern automated guarantees`,
          ],
      differentiationPillars: (Array.isArray(raw.differentiationPillars) && raw.differentiationPillars.length > 0)
        ? raw.differentiationPillars
        : [
            `Proprietary Focus: ${usps[0]}`,
            `Radical Transparency: Upfront clear pricing with zero hidden operational overhead`,
            `Execution Speed: ${usps[1] || 'Modern, high-velocity customer onboarding'}`,
          ],
      counterMessagingAction: raw.counterMessagingAction || `Launch a counter-positioning campaign: "Tired of slow, complicated legacy options? Switch to ${name} for ${usps[0]} and get started in minutes."`,
    };
  }
}
