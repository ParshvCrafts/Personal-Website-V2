export type Milestone = {
  year: string;
  title: string;
  body: string;
  status?: "active";
};

export const MILESTONES: Milestone[] = [
  {
    year: "2023",
    title: "Indian Board X Exam",
    body: "Ranked 1st in Board Examinations, laying the foundation for academic excellence.",
  },
  {
    year: "2023",
    title: "IMO Math Olympiad",
    body: "Won 2 Gold Medals in the International Math Olympiad Level 1, showcasing analytical prowess.",
  },
  {
    year: "2023",
    title: "Immigrated to USA",
    body: "Moved to the United States during high school, embracing a new chapter and new challenges.",
  },
  {
    year: "2023",
    title: "West Valley High School",
    body: "Graduated as Valedictorian, Student of the Month, AP Scholar with Distinction, and Outstanding Science Student.",
  },
  {
    year: "2024",
    title: "Coastline Community College",
    body: "Completed 14 dual enrollment courses with a perfect 4.0 GPA, building strong academic foundations.",
  },
  {
    year: "2024",
    title: "QuestBridge Finalist",
    body: "Selected as a National College Match Finalist, recognized among top low-income students nationally.",
  },
  {
    year: "2025",
    title: "Greenhouse Scholar",
    body: "Selected for the prestigious Greenhouse Scholars program, joining a community of high-achieving students.",
  },
  {
    year: "2025",
    title: "Amazon Future Engineer",
    body: "Awarded the Amazon Future Engineer Scholarship for demonstrating leadership and passion for computer science.",
  },
  {
    year: "2025",
    title: "UC Berkeley",
    body: "Transferred to study Data Science at the #1 ranked public university in the world.",
  },
  {
    year: "2025",
    title: "MLT Ascend Scholar",
    body: "Selected for Management Leadership for Tomorrow's Ascend program, developing leadership skills.",
  },
  {
    year: "Summer 2026",
    title: "Amazon SWE Intern",
    body: "Software Engineering Intern at Amazon's South Lake Union office in Seattle. Building production systems at scale.",
    status: "active",
  },
];
