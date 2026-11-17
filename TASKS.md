# Pending Tasks Backlog

A focused checklist of operational tasks specifically tied to upcoming unreleased features and known UI/UX debt.

### 🐛 Bug Fixes & Tech Debt
- [x] **State Syncing:** Ensure `isAuthReady` does not flash the loading spinner longer than necessary on cached connections.
- [x] **Pagination/Virtualization:** The `TOOLS_REGISTRY` mapping on the Directory page will get sluggish when scaled past 200+ tools. Implement window virtualization or clean pagination.
- [x] **Firestore Sync:** User saved stacks are migrated to Firestore. Automatic migration script moves legacy `localStorage` stacks into the user's `/stacks` Firestore collection.

### ✨ Features & UI Implementations
- [x] **Stack Share Links:** Add a "Copy Share Link" button inside `StackDetails.tsx` that copies a public route linking to the stack configuration.
- [x] **Social Share Cards & Favicon:** Implemented branded vector SVG favicon matching Jengo AI Design Language v1.0, 1200x630 OpenGraph / Twitter Cards, and interactive Social Share modal across Tool Details, Stack Details, Tool Cards, and Layout header/footer.
- [x] **AI Workflow Synthesizer:** Embedded Gemini 4 workflow generation directly inside Stack management with structured registry-bounded output and one-click save.
- [x] **Creator Submission Tracker:** Display user-submitted tools and review statuses (`PENDING_REVIEW`, `APPROVED`, `REJECTED`) in `Profile.tsx`.
- [x] **Bundle Optimization & Route Splitting:** Lazy-load all page routes and the Three.js `HeroCanvas` scene via `React.lazy` and `<Suspense>`.
- [ ] **Dark/Light Mode Toggle:** The theme is currently locked to the `dark-*` aesthetic. Implement a standard CSS variables abstraction for a light theme toggle.
- [x] **Enhanced Tool Comparison Matrix:** In `ComparisonPage.tsx`, allow users to freeze a specific tool in the left column, prefill selections via `?tools=`, and compare up to 5 tools.
- [x] **Filter State Persistence:** Store directory filter parameters in the URL via `useSearchParams()`.
- [x] **User Reviews & Atomic Upvotes UI:** Allow authenticated users to cast/toggle atomic `toolUpvotes` + `toolStats` votes and create or edit their verified review in `ToolDetails.tsx`.

### 🔐 Security & Verification
- [x] **Firestore Security Rules & Emulator Suite:** Enforce `canonicalToolIds()` sync, `toolUpvotes`/`toolStats` PII isolation, SSRF-safe HTTPS validation, exact document schemas, and full automated test coverage (`tests/firestoreRules.test.ts`, `tests/e2eWorkflows.test.ts`, `tests/security.test.ts`).
- [x] **Server-Side Gemini Proxy Architecture:** Route all `/api/chat` and `/api/workflow/suggest` Gemini calls exclusively through Express middleware (`server/services/aiService.ts`) with strict schema & rate-limit guards.
