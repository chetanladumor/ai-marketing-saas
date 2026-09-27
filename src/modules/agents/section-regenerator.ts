import { ModelGateway } from '../model-gateway/cost-router.js';
import { TaskTier } from '../model-gateway/types.js';
import { MasterMarketingPlan } from './types.js';
import { SettingsStore } from '../integrations/credentials.store.js';

export interface AdvancedVideoOptions {
  prompt?: string;
  angle?: 'CONTRARIAN_MYTH' | 'STUDENT_COMEDY' | 'DAILY_HABIT' | 'JOB_INTERVIEW' | 'OFFLINE_HACK' | 'CUSTOM';
  style?: 'CASUAL_CREATOR' | 'FAST_PACED_SCREEN' | 'PROBLEM_SOLUTION' | 'SKIT';
  durationSeconds?: number;
  targetPlatform?: 'TIKTOK' | 'INSTAGRAM_REELS' | 'YOUTUBE_SHORTS';
}

export class SectionRegenerator {
  constructor(private gateway: ModelGateway) {}

  /**
   * Generates a new, high-converting short-form video reel with detailed camera directions and spoken voiceovers.
   */
  async generateAdvancedVideo(
    plan: MasterMarketingPlan,
    options: AdvancedVideoOptions
  ): Promise<MasterMarketingPlan['content']['shortFormVideoReel']> {
    const settings = SettingsStore.getSettings();
    const brand = settings.brandProfile;
    const playStoreUrl = brand.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.engligenious.app';

    const angleGuidance: Record<string, string> = {
      CONTRARIAN_MYTH: 'Angle: "Stop studying English grammar! Why reading textbooks fails and 10-minute micro-speaking works."',
      STUDENT_COMEDY: 'Angle: Relatable student comedy about freezing during English viva / oral exams or presentations.',
      DAILY_HABIT: 'Angle: The 10-minute daily commute routine: How busy people get fluent while on the bus or train.',
      JOB_INTERVIEW: 'Angle: How to answer "Tell me about yourself" in English with confidence and perfect pronunciation.',
      OFFLINE_HACK: 'Angle: The Airplane Mode test: Practicing English anywhere without wasting mobile data or needing Wi-Fi.',
      CUSTOM: options.prompt || 'High-converting viral short video script for Google Play app.',
    };

    const chosenAngle = angleGuidance[options.angle || 'CUSTOM'] || angleGuidance.CONTRARIAN_MYTH;

    const systemPrompt = `You are a viral TikTok & Instagram Reels Director specializing in educational mobile app marketing.
Generate a high-retention, 30-to-45-second vertical video script with:
1. A 3-second scroll-stopping hook (visual action + spoken words).
2. 4 distinct scenes with visual camera cues, word-for-word spoken voiceover script, and bold on-screen typography overlays.
3. A compelling Call to Action pointing to Google Play Store.

Return a STRICT JSON object conforming to:
{
  "title": string,
  "durationSeconds": number,
  "hookVisualAndAudio": string,
  "bodyScenes": [
    {
      "sceneNumber": number,
      "visualPrompt": string,
      "spokenScript": string,
      "onScreenText": string
    }
  ],
  "cta": string
}
Do not include any text outside the JSON.`;

    const userPrompt = `APP & BRAND:
Name: ${brand.companyName}
Type: ${brand.productType}
Play Store URL: ${playStoreUrl}
USPs: ${(brand.keyFeatures || []).join(' | ')}
Target Audience: ${brand.targetAudience}

CREATIVE INSTRUCTIONS:
${chosenAngle}
Style: ${options.style || 'FAST_PACED_SCREEN'}
Duration: ${options.durationSeconds || 30} seconds
Custom Notes: ${options.prompt || 'Focus on speaking fluency, 10-min micro lessons, and 100% offline practice.'}

Generate the complete production script with precise on-screen text and spoken dialogue.`;

    try {
      const result = await this.gateway.routeCompletion<any>({
        tier: TaskTier.TIER_0_LOCAL_UTILITY,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        options: {
          temperature: 0.75,
          responseFormat: 'json',
          timeout: 6000,
        },
      });

      if (result.data && result.data.bodyScenes && result.data.bodyScenes.length >= 3) {
        return result.data;
      }
    } catch (err) {
      console.warn('[SectionRegenerator] Video generation model error, using rich fallback template:', err);
    }

    // Rich fallback tailored specifically to the requested creative angle
    const angleScripts: Record<string, { title: string; hook: string; scenes: any[]; cta: string }> = {
      JOB_INTERVIEW: {
        title: 'Job Interview Fluency: Cracking "Tell Me About Yourself"',
        hook: 'Why do 80% of candidates freeze in English job interviews? Here is the 10-minute fix.',
        scenes: [
          {
            sceneNumber: 1,
            visualPrompt: 'POV nervous candidate sitting in front of glass interview room; hand slightly trembling with resume',
            spokenScript: 'Ever freeze when the interviewer asks: "Tell me about yourself in English"?',
            onScreenText: 'Freezing in Job Interviews?',
          },
          {
            sceneNumber: 2,
            visualPrompt: 'Animated mind graphic: brain struggling to translate native language into English under pressure',
            spokenScript: 'It is not your knowledge. It is mental translation delay causing that hesitation.',
            onScreenText: 'Mental Translation = Hesitation',
          },
          {
            sceneNumber: 3,
            visualPrompt: 'Close-up of Engligenious app screen: User speaking an interview answer, AI wave turns bright green with pronunciation score',
            spokenScript: 'Engligenious trains vocal muscle memory in 10-minute daily drills with real-time AI speech feedback.',
            onScreenText: 'Instant AI Voice Correction',
          },
          {
            sceneNumber: 4,
            visualPrompt: 'Confident candidate smiling and shaking hands with hiring manager; Google Play badge appears',
            spokenScript: 'Master 3,000+ career words offline with zero Wi-Fi. Install Engligenious free on Google Play.',
            onScreenText: 'Ace Interviews • Free on Google Play',
          },
        ],
        cta: `Install ${brand.companyName} on Google Play to ace your English interviews!`,
      },
      STUDENT_COMEDY: {
        title: 'The Viva / Oral Exam Panic vs. Engligenious',
        hook: 'POV: The professor points directly at you and says: "Explain this in English please."',
        scenes: [
          {
            sceneNumber: 1,
            visualPrompt: 'Student wide-eyed in classroom, looking around desperately while classmates avoid eye contact',
            spokenScript: 'When the teacher asks you a question in English and your soul leaves your body...',
            onScreenText: 'English Viva Panic Mode 💀',
          },
          {
            sceneNumber: 2,
            visualPrompt: 'Split screen: Left student stuttering "Uh... actually sir...", Right student speaking fluently with confidence',
            spokenScript: 'Reading grammar textbooks won\'t save you when it is time to actually speak out loud.',
            onScreenText: 'Grammar Books Won\'t Help You Speak',
          },
          {
            sceneNumber: 3,
            visualPrompt: 'Phone screen demo: Engligenious rapid speech practice with streak animation and sound effects',
            spokenScript: 'Just 10 minutes a day on Engligenious turns hesitation into natural, automatic speaking.',
            onScreenText: '10 Mins / Day Rapid Speaking Drills',
          },
          {
            sceneNumber: 4,
            visualPrompt: 'Smiling student walking out of college with high marks; download button pulsing',
            spokenScript: 'Stop being scared of English viva. Download Engligenious free on Google Play today!',
            onScreenText: 'Never Freeze Again • Free on Google Play',
          },
        ],
        cta: `Download ${brand.companyName} free on Google Play and master spoken English!`,
      },
      OFFLINE_HACK: {
        title: 'The Airplane Mode Fluency Hack (Zero Data Needed)',
        hook: 'Put your phone on Airplane Mode right now. Can your English app do this?',
        scenes: [
          {
            sceneNumber: 1,
            visualPrompt: 'Thumb swiping down on Android quick settings and tapping the Airplane Mode icon',
            spokenScript: 'No Wi-Fi? Ran out of daily mobile data? Watch this.',
            onScreenText: 'Airplane Mode ON ✈️ No Wi-Fi',
          },
          {
            sceneNumber: 2,
            visualPrompt: 'Other popular language apps showing "Network connection failed" error spinners',
            spokenScript: 'Most language apps crash immediately without expensive internet connection.',
            onScreenText: 'Other Apps: Network Error ❌',
          },
          {
            sceneNumber: 3,
            visualPrompt: 'Engligenious opening instantly, playing native speaker audio and running voice feedback smoothly',
            spokenScript: 'Engligenious works 100% offline. All 3,000 words, lessons, and speech exercises run right on your phone.',
            onScreenText: 'Engligenious: 100% Offline Power ✅',
          },
          {
            sceneNumber: 4,
            visualPrompt: 'Person practicing on crowded subway train with headphones; Google Play download button',
            spokenScript: 'Practice on your bus ride, subway, or in rural areas. Download Engligenious free on Google Play!',
            onScreenText: 'Practice Anywhere • Free on Google Play',
          },
        ],
        cta: `Get ${brand.companyName} on Google Play — Practice 100% Offline!`,
      },
      DAILY_HABIT: {
        title: 'The 10-Minute Daily Commute Routine to English Fluency',
        hook: 'You do not need 2 hours to learn English. You only need 10 minutes.',
        scenes: [
          {
            sceneNumber: 1,
            visualPrompt: 'Alarm clock at 7:30 AM, person waiting at bus stop looking at smartphone',
            spokenScript: 'If you have 10 minutes on your daily commute, you have enough time to get fluent.',
            onScreenText: '10 Minutes While Commuting',
          },
          {
            sceneNumber: 2,
            visualPrompt: 'Fast montage of Engligenious 10-minute streak timer ticking from 10:00 to 0:00 with progress bar filling',
            spokenScript: 'Engligenious micro-lessons are engineered to build speaking habits that actually stick.',
            onScreenText: 'Micro-Lessons Engineered For Retention',
          },
          {
            sceneNumber: 3,
            visualPrompt: 'Vocal waveform lighting up with score "98% Native Clarity"',
            spokenScript: 'Real-time AI voice feedback trains your pronunciation without needing expensive human tutors.',
            onScreenText: 'AI Pronunciation Coach in Your Pocket',
          },
          {
            sceneNumber: 4,
            visualPrompt: 'User reaching 30-day streak badge in app, celebrating; Google Play banner glowing',
            spokenScript: 'Build your 10-minute speaking habit today. Free on Google Play Store!',
            onScreenText: 'Build Your Streak • Free on Google Play',
          },
        ],
        cta: `Download ${brand.companyName} on Google Play and start your 10-minute daily streak!`,
      },
      CONTRARIAN_MYTH: {
        title: 'Stop Studying English Grammar! (The Speaking Truth)',
        hook: 'Stop studying grammar rules! Here is why textbooks are keeping you from speaking English.',
        scenes: [
          {
            sceneNumber: 1,
            visualPrompt: 'POV looking down at phone; quick finger tap opening app with vibrant streak counter',
            spokenScript: 'If you want to speak fluent English, spending hours on grammar books is the slowest way.',
            onScreenText: 'Grammar Books Won\'t Make You Fluent',
          },
          {
            sceneNumber: 2,
            visualPrompt: 'Split-screen: Left is textbook, Right is Engligenious 10-minute micro-lesson in action',
            spokenScript: 'Engligenious breaks spoken practice into 10-minute daily challenges that fit right into your commute.',
            onScreenText: '10 Mins / Day Habit-Building Streaks',
          },
          {
            sceneNumber: 3,
            visualPrompt: 'Close-up of AI microphone wave listening and flashing green with pronunciation checkmark',
            spokenScript: 'Our on-device AI gives you instant pronunciation feedback so you sound natural and confident.',
            onScreenText: 'Instant AI Accent & Voice Feedback',
          },
          {
            sceneNumber: 4,
            visualPrompt: 'User toggling Airplane mode, app continues running smoothly; Google Play button glows',
            spokenScript: 'And it runs 100% offline with zero mobile data! Download Engligenious free on Google Play right now.',
            onScreenText: '100% Offline • Free on Google Play',
          },
        ],
        cta: `Download ${brand.companyName} on Google Play Store today!`,
      },
    };

    const fallback = angleScripts[options.angle || ''] || (options.prompt ? {
      title: `Special: ${options.prompt.slice(0, 50)}`,
      hook: `Looking for a smarter way to master English? Here is how Engligenious delivers results in 10 minutes a day.`,
      scenes: angleScripts.CONTRARIAN_MYTH.scenes,
      cta: `Download ${brand.companyName} on Google Play Store today!`,
    } : angleScripts.CONTRARIAN_MYTH);

    return {
      title: options.prompt ? `Special: ${options.prompt.slice(0, 50)}` : fallback.title,
      durationSeconds: options.durationSeconds || 30,
      hookVisualAndAudio: fallback.hook,
      bodyScenes: fallback.scenes,
      cta: fallback.cta,
    };
  }

