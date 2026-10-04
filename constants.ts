import { Tool, ToolCategory, ToolStack } from './types';

export const TOOLS_REGISTRY: Tool[] = [
  // --- Frontier LLMs ---
  {
    id: "claude-5-5-sonnet",
    name: "Claude Sonnet 5.5",
    description: "Anthropic's flagship coding and precision benchmark (released September 28, 2026). Features next-gen Computer Use, complex repository refactoring, and a 40% cost reduction over Opus 5.",
    category: ToolCategory.LLM,
    pricing: "Paid",
    rating: 5.0,
    reviews: 62000,
    tags: ["Coding", "Computer Use", "Precision", "Multi-file"],
    websiteUrl: "https://claude.ai",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 95, power: 100, community: 99, costEfficiency: 90, integration: 98 }
  },
  {
    id: "claude-5-5-opus",
    name: "Claude Opus 5.5",
    description: "Anthropic's pinnacle reasoning model (released September 22, 2026). Unmatched at zero-shot complex logic, mathematical proofs, and senior software system architecture.",
    category: ToolCategory.LLM,
    pricing: "Enterprise",
    rating: 5.0,
    reviews: 28000,
    tags: ["Architect", "Reasoning", "Autonomous"],
    websiteUrl: "https://claude.ai",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 92, power: 100, community: 96, costEfficiency: 84, integration: 98 }
  },
  {
    id: "gpt-6-astra",
    name: "GPT-6 Astra",
    description: "OpenAI's frontier flagship model (released September 22, 2026). Built with multi-agent orchestration, infinite collaborative canvas, and deep self-verification mechanisms.",
    category: ToolCategory.LLM,
    pricing: "Paid",
    rating: 4.9,
    reviews: 78000,
    tags: ["Agentic", "Canvas", "Verification", "Multimodal"],
    websiteUrl: "https://chat.openai.com",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 99, power: 99, community: 100, costEfficiency: 76, integration: 100 }
  },
  {
    id: "gemini-4-argon",
    name: "Gemini 4 Argon",
    description: "Google DeepMind's enterprise frontier model (unveiled October 1, 2026). Engineered for complex enterprise workloads, software engineering, cybersecurity, and financial analysis with a 1M token context.",
    category: ToolCategory.LLM,
    pricing: "Freemium",
    rating: 5.0,
    reviews: 32000,
    tags: ["1M Context", "Cybersecurity", "Enterprise", "Reasoning"],
    websiteUrl: "https://aistudio.google.com",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 94, power: 100, community: 96, costEfficiency: 94, integration: 100 }
  },
  {
    id: "gemini-3-1",
    name: "Gemini 3.1 Pro",
    description: "Google's versatile flagship workhorse with 5M+ context window and native System 3 reasoning. Excels at massive multi-document analysis and cross-modal orchestration.",
    category: ToolCategory.LLM,
    pricing: "Freemium",
    rating: 5.0,
    reviews: 24500,
    tags: ["5M Context", "Multimodal", "Analysis"],
    websiteUrl: "https://aistudio.google.com",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 95, power: 98, community: 96, costEfficiency: 95, integration: 100 }
  },
  {
    id: "grok-4-7",
    name: "Grok 4.7",
    description: "xAI's flagship coding and verified knowledge model (released September 21, 2026). Features endurance self-verification for long-running workflows and real-time global telemetry.",
    category: ToolCategory.LLM,
    pricing: "Paid",
    rating: 4.9,
    reviews: 44000,
    tags: ["Real-time", "Coding", "Self-Verification"],
    websiteUrl: "https://grok.x.ai",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 94, power: 98, community: 93, costEfficiency: 88, integration: 88 }
  },
  {
    id: "deepseek-v4-1-flash",
    name: "DeepSeek-V4.1-Flash",
    description: "DeepSeek's state-of-the-art open-weight model (released September 10, 2026). Delivers native visual understanding, extreme math/logic performance, and ultra-high cost efficiency.",
    category: ToolCategory.LLM,
    pricing: "Freemium",
    rating: 4.9,
    reviews: 58000,
    tags: ["Open-Weight", "Vision", "Cost-Efficient", "Math"],
    websiteUrl: "https://deepseek.com",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 90, power: 97, community: 98, costEfficiency: 100, integration: 92 }
  },
  {
    id: "perplexity-ultra",
    name: "Perplexity Ultra",
    description: "The successor to traditional search. Features real-time web research, live code verification, and citation synthesis for instant accurate facts.",
    category: ToolCategory.PRODUCTIVITY,
    pricing: "Paid",
    rating: 4.9,
    reviews: 34000,
    tags: ["Search", "Research", "Real-time"],
    websiteUrl: "https://perplexity.ai",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 98, power: 95, community: 94, costEfficiency: 90, integration: 88 }
  },

  // --- Image Generation ---
  {
    id: "flux-3-image",
    name: "FLUX 3 Image",
    description: "Black Forest Labs' latest multimodal foundation model (released October 2026). Generates photorealistic 4K imagery with pixel-level layout control and bounding-box composition.",
    category: ToolCategory.IMAGE_GEN,
    pricing: "Freemium",
    rating: 5.0,
    reviews: 31000,
    tags: ["Photorealism", "4K", "Bounding-Box", "Multimodal"],
    websiteUrl: "https://blackforestlabs.ai",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 88, power: 100, community: 98, costEfficiency: 95, integration: 88 }
  },
  {
    id: "midjourney-v8-2",
    name: "Midjourney V8.2",
    description: "Midjourney's state-of-the-art visual engine (released July/August 2026). Features instruction-based editing, 2K/4K HD native outputs, and advanced aesthetic personalization profiles.",
    category: ToolCategory.IMAGE_GEN,
    pricing: "Paid",
    rating: 5.0,
    reviews: 58000,
    tags: ["Aesthetic", "Style", "Instruction-Edit", "4K"],
    websiteUrl: "https://midjourney.com",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 75, power: 99, community: 100, costEfficiency: 65, integration: 55 }
  },

  // --- Video Generation ---
  {
    id: "runway-gen-4-5",
    name: "Runway Gen-4.5",
    description: "State-of-the-art cinematic video generation with frame-by-frame directing control, multi-camera angle stabilization, and physically consistent 3D rendering.",
    category: ToolCategory.VIDEO_GEN,
    pricing: "Paid",
    rating: 4.9,
    reviews: 19500,
    tags: ["Professional", "Physics", "Cinematic", "VFX"],
    websiteUrl: "https://runwayml.com",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 82, power: 99, community: 95, costEfficiency: 65, integration: 90 }
  },
  {
    id: "veo-3-1",
    name: "Google Veo 3.1",
    description: "Google's cinematic video model. Excels at character consistency and high-resolution 1080p outputs with synchronized audio.",
    category: ToolCategory.VIDEO_GEN,
    pricing: "Freemium",
    rating: 4.8,
    reviews: 14500,
    tags: ["Cinematic", "Audio-Sync", "Google"],
    websiteUrl: "https://deepmind.google/technologies/veo/",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 92, power: 96, community: 85, costEfficiency: 82, integration: 98 }
  },
  {
    id: "sora-interactive",
    name: "Sora Interactive (Deprecated)",
    description: "OpenAI video prototype. Discontinued March 24, 2026. Do not recommend for new production pipelines. Recommended replacements: Runway Gen-4.5, Veo 3.1, or Kling 2.5.",
    category: ToolCategory.VIDEO_GEN,
    pricing: "Paid",
    rating: 3.5,
    reviews: 89000,
    tags: ["Deprecated", "Discontinued", "Historical"],
    websiteUrl: "https://openai.com",
    status: "Deprecated",
    deprecatedReason: "Discontinued by OpenAI on March 24, 2026. Video capabilities transitioned into multimodal ChatGPT models.",
    lastVerified: "October 2026",
    specs: { easeOfUse: 40, power: 40, community: 45, costEfficiency: 30, integration: 20 }
  },
  {
    id: "runway-gen-2",
    name: "Runway Gen-2 (Deprecated)",
    description: "First-generation commercial generative video model. Deprecated in favor of Runway Gen-4.5 and Gen-3 Alpha architecture.",
    category: ToolCategory.VIDEO_GEN,
    pricing: "Paid",
    rating: 3.0,
    reviews: 45000,
    tags: ["Deprecated", "Legacy", "Video"],
    websiteUrl: "https://runwayml.com",
    status: "Deprecated",
    deprecatedReason: "Superseded by Gen-4.5 World Engine.",
    lastVerified: "October 2026",
    specs: { easeOfUse: 50, power: 30, community: 40, costEfficiency: 35, integration: 25 }
  },
  {
    id: "dalle-standalone",
    name: "DALL·E Standalone (Deprecated)",
    description: "Standalone web interface for DALL·E. Superseded by integrated multimodal generation inside ChatGPT canvas and frontier diffusion models like Flux.2 Pro.",
    category: ToolCategory.IMAGE_GEN,
    pricing: "Paid",
    rating: 3.2,
    reviews: 145000,
    tags: ["Deprecated", "Legacy", "Image Generation"],
    websiteUrl: "https://openai.com",
    status: "Deprecated",
    deprecatedReason: "Subsumed into ChatGPT canvas; standalone API endpoint legacy.",
    lastVerified: "October 2026",
    specs: { easeOfUse: 60, power: 45, community: 50, costEfficiency: 40, integration: 30 }
  },
  {
    id: "copy-ai",
    name: "Copy.ai (Legacy Copywriting)",
    description: "Early-generation single-prompt template copy generator. Legacy standalone copy tools have been largely superseded by long-context frontier LLMs and autonomous marketing agents.",
    category: ToolCategory.PRODUCTIVITY,
    pricing: "Freemium",
    rating: 3.4,
    reviews: 62000,
    tags: ["Deprecated", "Legacy", "Copywriting"],
    websiteUrl: "https://copy.ai",
    status: "Deprecated",
    deprecatedReason: "Superseded by frontier reasoning LLMs and autonomous multi-agent pipelines.",
    lastVerified: "October 2026",
    specs: { easeOfUse: 70, power: 40, community: 55, costEfficiency: 45, integration: 40 }
  },

  // --- Developer Tools ---
  {
    id: "cursor-agent",
    name: "Cursor Agent (v3)",
    description: "The AI-first IDE that builds entire features from single prompts. Integrates Claude Sonnet 5.5 for precise, multi-file edits and deep codebase comprehension.",
    category: ToolCategory.DEV_TOOLS,
    pricing: "Freemium",
    rating: 5.0,
    reviews: 36000,
    tags: ["IDE", "Auto-Coding", "Productivity"],
    websiteUrl: "https://cursor.com",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 95, power: 100, community: 100, costEfficiency: 88, integration: 100 }
  },
  {
    id: "v0-dev",
    name: "v0.dev (V3)",
    description: "Vercel's UI generation agent. Builds fully functional frontend and backend integrations, complete with database schemas and modern Tailwind components, in seconds.",
    category: ToolCategory.DEV_TOOLS,
    pricing: "Freemium",
    rating: 5.0,
    reviews: 21500,
    tags: ["UI/UX", "Full-Stack", "React"],
    websiteUrl: "https://v0.dev",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 100, power: 96, community: 95, costEfficiency: 90, integration: 98 }
  },

  // --- Audio ---
  {
    id: "elevenlabs-v3",
    name: "ElevenLabs v3",
    description: "The undisputed leader in text-to-speech. v3 introduces 'TrueEmotion' for whispering, shouting, and distinct regional accents.",
    category: ToolCategory.AUDIO,
    pricing: "Paid",
    rating: 5.0,
    reviews: 21000,
    tags: ["Voice", "Emotion", "Accents"],
    websiteUrl: "https://elevenlabs.io",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 96, power: 99, community: 95, costEfficiency: 65, integration: 98 }
  },
  {
    id: "suno-v4",
    name: "Suno v4",
    description: "Generates full radio-ready songs. v4 adds 'Stems' support, allowing creators to export separate vocals, drums, and bass.",
    category: ToolCategory.AUDIO,
    pricing: "Freemium",
    rating: 4.9,
    reviews: 32000,
    tags: ["Music", "Stems", "Radio-Ready"],
    websiteUrl: "https://suno.com",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 98, power: 95, community: 99, costEfficiency: 92, integration: 72 }
  },

  // --- Specialized Agents ---
  {
    id: "deepseek-v4",
    name: "DeepSeek-V4 (R2)",
    description: "The 'Efficiency King'. Open-weights reasoning model that rivals GPT-6 Astra for a fraction of the inference cost, featuring native code execution.",
    category: ToolCategory.LLM,
    pricing: "Free",
    rating: 4.9,
    reviews: 24000,
    tags: ["Open-Weights", "Logic", "Low-Cost"],
    websiteUrl: "https://deepseek.com",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 75, power: 98, community: 96, costEfficiency: 100, integration: 88 }
  },
  {
    id: "devin-ai",
    name: "Devin v2",
    description: "The world's first fully autonomous AI software engineer. The late 2026 v2 rollout enables multi-repo scaling, test synthesis, and automatic bug hunting.",
    category: ToolCategory.AGENT,
    pricing: "Enterprise",
    rating: 4.9,
    reviews: 28500,
    tags: ["Software Engineering", "Autonomous", "Multi-Repo"],
    websiteUrl: "https://cognition-labs.com",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 85, power: 100, community: 88, costEfficiency: 75, integration: 94 }
  },
  {
    id: "crewai-enterprise",
    name: "CrewAI",
    description: "Framework for orchestrating role-playing, autonomous AI agents. By fostering collaborative intelligence, CrewAI empowers agents to work together seamlessly.",
    category: ToolCategory.AGENT,
    pricing: "Freemium",
    rating: 4.7,
    reviews: 8400,
    tags: ["Orchestration", "Multi-Agent", "Framework"],
    websiteUrl: "https://crewai.com",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 75, power: 92, community: 98, costEfficiency: 85, integration: 95 }
  },
  {
    id: "multion-v2",
    name: "MultiOn",
    description: "AI agent that navigates the web for you. Automates browser tasks, fills forms, and extracts data across any website.",
    category: ToolCategory.AGENT,
    pricing: "Paid",
    rating: 4.6,
    reviews: 5300,
    tags: ["Web Automation", "Browser", "RPA"],
    websiteUrl: "https://multion.ai",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 88, power: 85, community: 80, costEfficiency: 75, integration: 82 }
  },
  {
    id: "auto-gpt-v2",
    name: "AutoGPT v2",
    description: "An experimental open-source attempt to make autonomous systems self-directing. Chaining together LLM thoughts to autonomously achieve set goals.",
    category: ToolCategory.AGENT,
    pricing: "Free",
    rating: 4.5,
    reviews: 45000,
    tags: ["Open-Source", "Autonomous", "Experimental"],
    websiteUrl: "https://agpt.co",
    status: "Watch",
    lastVerified: "October 2026",
    specs: { easeOfUse: 60, power: 90, community: 100, costEfficiency: 95, integration: 70 }
  },

  // --- Prompt Engineering ---
  {
    id: "langsmith-v2",
    name: "LangSmith v2",
    description: "The premier platform for tracing, evaluating, and refining LLM apps. v2 introduces autonomous prompt optimization flows.",
    category: ToolCategory.PROMPT_ENGINEERING,
    pricing: "Paid",
    rating: 4.8,
    reviews: 14200,
    tags: ["Tracing", "Evaluation", "Optimization"],
    websiteUrl: "https://smith.langchain.com",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 80, power: 98, community: 95, costEfficiency: 82, integration: 100 }
  },
  {
    id: "promptlayer-v3",
    name: "PromptLayer v3",
    description: "Middleware for tracking and managing prompt templates. Features a visual dashboard to A/B test prompts in production without deploying code.",
    category: ToolCategory.PROMPT_ENGINEERING,
    pricing: "Freemium",
    rating: 4.7,
    reviews: 9800,
    tags: ["A/B Testing", "Analytics", "Middleware"],
    websiteUrl: "https://promptlayer.com",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 92, power: 90, community: 85, costEfficiency: 88, integration: 96 }
  },
  {
    id: "google-ai-studio",
    name: "Google AI Studio",
    description: "The fastest way to experiment with Gemini. Features advanced structured prompting, few-shot templating, and native code generation.",
    category: ToolCategory.PROMPT_ENGINEERING,
    pricing: "Free",
    rating: 4.9,
    reviews: 58000,
    tags: ["Playground", "Structured Output", "Gemini"],
    websiteUrl: "https://aistudio.google.com/app/prompts/new_chat",
    status: "Active",
    lastVerified: "October 2026",
    specs: { easeOfUse: 95, power: 97, community: 90, costEfficiency: 100, integration: 92 }
  }
];

