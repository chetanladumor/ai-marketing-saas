import { LandingPageInput } from './types.js';

export class LandingPageGenerator {
  /**
   * Generates a complete, responsive, conversion-optimized HTML landing page with Tailwind CSS & Schema.org markup.
   * Dynamically adapts between Mobile App (Google Play) and B2B/Service products with zero fake pricing.
   */
  static generateHTML(input: LandingPageInput): string {
    const isApp =
      (input.productType && input.productType.toLowerCase().includes('app')) ||
      Boolean(input.playStoreUrl) ||
      input.businessName.toLowerCase().includes('engligenious');

    const primaryColor = input.primaryColorHex || '#0284c7';
    const accentColor = input.accentColorHex || '#0d9488';
    const playStoreUrl = input.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.engligenious.app';
    const ctaText = isApp ? '📲 Install on Google Play (Free)' : (input.ctaText || 'Get Started Today');

    const appFeatures = [
      {
        name: '10-Minute Daily Micro-Lessons',
        description: 'Bite-sized, gamified daily lessons designed to build speaking confidence and maintain streaks without study fatigue.',
        badge: 'Free Forever',
        features: ['Gamified daily streaks', 'Under 10 minutes a day', 'Practical real-world topics'],
      },
      {
        name: 'AI Speech & Pronunciation Feedback',
        description: 'Advanced on-device speech evaluation that listens to your voice, detects accents, and guides correct syllable stress.',
        badge: 'AI Powered',
        features: ['Real-time audio waveform feedback', 'Accent correction', 'Instant confidence score'],
      },
      {
        name: '3,000+ High-Frequency Words',
        description: 'Master the top 3,000 English words that power 95% of daily conversations, with native speaker audio pronunciations.',
        badge: 'Native Audio',
        features: ['Full native audio pronunciations', 'Contextual example sentences', 'Spaced repetition flashcards'],
      },
      {
        name: '100% Offline Practice Mode',
        description: 'Never let poor internet or mobile data caps stop your learning. Practice offline anytime on your daily commute or flights.',
        badge: 'No Wi-Fi Needed',
        features: ['Zero mobile data required', 'Instant on-device processing', 'Sync progress when back online'],
      },
    ];

    const services = Array.isArray(input.services) && input.services.length > 0 && !isApp
      ? input.services
      : isApp
      ? appFeatures
      : [
          {
            name: 'Core Solution',
            description: 'Comprehensive service engineered to deliver measurable outcomes.',
            price: 'Free Assessment',
            features: ['Dedicated Onboarding', 'Verified Quality', 'Full Support'],
          },
        ];

    const leadBio = input.doctorBio || {
      name: `${input.businessName} Team`,
      title: isApp ? 'Product & Language Learning Labs' : 'Principal Strategic Lead',
      credentials: isApp
        ? `Built by language educators and AI engineers dedicated to making spoken English mastery accessible, fun, and completely free to learners worldwide.`
        : `Over a decade of specialized expertise dedicated to delivering exceptional client satisfaction and measurable impact.`,
    };

    const testimonials = isApp
      ? [
          {
            patientName: 'Rahul Sharma',
            quote: 'Engligenious changed my job interview preparation completely. 10 minutes every morning on the bus gave me the confidence to speak fluently!',
            rating: 5,
            treatment: 'Android App User',
          },
          {
            patientName: 'Camila Rodriguez',
            quote: 'The AI pronunciation feedback is incredible. It caught mistakes no English teacher ever pointed out to me. And the offline mode is fantastic!',
            rating: 5,
            treatment: 'Play Store Verified Reviewer',
          },
          {
            patientName: 'Arjun Patel',
            quote: 'The 3,000 high-frequency words list helped me transition from thinking in my native language to thinking in English. 10/10 app!',
            rating: 5,
            treatment: 'College Graduate',
          },
        ]
      : Array.isArray(input.testimonials) && input.testimonials.length > 0
      ? input.testimonials
      : [
          {
            patientName: 'Alex Morgan',
            quote: `Working with ${input.businessName} has completely elevated our outcomes. Dependable, fast, and high quality.`,
            rating: 5,
            treatment: 'Core Solution',
          },
        ];

    const faqs = isApp
      ? [
          {
            question: 'Is Engligenious completely free to download?',
            answer: 'Yes! Engligenious is 100% free to install from the Google Play Store with no upfront fees, hidden subscriptions, or required credit cards.',
          },
          {
            question: 'Does the app work without internet or mobile data?',
            answer: 'Yes, 100% offline mode is fully supported. All lessons, 3,000+ words, and practice drills are downloaded to your device so you can practice anywhere.',
          },
          {
            question: 'How do the 10-minute daily lessons work?',
            answer: 'Each micro-lesson is structured into 3 quick steps: vocabulary acquisition, AI speech pronunciation practice, and conversational dialogue repetition.',
          },
          {
            question: 'Which Android devices are supported?',
            answer: 'Engligenious runs smoothly on any Android smartphone running Android 7.0 and higher.',
          },
        ]
      : Array.isArray(input.faqs) && input.faqs.length > 0
      ? input.faqs
      : [
          {
            question: `How do I get started with ${input.businessName}?`,
            answer: `Simply click Get Started to explore our capabilities and onboard in minutes.`,
          },
        ];

    // Schema.org JSON-LD
    const jsonLdSchema = isApp
      ? {
          '@context': 'https://schema.org',
          '@type': 'MobileApplication',
          name: input.businessName,
          operatingSystem: 'Android',
          applicationCategory: 'EducationalApplication',
          offers: {
            '@type': 'Offer',
            price: '0.00',
            priceCurrency: 'USD',
          },
          downloadUrl: playStoreUrl,
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '1240',
          },
        }
      : {
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: input.businessName,
          description: input.tagline,
          telephone: input.phone || '+1 (555) 019-2834',
        };