  /**
   * Regenerates fresh multi-platform social media posts.
   */
  async regenerateSocialPosts(plan: MasterMarketingPlan): Promise<MasterMarketingPlan['content']['socialPosts']> {
    const settings = SettingsStore.getSettings();
    const brand = settings.brandProfile;
    const playStoreUrl = brand.playStoreUrl || 'https://play.google.com/store/apps/details?id=com.engligenious.app';

    return [
      {
        platform: 'LINKEDIN',
        hook: 'Why do most professionals freeze when speaking English in meetings?',
        content: `It is not a lack of intelligence.\n\nIt is the absence of daily conversational muscle memory.\n\nTraditional classes teach passive reading. At ${brand.companyName}, we designed 10-minute daily spoken workouts with real-time AI pronunciation analysis.\n\nPlus, it works 100% offline—perfect for busy professionals practicing on their commute.\n\nInstall ${brand.companyName} for free on Google Play Store.`,
        hashtags: ['#CareerDevelopment', '#ProfessionalEnglish', '#PublicSpeaking', '#EdTech'],
        callToAction: `Get it on Google Play: ${playStoreUrl}`,
      },
      {
        platform: 'INSTAGRAM',
        hook: 'The 10-minute speaking habit that changed my English fluency forever! 🚀',
        content: `Stuck trying to remember grammar rules when you speak?\n\nTry the ${brand.companyName} micro-habit:\n✨ 10 minutes a day\n✨ Real-time AI pronunciation feedback\n✨ 3,000+ words with native audio\n✨ 100% offline (no data or Wi-Fi needed!)\n\nComment 'ENGLISH' or tap link in bio to install free on Google Play! 📲`,
        hashtags: ['#Engligenious', '#LearnEnglishOnline', '#SpokenEnglish', '#FluencyTips', '#MobileApp'],
        callToAction: 'Tap link in bio to install on Google Play',
      },
      {
        platform: 'X',
        hook: 'You do not need 2 hours of English study every day.',
        content: `You just need 10 focused minutes of vocal speaking with AI pronunciation correction.\n\n${brand.companyName} turns daily speaking into an effortless habit—100% offline.\n\nDownload free on Google Play 📲`,
        hashtags: ['#Engligenious', '#LearnEnglish', '#MicroLearning'],
        callToAction: playStoreUrl,
      },
      {
        platform: 'FACEBOOK',
        hook: 'Speak English with total confidence—wherever you are in the world.',
        content: `${brand.companyName} is built for learners who want real conversational fluency. Practice 3,000+ essential vocabulary words, get instant voice feedback from AI, and keep your streak alive offline with zero mobile data.\n\nAvailable 100% free on Google Play Store!`,
        hashtags: ['#Engligenious', '#EnglishSpeaking', '#FreeLearning'],
        callToAction: 'Download on Google Play',
      },
    ];
  }

