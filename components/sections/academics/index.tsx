import { getCourses, getResearch } from "@/lib/data";
import { groupCoursesByState, sortCourses } from "@/lib/academics";
import type { Course } from "@/lib/types";
import { Reveal } from "@/components/motion/reveal";
import { SplitReveal } from "@/components/motion/split-reveal";
import { CountUp } from "@/components/motion/count-up";
import { CourseGrid } from "./course-grid";
import { ACADEMICS_HEADER } from "@/content/academics";

export function Academics() {
  const courses = getCourses();
  const research = getResearch();
  const rawGroups = groupCoursesByState(courses);
  const groups = {
    completed: sortCourses(rawGroups.completed),
    inProgress: sortCourses(rawGroups.inProgress),
    upcoming: sortCourses(rawGroups.upcoming),
  };

  const stats = [
    { id: "gpa", testId: "stat-gpa", value: 4.0, decimals: 2, suffix: "", label: "GPA" },
    {
      id: "courses",
      testId: "stat-courses",
      value: groups.completed.length,
      decimals: 0,
      suffix: "",
      label: "Courses Completed",
    },
    {
      id: "projects",
      testId: "stat-course-projects",
      value: courses.flatMap((c) => c.projects).length,
      decimals: 0,
      suffix: "",
      label: "Course Projects",
    },
    {
      id: "papers",
      testId: null,
      value: research.length,
      decimals: 0,
      suffix: "",
      label: "Research Papers",
    },
  ];

  return (
    <section
      id="academics"
      aria-labelledby="academics-h"
      className="relative scroll-mt-[88px] overflow-hidden border-t border-border px-6 py-24 md:px-10 md:py-32"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 40% at 85% 30%, color-mix(in oklab, var(--accent) 8%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          Academic Excellence
        </p>
        <SplitReveal
          as="h2"
          id="academics-h"
          className="mt-4 font-display text-4xl leading-[1.05] text-heading md:text-6xl"
        >UC Berkeley</SplitReveal>
        <p className="mt-3 font-mono text-sm text-muted">
          {ACADEMICS_HEADER.major} · {ACADEMICS_HEADER.concentration} ·{" "}
          {ACADEMICS_HEADER.focus}
        </p>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">
          {ACADEMICS_HEADER.years} · {ACADEMICS_HEADER.honorsLine}
        </p>

        <h3 className="sr-only">By the numbers</h3>
        <Reveal
          stagger={0.08}
          className="mt-16 grid grid-cols-2 gap-x-6 gap-y-8 border-y border-border py-10 sm:grid-cols-4 md:mt-20"
        >
          {stats.map((s) => (
            <div key={s.id} className="flex flex-col gap-1">
              <span
                {...(s.testId ? { "data-testid": s.testId } : {})}
                className="font-display text-4xl tabular-nums text-heading md:text-5xl"
              >
                <CountUp to={s.value} decimals={s.decimals} suffix={s.suffix} />
              </span>
              <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
                {s.label}
              </span>
            </div>
          ))}
        </Reveal>

        <div className="mt-16 space-y-16 md:mt-24 md:space-y-24">
          <CourseSection title="Completed Courses" courses={groups.completed} />
          {groups.inProgress.length > 0 && (
            <CourseSection
              title="Currently Enrolled"
              courses={groups.inProgress}
            />
          )}
          {groups.upcoming.length > 0 && (
            <CourseSection title="Upcoming Courses" courses={groups.upcoming} />
          )}
        </div>
      </div>
    </section>
  );
}

function CourseSection({
  title,
  courses,
}: {
  title: string;
  courses: Course[];
}) {
  return (
    <div>
      <h3 className="font-display text-2xl text-heading md:text-3xl">{title}</h3>
      <CourseGrid courses={courses} />
    </div>
  );
}
