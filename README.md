# Aetheria AI — Autonomous Multi-Agent Marketing SaaS Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-black.svg)](https://expressjs.com/)
[![Local AI](https://img.shields.io/badge/Ollama-Local%20%240-purple.svg)](https://ollama.ai/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

Aetheria is an enterprise-grade autonomous AI marketing orchestration platform designed to transform high-level marketing goals into multi-channel campaigns, viral video production scripts, programmatic SEO landing pages, and automated ad creatives.

Built with a **sequential multi-agent pipeline**, **real-time Server-Sent Events (SSE) streaming**, **hybrid cost-saving AI routing**, and **dual-layer state persistence**, Aetheria empowers marketers to plan, generate, fine-tune, and deploy marketing assets in seconds.

---

## 🚀 Key Features

### 1. 🤖 6-Agent Autonomous Orchestration Pipeline
A sequential multi-agent architecture coordinates specialized AI agents to generate complete 360° marketing campaigns:
- **Strategy & Persona Agent**: Defines target audience segments, pain points, motivations, budget allocation, and target KPIs.
- **Content & Video Production Agent**: Generates long-form SEO blog outlines, multi-platform social posts (LinkedIn, Instagram, X, Facebook), and viral short-form video reels.
- **Campaign & Conversion Agent**: Drafts Google Search responsive ad copies, Meta conversion ad copy, and multi-stage automated email drip sequences.
- **Competitor Radar & Counter-Positioning Agent**: Analyzes industry competitor vulnerabilities and creates sharp counter-messaging USPs.
- **Fact-Checking & Brand Compliance Agent**: Validates claims, verifies Play Store/Website URLs, checks character limits, and enforces brand voice guidelines.
- **Autonomous Execution Engine**: Packages approved assets for automated deployment across connected ad channels and social networks.

### 2. 🎬 Advanced AI Video Studio (Viral Reels, Shorts & TikTok)
Generates ready-to-shoot vertical video scripts with full scene-by-scene production direction:
- **3-Second Scroll-Stopping Hook**: Visual action + spoken opening lines designed to minimize drop-off.
- **4 Distinct Production Scenes**:
  - **Camera & Visual Prompts**: Perspective, action, lighting, and transitions.
  - **Spoken Voiceover Dialogue**: Word-for-word spoken scripts.
  - **On-Screen Text Overlays**: Bold typography cues for silent viewers.
- **Pre-Engineered High-Converting Angles**:
  - `Contrarian Myth`: Debunking outdated methods to highlight micro-learning.
  - `Job Interview Fluency`: Tackling real-world interview anxiety and fluency hurdles.
  - `Airplane Mode Test`: Showcasing 100% offline app functionality with zero mobile data.
  - `Student Viva Panic (Skit)`: Relatable comedy contrasting textbook learning with vocal confidence.
  - `Daily Commute Routine`: Actionable 10-minute micro-habit integration.
- **Custom Creative Briefs**: Accepts custom user prompts, tone, target duration (15s, 30s, 45s), and platform selection.

### 3. 🔄 Granular 1-Click Section Regeneration
No need to re-run the entire pipeline when only one creative asset needs updating. Dedicated independent regenerators update:
- `🔄 Regenerate Video`: Refreshes video hook, scenes, and visual prompts.
- `🔄 Regenerate Posts`: Refreshes copy, hooks, and hashtags for LinkedIn, Instagram, X, and Facebook.
- `🔄 Regenerate Ads`: Refreshes Google Search headlines and Meta ad copy.
- `🔄 Regenerate Emails`: Refreshes the 3-part nurture sequence (Day 0, Day 2, Day 5).

### 4. 💾 Dual-Layer State Persistence (No Work Lost on Refresh)
Prevents generated work from disappearing when the browser is refreshed:
- **Browser Layer (`localStorage`)**: Instantly syncs the active plan client-side on every generation or section edit.
- **Server Disk Store (`data/active_plan.json`)**: Persists the master marketing plan to disk, ensuring continuity across sessions.
- **Grounded Default Brand**: Pre-configured with **Engligenious** (Spoken English Android App) metadata, removing generic placeholders.

### 5. ⚡ Hybrid Model Cost Router ($0 Local + Cloud)
Intelligently routes AI requests based on task complexity to minimize API expenses:
- **Tier 0 (Local Utility & Fallbacks - $0)**: Runs via local Ollama (`llama3.1`) or instant deterministic templates.
- **Tier 1 (Bulk Content & Captions)**: Low-cost cloud or local models.
- **Tier 2 (High-Stakes Strategy & Creative Architecture)**: Advanced cloud models (OpenAI GPT-4o / Claude 3.5 Sonnet / Gemini 1.5 Pro).

---

## 🏛️ System Architecture

```text
               +-------------------------------------------+
               |        Aetheria Web UI (TailwindCSS)      |
               | - SSE Live Stepper Visualization          |
               | - Advanced Video AI Studio Modal          |
               | - 1-Click Granular Section Regenerators   |
               | - LocalStorage Sync Engine                |
               +---------------------+---------------------+
                                     |
               HTTP REST & SSE Stream|
                                     v
               +-------------------------------------------+
               |        Express.js Server (src/server.ts)  |
               +---------------------+---------------------+
                                     |
        +----------------------------+----------------------------+
        |                            |                            |
        v                            v                            v
+---------------+            +------------------+         +----------------+
|  Marketing    |            | Section          |         | Active Plan    |
|  Orchestrator |            | Regenerator      |         | Store (Disk)   |
| (6 Agents)    |            | (Reels/Ads/Posts)|         |                |
+-------+-------+            +--------+---------+         +--------+-------+
        |                             |                            |
        +-----------------------------+----------------------------+
                                     |
                                     v
               +-------------------------------------------+
               |     Model Gateway & Cost Router           |
               |  - Ollama (Local $0 Inference)            |
               |  - OpenAI / Anthropic / Gemini Providers  |
               +-------------------------------------------+
```

---

## 📂 Project Structure

```text
ai-marketing-saas/
├── data/                         # Persistent JSON storage (plans, settings)
│   └── active_plan.json          # Persisted master marketing plan
├── public/                       # Frontend SPA (Vanilla JS + TailwindCSS)
│   └── index.html                # UI with tabs, stepper, modals, regenerators
├── src/
│   ├── modules/
│   │   ├── agents/               # Multi-Agent Architecture
│   │   │   ├── orchestrator.ts   # 6-step sequential pipeline coordinator
│   │   │   ├── section-regenerator.ts # Dedicated video, social, ad regenerator
│   │   │   └── types.ts          # Master marketing plan interfaces
│   │   ├── campaigns/            # Campaign & Plan Persistence
│   │   │   └── active-plan.store.ts # Disk-backed plan storage engine
│   │   ├── creative/             # Creative Asset Engines
│   │   │   ├── ad-banner-studio.ts  # HTML5 Canvas programmatic ad banners
│   │   │   ├── landing-page-generator.ts # High-conversion HTML landing pages
│   │   │   └── pseo-generator.ts # Programmatic SEO matrix builder
│   │   ├── integrations/         # Third-party Channel Adapters
│   │   │   ├── adapters/         # Social (Meta, LinkedIn, X) & Email (SendGrid)
│   │   │   ├── credentials.store.ts # Secure credentials & brand profile store
│   │   │   └── queue-worker.ts   # Asynchronous campaign execution queue
│   │   ├── model-gateway/        # Hybrid AI Cost Router
│   │   │   ├── cost-router.ts    # Task tier routing logic
│   │   │   └── providers/        # Ollama, OpenAI, Anthropic, Gemini adapters
│   │   ├── rag/                  # Retrieval-Augmented Generation
│   │   │   └── rag-service.ts    # Vector search over brand documentation
│   │   └── workflow/             # Human-in-the-Loop Governance
│   │       └── approval-engine.ts# Approval tickets & compliance reviews
│   └── server.ts                 # Express REST API & SSE streaming server
├── docker-compose.yml            # Container orchestration config
├── Dockerfile                    # Production container build
├── package.json                  # Dependencies & scripts
└── tsconfig.json                 # TypeScript compiler options
```

---

## 🛠️ API Reference

### Marketing Plan Orchestration
- `GET /api/v1/plans/stream?prompt=...`: Server-Sent Events (SSE) endpoint providing live status updates as each of the 6 agents completes its task.
- `POST /api/v1/plans/generate`: Synchronous plan generation endpoint returning the complete `MasterMarketingPlan`.
- `GET /api/v1/plans/active`: Returns the current active marketing plan saved on disk.
- `POST /api/v1/plans/active`: Updates and persists the active plan on disk.
- `GET /api/v1/plans/sample`: Returns the default brand-grounded plan (Engligenious).

### Creative Regeneration & Video Studio
- `POST /api/v1/plans/regenerate-section`: Granularly regenerates a single section (`reel`, `social`, `ads`, `emails`) without re-running the whole pipeline.
  ```json
  {
    "section": "reel",
    "options": { "angle": "JOB_INTERVIEW", "durationSeconds": 30 }
  }
  ```
- `POST /api/v1/plans/generate-video`: Generates a custom video script with camera prompts, voiceovers, and typography overlays.
  ```json
  {
    "prompt": "Focus on cracking tech interviews in English with zero stuttering",
    "angle": "JOB_INTERVIEW",
    "style": "FAST_PACED_SCREEN",
    "durationSeconds": 30,
    "targetPlatform": "INSTAGRAM_REELS"
  }
  ```

### Brand Settings & Integrations
- `GET /api/v1/settings`: Fetches the current brand profile and integration status.
- `POST /api/v1/settings/brand`: Updates company name, target audience, USPs, and Play Store/Website URLs.
- `POST /api/v1/settings/integrations`: Configures Meta, LinkedIn, X, and Email API keys and automation modes.

### Human-in-the-Loop Approvals
- `GET /api/v1/approvals`: Retrieves all pending compliance approval tickets.
- `POST /api/v1/approvals/:id/review`: Approves or rejects a campaign asset with reviewer audit notes.

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [npm](https://www.npmjs.com/) v9.0.0 or higher
- (Optional) [Ollama](https://ollama.ai/) installed locally for $0 zero-cost AI generation

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/chetanladumor/ai-marketing-saas.git
   cd ai-marketing-saas
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```
   *(Optional)* Add your OpenAI, Anthropic, or Gemini API keys to `.env`. If no external API keys are configured, the system seamlessly operates using local Ollama or high-fidelity deterministic brand templates.

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Or directly with tsx:
   ```bash
   npx tsx src/server.ts
   ```

5. **Open the Web UI:**
   Navigate to [http://localhost:4000](http://localhost:4000) in your browser.

---

## 🐳 Docker Deployment

To run the application inside a containerized environment:

```bash
docker-compose up --build -d
```

The server will be available at `http://localhost:4000`.

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
