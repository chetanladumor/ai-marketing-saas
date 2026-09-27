import { ModelGateway } from '../../model-gateway/cost-router.js';
import { TaskTier } from '../../model-gateway/types.js';
import { AgentState, CampaignPlan, CampaignPlanSchema } from '../types.js';

export class CampaignAgent {
  constructor(private gateway: ModelGateway) {}

  async execute(state: AgentState): Promise<CampaignPlan> {
    const systemPrompt = `You are a Performance Marketing & Paid Advertising Director AI.
Formulate a high-ROAS omnichannel campaign including funnel definitions, ad copy, and email nurture sequences.
Return a STRICT JSON object conforming to this schema:
{
  "funnelStages": {
    "tofuAwareness": string,
    "mofuConsideration": string,
    "bofuConversion": string
  },
  "adCopies": {
    "metaAds": {
      "primaryText": string,
      "headline": string,
      "visualDescription": string,
      "ctaButton": string
    },
    "googleSearchAd": {
      "headlines": [string],
      "descriptions": [string]
    }
  },
  "emailNurtureSequence": [
    {
      "emailNumber": number,
      "delayDays": number,
      "subjectLine": string,
      "previewText": string,
      "bodyOutline": string,
      "primaryCTA": string
    }
  ]
}
Do not include any conversational text outside the JSON object.`;

    const userPrompt = `BUSINESS & RAG DETAILS:
Clinic: ${state.businessContext.businessName}
Location: ${state.businessContext.city}
USPs: ${state.businessContext.usps.join(' | ')}
Services: ${state.businessContext.services.map((s) => s.name).join(', ')}

RAG CONTEXT:
${state.ragContext}

GOAL:
"${state.userPrompt}"

Generate the complete paid advertising and email nurture campaign plan.`;

    const result = await this.gateway.routeCompletion<CampaignPlan>({
      tier: TaskTier.TIER_0_LOCAL_UTILITY,
      options: {
        systemPrompt,
        responseFormat: 'json',
        temperature: 0.2,
      },
      messages: [{ role: 'user', content: userPrompt }],
    });

    const parsed = CampaignPlanSchema.safeParse(result.data);
    if (parsed.success) {
      return parsed.data;
    }

    const raw = (result.data || {}) as any;
    const name = state.businessContext.businessName;
    const city = state.businessContext.city;
    const primaryService = state.businessContext.services[0]?.name || `${name} Service`;
    const usp = state.businessContext.usps[0] || 'Guaranteed Quality and Performance';
    const goal = state.userPrompt;

    return {
      funnelStages: {
        tofuAwareness: raw.funnelStages?.tofuAwareness || `Target audience awareness campaign highlighting common bottlenecks in ${state.businessContext.industry} and how ${name} solves them.`,
        mofuConsideration: raw.funnelStages?.mofuConsideration || `Retarget engaged prospects with verified social proof, feature walkthroughs, and our core guarantee: ${usp}.`,
        bofuConversion: raw.funnelStages?.bofuConversion || `High-conversion limited incentive offering an exclusive onboarding bonus or consultation to achieve "${goal.slice(0, 50)}".`,
      },
      adCopies: {
        metaAds: {
          primaryText: raw.adCopies?.metaAds?.primaryText || `Ready to achieve "${goal.slice(0, 70)}"?\n\nAt ${name}, we built ${primaryService} to deliver real outcomes without the usual headaches.\n\n✨ ${usp}\n✨ Fast Setup & Dedicated Support\n✨ Transparent Pricing with Proven ROI\n\nTap below to get started today!`,
          headline: raw.adCopies?.metaAds?.headline || `Accelerate Your Results with ${name} | ${primaryService}`,
          visualDescription: raw.adCopies?.metaAds?.visualDescription || `Clean, high-contrast visual showcasing ${name}'s core benefit with a bold headline badge: "${usp}"`,
          ctaButton: raw.adCopies?.metaAds?.ctaButton || `Learn More`,
        },
        googleSearchAd: {
          headlines: (Array.isArray(raw.adCopies?.googleSearchAd?.headlines) && raw.adCopies.googleSearchAd.headlines.length > 0)
            ? raw.adCopies.googleSearchAd.headlines
            : [
                `${name} - ${primaryService}`,
                `Achieve Your Goals Faster`,
                `${usp}`,
                `Get Started with ${name}`,
              ],
          descriptions: (Array.isArray(raw.adCopies?.googleSearchAd?.descriptions) && raw.adCopies.googleSearchAd.descriptions.length > 0)
            ? raw.adCopies.googleSearchAd.descriptions
            : [
                `Transform your results with ${primaryService}. Backed by ${usp}.`,
                `Trusted by leaders in ${city !== 'Global' ? city : 'the industry'}. Discover why clients choose ${name}.`,
              ],
        },
      },
      emailNurtureSequence: (Array.isArray(raw.emailNurtureSequence) && raw.emailNurtureSequence.length > 0)
        ? raw.emailNurtureSequence
        : [
            {
              emailNumber: 1,
              delayDays: 0,
              subjectLine: `Welcome to ${name}: Your action plan for ${primaryService}`,
              previewText: `Here is exactly how we help you achieve "${goal.slice(0, 45)}"`,
              bodyOutline: `Warm welcome introducing ${name}, outlining the roadmap for ${primaryService}, and setting expectations for ${usp}.`,
              primaryCTA: `Access Your Free Roadmap`,
            },
            {
              emailNumber: 2,
              delayDays: 2,
              subjectLine: `How our clients overcome the #1 obstacle in ${state.businessContext.industry}`,
              previewText: `Case study & actionable breakdown...`,
              bodyOutline: `Breakdown of common mistakes, how ${name} solves them, and verified customer results.`,
              primaryCTA: `Read the Full Case Study`,
            },
            {
              emailNumber: 3,
              delayDays: 5,
              subjectLine: `Exclusive access: Next step to accelerate your progress with ${name}`,
              previewText: `Only a few priority onboarding slots available this week...`,
              bodyOutline: `Friendly check-in, review of core value proposition (${usp}), and direct invitation to book an introductory call.`,
              primaryCTA: `Claim Your Priority Slot`,
            },
          ],
    };
  }
}
