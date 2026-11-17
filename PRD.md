# JengaForge Product Requirements Document (PRD)

## 1. Product Overview
**Name:** JengaForge
**Tagline:** Build Your Stack
**Vision:** A curated, community-driven ecosystem to find, compare, and stack the best AI tools. JengaForge helps developers, creators, and businesses navigate the complex AI landscape by providing verified data, performance metrics, and workflow combinations.

## 2. Target Audience
*   **Software Engineers & Developers:** Looking for coding assistants, API providers, and deployment tools.
*   **Content Creators:** Searching for video, audio, and image generation tools.
*   **Founders & Indie Hackers:** Needing to build "stacks" of tools to run their businesses efficiently.

## 3. Core Features & Requirements

### 3.1. Tool Directory (Home)
*   **Search & Filtering:** Users can search tools by name, tag, or category (e.g., LLM, Image Gen, Video Gen, Audio, Dev Tools).
*   **Market Stats Dashboard:** Visual representation of the AI market landscape.
*   **Featured Stacks:** Showcase community-curated combinations of tools.

### 3.2. Tool Details Page
*   **Comprehensive Specs:** Display pricing, rating, reviews, and specific performance metrics (Power, Ease of Use, Community, Cost Efficiency, Integration).
*   **Performance Radar:** Visual radar chart comparing the tool's specs against industry standards.
*   **Stack Integration & Community Engagement:** Save tools to custom stacks, cast deterministic atomic upvotes, and publish verified user reviews.

### 3.3. Comparison Engine
*   **Side-by-Side View:** Compare up to 5 tools simultaneously via interactive selection or shareable `?tools=` URLs.
*   **Visual Radar Comparison & Sticky Baseline:** Overlay multiple tools on a single radar chart and freeze a baseline tool column while scrolling horizontally.
*   **Detailed Table:** Tabular breakdown of features, pricing, ratings, and tags.

### 3.4. Stack Builder & AI Workflow Synthesizer
*   **Custom Stacks:** Users can create named stacks (e.g., "My Coding Workflow") and add/remove canonical registry tools.
*   **AI Workflow Synthesizer:** Structured Gemini 4 workflow generator (`POST /api/workflow/suggest`) producing step-by-step toolchains strictly bounded to canonical registry tools.
*   **Persistence & Sharing:** Stacks persist in Cloud Firestore (`/stacks`) with server timestamps and public `/stack/:id` share routes.

### 3.5. User Profile
*   **Profile & Avatar:** Authenticated identity via Firebase Auth (Google OAuth / Email) supporting CSS monograms or validated public HTTPS avatar URLs.
*   **Saved Stacks, Tools & Submissions:** Access saved tools, managed workflows, and creator tool submission statuses (`PENDING_REVIEW`, `APPROVED`, `REJECTED`).

### 3.6. AI Agent & Starter Stack Repository
*   **Agent Directory:** Discover, compare, and evaluate autonomous AI agents across coding, research, and orchestration.
*   **Starter Workflows:** Curated multi-step starter blueprints (`STARTER_STACKS`) cloneable directly into authenticated workspaces.

## 4. Non-Functional Requirements
*   **Performance & Bundle Splitting:** Route-level `React.lazy` code splitting and lazy-loaded Three.js hero visuals (`HeroCanvas`) to keep initial page loads fast.
*   **Security & Access Control:** Express 5 REST & server-side Gemini proxy (`/api/chat`, `/api/workflow/suggest`) with Helmet CSP, strict CORS allowlists, rate limiting, and hardened Cloud Firestore security rules (`toolStats` / `toolUpvotes` PII isolation, SSRF-safe URL validation).
*   **Design System:** Dark brutalist aesthetic utilizing Jenga Orange/Amber and Bunifu Yellow tokens (`#0A0A0A`, `#FFD100`, `#FF8C00`) with Space Grotesk, Inter, and JetBrains Mono typography.
*   **Tech Stack:** React 19, TypeScript, Vite, Express 5, Tailwind CSS v4, Firebase Auth & Cloud Firestore, Recharts, Three.js, `@google/genai`.
