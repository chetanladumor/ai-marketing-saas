import { config } from 'dotenv';
config();

import { AttributionEngine } from '../src/modules/analytics/attribution-engine.js';
import { OptimizationAgent } from '../src/modules/analytics/optimization.agent.js';
import { ModelGateway } from '../src/modules/model-gateway/cost-router.js';
import { AnalyticsEvent, MarketingChannel } from '../src/modules/analytics/types.js';
import { v4 as uuidv4 } from 'uuid';

async function runMilestone8Verification() {
  console.log('================================================================');
  console.log('🚀 RUNNING MILESTONE 8 VERIFICATION: AI ANALYTICS & SELF-OPTIMIZATION');
  console.log('================================================================\n');

  const testOrgId = uuidv4();
  const gateway = new ModelGateway();
  const optimizationAgent = new OptimizationAgent(gateway);

  // 1. Generate Realistic Multi-Channel Marketing Events
  console.log('👉 [Step 1] Ingesting Multi-Channel Event Stream (Traffic, Clicks, Conversions)...');
  const events: AnalyticsEvent[] = [];

  // Meta Ads traffic
  for (let i = 0; i < 180; i++) {
    events.push({
      id: uuidv4(),
      organizationId: testOrgId,
      eventType: 'AD_CLICK',
      channel: 'META_ADS',
      userIdOrSession: `user_meta_${i % 40}`,
      device: i % 3 === 0 ? 'DESKTOP' : 'MOBILE',
      pageUrl: 'https://smilecraftdental.example.com/implant-offer',
      utmCampaign: 'implant_growth_accelerator',
      timestamp: new Date(Date.now() - (180 - i) * 3600000).toISOString(),
    });
  }

  // 12 Meta conversions
  for (let i = 0; i < 12; i++) {
    events.push({
      id: uuidv4(),
      organizationId: testOrgId,
      eventType: 'APPOINTMENT_BOOKED',
      channel: 'META_ADS',
      userIdOrSession: `user_meta_${i * 3}`,
      device: 'MOBILE',
      pageUrl: 'https://smilecraftdental.example.com/implant-offer',
      revenueUsd: 2200,
      timestamp: new Date(Date.now() - (12 - i) * 7200000).toISOString(),
    });
  }

  // Google Search traffic
  for (let i = 0; i < 110; i++) {
    events.push({
      id: uuidv4(),
      organizationId: testOrgId,
      eventType: 'AD_CLICK',
      channel: 'GOOGLE_SEARCH',
      userIdOrSession: `user_google_${i % 30}`,
      device: 'DESKTOP',
      pageUrl: 'https://smilecraftdental.example.com/treatments/dental-implants-manhattan',
      timestamp: new Date(Date.now() - (110 - i) * 3600000).toISOString(),
    });
  }

  // 9 Google conversions
  for (let i = 0; i < 9; i++) {
    events.push({
      id: uuidv4(),
      organizationId: testOrgId,
      eventType: 'APPOINTMENT_BOOKED',
      channel: 'GOOGLE_SEARCH',
      userIdOrSession: `user_google_${i * 2}`,
      device: 'DESKTOP',
      pageUrl: 'https://smilecraftdental.example.com/treatments/dental-implants-manhattan',
      revenueUsd: 2200,
      timestamp: new Date(Date.now() - (9 - i) * 7200000).toISOString(),
    });
  }

  // WhatsApp Conversational bookings
  for (let i = 0; i < 45; i++) {
    events.push({
      id: uuidv4(),
      organizationId: testOrgId,
      eventType: 'PAGEVIEW',
      channel: 'WHATSAPP',
      userIdOrSession: `user_wa_${i % 15}`,
      device: 'MOBILE',
      pageUrl: 'https://wa.me/smilecraft',
      timestamp: new Date(Date.now() - (45 - i) * 1800000).toISOString(),
    });
  }
  for (let i = 0; i < 18; i++) {
    events.push({
      id: uuidv4(),
      organizationId: testOrgId,
      eventType: 'APPOINTMENT_BOOKED',
      channel: 'WHATSAPP',
      userIdOrSession: `user_wa_${i}`,
      device: 'MOBILE',
      pageUrl: 'https://wa.me/smilecraft',
      revenueUsd: 2200,
      timestamp: new Date(Date.now() - (18 - i) * 3600000).toISOString(),
    });
  }

  console.log(`✅ Ingested ${events.length} multi-touch marketing events.\n`);

  // 2. Compute Performance Metrics
  console.log('👉 [Step 2] Computing Channel Performance & Return on Ad Spend (ROAS)...');
  const spendMap: Partial<Record<MarketingChannel, number>> = {
    META_ADS: 950.0,
    GOOGLE_SEARCH: 820.0,
    SEO_ORGANIC: 250.0,
    WHATSAPP: 85.0,
  };

  const channelMetrics = AttributionEngine.computeChannelMetrics(events, spendMap);

  console.log('📊 CHANNEL PERFORMANCE REPORT:');
  console.log('-----------------------------------------------------------------------------------------------');
  console.log('CHANNEL          | CLICKS | CONV | SPEND ($) | REVENUE ($) | CVR (%) | CPA ($) | ROAS (x)');
  console.log('-----------------------------------------------------------------------------------------------');
  channelMetrics.forEach((m) => {
    console.log(
      `${m.channel.padEnd(16)} | ${String(m.clicks).padEnd(6)} | ${String(m.conversions).padEnd(4)} | $${String(m.adSpendUsd).padEnd(8)} | $${String(m.revenueUsd).padEnd(10)} | ${String(m.conversionRatePercent).padEnd(7)} | $${String(m.cpaUsd).padEnd(6)} | ${m.roasRatio}x`
    );
  });
  console.log('-----------------------------------------------------------------------------------------------\n');

  // 3. Multi-Touch Journey Reconstruction
  console.log('👉 [Step 3] Reconstructing Patient Multi-Touch Journeys...');
  const journeys = AttributionEngine.reconstructJourneys(events);
  console.log(`✅ Identified ${journeys.length} converted multi-touch customer journeys.`);
  journeys.slice(0, 3).forEach((j, i) => {
    console.log(`   [Journey ${i + 1}] Lead: ${j.leadName}`);
    console.log(`       First Touch: ${j.firstTouchChannel} ➔ Last Touch: ${j.lastTouchChannel}`);
    console.log(`       Touches: ${j.totalTouches} | Converted Value: $${j.convertedRevenueUsd}`);
  });

  // 4. Proactive Optimization Agent
  console.log('\n👉 [Step 4] Running Proactive AI Optimization & Anomaly Detection Agent...');
  const recommendations = await optimizationAgent.analyzeAndRecommend(testOrgId, channelMetrics);

  console.log('\n================================================================');
  console.log('💡 AI OPTIMIZATION RECOMMENDATIONS:');
  console.log('================================================================');
  recommendations.forEach((rec, idx) => {
    console.log(`\nRecommendation [${idx + 1}]: "${rec.title}"`);
    console.log(`Channel: ${rec.channel} | Risk Level: ${rec.riskLevel}`);
    console.log(`⚠️ Observed Anomaly: ${rec.observedAnomaly}`);
    console.log(`🔍 Root Cause Analysis: ${rec.rootCauseAnalysis}`);
    console.log(`🧪 Proposed A/B Experiment:`);
    console.log(`   - Control (Variant A): "${rec.proposedExperiment.variantA}"`);
    console.log(`   - Challenger (Variant B): "${rec.proposedExperiment.variantB}"`);
    console.log(`   - Budget Reallocation: Shift ${rec.proposedExperiment.budgetReallocationPercent}% budget to Challenger`);
    console.log(`📈 Estimated Business Impact: ${rec.estimatedImpact}`);
    console.log(`🚦 Status: ${rec.status} (Requires Human Approval: ${rec.requiresApproval})`);
  });

  console.log('\n================================================================');
  console.log('🎉 MILESTONE 8 COMPLETE: AI ANALYTICS & SELF-OPTIMIZATION OPERATIONAL!');
  console.log('================================================================\n');
}

runMilestone8Verification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
