import { ModelGateway } from '../model-gateway/cost-router.js';
import { RAGService } from '../rag/rag-service.js';
import { StrategistAgent } from './specialized/strategist.agent.js';
import { SEOAgent } from './specialized/seo.agent.js';
import { ContentAgent } from './specialized/content.agent.js';
import { CampaignAgent } from './specialized/campaign.agent.js';
import { CompetitorAgent } from './specialized/competitor.agent.js';
import { AgentState, MasterMarketingPlan, MasterMarketingPlanSchema } from './types.js';
import { v4 as uuidv4 } from 'uuid';

export class MarketingOrchestrator {
  private strategistAgent: StrategistAgent;
  private seoAgent: SEOAgent;
  private contentAgent: ContentAgent;
  private campaignAgent: CampaignAgent;
  private competitorAgent: CompetitorAgent;

  constructor(
    private gateway: ModelGateway,
    private ragService: RAGService
  ) {
    this.strategistAgent = new StrategistAgent(gateway);
    this.seoAgent = new SEOAgent(gateway);
    this.contentAgent = new ContentAgent(gateway);
    this.campaignAgent = new CampaignAgent(gateway);
    this.competitorAgent = new CompetitorAgent(gateway);
  }

  /**
   * Executes the multi-agent state pipeline to convert a natural language goal into an executable marketing plan
   */
  async generateMarketingPlan(
    organizationId: string,
    userPrompt: string,
    businessContext: AgentState['businessContext'],
    onProgress?: (step: string, percent: number) => void
  ): Promise<MasterMarketingPlan> {
    onProgress?.('Retrieving business knowledge from RAG...', 10);

    // 1. Retrieve RAG Context
    const ragContextResult = await this.ragService.retrieveContext(organizationId, userPrompt, 4);

    const state: AgentState = {
      organizationId,
      userPrompt,
      businessContext,
      ragContext: ragContextResult.formattedContext,
      citations: ragContextResult.citations,
      errors: [],
    };

    // 2. Step 1: Strategist Agent
    console.log(`[Orchestrator] Step 1: Strategist Agent formulating strategy...`);
    onProgress?.('Strategist Agent formulating core marketing direction...', 25);
    state.strategy = await this.strategistAgent.execute(state);
    console.log(`[Orchestrator] Step 1 complete. Strategy:`, state.strategy?.campaignName);

    // 3. Step 2: SEO & Programmatic SEO Agent
    console.log(`[Orchestrator] Step 2: SEO Agent generating clusters...`);
    onProgress?.('SEO Agent generating local clusters and pSEO matrix...', 45);
    state.seo = await this.seoAgent.execute(state);
    console.log(`[Orchestrator] Step 2 complete. Clusters:`, state.seo?.primaryKeywordClusters?.length);

    // 4. Step 3: Content & Creative Agent
    console.log(`[Orchestrator] Step 3: Content Agent drafting content...`);
    onProgress?.('Content Agent drafting blog, social hooks, and video reel script...', 65);
    state.content = await this.contentAgent.execute(state);
    console.log(`[Orchestrator] Step 3 complete. Reel:`, state.content?.shortFormVideoReel?.title);

    // 5. Step 4: Omnichannel Campaign Agent
    console.log(`[Orchestrator] Step 4: Campaign Agent designing ads & emails...`);
    onProgress?.('Campaign Agent designing ad copies and email nurture sequence...', 80);
    state.campaign = await this.campaignAgent.execute(state);
    console.log(`[Orchestrator] Step 4 complete. Emails:`, state.campaign?.emailNurtureSequence?.length);

    // 6. Step 5: Competitor Radar Agent
    console.log(`[Orchestrator] Step 5: Competitor Agent formulating angles...`);
    onProgress?.('Competitor Agent formulating counter-positioning angles...', 90);
    state.competitorRadar = await this.competitorAgent.execute(state);
    console.log(`[Orchestrator] Step 5 complete.`);

    // 7. Step 6: Assemble and Validate Master Marketing Plan
    onProgress?.('Validating plan structure and finalizing...', 98);

    const masterPlanRaw: MasterMarketingPlan = {
      id: uuidv4(),
      organizationId,
      userPrompt,
      generatedAt: new Date().toISOString(),
      strategy: state.strategy!,
      seo: state.seo!,
      content: state.content!,
      campaign: state.campaign!,
      competitorRadar: state.competitorRadar!,
      status: 'DRAFT',
    };

    const validated = MasterMarketingPlanSchema.parse(masterPlanRaw);
    onProgress?.('Marketing Plan ready for review!', 100);

    return validated;
  }
}