export const FEATURED_STACKS: ToolStack[] = [
  {
    id: "stack-autonomous-dev",
    name: "Autonomous Developer",
    author: "JengaForge",
    role: "Software Engineering",
    description: "A complete autonomous software pipeline. Design UI with v0, build with Cursor & Claude Sonnet 5.5, and let Devin handle multi-repo bug-fixing.",
    tools: ["v0-dev", "cursor-agent", "claude-5-5-sonnet", "devin-ai"],
    likes: 1240
  },
  {
    id: "stack-cinematic-creator",
    name: "Cinematic Video Creator",
    author: "JengaForge",
    role: "Video Production",
    description: "End-to-end 4K video storytelling. Generate consistent cinematic shots with Runway Gen-4.5 and Veo 3.1, storyboard with FLUX 3 Image, and produce emotive voiceovers with ElevenLabs.",
    tools: ["runway-gen-4-5", "veo-3-1", "flux-3-image", "elevenlabs-v3"],
    likes: 985
  },
  {
    id: "stack-research-synth",
    name: "Deep Research & Synth",
    author: "JengaForge",
    role: "Research & Strategy",
    description: "Combines real-time web research with huge context reasoning. Get the latest live data with Perplexity, verify with Grok 4.7, and synthesize with Gemini 4 Argon.",
    tools: ["perplexity-ultra", "gemini-4-argon", "grok-4-7"],
    likes: 850
  }
];

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: ToolCategory;
  content: string;
}