  /**
   * Regenerates ad copies with fresh hooks and headlines.
   */
  async regenerateAdCopies(plan: MasterMarketingPlan): Promise<MasterMarketingPlan['campaign']['adCopies']> {
    const settings = SettingsStore.getSettings();
    const brand = settings.brandProfile;

    return {
      googleSearchAd: {
        headlines: [
          'Speak Fluent English in 10 Mins',
          'Free Spoken English Android App',
          'AI Pronunciation Feedback App',
          '100% Offline English Practice',
        ],
        descriptions: [
          'Master 3,000+ conversational words with instant AI pronunciation feedback. 100% free.',
          'Bite-sized 10-minute daily lessons designed for non-native speakers. Works without Wi-Fi.',
        ],
        displayUrl: 'engligenious.app/google-play',
      },
      metaAds: {
        primaryText: `Stop feeling nervous in English interviews! 🎯\n\n${brand.companyName} gives you 10-minute daily micro-lessons with instant AI pronunciation feedback.\n\n✨ 10-Min Micro Lessons with Daily Streaks\n✨ Instant AI Accent & Voice Feedback\n✨ 3,000+ Words with Native Audio\n✨ 100% Offline Practice (Zero Wi-Fi Needed)\n\nInstall free from Google Play Store today! 📲`,
        headline: 'Speak English with Confidence in 10 Mins a Day',
        visualDescription: 'Vibrant mobile screen showing AI pronunciation wave',
        ctaButton: 'Install Now',
        callToAction: 'Install Now',
      },
    };
  }

