# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.8.1] - 2026-10-07

### Architectural Unification & Zero-Trust Hardening
- **Decommissioned Obsolete Server Endpoints (`server.ts`)**:
  - Completely removed legacy in-memory submission and upvote endpoints (`POST /api/v2/tools/submit`, `POST /api/v2/tools/:id/upvote`) and ephemeral trackers (`toolSubmissions`, `upvotedMap`).
  - Unified the architecture to use authenticated, persistent Firestore operations with cryptographic user verification, eliminating the split-architecture vulnerability.
- **Firestore Canonical Registry Enforcement (`firestore.rules`, `services/toolService.ts`)**:
  - Embedded `canonicalToolIds()` validation in Firestore rules to guarantee that `toolUpvotes`, user `savedToolIds`, `reviews`, and custom `stacks` can only reference canonical JengaForge tools.
  - Added CEL rule `data.toolIds.hasOnly(canonicalToolIds())` preventing arbitrary or spoofed tool IDs across all stack documents.
- **Deep Firestore URL & SSRF Defense (`firestore.rules`, `services/securityUtils.ts`, `components/SubmitToolModal.tsx`)**:
  - Replaced weak scheme prefix checks with RE2 regex rule `isSafePublicHttpsUrl(url)` directly in Firestore security rules.
  - Rejects localhost, loopback, private RFC 1918 IPv4 ranges (10.*, 172.16-31.*, 192.168.*), AWS/GCP cloud metadata (169.254.169.254), and internal domain names (.local, .internal, .lan, .corp, .test), strictly requiring HTTPS.
- **Shared Production Security Module & Test Refactoring (`services/securityUtils.ts`, `tests/security.test.ts`)**:
  - Extracted `isValidHttpUrl`, `isAllowedOrigin`, and `sanitizeProfileUpdates` into `services/securityUtils.ts`.
  - Replaced all duplicated test logic with direct imports of production implementations, ensuring test assertions validate the actual runtime code.
- **Developer API Docs Realignment (`pages/ApiDocs.tsx`)**:
  - Updated API docs and interactive console to reflect real REST endpoints (`/api/v2/tools`, `/api/v2/tools/:id`, `/api/v2/stacks/featured`, `/api/v2/stats`, `/api/chat`, `/api/health`).
  - Updated BYOK documentation copy to accurately reflect zero-trust browser-side execution rather than deprecated header transmission.

### Security, Persistence & CI Hardening
- **Authenticated & Persistent Tool Submissions (`services/toolService.ts`, `server.ts`, `firestore.rules`)**:
  - Migrated tool submissions from ephemeral in-memory state to persistent Cloud Firestore (`toolSubmissions/{submissionId}`).
  - Locked `submittedBy` strictly to `request.auth.uid` via Firestore security rules and client derivation.
  - Hardened `/api/v2/tools/submit` to require valid `Authorization: Bearer <token>`, returning HTTP 401 for unauthenticated calls.
- **Persistent Multi-Instance Upvote Architecture (`services/toolService.ts`, `firestore.rules`)**:
  - Replaced volatile server-memory IP tracking with persistent Firestore documents (`toolUpvotes/{toolId}_{userId}`).
  - Enforced deterministic idempotency: exactly 1 upvote per user per tool.
- **Stack Registry Integrity & Canonical Validation (`services/stackService.ts`, `tests/security.test.ts`)**:
  - Implemented `filterCanonicalToolIds` to validate tool lists against the canonical registry, rejecting arbitrary or malicious tool IDs.
- **Client Metric Lockdown (`context/AuthContext.tsx`, `firestore.rules`)**:
  - Locked `masteryLevel` and `stacksCreated` as server-controlled metrics; client mutations are rejected by Firestore security rules.
- **Review Update Lifecycle & Verified Identity (`services/reviewService.ts`, `firestore.rules`)**:
  - Fixed update lifecycle bug by preserving original `createdAt` and setting `updatedAt`.
  - Verified reviewer identity directly from `auth.currentUser` rather than untrusted client payloads.
- **CORS Policy Hardening (`server.ts`)**:
  - Tightened origin allowlist by eliminating broad wildcard matches in favor of exact production and preview hostnames.
