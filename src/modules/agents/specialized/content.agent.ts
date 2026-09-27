import { ModelGateway } from '../../model-gateway/cost-router.js';
import { TaskTier } from '../../model-gateway/types.js';
import { AgentState, ContentPlan, ContentPlanSchema } from '../types.js';

export class ContentAgent {
  constructor(private gateway: ModelGateway) {}

  async execute(state: AgentState): Promise<ContentPlan> {
    const systemPrompt = `You are an elite Creative Content & Social Media Director AI.
Generate engaging, conversion-driven content grounded in the client's business RAG context and brand voice.
Return a STRICT JSON object conforming to this schema:
{
  "blogPost": {
    "title": string,
    "seoMetaDescription": string,
    "targetKeyword": string,
    "outline": [string]
  },
  "socialPosts": [
    {
      "platform": "LINKEDIN" | "INSTAGRAM" | "FACEBOOK" | "X",
      "hook": string,
      "content": string,
      "hashtags": [string],
      "callToAction": string
    }
  ],
  "shortFormVideoReel": {
    "title": string,
    "durationSeconds": number,
    "hookVisualAndAudio": string,
    "bodyScenes": [
      {
        "sceneNumber": number,
        "visualPrompt": string,
        "spokenScript": string,
        "onScreenText": string
      }
    ],
    "cta": string
  }
}
Do not include any text outside the JSON object.`;

    const userPrompt = `BRAND CONTEXT:
Name: ${state.businessContext.businessName}
Tone: ${state.businessContext.brandTone}
USPs: ${state.businessContext.usps.join(' | ')}

RAG KNOWLEDGE BASE:
${state.ragContext}

GOAL:
"${state.userPrompt}"

Generate the complete Content Plan (Blog, Social Posts, and Video Reel Script).`;

    const result = await this.gateway.routeCompletion<ContentPlan>({
      tier: TaskTier.TIER_0_LOCAL_UTILITY,
      options: {
        systemPrompt,
        responseFormat: 'json',
        temperature: 0.3,
      },
      messages: [{ role: 'user', content: userPrompt }],
    });

    const parsed = ContentPlanSchema.safeParse(result.data);
    if (parsed.success) {
      return parsed.data;
    }

    // Dynamic synthesis derived entirely from user's business context & goal
    const raw = (result.data || {}) as any;
    const name = state.businessContext.businessName;
    const primaryService = state.businessContext.services[0]?.name || `${name} Solution`;
    const usp = state.businessContext.usps[0] || 'Guaranteed Performance and Quality';
    const city = state.businessContext.city;
    const goal = state.userPrompt;

    return {
      blogPost: {
        title: raw.blogPost?.title || `The Definitive Guide to ${primaryService}: How ${name} Drives Real Results`,
        seoMetaDescription: raw.blogPost?.seoMetaDescription || `Discover how ${name} helps you achieve "${goal.slice(0, 80)}" with ${usp}. Read our comprehensive playbook.`,
        targetKeyword: raw.blogPost?.targetKeyword || `${primaryService.toLowerCase()} ${city !== 'Global' ? city.toLowerCase() : 'guide'}`,
        outline: (Array.isArray(raw.blogPost?.outline) && raw.blogPost.outline.length > 0)
          ? raw.blogPost.outline
          : [
              `1. The Changing Landscape of ${state.businessContext.industry}`,
              `2. Key Challenges Faced and Why Traditional Methods Fall Short`,
              `3. How ${name} Delivers a Measurable Advantage with ${usp}`,
              `4. Step-by-Step Implementation Framework & Real-World Timeline`,
              `5. Expected ROI, Milestones, and Next Steps to Get Started`,
            ],
      },
      socialPosts: (Array.isArray(raw.socialPosts) && raw.socialPosts.length > 0)
        ? raw.socialPosts.map((p: any) => ({
            platform: (['LINKEDIN', 'INSTAGRAM', 'FACEBOOK', 'X'].includes(p.platform) ? p.platform : 'LINKEDIN') as any,
            hook: p.hook || `How we help clients achieve "${goal.slice(0, 60)}" faster:`,
            content: p.content || `Traditional approaches in ${state.businessContext.industry} waste too much time.\n\nAt ${name}, we focus on: ${usp}.\n\nReady to see what is possible? Let's connect!`,
            hashtags: Array.isArray(p.hashtags) ? p.hashtags : [`#${name.replace(/\s+/g, '')}`, '#Growth', '#Innovation'],
            callToAction: p.callToAction || `Learn more at ${name} or send us a direct message today!`,
          }))
        : [
            {
              platform: 'LINKEDIN',
              hook: `Most teams struggle with ${primaryService.toLowerCase()}. Here is what actually moves the needle:`,
              content: `To achieve goals like "${goal.slice(0, 60)}", you need a systematic strategy.\n\nAt ${name}, we built our approach around: ${usp}.\n\nConsistency and execution beat guesswork every single time.`,
              hashtags: [`#${name.replace(/\s+/g, '')}`, '#Leadership', '#BusinessGrowth', '#Strategy'],
              callToAction: `Reach out to our team or tap the link to explore our playbook.`,
            },
            {
              platform: 'INSTAGRAM',
              hook: `Want better results without the overwhelm? ✨ Here is how ${name} helps you win:`,
              content: `Swipe ➡️ to see the 3-step breakdown:\n\n1️⃣ Clear strategic audit\n2️⃣ Implementation of ${primaryService}\n3️⃣ Measurable outcome: ${usp}\n\nNo wasted budget. Just clear progress.`,
              hashtags: [`#${name.replace(/\s+/g, '')}`, '#GrowthJourney', '#DailyMotivation', '#Results'],
              callToAction: `DM us 'START' to get your tailored action plan! 📲`,
            },
          ],
      shortFormVideoReel: {
        title: raw.shortFormVideoReel?.title || `How ${name} Solves ${primaryService} in 30 Seconds`,
        durationSeconds: typeof raw.shortFormVideoReel?.durationSeconds === 'number' ? raw.shortFormVideoReel.durationSeconds : 30,
        hookVisualAndAudio: raw.shortFormVideoReel?.hookVisualAndAudio || `Dynamic screen record with bold overlay: "If you want ${goal.slice(0, 50)}, stop doing this mistake..."`,
        bodyScenes: (Array.isArray(raw.shortFormVideoReel?.bodyScenes) && raw.shortFormVideoReel.bodyScenes.length > 0)
          ? raw.shortFormVideoReel.bodyScenes
          : [
              {
                sceneNumber: 1,
                visualPrompt: `Presenter showing problem visually with animated highlight`,
                spokenScript: `Most people spend weeks trying to do this manually.`,
                onScreenText: `The Old Way: Inefficient & Slow`,
              },
              {
                sceneNumber: 2,
                visualPrompt: `Fast-paced showcase of ${name} and ${primaryService}`,
                spokenScript: `Here is how ${name} streamlines the entire workflow with ${usp}.`,
                onScreenText: `${usp}`,
              },
              {
                sceneNumber: 3,
                visualPrompt: `Clear result dashboard showing dramatic positive transformation`,
                spokenScript: `Now you get consistent, reliable results without the headache.`,
                onScreenText: `Results Guaranteed • Get Started Today`,
              },
            ],
        cta: raw.shortFormVideoReel?.cta || `Comment 'GROW' or tap the bio link to get started with ${name}!`,
      },
    };
  }
}
