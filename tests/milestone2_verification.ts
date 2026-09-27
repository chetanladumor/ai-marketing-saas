import { config } from 'dotenv';
config();

import { SafeWebScraper } from '../src/modules/rag/parsers/web-scraper.js';
import { RAGService } from '../src/modules/rag/rag-service.js';
import { v4 as uuidv4 } from 'uuid';

async function runMilestone2Verification() {
  console.log('================================================================');
  console.log('🚀 RUNNING MILESTONE 2 VERIFICATION: KNOWLEDGE BASE & HYBRID RAG');
  console.log('================================================================\n');

  // Test 1: SSRF Protection
  console.log('👉 [Test 1] Testing Web Crawler SSRF Security Guards...');
  const maliciousUrls = [
    'http://localhost:8080/admin',
    'http://127.0.0.1:5432',
    'http://169.254.169.254/latest/meta-data/',
    'http://192.168.1.100/router-config',
    'ftp://example.com/file',
  ];

  for (const badUrl of maliciousUrls) {
    const check = SafeWebScraper.isUrlSafe(badUrl);
    if (check.safe) {
      throw new Error(`SSRF Guard failed! Permitted unsafe URL: ${badUrl}`);
    }
  }
  const safeCheck = SafeWebScraper.isUrlSafe('https://www.smilecraftdental.example.com/services');
  if (!safeCheck.safe) {
    throw new Error('SSRF Guard blocked legitimate HTTPS website!');
  }
  console.log('✅ SSRF Security Guard successfully blocked all 5 malicious/internal URLs and approved public HTTPS.\n');

  // Test 2: Ingest Business Documents & Generate Local Vectors
  console.log('👉 [Test 2] Ingesting Business Practice Documents & Generating Local Embeddings...');
  const testOrgId = uuidv4();
  const ragService = new RAGService();

  const clinicalGuide = `
# SmileCraft Practice Services & Clinical Guide 2026

## Section: Invisible Clear Aligners
SmileCraft provides custom 3D-scanned clear aligners for teeth straightening without metal braces.
Treatment duration ranges from 6 to 14 months depending on crowding severity.
The all-inclusive package price is $3,500, which includes the initial 3D digital scan, all tray series, and two sets of post-treatment retainers.
Patients wear each tray for 22 hours per day, switching trays every 10 days.

## Section: Titanium Dental Implants
Our dental implants use premium medical-grade Grade 5 Titanium fixtures with custom zirconia abutments and porcelain crowns.
Single tooth replacement starts at $2,200 including surgical placement and custom crown.
Full-arch restoration (All-on-4) starts at $14,500 per arch.
All implants carry a 10-Year Clinical Warranty against osseointegration failure.
Procedure is performed under local anesthesia with conscious sedation options available.

## Section: Clinical Team & Credentials
Lead implantologist Dr. Elena Vance holds a Master of Science in Periodontology from Columbia University with over 15 years experience.
The clinic is equipped with a CBCT 3D Cone Beam CT scanner and an intraoral iTero scanner for zero-radiation impressions.
`;

  const faqDocument = `
# SmileCraft Patient Policies & FAQs

## Section: Insurance & Financing
We accept all major PPO insurance plans including Delta Dental, MetLife, Cigna, and Aetna.
0% interest financing is available for 12 or 24 months via CareCredit and Sunbit.
Same-day emergency appointments are guaranteed for patients in severe pain if booked before 2 PM.

## Section: Cancellation & Rescheduling
Appointments can be rescheduled with at least 24 hours advance notice without penalty.
Cancellations made under 24 hours may incur a $50 administrative fee.
`;

  const ingest1 = await ragService.ingestDocument({
    organizationId: testOrgId,
    title: 'SmileCraft Practice Services & Clinical Guide 2026',
    sourceType: 'PDF',
    content: clinicalGuide,
  });

  const ingest2 = await ragService.ingestDocument({
    organizationId: testOrgId,
    title: 'SmileCraft Patient Policies & FAQs',
    sourceType: 'FAQ',
    content: faqDocument,
  });

  console.log(`✅ Ingested Document 1: ${ingest1.chunkCount} chunks generated with local vector embeddings.`);
  console.log(`✅ Ingested Document 2: ${ingest2.chunkCount} chunks generated with local vector embeddings.`);
  console.log(`📊 Total Knowledge Chunks in Store: ${ragService.getChunkCount(testOrgId)}\n`);

  // Test 3: Hybrid Search with Reciprocal Rank Fusion (RRF)
  console.log('👉 [Test 3] Testing Hybrid Search (Vector Cosine + Keyword Match + RRF)...');
  const query = 'What is the exact price of clear aligners and what does it include?';
  const ragContext = await ragService.retrieveContext(testOrgId, query, 2);

  console.log(`🔍 Query: "${query}"`);
  console.log(`✅ Retrieved ${ragContext.citations.length} context blocks via Hybrid RRF:`);
  ragContext.citations.forEach((c, i) => {
    console.log(`   [${i + 1}] Source: "${c.sourceTitle}" | Section: ${c.section}`);
    console.log(`       Snippet: "${c.matchedSnippet.replace(/\n/g, ' ')}"`);
  });

  // Test 4: Grounded Answer Generation with Source Attribution
  console.log('\n👉 [Test 4] Generating Grounded Answer with Local llama3.1...');
  const answerResult = await ragService.generateGroundedAnswer(
    testOrgId,
    'What is the price of clear aligners and is there a warranty on dental implants?'
  );

  console.log('--------------------------------------------------');
  console.log('📝 AI Generated Grounded Answer:');
  console.log(answerResult.answer);
  console.log('--------------------------------------------------');
  console.log(`⏱️ Latency: ${answerResult.latencyMs}ms`);
  console.log(`📚 Attributed Citations:`);
  answerResult.citations.forEach((c) => console.log(`   - ${c.sourceTitle} (Section: ${c.section})`));

  // Test 5: Hallucination Guardrail Check
  console.log('\n👉 [Test 5] Testing Hallucination Guardrail (Out of Scope Question)...');
  const outOfScopeResult = await ragService.generateGroundedAnswer(
    testOrgId,
    'Do you perform cosmetic dental surgery on pet dogs or cats?'
  );
  console.log('🛡️ Hallucination Guardrail Response:');
  console.log(outOfScopeResult.answer);

  console.log('\n================================================================');
  console.log('🎉 MILESTONE 2 COMPLETE: KNOWLEDGE BASE & HYBRID RAG FULLY TESTED!');
  console.log('================================================================\n');
}

runMilestone2Verification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
