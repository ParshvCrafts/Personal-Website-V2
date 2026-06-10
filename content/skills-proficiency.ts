export interface SkillProficiency {
  name: string;
  /** 0–100 */
  level: number;
  category: "languages" | "data" | "ml" | "tools";
}

export const SKILL_PROFICIENCY: SkillProficiency[] = [
  { name: "Python", level: 92, category: "languages" },
  { name: "SQL", level: 85, category: "data" },
  { name: "JavaScript/TypeScript", level: 80, category: "languages" },
  { name: "Pandas / NumPy", level: 90, category: "data" },
  { name: "scikit-learn", level: 85, category: "ml" },
  { name: "PyTorch", level: 78, category: "ml" },
  { name: "Computer Vision (OpenCV)", level: 82, category: "ml" },
  { name: "LangChain / LLMs", level: 80, category: "ml" },
  { name: "React / Next.js", level: 75, category: "tools" },
  { name: "Git / CI", level: 85, category: "tools" },
];
