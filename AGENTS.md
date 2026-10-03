# JengaForge AI Agent Directives

> **Notice:** This file serves as the core system instruction overlay for AI agents working within this application. It provides context, rules, and expectations to ensure consistent codebase evolution.

## 🤖 Global Persona & Rules
- **First-Task Directive: Mandatory Real-Time Model Landscape Sync:**
  Tool versions and AI frontier models must be updated constantly. An AI agent's **FIRST task** in any session involving models, registry data, or landscape overviews MUST always be to execute web searches (Google Search via `search_web`) for the newest frontier model updates, version bumps, deprecations, and capabilities across key labs (Anthropic Claude, OpenAI GPT, Google DeepMind Gemini, xAI Grok, DeepSeek, Black Forest Labs Flux, Runway, Midjourney, Anysphere Cursor). The agent must then effectively edit `constants.ts`, `README.md`, and affected stacks to keep the registry in strict sync with real-time ground truth.
- **Timeline Context:** Current era is **October 2026**. Never refer to legacy models (ChatGPT 4, Claude 3.5, or Gemini 1.5) as cutting-edge. The baseline frontier models include Claude Sonnet 5.5 / Opus 5.5, GPT-6 Astra / Sol, Gemini 4 Argon / Gemini 3.8 Flash, Grok 4.7, DeepSeek-V4.1-Flash, FLUX 3, Runway Gen-4.5, and Midjourney V8.2. Always record `lastVerified` dates.
- **Design Aesthetic:** "Brutalist & High-Contrast" (Kenyan-inspired). Use heavy font weights (`font-black`, `uppercase`, `tracking-widest`), sharp lines (no rounded corners unless necessary `rounded-none`), and high contrast (`text-surface-text` vs `bg-dark-900`). Primary brand color is Jenga Orange (`bg-jenga-500`) and Bunifu Yellow (`#FFD100`).
- **Communication:** Responses to the user should be concise, professional, and slightly energetic. Avoid robotic or overly apologetic language. 
- **Action-Oriented:** Prefer issuing tool calls directly over explaining what you *could* do.

## 🏗️ Architecture constraints
- **Frontend Only by Default:** This app primarily operates as a Vite/React application. 
- **Tailwind Strictness:** ALL styling must be done via Tailwind CSS utility classes. Avoid creating raw `.css` blocks unless absolutely necessary for complex keyframe animations or WebGL hooks.
- **BYOK Policy (Bring Your Own Key):** Never embed API keys into the repository, environment variables pushed to `.env.local`, or `vite.config.ts`. API Keys (especially for `@google/genai`) must be resolved via the user's `localStorage` (`USER_GEMINI_API_KEY`). Ensure robust fallback UI telling users to provide their key.

## 🪝 Development Hooks & Checks
Before completing any coding task, an AI assistant should internally confirm the following:
1. **Linter Rule:** Run `npm run lint` and verify `eslint` throws no warnings. If the linter fails (e.g., unused variables), fix them immediately.
2. **Secret Checking:** Run `grep -ri "api_key" .` to ensure no sensitive tokens leaked into the output code.
3. **Scroll Resets:** Ensure new routes utilize the `window.scrollTo` component lifecycle to prevent users from spawning mid-page.
4. **Error Handling:** Avoid logging raw `error` objects to `console.log`. Pre-parse them via `error instanceof Error ? error.message : "Unknown error"` so API tokens don't cache in network debug logs.

## 📦 Versioning Mechanics
- When adding a significant feature (e.g., Firestore Storage), update the **App Version** in `CHANGELOG.md` properly using SemVer formatting.
- Check and update `PLANNING.md` when closing out major Phase goals. Check off boxes in `TASKS.md` when micro-tickets are closed.