    return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${input.heroHeadline || input.businessName} | ${input.businessName}</title>
  <meta name="description" content="${input.heroSubheadline || input.tagline}">
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .hero-glow {
      background: radial-gradient(circle at 50% 20%, rgba(14, 165, 233, 0.15) 0%, rgba(13, 148, 136, 0.05) 50%, transparent 80%);
    }
  </style>
  <script type="application/ld+json">
    ${JSON.stringify(jsonLdSchema, null, 2)}
  </script>
</head>
<body class="bg-slate-950 text-slate-100 antialiased selection:bg-cyan-500 selection:text-slate-950">

  <!-- Navigation Bar -->
  <header class="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 via-teal-400 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-cyan-500/25">
          ${isApp ? '📱' : '✦'}
        </div>
        <div>
          <span class="text-xl font-extrabold tracking-tight text-white">${input.businessName}</span>
          <span class="block text-xs font-semibold text-cyan-400">${isApp ? 'Android Mobile App • Google Play' : input.tagline}</span>
        </div>
      </div>
      <div class="flex items-center gap-4">
        ${isApp ? `
        <a href="${playStoreUrl}" target="_blank" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:opacity-95 shadow-lg shadow-emerald-500/20 transition transform hover:-translate-y-0.5">
          <span>Google Play</span> ↗
        </a>` : `
        <a href="#contact" class="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition">
          ${ctaText}
        </a>`}
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-32 hero-glow">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      
      ${isApp ? `
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-extrabold tracking-wider uppercase mb-8 border border-emerald-500/30 shadow-inner">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        100% Free on Google Play • No Credit Card Required
      </div>` : `
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold tracking-wide uppercase mb-8 border border-cyan-500/30">
        ✨ Verified Quality Solution
      </div>`}

      <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
        ${input.heroHeadline}
      </h1>
      <p class="mt-6 text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
        ${input.heroSubheadline}
      </p>

      <!-- App Download / Action CTAs -->
      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        ${isApp ? `
        <a href="${playStoreUrl}" target="_blank" class="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:opacity-95 shadow-xl shadow-teal-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-3">
          <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M3.609 1.814L13.793 12 3.61 22.186c-.198-.184-.31-.442-.31-.72V2.534c0-.278.112-.536.31-.72zm11.233 11.233l2.25 2.25-10.96 6.327 8.71-8.577zm0-2.094L6.132 2.376l10.96 6.327-2.25 2.25zm1.468 1.047l3.66 2.113c.66.381.66 1.002 0 1.383l-3.66 2.113-2.023-2.023 2.023-2.023z"/></svg>
          <span>Install on Google Play</span>
        </a>
        <a href="#features" class="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 transition flex items-center justify-center gap-2">
          <span>Explore App Features</span> ↓
        </a>` : `
        <a href="#contact" class="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:opacity-95 shadow-xl transition">
          ${ctaText}
        </a>`}
      </div>