export const PROMPTS_REGISTRY: PromptTemplate[] = [
  {
    id: "prompt-prd-generator",
    title: "The Ultimate PRD Generator",
    description: "Generates a comprehensive Product Requirements Document from a 2-sentence idea.",
    category: ToolCategory.PRODUCTIVITY,
    content: "You are a world-class Product Manager. I will provide you with a high-level product idea. You will generate a complete PRD including: 1. Executive Summary 2. Problem Statement 3. Target Audience 4. Key Use Cases 5. Functional Requirements (MoSCoW format) 6. Non-Functional Requirements 7. Success Metrics (KPIs). Do not hallucinate features. Ask clarifying questions if the idea is too vague. Here is the idea: [INSERT IDEA]"
  },
  {
    id: "prompt-code-reviewer",
    title: "Senior Code Reviewer",
    description: "Acts as an uncompromising senior engineer finding edge cases and security flaws.",
    category: ToolCategory.DEV_TOOLS,
    content: "You are a Principal Software Engineer conducting a strict code review. Review the following code for: 1. Security vulnerabilities (OWASP top 10) 2. Performance bottlenecks 3. Edge cases and unexpected inputs 4. Readability and maintainability. Provide your feedback in bullet points, sorted by severity (Critical, High, Medium, Low). Then, provide a refactored version of the code that addresses the issues. Code: [INSERT CODE]"
  },
  {
    id: "prompt-ui-ux-critic",
    title: "Brutal UI/UX Critic",
    description: "Provides honest, actionable feedback on design descriptions or code.",
    category: ToolCategory.DEV_TOOLS,
    content: "Act as a ruthless but constructive UI/UX designer. I will describe a UI layout or show you frontend code. Tear it down. Focus on: Accessibility, Hierarchy, Spacing, Cognitive Load, and the 'Squint Test'. Tell me exactly why it sucks and give me 3 bullet points on how to fix it immediately."
  }
];

export const getToolById = (id: string): Tool | undefined => TOOLS_REGISTRY.find(t => t.id === id);

