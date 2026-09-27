import { config } from 'dotenv';
config();

import { ModelGateway } from '../src/modules/model-gateway/cost-router.js';
import { RAGService } from '../src/modules/rag/rag-service.js';
import { MarketingOrchestrator } from '../src/modules/agents/orchestrator.js';
import { v4 as uuidv4 } from 'uuid';

async function runMilestone3Verification() {
  console.log('================================================================');
  console.log('🚀 RUNNING MILESTONE 3 VERIFICATION: LANGGRAPH MULTI-AGENT ENGINE');
  console.log('================================================================\n');

  const testOrgId = uuidv4();
  const gateway = new ModelGateway();
  const ragService = new RAGService(gateway);

  // 1. Seed Business Knowledge into RAG
  console.log('👉 [Step 1] Ingesting Practice Knowledge into RAG...');
  await ragService.ingestDocument({
    organizationId: testOrgId,
    title: 'SmileCraft Dental Practice Guide',
    sourceType: 'PDF',
    content: `
SmileCraft Dental specializes in Titanium Dental Implants ($2,200 single, $14,500 All-on-4) and Clear Aligners ($3,500).
We provide a 10-Year Clinical Warranty on all dental implants.
Our workflow uses 5-minute 3D iTero digital scans with zero radiation and computer-guided placement.
Financing is available at 0% interest for 12/24 months.
Competitors often charge hidden crown fees and use painful physical impression goop.
    `,
  });
  console.log('✅ Knowledge base indexed successfully.\n');

  // 2. Initialize Multi-Agent Orchestrator
  console.log('👉 [Step 2] Initializing Multi-Agent Orchestrator (5 Specialized Agents)...');
  const orchestrator = new MarketingOrchestrator(gateway, ragService);

  const businessContext = {
    businessName: 'SmileCraft Dental Studio',
    industry: 'Healthcare / Cosmetic Dentistry',
    city: 'New York',
    country: 'United States',
    services: [
      { name: 'Dental Implants', description: 'Permanent tooth replacement', estimatedPrice: '$2,200' },
      { name: 'Clear Aligners', description: 'Invisible straightening', estimatedPrice: '$3,500' },
    ],
    usps: [
      '10-Year Clinical Warranty on Implants',
      '3D Computer Guided Placement in under 45 mins',
      '0% Interest Financing for 24 Months',
    ],
    competitors: ['Apex Smile Clinic', 'Manhattan Dental Express'],
    brandTone: 'PROFESSIONAL_EMPATHETIC',
  };

  const userGoal = 'I want to attract 50 dental implant patients over the next 30 days in New York with a focus on Manhattan and Brooklyn.';

  console.log(`🎯 Goal Prompt: "${userGoal}"\n`);
  console.log('⏳ Running Multi-Agent Pipeline...');

  const startTime = Date.now();
  const plan = await orchestrator.generateMarketingPlan(
    testOrgId,
    userGoal,
    businessContext,
    (step, percent) => {
      console.log(`   [${percent}%] ${step}`);
    }
  );

  const totalTime = Date.now() - startTime;

  // 3. Inspect Generated Multi-Agent Deliverables
  console.log('\n================================================================');
  console.log('📋 GENERATED MASTER MARKETING PLAN INSPECTION:');
  console.log('================================================================');

  console.log('\n1️⃣ STRATEGY:');
  console.log(`   Campaign Name: ${plan.strategy.campaignName}`);
  console.log(`   Core Value Prop: ${plan.strategy.coreValueProposition}`);
  console.log(`   Budget Allocation:`, JSON.stringify(plan.strategy.budgetAllocation));
  console.log(`   Target KPIs:`, plan.strategy.targetKPIs.map((k) => `${k.metric}: ${k.targetValue}`).join(' | '));

  console.log('\n2️⃣ SEO & PROGRAMMATIC SEO:');
  console.log(`   Primary Clusters: ${plan.seo.primaryKeywordClusters.map((c) => c.clusterName).join(', ')}`);
  console.log(`   pSEO Target Pages: ${plan.seo.programmaticSEOMatrix.totalGeneratedPagesTarget} pages across locations (${plan.seo.programmaticSEOMatrix.locations.join(', ')})`);
  console.log(`   Sample pSEO Title: "${plan.seo.programmaticSEOMatrix.samplePageTitles[0]}"`);

  console.log('\n3️⃣ CONTENT & CREATIVE:');
  console.log(`   Blog Post Title: "${plan.content.blogPost.title}"`);
  console.log(`   Social Posts: ${plan.content.socialPosts.length} drafted (${plan.content.socialPosts.map((s) => s.platform).join(', ')})`);
  console.log(`   Short-Form Reel: "${plan.content.shortFormVideoReel.title}" (${plan.content.shortFormVideoReel.durationSeconds}s)`);
  console.log(`   Reel Hook: "${plan.content.shortFormVideoReel.hookVisualAndAudio}"`);

  console.log('\n4️⃣ CAMPAIGN & ADVERTISING:');
  console.log(`   Meta Ad Headline: "${plan.campaign.adCopies.metaAds.headline}"`);
  console.log(`   Google Search Headlines: ${plan.campaign.adCopies.googleSearchAd.headlines.slice(0, 2).join(' | ')}`);
  console.log(`   Email Nurture Sequence: ${plan.campaign.emailNurtureSequence.length} automated steps`);
  plan.campaign.emailNurtureSequence.forEach((em) => {
    console.log(`     - Email ${em.emailNumber} (Day ${em.delayDays}): "${em.subjectLine}" ➔ CTA: ${em.primaryCTA}`);
  });

  console.log('\n5️⃣ COMPETITOR RADAR:');
  console.log(`   Differentiation Pillars: ${plan.competitorRadar.differentiationPillars.slice(0, 2).join(' | ')}`);
  console.log(`   Counter-Messaging Action: "${plan.competitorRadar.counterMessagingAction}"`);

  console.log(`\n⏱️ Total Execution Time: ${totalTime}ms`);
  console.log(`🔒 Plan Status: ${plan.status} (Ready for Human-in-the-Loop Approval in Milestone 4)`);

  console.log('\n================================================================');
  console.log('🎉 MILESTONE 3 COMPLETE: LANGGRAPH MULTI-AGENT ENGINE OPERATIONAL!');
  console.log('================================================================\n');
}

runMilestone3Verification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
