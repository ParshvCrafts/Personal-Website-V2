import type { Course } from "./types";

export type CourseGroups = {
  completed: Course[];
  inProgress: Course[];
  upcoming: Course[];
};

export function groupCoursesByState(courses: Course[]): CourseGroups {
  return {
    completed: courses.filter((c) => c.status === "completed"),
    inProgress: courses.filter(
      (c) =>
        c.status === "in-progress" ||
        (c.status === "upcoming" && c.grade === "Ongoing")
    ),
    upcoming: courses.filter(
      (c) => c.status === "upcoming" && c.grade !== "Ongoing"
    ),
  };
}

const SEMESTER_ORDER: Record<string, number> = {
  "Fall 2025": 0,
  "Spring 2026": 1,
  "2024 — Present": 2,
  "Fall 2026": 3,
};

export function sortCourses(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => {
    const sa = SEMESTER_ORDER[a.semester] ?? 99;
    const sb = SEMESTER_ORDER[b.semester] ?? 99;
    if (sa !== sb) return sa - sb;
    return a.code.localeCompare(b.code);
  });
}