- **Automated Testing & CI Pipeline (`tests/`, `.github/workflows/ci.yml`, `.github/dependabot.yml`)**:
  - Built comprehensive automated security and data-integrity test suite (`tests/security.test.ts`, `tests/registry.test.ts`).
  - Added `npm test` and `npm run typecheck` scripts.
  - Updated CI to run lint, typecheck, automated test execution, dependency vulnerability audit (`npm audit`), and build.
  - Configured automated Dependabot dependency updates.
- **Production Efficiency & Sanitized Errors (`firebase.ts`, `context/AuthContext.tsx`)**:
  - Removed startup test connection probe in production.
  - Sanitized Firestore error handling to avoid leaking internal collection paths and user identifiers.

## [3.7.0] - 2026-10-04

### Security & Architecture Hardening
- **Gemini BYOK Client-Side Isolation (`services/geminiService.ts`, `server.ts`)**:
  - Enforced zero-trust boundary for user API keys. When Bring-Your-Own-Key is used, requests are executed client-side via `@google/genai` directly from the user's browser, preventing user keys from ever touching proxy headers, server traces, or backend logs.
  - Hardened `/api/chat` to exclusively use `process.env.GEMINI_API_KEY` in server-proxy mode.
- **CORS Allowlist Enforcement (`server.ts`)**:
  - Replaced open `cors()` with an origin allowlist restricted to `https://jenga-forge.vercel.app`, `https://jengaforge.ai`, and local development ports.
- **Community Tool Moderation Workflow (`server.ts`, `components/SubmitToolModal.tsx`)**:
  - Submissions are assigned `PENDING_REVIEW` status in a staging queue rather than directly polluting the live canonical registry.
  - Implemented SSRF-resistant URL validation (`isValidHttpUrl`) verifying public DNS hostnames and rejecting private RFC 1918 IPs, link-local addresses, and `.local`/`.internal` domains.
- **Database Idempotency & Firestore Rules Hardening (`firestore.rules`, `services/reviewService.ts`)**:
  - Converted review creation to deterministic document IDs (`reviews/{userId}_{toolId}`) with Firestore rules enforcement, guaranteeing a strict 1-review-per-user-per-tool constraint at the database layer.
  - Hardened user document mutation rules preventing modification of `id`, `email`, and `joinedAt`.
  - Sanitized `updateProfile` in `context/AuthContext.tsx` with field-level whitelisting.

### Repo Hygiene & Ecosystem Sync
- Removed redundant `bun.lock` to unify dependency management around standard `package-lock.json` and `npm`.
- Synchronized all tool registry entries in `constants.ts` with `status: "Active" | "Watch" | "Deprecated"` and `lastVerified: "October 2026"`.
- Updated server ecosystem telemetry, assistant dates, and model references.

## [3.6.0] - 2026-10-03

### Added
- **Mandatory Real-Time Model Sync Agent Directive (`AGENTS.md`)**:
  - Codified the permanent first-task protocol requiring agents to run Google web searches for latest model updates, deprecations, and version bumps before modifying model constants.
- **October 2026 Frontier Model Landscape Sync (`constants.ts`, `README.md`)**:
  - **Anthropic Claude**: Added **Claude Sonnet 5.5** (Sept 28, 2026 coding benchmark) and **Claude Opus 5.5** (Sept 22, 2026 senior reasoning).
  - **OpenAI**: Added **GPT-6 Astra** (Sept 22, 2026 frontier flagship) with multi-agent orchestration.
  - **Google DeepMind**: Added **Gemini 4 Argon** (Oct 1, 2026 enterprise 1M-token model) and updated Gemini 3.1 Pro.
  - **xAI**: Added **Grok 4.7** (Sept 21, 2026 coding endurance and self-verification).
  - **DeepSeek**: Added **DeepSeek-V4.1-Flash** (Sept 10, 2026 native visual understanding open-weight model).
  - **Image & Video**: Added **FLUX 3 Image** (Oct 2, 2026 4K layout control), **Midjourney V8.2** (instruction edits & 4K HD), and **Runway Gen-4.5**.
  - **Active Workflows Sync**: Updated `FEATURED_STACKS` across Autonomous Developer, Cinematic Video Creator, and Deep Research to reference the verified live frontier tools.
  - **Deprecation Pipeline**: Documented legacy and discontinued status for Sora Interactive, DALL·E standalone, Runway Gen-2, and legacy copy generators with visual UI badges and alert notices.


## [3.5.0] - 2026-04-20

