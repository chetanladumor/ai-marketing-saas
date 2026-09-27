import { config } from 'dotenv';
config();

import { LandingPageGenerator } from '../src/modules/creative/landing-page-generator.js';
import { AdBannerStudio } from '../src/modules/creative/ad-banner-studio.js';
import { PSEOGenerator } from '../src/modules/creative/pseo-generator.js';
import { WhatsAppBookingAgent } from '../src/modules/creative/whatsapp-booking-agent.js';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function runMilestone5Verification() {
  console.log('================================================================');
  console.log('🚀 RUNNING MILESTONE 5 VERIFICATION: ADVANCED CREATIVE & EXECUTION');
  console.log('================================================================\n');

  const distDir = path.resolve(process.cwd(), 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 1. Test Landing Page Generator
  console.log('👉 [Test 1] Generating Responsive Tailwind CSS Landing Page & Schema.org Markup...');
  const landingPageHtml = LandingPageGenerator.generateHTML({
    businessName: 'SmileCraft Dental Studio',
    tagline: 'Modern Implant & Aesthetic Dentistry',
    heroHeadline: 'Restore Your Confident Smile in 45 Minutes',
    heroSubheadline: 'Experience computer-guided titanium dental implants with zero radiation 3D scanning, 0% financing, and our 10-Year Clinical Warranty.',
    ctaText: 'Claim Your 3D Scan & Consultation',
    phone: '+1 (212) 555-0144',
    address: '450 Lexington Ave, Suite 1400, Manhattan, NY 10017',
    services: [
      {
        name: 'Titanium Dental Implants',
        description: 'Permanent single tooth or full-arch replacement using Grade 5 titanium.',
        price: '$2,200',
        features: ['10-Year Clinical Warranty', 'Custom Zirconia Abutment Included', 'CBCT Guided Precision Placement'],
      },
      {
        name: 'Invisible Clear Aligners',
        description: 'Custom 3D-printed orthodontic trays for discreet teeth straightening.',
        price: '$3,500',
        features: ['5-Minute Digital Impression', 'All Trays Included', '2 Post-Treatment Retainer Sets'],
      },
      {
        name: '1-Hour Laser Whitening',
        description: 'In-office professional dental laser smile brightening.',
        price: '$450',
        features: ['Up to 8 Shades Whiter', 'Zero Tooth Sensitivity Formulation', 'Same-Day Instant Results'],
      },
    ],
    doctorBio: {
      name: 'Dr. Elena Vance, DDS, MS',
      title: 'Chief Periodontist & Implant Surgeon',
      credentials: 'Master of Science in Periodontology from Columbia University with over 15 years experience and 3,500+ successful implant surgeries.',
    },
    testimonials: [
      {
        patientName: 'David K., Manhattan',
        quote: 'I delayed getting my implant for 3 years because I was terrified of pain. Dr. Vance was incredible—I was back at work the next morning with zero swelling.',
        rating: 5,
        treatment: 'Single Dental Implant',
      },
    ],
    faqs: [
      {
        question: 'How long does the dental implant procedure take?',
        answer: 'With our 3D computer-guided surgical planning, the actual fixture placement takes under 45 minutes under gentle local anesthesia.',
      },
      {
        question: 'What is included in the $2,200 all-inclusive price?',
        answer: 'Everything: the initial 3D digital scan, the medical-grade Grade 5 titanium implant, the custom zirconia abutment, the porcelain crown, and our 10-year warranty.',
      },
    ],
  });

  const landingPagePath = path.join(distDir, 'generated_landing_page.html');
  fs.writeFileSync(landingPagePath, landingPageHtml, 'utf-8');
  console.log(`✅ Landing Page successfully generated and saved to: ${landingPagePath}`);
  console.log(`   - Size: ${(landingPageHtml.length / 1024).toFixed(1)} KB`);
  console.log(`   - Includes Schema.org JSON-LD LocalBusiness markup: ${landingPageHtml.includes('application/ld+json') ? 'YES' : 'NO'}\n`);

  // 2. Test AI Visual Ad Creative & Banner Studio
  console.log('👉 [Test 2] Generating Multi-Aspect Ratio Visual Ad Set (1:1, 9:16, 16:9)...');
  const adBanners = AdBannerStudio.generateAdSet({
    brandName: 'SmileCraft Dental',
    headline: 'Permanent Dental Implants in 45 Mins',
    subheadline: 'Grade 5 Titanium • 10-Year Clinical Warranty • 0% Financing',
    ctaText: 'Claim Free 3D Scan',
    badgeText: '10-YEAR WARRANTY • $2,200 ALL-IN',
  });

  for (const banner of adBanners) {
    const filename = `ad_banner_${banner.aspectRatio.replace(':', 'x')}.svg`;
    const bannerPath = path.join(distDir, filename);
    fs.writeFileSync(bannerPath, banner.svgContent, 'utf-8');
    console.log(`   - [${banner.aspectRatio}] ${banner.width}x${banner.height}px saved to: ${bannerPath}`);
  }
  console.log('✅ Visual ad set generated for Instagram Feed, Stories/Reels, and Google Display Ads.\n');

  // 3. Test Programmatic SEO (pSEO) Matrix & Sitemap Generator
  console.log('👉 [Test 3] Generating Programmatic SEO (pSEO) Matrix & XML Sitemap...');
  const pseoResult = PSEOGenerator.generateMatrix({
    baseUrl: 'https://smilecraftdental.example.com',
    businessName: 'SmileCraft Dental Studio',
    city: 'New York',
    services: ['Dental Implants', 'Clear Aligners', 'Laser Whitening'],
    subLocations: ['Manhattan', 'Brooklyn', 'Soho', 'Williamsburg'],
    serviceDescriptions: {
      'Dental Implants': 'Permanent titanium tooth replacement',
      'Clear Aligners': 'Invisible straightening',
      'Laser Whitening': '1-hour smile brightening',
    },
    landmarkMap: {
      Manhattan: ['Grand Central Terminal', 'Bryant Park'],
      Brooklyn: ['Downtown Brooklyn', 'DUMBO Waterfront'],
      Soho: ['Prince Street Broadway', 'Spring Street'],
      Williamsburg: ['Bedford Avenue', 'North 6th Street'],
    },
  });

  const sitemapPath = path.join(distDir, 'sitemap.xml');
  fs.writeFileSync(sitemapPath, pseoResult.sitemapXml, 'utf-8');

  console.log(`✅ Generated ${pseoResult.totalPages} unique localized landing page packages.`);
  console.log(`   Sample pSEO Title: "${pseoResult.pages[0].title}"`);
  console.log(`   Sample pSEO URL: ${pseoResult.pages[0].canonicalUrl}`);
  console.log(`   Sample Local Landmarks: ${pseoResult.pages[0].localLandmarks.join(', ')}`);
  console.log(`   - Sitemap XML saved to: ${sitemapPath} (${pseoResult.pages.length} URLs indexed)\n`);

  // 4. Test WhatsApp Business AI Conversational Booking Agent
  console.log('👉 [Test 4] Testing Conversational WhatsApp AI Booking Agent...');
  const bookingAgent = new WhatsAppBookingAgent();
  const patientPhone = '+12125550188';

  // Turn 1: Patient asks about implants
  console.log('💬 Patient: "Hi! I have a missing tooth and want to know about your dental implants."');
  const response1 = await bookingAgent.handleIncomingMessage(patientPhone, 'Hi! I have a missing tooth and want to know about your dental implants.');
  console.log(`🤖 Agent: "${response1.reply.split('\n')[0]}..."`);

  // Turn 2: Patient prefers Thursday morning
  console.log('\n💬 Patient: "Thursday morning works great for me."');
  const response2 = await bookingAgent.handleIncomingMessage(patientPhone, 'Thursday morning works great for me.');
  console.log(`🤖 Agent: "${response2.reply.split('\n')[0]}..."`);

  // Turn 3: Patient chooses 10:00 AM slot
  console.log('\n💬 Patient: "Let\'s do 10:00 AM please."');
  const response3 = await bookingAgent.handleIncomingMessage(patientPhone, "Let's do 10:00 AM please.");
  console.log(`🤖 Agent:\n${response3.reply}\n`);

  if (!response3.bookingConfirmed) {
    throw new Error('Expected confirmed booking payload from WhatsApp booking agent!');
  }

  console.log('📅 Calendar Event Payload Generated:');
  console.log(JSON.stringify(response3.bookingConfirmed, null, 2));

  console.log('\n================================================================');
  console.log('🎉 MILESTONE 5 COMPLETE: ADVANCED CREATIVE & EXECUTION ENGINES!');
  console.log('================================================================\n');
}

runMilestone5Verification().catch((err) => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
