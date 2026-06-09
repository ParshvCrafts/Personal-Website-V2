// v2/content/projects.ts

export const CURRENTLY_BUILDING = {
  name: "JARVIS AI Assistant",
  description:
    "A comprehensive personal AI assistant featuring voice control, task automation, multi-LLM integration, and 8+ specialized modules including Academic, Career, Finance, and Research assistants.",
  tech: ["Python", "LangChain", "OpenAI", "Groq", "Flask"],
} as const;

export const CURRENTLY_LEARNING = [
  "Agentic AI & Autonomous Systems",
  "Large Language Models (LLMs)",
  "Advanced Machine Learning",
] as const;

export const LEARNING_GOAL = "Goal: Build production-ready AI systems" as const;

export const FILTER_LABELS: Record<string, string> = {
  all: "All Projects",
  saas: "Full-Stack SaaS",
  cv: "Computer Vision",
  ml: "Machine Learning",
  deployment: "Deployed Apps",
  analytics: "Data Analytics",
};

export const FILTER_KEYS = ["all", "saas", "cv", "ml", "deployment", "analytics"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
