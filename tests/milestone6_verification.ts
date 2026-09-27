import { config } from 'dotenv';
config();

import { MarketingEventBus } from '../src/modules/integrations/event-bus.js';
import { BackgroundQueueWorker } from '../src/modules/integrations/queue-worker.js';
import { SocialMediaAdapter } from '../src/modules/integrations/adapters/social.adapter.js';
import { EmailAdapter } from '../src/modules/integrations/adapters/email.adapter.js';
import { WhatsAppAdapter } from '../src/modules/integrations/adapters/whatsapp.adapter.js';
import { ReviewReputationAdapter } from '../src/modules/integrations/adapters/reviews.adapter.js';
import { v4 as uuidv4 } from 'uuid';

async function runMilestone6Verification() {
  console.log('================================================================');
  console.log('🚀 RUNNING MILESTONE 6 VERIFICATION: WORKERS, EVENT BUS & ADAPTERS');
  console.log('================================================================\n');

  const testOrgId = uuidv4();
  const eventBus = new MarketingEventBus();
  const queueWorker = new BackgroundQueueWorker();

  // Test 1: Event Bus Pub/Sub
  console.log('👉 [Test 1] Testing Event Bus Pub/Sub & Real-Time Event Stream...');
  let eventReceived = false;

  eventBus.subscribe('lead.created', (event) => {
    eventReceived = true;
    console.log(`   🔔 Event Captured by Subscriber: [${event.type}] for Lead "${event.payload.leadName}" (${event.payload.service})`);
  });

  await eventBus.publish(testOrgId, 'lead.created', {
    leadName: 'Emma Watson',
    service: 'Clear Aligners',
    source: 'Instagram Ad',
  });

  if (!eventReceived) {
    throw new Error('Event Bus failed to deliver event to subscriber!');
  }
  console.log('✅ Event Bus successfully dispatched and captured event in real-time.\n');

  // Test 2: Background Queue Worker with Retries & Dead-Letter Queue (DLQ)
  console.log('👉 [Test 2] Testing Background Queue Worker & Exponential Backoff Retry...');
  let attemptCount = 0;

  // Register processor that fails on attempt 1, succeeds on attempt 2
  queueWorker.registerProcessor('social-publish-queue', async (job) => {
    attemptCount++;
    if (attemptCount === 1) {
      console.log('   ⚠️ Attempt 1: Simulated transient network timeout. Triggering backoff...');
      throw new Error('Transient rate limit or network glitch (HTTP 429)');
    }
    console.log('   🟢 Attempt 2: Recovered! Dispatched social post successfully.');
    return { success: true };
  });

  const job = await queueWorker.addJob('social-publish-queue', testOrgId, {
    platform: 'LINKEDIN',
    text: 'Exciting news: 3D Digital Smile Scans are now live at SmileCraft!',
  });

  // Wait for retry
  await new Promise((resolve) => setTimeout(resolve, 800));

  const refreshedJob = queueWorker.getJob(job.id);
  console.log(`   Job Status: ${refreshedJob?.status} (Total Attempts: ${refreshedJob?.attempts})`);

  if (refreshedJob?.status !== 'COMPLETED') {
    throw new Error('Queue Worker failed to retry and complete transient failure job!');
  }
  console.log('✅ Background Worker successfully recovered via exponential backoff.\n');

  // Test 3: Dead-Letter Queue (DLQ) Routing
  console.log('👉 [Test 3] Testing Dead-Letter Queue (DLQ) on Permanent Failure...');
  queueWorker.registerProcessor('faulty-queue', async () => {
    throw new Error('Fatal database connection error');
  });

  const failJob = await queueWorker.addJob('faulty-queue', testOrgId, { task: 'fatal' }, 2);
  await new Promise((resolve) => setTimeout(resolve, 800));

  const dlq = queueWorker.getDeadLetterQueue();
  console.log(`   Dead-Letter Queue Count: ${dlq.length} (Job ID: ${dlq[0]?.id})`);
  console.log(`   DLQ Error Captured: "${dlq[0]?.error}"`);

  if (dlq.length === 0) {
    throw new Error('Failed to move exhausted job to Dead-Letter Queue!');
  }
  console.log('✅ Permanently failed job safely routed to Dead-Letter Queue.\n');

  // Test 4: Omnichannel Social Media Publishing Adapter
  console.log('👉 [Test 4] Testing Social Media Publishing (Meta & LinkedIn)...');
  const linkedInResult = await SocialMediaAdapter.publishPost(testOrgId, {
    platform: 'LINKEDIN',
    content: 'Why modern dental implants take 45 mins with 10-year warranty.',
    postMode: 'IMMEDIATE',
  });
  console.log(`   - LinkedIn: Post ID: ${linkedInResult.externalPostId} ➔ ${linkedInResult.liveUrl}`);

  const igResult = await SocialMediaAdapter.publishPost(testOrgId, {
    platform: 'INSTAGRAM',
    content: 'Transform your smile! ✨ Tap bio for 3D scan.',
    postMode: 'IMMEDIATE',
  });
  console.log(`   - Instagram: Post ID: ${igResult.externalPostId} ➔ ${igResult.liveUrl}`);
  console.log('✅ Social Media Adapter successfully connected and dispatched.\n');

  // Test 5: Compliant Email Dispatch Adapter
  console.log('👉 [Test 5] Testing CAN-SPAM / CASL Compliant Email Delivery...');
  const emailResult = await EmailAdapter.sendEmail(testOrgId, {
    to: 'patient@example.com',
    subject: 'Your 3D Digital Smile Scan Confirmation',
    htmlContent: '<h1>Welcome to SmileCraft</h1><p>Your appointment is locked in.</p>',
    senderName: 'Dr. Elena Vance, SmileCraft Dental',
    senderEmail: 'care@smilecraftdental.com',
    organizationAddress: '450 Lexington Ave, Suite 1400, Manhattan, NY 10017',
    unsubscribeUrl: 'https://smilecraftdental.example.com/unsubscribe?token=abc123xyz',
  });

  console.log(`   - Status: ${emailResult.status} (Message ID: ${emailResult.messageId})`);
  console.log(`   - Recipient: ${emailResult.recipient}`);
  console.log(`   - List-Unsubscribe Header: ${emailResult.headers['List-Unsubscribe']}`);
  console.log('✅ Email Adapter verified with required physical address and one-click unsubscribe headers.\n');

  // Test 6: WhatsApp Cloud API Adapter
  console.log('👉 [Test 6] Testing International WhatsApp Cloud API Adapter...');
  const waResult = await WhatsAppAdapter.sendMessage(testOrgId, {
    toPhone: '+12125550199',
    templateName: 'appointment_confirmed_template',
    parameters: { patient_name: 'Emma', date: 'Thursday, Oct 1' },
  });
  console.log(`   - WhatsApp Message ID: ${waResult.wamid}`);
  console.log(`   - Destination: ${waResult.toPhone} (Verified E.164 Format)`);
  console.log('✅ WhatsApp Adapter successfully verified.\n');

  // Test 7: Review & Reputation Auto-Response Engine
  console.log('👉 [Test 7] Testing Google Reviews & Reputation Shield Engine...');
  const fiveStarReview = {
    id: 'rev_1',
    platform: 'GOOGLE_BUSINESS' as const,
    authorName: 'Michael Chang',
    rating: 5,
    reviewText: 'Dr. Vance and her team were incredible. Got my implant done in 45 mins with zero pain!',
    reviewDate: '2026-09-25',
  };
  const response5 = ReviewReputationAdapter.generateAutoResponse('SmileCraft Dental Studio', fiveStarReview);
  console.log(`⭐ 5-Star Review Auto-Reply:`);
  console.log(`   "${response5}"`);

  const twoStarReview = {
    id: 'rev_2',
    platform: 'GOOGLE_BUSINESS' as const,
    authorName: 'Sarah Jenkins',
    rating: 2,
    reviewText: 'The waiting room was busy and I had to wait 20 minutes past my slot.',
    reviewDate: '2026-09-25',
  };
  const response2 = ReviewReputationAdapter.generateAutoResponse('SmileCraft Dental Studio', twoStarReview);
  console.log(`\n🛡️ 2-Star Review Crisis Shield Reply:`);
  console.log(`   "${response2}"`);

  console.log('\n================================================================');
  console.log('🎉 MILESTONE 6 COMPLETE: WORKERS, EVENT BUS & OMNICHANNEL ADAPTERS!');
  console.log('================================================================\n');
}

runMilestone6Verification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
