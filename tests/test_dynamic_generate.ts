import { ModelGateway } from '../src/modules/model-gateway/cost-router.js';
import { RAGService } from '../src/modules/rag/rag-service.js';
import { MarketingOrchestrator } from '../src/modules/agents/orchestrator.js';
import { v4 as uuidv4 } from 'uuid';

async function testDynamic() {
  const gateway = new ModelGateway();
  const ragService = new RAGService(gateway);
  const orchestrator = new MarketingOrchestrator(gateway, ragService);
  const orgId = uuidv4();

  console.log('Testing dynamic plan generation...');
  const prompt = 'I want to attract 50 dental implant patients over the next 30 days in New York with a focus on Manhattan and Brooklyn.';
  const context = {
    businessName: 'SmileCraft Dental Studio',
    industry: 'Cosmetic Dentistry & Implantology',
    city: 'New York',
    country: 'United States',
    services: [
      { name: 'Titanium Dental Implants', description: 'Permanent tooth replacement', estimatedPrice: '$2,200' },
    ],
    usps: ['10-Year Clinical Warranty on Implants', '5-Minute 3D iTero Digital Scan'],
    competitors: ['Apex Smile Clinic'],
    brandTone: 'PROFESSIONAL_EMPATHETIC' as const,
  };

  const plan = await orchestrator.generateMarketingPlan(orgId, prompt, context, (step, pct) => {
    console.log(`[${pct}%] ${step}`);
  });

  console.log('Generated Campaign:', plan.strategy.campaignName);
  console.log('Personas Count:', plan.strategy.targetPersonas.length);
  console.log('SEO Clusters:', plan.seo.primaryKeywordClusters.length);
}

testDynamic().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
