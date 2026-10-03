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
*   **Comprehensive Specs:** Display pricing, rating, reviews, and specific performance metrics (Power, Ease of Use, Community, Cost Efficiency).
*   **Performance Radar:** Visual radar chart comparing the tool's specs against industry standards.
*   **Related Tools:** Suggest similar tools based on category and tags.
*   **Stack Integration:** Ability to save the tool to a custom user stack.

### 3.3. Comparison Engine
*   **Side-by-Side View:** Compare up to 3 tools simultaneously.
*   **Visual Radar Comparison:** Overlay multiple tools on a single radar chart to visualize strengths and weaknesses.
*   **Detailed Table:** Tabular breakdown of features, pricing, and ratings.

### 3.4. Stack Builder (Workflows)
*   **Custom Stacks:** Users can create named stacks (e.g., "My Coding Workflow").
*   **Tool Management:** Add or remove tools from stacks.
*   **Persistence:** Stacks are saved locally (MVP) or via backend (Future).

### 3.5. User Profile
*   **Avatar & Info:** Display user information using CSS-based avatars (no external images).
*   **Saved Stacks:** Quick access to the user's created stacks.

### 3.6. AI Agent Repository
*   **Agent Directory:** A dedicated section to discover, compare, and evaluate autonomous AI agents (e.g., coding agents, research agents, customer support agents).
*   **Agent Capabilities:** Detailed breakdown of what each agent can do, supported integrations, and autonomy levels.
*   **Use Cases:** Real-world examples of how specific agents are being deployed.

### 3.7. AI Workflow Repository
*   **Workflow Templates:** A curated library of end-to-end AI workflows (e.g., "Automated Content Pipeline", "AI-Driven Sales Outreach").
*   **Step-by-Step Guides:** Visual representations of how different tools and agents connect to form a complete workflow.
*   **Export/Import:** Ability to export workflow configurations or clone community workflows into a user's own workspace.

## 4. Non-Functional Requirements
*   **Performance:** The application must load instantly. External image dependencies are strictly prohibited to prevent blank screens or slow rendering on deployment platforms like Vercel.
*   **Design System:** Dark mode by default, utilizing a custom "Jenga" orange/amber color palette.
*   **Responsiveness:** Fully responsive across mobile, tablet, and desktop using Tailwind CSS.
*   **Tech Stack:** React 18+, Vite, Tailwind CSS, Lucide React, Recharts.