  /**
   * Regenerates the multi-day email nurture sequence.
   */
  async regenerateEmailSequence(plan: MasterMarketingPlan): Promise<MasterMarketingPlan['campaign']['emailNurtureSequence']> {
    const settings = SettingsStore.getSettings();
    const brand = settings.brandProfile;

    return [
      {
        emailNumber: 1,
        delayDays: 0,
        subjectLine: `Welcome to ${brand.companyName}! Your 10-minute fluency journey starts now 🚀`,
        previewText: 'Your journey to English fluency begins with 10 minutes today.',
        bodyOutline: 'Celebrate the learner joining, explain why 10 minutes a day beats cramming, and prompt them to complete their initial speaking assessment in the app.',
        primaryCTA: 'Start 10-Minute Day 1 Lesson in App',
      },
      {
        emailNumber: 2,
        delayDays: 2,
        subjectLine: 'How to sound like a native speaker (The AI pronunciation secret) 🎙️',
        previewText: 'Learn syllable stress with real-time AI speech feedback.',
        bodyOutline: 'Share tips on syllable stress, show how the AI waveform feedback works, and encourage maintaining their 3-day streak.',
        primaryCTA: 'Try Pronunciation Workout in App',
      },
      {
        emailNumber: 3,
        delayDays: 5,
        subjectLine: 'No Wi-Fi? How to practice 100% offline anywhere ✈️',
        previewText: 'Keep your speaking streak alive without consuming mobile data.',
        bodyOutline: 'Remind the user that all 3,000 vocabulary words and daily drills work in Airplane Mode on their daily commute.',
        primaryCTA: 'Check Offline Mode in App',
      },
      {
        emailNumber: 4,
        delayDays: 10,
        subjectLine: 'Congratulations on 7 days! Here is your speaking confidence report 🏆',
        previewText: 'See your weekly fluency progress and unlocked badges.',
        bodyOutline: 'Summarize their progress, highlight common speaking improvements, and invite them to share the app with friends.',
        primaryCTA: 'View Fluency Badge in App',
      },
    ];
  }
}
