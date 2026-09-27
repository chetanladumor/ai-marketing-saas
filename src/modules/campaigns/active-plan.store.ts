import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MasterMarketingPlan } from '../agents/types.js';
import { SettingsStore } from '../integrations/credentials.store.js';

const PLAN_FILE_PATH = path.join(process.cwd(), 'data', 'active_plan.json');

export class ActivePlanStore {
  /**
   * Retrieves the current saved plan from disk, or generates a fresh brand-grounded default plan.
   */
  static getActivePlan(): MasterMarketingPlan {
    try {
      if (fs.existsSync(PLAN_FILE_PATH)) {
        const raw = fs.readFileSync(PLAN_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && parsed.strategy && parsed.content) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[ActivePlanStore] Failed to read active_plan.json:', err);
    }

    // Fallback: Generate Default Brand Plan (Engligenious grounded)
    const settings = SettingsStore.getSettings();
    const brand = settings.brandProfile;
    const playStoreUrl = brand.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.engligenious.app';

    const defaultPlan: MasterMarketingPlan = {
      id: uuidv4(),
      organizationId: 'org_aetheria_default',
      userPrompt: `Launch 30-day viral acquisition for ${brand.companyName} on Google Play Store`,
      generatedAt: new Date().toISOString(),
      status: 'DRAFT',
      strategy: {
        campaignName: `${brand.companyName} Global Growth Accelerator`,
        primaryObjective: `Acquire 10,000 active app installs for ${brand.companyName} in 30 days.`,
        coreValueProposition: brand.valueProposition || 'Master spoken English in 10 minutes a day with AI pronunciation feedback and 100% offline practice.',
        targetPersonas: [
          {
            name: 'Aspiring Global Professionals & Students',
            demographics: 'Ages 18-35 in India, LATAM, Southeast Asia & Middle East seeking English fluency',
            painPoints: ['Fear of speaking in job interviews', 'Expensive English tutors', 'Limited internet access on daily commute'],
            motivation: 'Quick daily speaking practice to gain fluent job-ready English without boring grammar drills',
          },
        ],
        budgetAllocation: {
          'Social Reels & TikTok': '45%',
          'Google Play Store ASO & Search': '30%',
          'Email Drip Retention': '15%',
          'Community Referrals': '10%',
        },
        targetKPIs: [
          { metric: 'Monthly Active Installs', targetValue: '10,000+' },
          { metric: 'Cost Per Install (CPI)', targetValue: '< $0.18' },
          { metric: 'Day-7 Habit Streak Retention', targetValue: '> 48%' },
        ],
      },
      seo: {
        primaryKeywordClusters: [
          {
            clusterName: 'High-Intent Spoken English App Searches',
            searchIntent: 'TRANSACTIONAL',
            keywords: ['learn spoken english app', 'offline english speaking app', 'best english learning app android', 'daily english streak practice'],
          },
          {
            clusterName: 'AI Pronunciation Drills',
            searchIntent: 'INFORMATIONAL',
            keywords: ['ai pronunciation feedback app', 'practice english speaking alone', 'daily 10 minute english lessons'],
          },
        ],
        localSEOTactics: [
          'Optimize Google Play Store metadata and keyword density for "Spoken English Offline App"',
          'Localize Play Store screenshots into 6 languages (Hindi, Spanish, Portuguese, Indonesian, Arabic, Vietnamese)',
          'Deploy programmatic landing pages for "Learn Spoken English in [City/Country]"',
        ],
        programmaticSEOMatrix: {
          services: ['Spoken English Lessons', 'AI Pronunciation Drills', '3,000 High-Frequency Words', 'Offline Learning Mode'],
          locations: ['Global', 'Mumbai', 'Delhi', 'São Paulo', 'Jakarta', 'Cairo'],
          totalGeneratedPagesTarget: 24,
          samplePageTitles: [
            'Best Offline Spoken English App in Global | Engligenious',
            'AI Pronunciation English Learning on Android | Engligenious',
          ],
        },
      },
      content: {
        blogPost: {
          title: 'How to Speak Fluent English in Just 10 Minutes a Day Without Grammar Books',
          seoMetaDescription: 'Discover the micro-learning science behind Engligenious: AI accent correction, 3,000 key words, and offline practice on Android.',
          targetKeyword: 'learn spoken english app',
          outline: [
            '1. Why Traditional Grammar Memorization Fails Non-Native Speakers',
            '2. The 10-Minute Daily Micro-Learning Method Explained',
            '3. How AI Speech Recognition Fixes Pronunciation on Android',
            '4. Why 100% Offline Access Is Essential for Consistent Daily Streaks',
          ],
        },
        socialPosts: [
          {
            platform: 'LINKEDIN',
            hook: 'Why are 82% of job candidates rejected in the first 3 minutes of an interview?',
            content: 'It is rarely their technical skills.\n\nIt is the lack of confidence in spoken English.\n\nAt Engligenious, we built an AI-powered micro-learning app that gives you 10-minute daily speaking workouts with instant pronunciation feedback.\n\nBest of all? It runs 100% offline.\n\nInstall Engligenious for free on Google Play Store today.',
            hashtags: ['#CareerGrowth', '#Engligenious', '#SpokenEnglish', '#EdTech', '#JobInterview'],
            callToAction: `Install free on Google Play: ${playStoreUrl}`,
          },
          {
            platform: 'INSTAGRAM',
            hook: 'Stop studying grammar for hours! 🛑 Do this 10-minute trick instead.',
            content: 'Want to speak fluent English?\n\n1️⃣ Open Engligenious\n2️⃣ Complete your 10-minute daily streak\n3️⃣ Let AI correct your pronunciation in real-time\n\nWorks 100% offline on your commute! 🚀\n\nLink in bio to download free on Google Play! 📲',
            hashtags: ['#Engligenious', '#LearnEnglish', '#EnglishSpeaking', '#StudyTips', '#AndroidApp'],
            callToAction: 'Tap link in bio to download on Google Play',
          },
          {
            platform: 'X',
            hook: 'Fluency is a habit, not a talent.',
            content: '10 minutes of daily speaking with real-time AI voice feedback beats 2 hours of silent textbook reading every time.\n\nMaster 3,000+ words with native audio—100% offline.\n\nDownload Engligenious on Google Play 📲',
            hashtags: ['#Engligenious', '#EnglishApp', '#EdTech'],
            callToAction: playStoreUrl,
          },
          {
            platform: 'FACEBOOK',
            hook: 'Learn to speak English with confidence from anywhere in the world.',
            content: 'No internet? No problem! Engligenious works 100% offline with AI pronunciation feedback, 3,000+ words, and daily streak micro-lessons.\n\nJoin thousands of happy learners today on Google Play Store.',
            hashtags: ['#Engligenious', '#LearnEnglish', '#FreeApp'],
            callToAction: 'Download on Google Play',
          },
        ],
        shortFormVideoReel: {
          title: 'Stop Memorizing Grammar: Speak Fluent English in 10 Mins/Day',
          durationSeconds: 30,
          hookVisualAndAudio: 'Stop memorizing grammar books! Here is how to speak fluent English in 10 minutes a day.',
          bodyScenes: [
            {
              sceneNumber: 1,
              visualPrompt: 'Frustrated student throwing a 500-page English grammar book on the desk, then smiling as they open their phone',
              spokenScript: 'Stop memorizing boring grammar rules! Here is how to speak fluent English in just 10 minutes a day.',
              onScreenText: 'Speak Fluent English in 10 Mins/Day',
            },
            {
              sceneNumber: 2,
              visualPrompt: 'Close-up screen recording of Engligenious showing the 10-minute daily streak counter ticking up to Day 14',
              spokenScript: 'Engligenious turns speaking practice into bite-sized daily streaks that keep you motivated without fatigue.',
              onScreenText: 'Gamified 10-Minute Daily Streaks',
            },
            {
              sceneNumber: 3,
              visualPrompt: 'User speaking into the phone microphone, live AI waveform glowing green with instant pronunciation checkmark',
              spokenScript: 'Our on-device AI listens to your voice and corrects your pronunciation on the spot with real-time feedback.',
              onScreenText: 'Real-Time AI Speech & Accent Feedback',
            },
            {
              sceneNumber: 4,
              visualPrompt: 'User toggling Airplane Mode on their Android phone in the metro; app runs smoothly with Google Play download badge',
              spokenScript: 'And best of all, it works 100% offline without wifi! Download Engligenious free on Google Play right now.',
              onScreenText: '100% Offline • Free on Google Play',
            },
          ],
          cta: 'Install Engligenious free on Google Play Store today!',
        },
      },
      campaign: {
        funnelStages: {
          tofuAwareness: 'Viral vertical reels and social hooks highlighting the failure of traditional grammar books',
          mofuConsideration: 'Micro-learning proof, AI accent evaluation demos, and 100% offline practice comparison',
          bofuConversion: 'Instant free Google Play download with zero friction and 10-minute starter streak',
        },
        adCopies: {
          googleSearchAd: {
            headlines: [
              'Master Spoken English Fast',
              '10-Minute Daily AI Lessons',
              '100% Offline Practice App',
            ],
            descriptions: [
              'Speak fluent English with real-time AI pronunciation feedback. Master 3,000+ words.',
              '100% free offline Android app. Build confidence for interviews in 10 mins a day.',
            ],
            displayUrl: 'engligenious.app/free-download',
          },
          metaAds: {
            primaryText: 'Struggling to speak English fluently in job interviews? 🎯\n\nEngligenious gives you 10-minute daily micro-lessons with instant AI pronunciation feedback.\n\n✨ 3,000+ Words with Native Audio\n✨ 100% Offline Practice Mode (No Internet Needed)\n✨ 100% Free to Install on Google Play\n\nInstall today and start speaking confidently!',
            headline: 'Speak English Confidently in 10 Mins a Day',
            visualDescription: 'App screenshot with AI pronunciation speech wave',
            ctaButton: 'Install Now',
            callToAction: 'Install Now',
          },
        },
        emailNurtureSequence: [
          {
            emailNumber: 1,
            delayDays: 0,
            subjectLine: 'Welcome to Engligenious! Your first 10-minute speaking lesson is ready 🚀',
            previewText: 'Your journey to English fluency begins with 10 minutes today.',
            bodyOutline: 'Celebrate their first step, explain the 10-minute micro-learning science, and guide them to take their initial pronunciation test.',
            primaryCTA: 'Start Day 1 Lesson in App',
          },
          {
            emailNumber: 2,
            delayDays: 2,
            subjectLine: 'How to practice speaking when you are alone (AI Feedback tip) 🎙️',
            previewText: 'Learn syllable stress with real-time AI speech feedback.',
            bodyOutline: 'Explain how the AI microphone evaluation works and how 10 minutes a day builds muscle memory for job interviews.',
            primaryCTA: 'Try AI Pronunciation Drills',
          },
          {
            emailNumber: 3,
            delayDays: 5,
            subjectLine: 'Going on a trip? Turn on 100% Offline Mode ✈️',
            previewText: 'Keep your speaking streak alive without consuming mobile data.',
            bodyOutline: 'Showcase that all 3,000 words and streak challenges work without Wi-Fi or mobile data.',
            primaryCTA: 'Keep Your Daily Streak Alive',
          },
        ],
      },
      competitorRadar: {
        competitorWeaknessesIdentified: [
          'Legacy apps require continuous high-speed Wi-Fi and consume expensive mobile data',
          'Heavy focus on silent grammar quizzes instead of active vocal speaking practice',
          'Expensive $12-$15 monthly subscription paywalls that block essential vocabulary',
        ],
        differentiationPillars: [
          '100% Offline Learning Mode engineered for Android learners on commutes',
          'Vocal-First AI Speech Evaluation that builds speaking confidence on day one',
          'Free access to 3,000+ high-frequency English conversational words with native audio',
        ],
        counterMessagingAction: 'Why pay $15/month for silent grammar quizzes? Engligenious gives you 10-minute spoken English workouts with AI feedback—100% offline and free on Google Play.',
      },
    };

    this.saveActivePlan(defaultPlan);
    return defaultPlan;
  }

  /**
   * Saves the active plan to disk so that refreshing the page never loses work.
   */
  static saveActivePlan(plan: MasterMarketingPlan): void {
    try {
      const dir = path.dirname(PLAN_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(PLAN_FILE_PATH, JSON.stringify(plan, null, 2), 'utf-8');
    } catch (err) {
      console.error('[ActivePlanStore] Failed to save active plan to disk:', err);
    }
  }
}
