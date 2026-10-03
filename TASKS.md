# Pending Tasks Backlog

A focused checklist of operational tasks specifically tied to upcoming unreleased features and known UI/UX debt.

### 🐛 Bug Fixes & Tech Debt
- [x] **State Syncing:** Ensure `isAuthReady` does not flash the loading spinner longer than necessary on cached connections.
- [x] **Pagination/Virtualization:** The `TOOLS_REGISTRY` mapping on the Directory page will get sluggish when scaled past 200+ tools. Implement window virtualization or clean pagination.
- [x] **Firestore Sync:** User saved stacks are migrated to Firestore. Automatic migration script moves legacy `localStorage` stacks into the user's `/stacks` Firestore collection.

### ✨ Features & UI Implementations
- [x] **Stack Share Links:** Add a "Copy Share Link" button inside `StackDetails.tsx` that copies a public route linking to the stack configuration.
- [x] **Social Share Cards & Favicon:** Implemented branded vector SVG favicon matching Jengo AI Design Language v1.0, 1200x630 OpenGraph / Twitter Cards, and interactive Social Share modal across Tool Details, Stack Details, Tool Cards, and Layout header/footer.
- [ ] **Dark/Light Mode Toggle:** The theme is currently locked to the `dark-*` aesthetic. Implement a standard CSS variables abstraction for a light theme toggle.
- [x] **Enhanced Tool Comparison Matrix:** In `ComparisonPage.tsx`, allow users to freeze a specific tool in the left column so they can horizontal-scroll compare it against 4-5 other tools.
- [x] **Filter State Persistence:** If a user clicks the "Text Generation" filter in the directory, clicks a tool, and hits 'back', the filter resets. Store filter parameters in the URL via `useSearchParams()`.
- [x] **User Reviews UI:** In `ToolDetails.tsx`, stub out a section beneath the radar chart to allow authenticated users to leave a text review or star-rating.

### 🔐 Security & Operations
- [x] **Firestore Security Rules:** Draft rigid `firestore.rules` for the upcoming user-generated Content (UGC) phase (e.g., verifying user schema lengths, rate limiting via writes).
