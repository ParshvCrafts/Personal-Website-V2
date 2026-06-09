export interface SkillCategory {
  id: string;
  label: string;
  skills: string[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "languages",
    label: "Programming Languages",
    skills: ["Python", "SQL", "HTML/CSS", "JavaScript"],
  },
  {
    id: "data-science",
    label: "Data Science & Analysis",
    skills: [
      "Data Wrangling",
      "Data Visualization",
      "Statistical Analysis",
      "Hypothesis Testing",
      "Feature Engineering",
    ],
  },
  {
    id: "ml-ai",
    label: "Machine Learning & AI",
    skills: [
      "Scikit-learn",
      "PyTorch",
      "Keras",
      "Computer Vision",
      "Deep Learning",
      "Hyperparameter Tuning",
    ],
  },
  {
    id: "tools",
    label: "Tools & Frameworks",
    skills: [
      "NumPy",
      "Pandas",
      "Matplotlib",
      "Seaborn",
      "Plotly",
      "Dash",
      "Tableau",
      "Flask",
      "Git",
      "OpenCV",
      "BeautifulSoup",
      "Excel",
    ],
  },
];

export const MARQUEE_SKILLS = SKILL_CATEGORIES.flatMap((c) => c.skills);
