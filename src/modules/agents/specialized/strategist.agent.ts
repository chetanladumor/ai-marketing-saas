import { ModelGateway } from '../../model-gateway/cost-router.js';
import { TaskTier } from '../../model-gateway/types.js';
import { AgentState, StrategicPlan, StrategicPlanSchema } from '../types.js';

export class StrategistAgent {
  constructor(private gateway: ModelGateway) {}

  async execute(state: AgentState): Promise<StrategicPlan> {
    const systemPrompt = `You are a world-class Marketing Strategist AI.
Analyze the user's objective, business profile, and RAG knowledge to formulate an actionable marketing strategy.
Return a STRICT JSON object conforming to this schema:
{
  "campaignName": string,
  "primaryObjective": string,
  "targetPersonas": [
    {
      "name": string,
      "demographics": string,
      "painPoints": [string],
      "motivation": string
    }
  ],
  "coreValueProposition": string,
  "budgetAllocation": { "ChannelName": "Percentage%" },
  "targetKPIs": [
    { "metric": string, "targetValue": string }
  ]
}
Do not include any conversational markdown or explanations outside the JSON object.`;

    const userPrompt = `BUSINESS PROFILE:
Name: ${state.businessContext.businessName}
Industry: ${state.businessContext.industry}
Location: ${state.businessContext.city}, ${state.businessContext.country}
USPs: ${state.businessContext.usps.join(', ')}

BUSINESS KNOWLEDGE (RAG):
${state.ragContext}

USER OBJECTIVE:
"${state.userPrompt}"

Generate the comprehensive strategic plan in JSON.`;

    // Tier 0/1 for cost-efficiency, falls back gracefully
    const result = await this.gateway.routeCompletion<StrategicPlan>({
      tier: TaskTier.TIER_0_LOCAL_UTILITY,
      options: {
        systemPrompt,
        responseFormat: 'json',
        temperature: 0.2,
      },
      messages: [{ role: 'user', content: userPrompt }],
    });

    const parsed = StrategicPlanSchema.safeParse(result.data);
    if (parsed.success) {
      return parsed.data;
    }

    const raw = (result.data || {}) as any;
    const name = state.businessContext.businessName;
    const city = state.businessContext.city;
    const primaryService = state.businessContext.services[0]?.name || `${name} Solution`;
    const usp = state.businessContext.usps[0] || 'Guaranteed Performance and Dedicated Support';

    return {
      campaignName: raw.campaignName || `${name} 30-Day Growth Accelerator`,
      primaryObjective: raw.primaryObjective || state.userPrompt,
      targetPersonas: (Array.isArray(raw.targetPersonas) && raw.targetPersonas.length > 0)
        ? raw.targetPersonas
        : [
            {
              name: `Target Decision Makers & Users`,
              demographics: `Core demographic in ${city !== 'Global' ? city : 'global digital market'} looking for ${primaryService}`,
              painPoints: [
                `Struggling with slow, manual processes in ${state.businessContext.industry}`,
                `Frustrated with unpredictable costs and hidden fees`,
                `Need a reliable, verified solution backed by real guarantees`,
              ],
              motivation: `Accelerate progress toward "${state.userPrompt.slice(0, 60)}" with peace of mind`,
            },
          ],
      coreValueProposition: raw.coreValueProposition || usp,
      budgetAllocation: raw.budgetAllocation || { 'Meta Ads': '40%', 'Google Ads': '35%', 'SEO & Content': '25%' },
      targetKPIs: (Array.isArray(raw.targetKPIs) && raw.targetKPIs.length > 0)
        ? raw.targetKPIs
        : [
            { metric: 'New Qualified Inquiries', targetValue: '50-100 targets' },
            { metric: 'Target CPA / Conversion Cost', targetValue: '< $35' },
            { metric: 'Conversion Rate', targetValue: '> 18%' },
          ],
    };
  }
}
