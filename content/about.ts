import type { LucideIcon } from "lucide-react";
import {
  Award,
  BookOpen,
  Cloud,
  Dumbbell,
  Feather,
  FlaskConical,
  GraduationCap,
  Library,
  Medal,
  Package,
  PenTool,
  Rocket,
  Sigma,
  Sparkles,
  Sprout,
  Star,
  Target,
  Trophy,
} from "lucide-react";
import { SITE, SOCIAL_LINKS } from "@/lib/site";

/** Two-paragraph bio (from v1 About; typos cleaned). */
export const ABOUT_BIO: string[] = [
  "I'm a rising sophomore at UC Berkeley pursuing a B.A. in Data Science with a focus on AI and Machine Learning. I completed my first year with a perfect 4.0 GPA and Dean's List honors both semesters, and I'll be joining Amazon as a Software Engineering Intern in Summer 2026.",
  "From agentic AI systems to computer vision and data pipelines, I love building projects that solve real-world problems. My work spans data wrangling, statistical modeling, deep learning, and full-stack deployment, bringing models from Jupyter notebooks to production-ready web applications.",
];

export interface AboutFact {
  label: string;
  value: string;
  href?: string;
}

/** Key facts; email/phone link out. Location/email/phone reuse SITE. */
export const ABOUT_FACTS: AboutFact[] = [
  { label: "Education", value: "UC Berkeley · B.A. Data Science" },
  { label: "Location", value: SITE.location },
  { label: "Email", value: SITE.email, href: `mailto:${SITE.email}` },
  { label: "Phone", value: SITE.phoneDisplay, href: `tel:${SITE.phone}` },
];

export interface AchievementBadge {
  id: string;
  label: string;
  icon: LucideIcon;
}

/** 16 achievement badges — v1 emoji replaced by typographic Lucide marks. */
export const ACHIEVEMENT_BADGES: AchievementBadge[] = [
  { id: "valedictorian", label: "Valedictorian", icon: GraduationCap },
  { id: "board-rank1", label: "Rank 1 Indian Board Exam", icon: Medal },
  { id: "questbridge", label: "QuestBridge Finalist", icon: Sparkles },
  { id: "greenhouse", label: "Greenhouse Scholar", icon: Sprout },
  { id: "amazon-fe", label: "Amazon Future Engineer", icon: Package },
  { id: "mlt", label: "MLT Ascend Scholar", icon: Rocket },
  { id: "poetry-champ", label: "National Poetry Champion", icon: Feather },
  { id: "imo-gold", label: "2 IMO Gold Medals", icon: Sigma },
  { id: "gpa", label: "4.00 GPA", icon: Target },
  { id: "athlete", label: "Athlete of the Year", icon: Dumbbell },
  { id: "student-month", label: "Student of the Month", icon: Star },
  { id: "published", label: "Published Researcher", icon: BookOpen },
  { id: "deans-list", label: "Dean's List × 2", icon: Award },
  { id: "library-prize", label: "Library Prize Honorable Mention", icon: Library },
  { id: "literary", label: "4 Berkeley Literary Prizes", icon: PenTool },
  { id: "amazon-swe", label: "Amazon SWE Intern 2026", icon: Cloud },
];

export interface Award {
  id: string;
  title: string;
  description: string;
  /** Brand logo path under /images/awards (white chip in the UI). */
  logo?: string;
  /** Lucide mark when there is no brand logo. */
  icon?: LucideIcon;
}

