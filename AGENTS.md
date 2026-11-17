# JengaForge AI Agent Directives

> **Notice:** This file serves as the core system instruction overlay for AI agents working within this application. It provides context, rules, and expectations to ensure consistent codebase evolution.

## 🤖 Global Persona & Rules
- **First-Task Directive: Mandatory Real-Time Model Landscape Sync:**
  Tool versions and AI frontier models must be updated constantly. An AI agent's **FIRST task** in any session involving models, registry data, or landscape overviews MUST always be to execute web searches (Google Search via `search_web`) for the newest frontier model updates, version bumps, deprecations, and capabilities across key labs (Anthropic Claude, OpenAI GPT, Google DeepMind Gemini, xAI Grok, DeepSeek, Black Forest Labs Flux, Runway, Midjourney, Anysphere Cursor). The agent must then effectively edit `constants.ts`, `README.md`, and affected stacks to keep the registry in strict sync with real-time ground truth.
- **Timeline Context:** Current era is **October 2026**. Never refer to legacy models (ChatGPT 4, Claude 3.5, or Gemini 1.5) as cutting-edge. The baseline frontier models include Claude Sonnet 5.5 / Opus 5.5, GPT-6 Astra / Sol, Gemini 4 Argon / Gemini 3.8 Flash, Grok 4.7, DeepSeek-V4.1-Flash, FLUX 3, Runway Gen-4.5, and Midjourney V8.2. Always record `lastVerified` dates.
- **Design Aesthetic:** "Brutalist & High-Contrast" (Kenyan-inspired). Use heavy font weights (`font-black`, `uppercase`, `tracking-widest`), sharp lines (no rounded corners unless necessary `rounded-none`), and high contrast (`text-surface-text` vs `bg-dark-900`). Primary brand color is Jenga Orange (`bg-jenga-500`) and Bunifu Yellow (`#FFD100`).
- **Communication:** Responses to the user should be concise, professional, and slightly energetic. Avoid robotic or overly apologetic language. 
- **Action-Oriented:** Prefer issuing tool calls directly over explaining what you *could* do.

## 🏗️ Architecture Constraints
- **Full-Stack Vite + Express Runtime:** Frontend operates as a Vite/React 19 SPA backed by `server.ts` (Express 5) serving REST APIs and AI proxy routes on port `3000`.
- **Tailwind Strictness:** ALL styling must be done via Tailwind CSS v4 utility classes and design tokens defined in `index.css` (`@theme`). Avoid unnecessary raw CSS blocks.
- **Server-Side Gemini Proxy Policy:** Never embed API keys into client source files, `vite.config.ts`, or browser storage. All `@google/genai` calls (`gemini-4-hydrogen`) must run strictly server-side via Express routes (`/api/chat`, `/api/workflow/suggest`) using `process.env.GEMINI_API_KEY`.
- **Interactive UI Dialogs:** Never use `window.alert`, `window.confirm`, or `window.open`; render accessible inline UI banners or React modals.

## 🪝 Development Hooks & Checks
Before completing any coding task, an AI assistant should confirm the following:
1. **Linter & Typecheck:** Run `npm run lint` (`--max-warnings 0`, including Firebase security rules checks) and `npm run typecheck`.
2. **Automated Tests:** Run `npm test` (`sync:rules` + Vitest/node test suites in `tests/`).
3. **Scroll Resets:** Ensure route changes trigger `window.scrollTo(0, 0)` cleanly via `<ScrollToTop />` in `App.tsx`.
4. **Sanitized Errors:** Avoid logging raw `error` objects; use `sanitizeClientErrorMessage` or `error instanceof Error ? error.message : "Unknown error"`.

## 📦 Versioning Mechanics
- When adding a significant feature (e.g., Firestore Storage), update the **App Version** in `CHANGELOG.md` properly using SemVer formatting.
- Check and update `PLANNING.md` when closing out major Phase goals. Check off boxes in `TASKS.md` when micro-tickets are closed.