### Added
- **Global Search & Command Palette System (`components/GlobalSearchModal.tsx`)**:
  - Implemented real-time multi-dimensional search spanning AI Tools, Featured Workflows/Stacks, Categories, and quick utilities.
  - Multi-criteria matching: tool/stack names, descriptions, categories, tags, pricing tiers, roles, and integrated tool lists.
  - Global keyboard navigation (`⌘K` / `Ctrl+K` and `/` quick shortcut triggers) with arrow key selection (`↑`/`↓`), `Enter` navigation, and `Esc` dismissal.
  - Category filter tabs (`All`, `Tools`, `Workflows`, `Categories`) with live match counts.
  - Trending search shortcuts, recent search history persistence via `localStorage`, and instant fallback actions.
  - Seamless navigation bar integration across desktop and mobile headers (`components/Layout.tsx`).
- **High-Performance Kinetic Blueprint Canvas Animation (`components/AmbientBackground.tsx`)**:
  - Upgraded global ambient background with hardware-accelerated 60fps HTML5 Canvas rendering.
  - Interactive laser crosshair reticle and horizontal/vertical guide beams tracking cursor with smooth mathematical lerp damping.
  - Real-time digital drafting coordinate readout (`[ X : Y ] CAD.01`) in JetBrains Mono.
  - Interactive seismic pulse shockwaves radiating dynamically across grid lines upon mouse clicks.
  - 28 floating construction micro-sparks and luminous blueprint data nodes with breathing luminescence.
  - Architectural blueprint calibration ruler notches (`000` - `192`) and signature Jengo hazard stripe top rule.
  - Battery-friendly lifecycle optimization pausing rendering on tab blur and fully respecting `prefers-reduced-motion`.


## [3.4.0] - 2026-04-20

### Added
- **Kinetic Architectural 3D Forge & Blueprint Grid (`components/Robot3D.tsx`)**:
  - Replaced literal static box with an architectural assemblage of 6 interlocking construction beams/bricks with sharp wireframe edges, glowing octahedral forge core, and damped 3D cursor parallax.
  - Added `ArchitecturalGrid` with perspective-tilted blueprint wireframe lines, expanding scan wave pulses, and origin crosshairs.
  - Upgraded `ParticleField` to 180 deterministic harmonic construction embers with interactive cursor deflection and dual-axis wave physics.
  - Replaced external HDR network assets with pure local multi-directional procedural lighting.
  - Built-in `prefers-reduced-motion` support honoring WCAG accessibility standards.
- **Ambient GPU-Accelerated Blueprint & Cursor Spotlight (`components/AmbientBackground.tsx`)**:
  - Created a global 60fps GPU compositor ambient background with hairline blueprint grid, smooth lerp-damped cursor aura (`#FFD100`/`#FF8C00`), and architectural survey corner brackets across all app routes via `Layout.tsx`.

## [3.3.0] - 2026-04-20

### Added
- **Jengo AI Design Language v1.0 Branded Favicon**:
  - Created flat, line-based construction block and J-foundation vector favicon (`public/favicon.svg` and `public/favicon.ico`) in Bunifu Yellow (`#FFD100`) and Jengo Black (`#0A0A0A`).
  - Configured standard and high-density SVG/ICO links and Apple touch icons in `index.html`.
- **OpenGraph & Twitter Card SEO Infrastructure**:
  - Created 1200x630 social card assets (`public/social-card.png`, `public/social-card.svg`, `public/og-image.png`) with signature 45° hazard stripes, architectural blueprint grid, and Bunifu Suite branding.
  - Enhanced `index.html` with complete OpenGraph metadata, Twitter `summary_large_image` cards, author/keyword tags, and Schema.org JSON-LD `WebApplication` structured data.
- **Interactive Social Card Share Modal (`components/SocialShareModal.tsx`)**:
  - Interactive social share dialog featuring live social card rendering and direct 1-click share intents for X (Twitter), LinkedIn, WhatsApp, Telegram, Reddit, and native device share (`navigator.share`).
  - Direct share link copy with instant visual confirmation (zero `window.alert` violation).
  - Developer Markdown badges and HTML embed snippets with one-click clipboard copying for READMEs and blogs.
  - Seamlessly integrated across Tool Details (`ToolDetails.tsx`), Stack Blueprints (`StackDetails.tsx`), Tool Directory Cards (`ToolCard.tsx`), and global Header/Footer (`Layout.tsx`).

## [3.2.0] - 2026-04-20

