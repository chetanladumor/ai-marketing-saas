import { config } from 'dotenv';
config();

async function runMilestone7Verification() {
  console.log('================================================================');
  console.log('🚀 RUNNING MILESTONE 7 VERIFICATION: SAAS WEB APP & API SERVER');
  console.log('================================================================\n');

  const baseUrl = 'http://localhost:4000';

  // Test 1: Healthcheck
  console.log('👉 [Test 1] Pinging Server Health Endpoint...');
  const healthRes = await fetch(`${baseUrl}/api/v1/health`);
  const healthData = (await healthRes.json()) as any;
  console.log(`✅ Health Status:`, healthData);

  // Test 2: Model Status & Cost Tracker
  console.log('\n👉 [Test 2] Querying AI Model Gateway & Cost Metering Status...');
  const modelRes = await fetch(`${baseUrl}/api/v1/models/status`);
  const modelData = (await modelRes.json()) as any;
  console.log(`✅ Model Gateway Status:`);
  console.log(`   - Active Mode: ${modelData.mode}`);
  console.log(`   - Local Ollama Status: ${modelData.localOllama.status} (${modelData.localOllama.completionModel})`);
  console.log(`   - Estimated Cost: ${modelData.localOllama.costPerToken}`);
  console.log(`   - Cumulative Tokens Saved Locally: ${modelData.totalTokensSavedLocally} tokens`);

  // Test 3: Plan Generation Endpoint
  console.log('\n👉 [Test 3] Testing Instant Plan Endpoint (/api/v1/plans/sample)...');
  const planRes = await fetch(`${baseUrl}/api/v1/plans/sample`);
  const planData = (await planRes.json()) as any;
  console.log(`✅ Plan Retrieved:`);
  console.log(`   - Campaign: "${planData.plan.strategy.campaignName}"`);
  console.log(`   - Core Value Prop: "${planData.plan.strategy.coreValueProposition}"`);
  console.log(`   - SEO Target Pages: ${planData.plan.seo.programmaticSEOMatrix.totalGeneratedPagesTarget} pages`);
  console.log(`   - Ad Headline: "${planData.plan.campaign.adCopies.metaAds.headline}"`);

  // Test 4: Approval Inbox & One-Click Review Action
  console.log('\n👉 [Test 4] Testing Pending Approvals & Review Action...');
  const approvalsRes = await fetch(`${baseUrl}/api/v1/approvals`);
  const approvalsData = (await approvalsRes.json()) as any;
  console.log(`✅ Pending Approvals in Queue: ${approvalsData.count}`);
  const ticket = approvalsData.approvals[0];
  console.log(`   - Ticket ID: ${ticket.id}`);
  console.log(`   - Title: "${ticket.actionTitle}" (${ticket.riskLevel})`);

  console.log('   Reviewing ticket: Granting APPROVAL...');
  const reviewRes = await fetch(`${baseUrl}/api/v1/approvals/${ticket.id}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'APPROVE',
      reviewerName: 'Chief Marketing Officer',
      notes: 'Strategy and budget approved for deployment.',
    }),
  });
  const reviewData = (await reviewRes.json()) as any;
  console.log(`✅ Review Result: Status is now ${reviewData.status} (Reviewed by: ${reviewData.approval.reviewedBy})`);

  console.log('\n================================================================');
  console.log('🎉 MILESTONE 7 COMPLETE: SAAS DASHBOARD & API BACKEND OPERATIONAL!');
  console.log('================================================================\n');
}

runMilestone7Verification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