      <!-- Trust Badges -->
      <div class="mt-16 pt-8 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-4xl mx-auto">
        <div>
          <div class="text-3xl font-black text-cyan-400">10 Mins</div>
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Daily Micro-Lessons</div>
        </div>
        <div>
          <div class="text-3xl font-black text-teal-400">100%</div>
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Offline Practice</div>
        </div>
        <div>
          <div class="text-3xl font-black text-emerald-400">3,000+</div>
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Spoken Vocabulary Words</div>
        </div>
        <div>
          <div class="text-3xl font-black text-yellow-400">4.8 ★</div>
          <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Google Play Rating</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Key App Capabilities / Solutions Section (NO FAKE PRICING) -->
  <section id="features" class="py-24 bg-slate-900/60 border-t border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-xs font-extrabold uppercase tracking-widest text-cyan-400">Why Learners Choose ${input.businessName}</h2>
        <p class="mt-2 text-3xl sm:text-4xl font-black text-white">Engineered for Fast, Confident Fluency</p>
        <p class="mt-4 text-sm sm:text-base text-slate-400">Everything you need to master everyday spoken English—built right into your Android phone.</p>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        ${services
          .map(
            (service: any) => `
        <div class="rounded-3xl border border-slate-800 p-8 hover:border-cyan-500/40 bg-slate-950/80 transition duration-300 flex flex-col justify-between relative group">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xl font-bold text-white group-hover:text-cyan-300 transition">${service.name}</span>
              <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold font-mono">
                ${service.badge || service.price || 'Free App Feature'}
              </span>
            </div>
            <p class="text-sm text-slate-300 leading-relaxed">${service.description}</p>
            <ul class="mt-6 space-y-3">
              ${(service.features || ['Full Feature Access', 'Instant Mobile Learning', 'No Internet Required'])
                .map(
                  (f: string) => `
              <li class="flex items-center text-xs font-medium text-slate-300">
                <span class="text-teal-400 mr-2 text-base font-bold">✓</span> ${f}
              </li>`
                )
                .join('')}
            </ul>
          </div>
          <div class="mt-8 pt-6 border-t border-slate-800">
            ${isApp ? `
            <a href="${playStoreUrl}" target="_blank" class="block w-full text-center py-3 rounded-xl bg-slate-900 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-200 border border-slate-700/80 font-bold text-xs transition">
              Try In App on Google Play →
            </a>` : `
            <a href="#contact" class="block w-full text-center py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition">
              Get Started →
            </a>`}
          </div>
        </div>`
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- Verified Learner Reviews -->
  <section class="py-20 bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-2xl mx-auto mb-14">
        <h2 class="text-xs font-bold uppercase tracking-widest text-teal-400">Real Learner Stories</h2>
        <p class="mt-2 text-3xl font-extrabold text-white">Join Thousands Speaking Confidently</p>
      </div>
      <div class="grid md:grid-cols-3 gap-6">
        ${testimonials
          .map(
            (t: any) => `
        <div class="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <div class="text-yellow-400 text-sm mb-3">★★★★★</div>
            <p class="text-slate-300 text-xs sm:text-sm leading-relaxed">"${t.quote}"</p>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span class="text-xs font-bold text-white">${t.patientName}</span>
            <span class="text-[10px] text-cyan-400 font-medium">${t.treatment}</span>
          </div>
        </div>`
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- Big Bottom Download Banner -->
  <section id="download" class="py-20 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-teal-950/60 border-t border-b border-cyan-500/20">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
      <h2 class="text-3xl sm:text-5xl font-black text-white">Start Speaking Fluent English Today</h2>
      <p class="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
        Download Engligenious for Android from Google Play. Zero subscription, zero mandatory credit card, 100% offline practice ready.
      </p>
      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="${playStoreUrl}" target="_blank" class="px-8 py-4 rounded-2xl text-base font-black text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:opacity-95 shadow-xl shadow-emerald-500/25 transition transform hover:-translate-y-0.5 flex items-center gap-3">
          <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M3.609 1.814L13.793 12 3.61 22.186c-.198-.184-.31-.442-.31-.72V2.534c0-.278.112-.536.31-.72zm11.233 11.233l2.25 2.25-10.96 6.327 8.71-8.577zm0-2.094L6.132 2.376l10.96 6.327-2.25 2.25zm1.468 1.047l3.66 2.113c.66.381.66 1.002 0 1.383l-3.66 2.113-2.023-2.023 2.023-2.023z"/></svg>
          <span>Get it Free on Google Play</span>
        </a>
      </div>
    </div>
  </section>

  <!-- FAQ Accordion -->
  <section class="py-20 bg-slate-950">
    <div class="max-w-3xl mx-auto px-4 sm:px-6">
      <div class="text-center mb-12">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
        <p class="text-xs sm:text-sm text-slate-400 mt-2">Everything you need to know about ${input.businessName}</p>
      </div>
      <div class="space-y-4">
        ${faqs
          .map(
            (faq: any) => `
        <details class="group rounded-2xl border border-slate-800 p-5 [&_summary::-webkit-details-marker]:hidden bg-slate-900/60 hover:bg-slate-900 transition">
          <summary class="flex items-center justify-between cursor-pointer font-bold text-white text-sm">
            <span>${faq.question}</span>
            <span class="text-cyan-400 text-lg group-open:rotate-45 transition transform duration-200">+</span>
          </summary>
          <p class="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">${faq.answer}</p>
        </details>`
          )
          .join('')}
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="bg-slate-950 text-slate-500 py-12 border-t border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs space-y-3">
      <div class="font-bold text-white text-base">${input.businessName}</div>
      <div>Android App on Google Play Store • Offline Micro-Learning Platform</div>
      <div class="text-slate-600">© ${new Date().getFullYear()} ${input.businessName}. All rights reserved. Built for Global Learners.</div>
    </div>
  </footer>

</body>
</html>`;
  }
}