### Added
- **Full-Stack REST Tool Integration (`services/toolService.ts`)**:
  - Connected frontend client to Express backend routes (`/api/v2/tools`, `/api/v2/tools/:id`, `/api/v2/stats`, `/api/health`).
  - Added resilient client-side fallback with query filtering and pagination when backend is offline.
  - Live server health badge with real-time ping latency display on Directory Explore screen.
- **Crowdsourced Tool Submission Portal (`SubmitToolModal.tsx`)**:
  - Interactive submission modal for creators to publish AI models, agents, and frameworks.
  - Direct integration with `POST /api/v2/tools/submit` validation and instant directory propagation.
- **Live Tool Upvoting & Engagement (`ToolDetails.tsx`)**:
  - Live upvote button with active state toggle hitting `POST /api/v2/tools/:id/upvote`.
  - Share link button with clipboard copy confirmation.
- **Interactive Developer API Explorer & Console (`ApiDocs.tsx`)**:
  - Live API testing console allowing developers to test GET/POST endpoints against the live Express server.
  - Real-time ecosystem metrics dashboard (Total Tools in DB, Average Rating, Reviews count).
  - Multi-language client code generator (cURL, TypeScript/fetch, Python/requests) with one-click copy.

### Added
- 3D Interactive Animation UI/UX with Framer Motion.
- Advanced parallax effects on Hero sections.
- 3D tilt interactions on Tool Cards.

## [3.1.0] - 2026-04-20

### Added
- **Full-Stack Backend Infrastructure (`server.ts`)**:
  - Implemented server-side Gemini AI proxy route (`POST /api/chat`) with strict request sanitization, dedicated rate-limiting (30 req/min), and BYOK header support.
  - Deployed RESTful Tools API (`GET /api/v2/tools` and `/api/v2/tools/:id`) with query search, multi-category filters, sorting, and pagination metadata.
  - Added Featured Stacks API (`GET /api/v2/stacks/featured`).
  - Added System Info (`GET /api/sysinfo`) and Health checks (`GET /api/health`).
- **Enhanced Comparison Matrix (`ComparisonPage.tsx`)**:
  - Added support for comparing up to 5 tools simultaneously.
  - Implemented "Freeze Baseline Tool" capability with sticky positioning, visual badges, and instant benchmark locking.
  - Added live registry filtering within the comparison picker.
- **Directory Pagination & Filter Sync (`Home.tsx`)**:
  - Implemented responsive pagination controls (9 tools per page) with page number navigation and item counts.
  - Full URL search parameter synchronization (`useSearchParams`) for category, query, sort, and page state.
- **Firestore Legacy Migration**:
  - Automatic migration script in `AuthContext` to transition any legacy `localStorage` stacks into the user's Firestore collection.
- **Developer Documentation (`ApiDocs.tsx`)**:
  - Documented live `/api/v2/tools`, `/api/v2/stacks/featured`, and `/api/chat` endpoints.

## [3.0.0] - 2026-03-14

### Changed
- **Major Data Update**: Shifted the timeline to April 2026.
- Updated `TOOLS_REGISTRY` to include the latest Generation 5 models and real-time updates:
  - Gemini 3.1 Pro (Google)
  - ChatGPT 5.4 (OpenAI)
  - Claude 4.7 Opus & Sonnet (Anthropic)
  - Grok 4.3 (xAI)
  - Sora Interactive (OpenAI)
  - Devin v2 & v0.dev (V3)
  - DeepSeek-V4 (China)
  - Midjourney v8
- Updated Gemini AI Assistant prompt to reflect the April 2026 landscape.
- Updated UI verification badges to "Verified 2026".
- Refactored `ToolDetails.tsx` to use lazy initialization for `useState` and `useMemo` for derived states.

## [2.0.0] - 2025-12-08

### Added
- Introduced the concept of "Agentic Systems" vs "Chatbots".
- Added `FEATURED_STACKS` for curated tool collections.
- Added comprehensive tool specifications (power, ease of use, community, cost efficiency, integration).

### Changed
- Shifted timeline to December 2025.
- Renamed `MOCK_TOOLS` to `TOOLS_REGISTRY` to signify production-ready live data.
- Updated Gemini AI Assistant prompt to reflect the December 2025 landscape.

## [1.0.0] - 2024-10-01

### Added
- Initial release of JengaForge AI Tools Repository.
- Basic tool listing and filtering.
- Integration with Gemini 2.0.
- User authentication and profile management.
- Custom stack creation.