/** 15 award citations (verbatim from v1; entities decoded). */
export const AWARDS: Award[] = [
  {
    id: "amazon-fe",
    title: "Amazon Future Engineer",
    description:
      "Scholarship of up to $40,000 (up to $10,000/year) towards an undergraduate degree in computer science and an offer to complete a summer internship at Amazon!",
    logo: "/images/awards/amazon.png",
  },
  {
    id: "greenhouse",
    title: "Greenhouse Scholar",
    description:
      "The Greenhouse Whole Person College Program offers up to $5,000/year scholarships and extensive mentorship, professional development, and financial guidance over five years for high-achieving, low-income students. Requirements: 3.5+ GPA, leadership, community commitment.",
    logo: "/images/awards/greenhouse.png",
  },
  {
    id: "mlt",
    title: "MLT Ascend Scholar",
    description:
      "MLT Ascend is a free, one-year career accelerator by Management Leadership for Tomorrow for high-achieving, first-generation college freshmen, providing personalized coaching, employer exposure, and pathways to careers in business or technology.",
    logo: "/images/awards/mlt.png",
  },
  {
    id: "questbridge",
    title: "QuestBridge Finalist",
    description:
      "QuestBridge National College Match connects high-achieving, low-income seniors with full four-year scholarships (tuition, room, board) to top U.S. colleges. Finalists rank up to 15 partner colleges for guaranteed early admission and full Match Scholarship.",
    logo: "/images/awards/questbridge.png",
  },
  {
    id: "library-prize",
    title: "Library Prize for Undergraduate Research",
    description:
      "Received the sole Honorable Mention for the Charlene Conrad Liebau Library Prize for Undergraduate Research at UC Berkeley. Awarded to the computational physics research paper on a 2D Navier-Stokes CFD Solver, which is archived in Berkeley's institutional repository (eScholarship) as an exemplary model of undergraduate research. Only STEM paper recognized in the lower-division category from 51 applications.",
    icon: BookOpen,
  },
  {
    id: "literary-sweep",
    title: "Berkeley Literary Prize Sweep: 4 Awards",
    description:
      "Received four competitive literary and essay prizes at UC Berkeley in Spring 2026: the Leslie Lipson Essay Prize (most prestigious undergraduate essay award), the Elizabeth Mills Crothers Prize in Literary Composition, the Dorothy Rosenberg Memorial Prize in Lyric Poetry, and the Lili Fabilli & Eric Hoffer Essay Prize. A rare multi-prize sweep in a single academic year.",
    icon: PenTool,
  },
  {
    id: "deans-list",
    title: "Dean's List × 2, UC Berkeley",
    description:
      "Earned Dean's List recognition from the College of Computing, Data Science, and Society (CDSS) for both Fall 2025 and Spring 2026 semesters, maintaining a 4.00 GPA across an intensive STEM curriculum including Data Structures, Principles of Data Science, and Linear Algebra.",
    icon: Star,
  },
  {
    id: "caa-tla",
    title: "CAA The Leadership Award Scholar",
    description:
      "Selected as a recipient of The Leadership Award (TLA) by the Cal Alumni Association, one of the most competitive merit scholarships at UC Berkeley, recognizing exceptional leadership, community impact, and academic achievement.",
    logo: "/images/awards/caa-tla.png",
  },
  {
    id: "rsm",
    title: "RSM First Generation Scholar",
    description:
      "Awarded the RSM First Generation Scholarship, a competitive merit award supporting first-generation college students demonstrating academic excellence, leadership, and commitment to creating a positive impact in their communities.",
    logo: "/images/awards/rsm.png",
  },
  {
    id: "valedictorian",
    title: "Valedictorian",
    description:
      "Top-performing student in the senior class based on overall GPA from 9th to 12th grade. Out of 455 students, only one is recognized as the highest achiever. Maintained a 4.61 GPA while balancing 23 advanced courses and extracurricular activities.",
    icon: Trophy,
  },
  {
    id: "imo-gold",
    title: "IMO Gold Medalist",
    description:
      "Rank 1 award for the International Mathematics Olympiad (IMO) Level 1 2022-23, awarded to the top student for each grade level. Students who pass the cutoff advance to Level 2, competing for gold medal and honors. A proud moment reflecting passion for mathematics.",
    icon: Medal,
  },
  {
    id: "ap-scholar",
    title: "AP Scholar with Distinction",
    description:
      "Granted to students who receive an average score of at least 3.5 on all AP Exams taken, and scores of 3 or higher on five or more of these exams. Demonstrates mastery across multiple college-level subjects.",
    icon: Award,
  },
  {
    id: "science-student",
    title: "Outstanding Science Student",
    description:
      "Only student selected from the school (2023-24) for demonstrating exceptional commitment to scientific inquiry and excellence in science coursework and projects.",
    icon: FlaskConical,
  },
  {
    id: "board-rank1",
    title: "Rank 1, Indian Board Exam X",
    description:
      "Achieved Rank 1 in my district for the Indian Board Exam X with 97% score. Competed against 2.4 million candidates. Featured in local newspapers and received a trophy from my school for this significant academic milestone.",
    icon: GraduationCap,
  },
  {
    id: "student-month",
    title: "Student of the Month",
    description:
      "Nominated by the principal for Student of the Month, given the opportunity to share my journey and community contributions. Received the Mike Christie Memorial Scholarship ($1000) out of 48 students from 11 schools in the Hemet and San Jacinto districts.",
    icon: Sparkles,
  },
];

export type CodeLang = "python" | "javascript" | "sql";

export interface CodeSample {
  id: string;
  lang: CodeLang;
  filename: string;
  code: string;
}

/** 3 code samples (verbatim from v1's code window). */
export const CODE_SAMPLES: CodeSample[] = [
  {
    id: "python",
    lang: "python",
    filename: "app.py",
    code: `# AtlasMind Trip Planner
def generate_itinerary(destination, preferences):
    """AI-powered travel planning"""
    context = analyze_destination(destination)
    activities = recommend_activities(context, preferences)
    return optimize_schedule(activities)`,
  },
  {
    id: "javascript",
    lang: "javascript",
    filename: "main.js",
    code: `// Portfolio Animation System
const initAnimations = () => {
  gsap.registerPlugin(ScrollTrigger);
  sections.forEach(section => {
    gsap.from(section, {
      opacity: 0, y: 50,
      scrollTrigger: { trigger: section }
    });
  });
};`,
  },
  {
    id: "sql",
    lang: "sql",
    filename: "query.sql",
    code: `-- Student Performance Analysis
SELECT course_name, AVG(grade) AS avg_grade,
       COUNT(*) AS enrollment
FROM student_records
GROUP BY course_name
HAVING AVG(grade) > 3.5
ORDER BY avg_grade DESC;`,
  },
];

export interface AboutDocument {
  id: "resume" | "transcript" | "linkedin";
  label: string;
  href: string;
}

/** Resume + transcript (in v2/public) + LinkedIn. */
export const ABOUT_DOCUMENTS: AboutDocument[] = [
  { id: "resume", label: "Resume", href: "/documents/resume.pdf" },
  { id: "transcript", label: "Unofficial Transcript", href: "/documents/transcript.pdf" },
  { id: "linkedin", label: "LinkedIn Profile", href: SOCIAL_LINKS.linkedin },
];
