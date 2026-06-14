"use client";

import { useState, useId } from "react";
import type { Course } from "@/lib/types";
import { Reveal } from "@/components/motion/reveal";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function gradeClass(grade: string): string {
  if (grade === "A+" || grade === "A") return "bg-accent text-on-accent";
  return "border border-border text-muted";
}

function CourseCard({
  course,
  onOpen,
}: {
  course: Course;
  onOpen: (c: Course) => void;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.currentTarget.focus();
        onOpen(course);
      }}
      aria-haspopup="dialog"
      className="group flex w-full min-h-[88px] items-start gap-4 rounded-3xl border border-border bg-surface p-5 text-left transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white p-1.5 ring-1 ring-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/images/courses/${course.image}`}
          alt=""
          width={48}
          height={48}
          className="h-full w-full object-contain"
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-xs uppercase tracking-widest text-accent">
          {course.code}
        </span>
        <span className="mt-0.5 block font-display text-lg leading-snug text-heading">
          {course.name}
        </span>
        <span className="mt-1 block font-mono text-xs text-muted">
          {course.semester}
        </span>
        {course.skills.length > 0 && (
          <span className="mt-2 flex flex-wrap gap-1">
            {course.skills.slice(0, 3).map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </span>
        )}
      </span>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 font-mono text-xs",
          gradeClass(course.grade)
        )}
      >
        {course.grade}
      </span>
    </button>
  );
}

function CourseModalContent({
  course,
  titleId,
}: {
  course: Course;
  titleId: string;
}) {
  return (
    <div className="pr-8">
      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white p-1.5 ring-1 ring-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/images/courses/${course.image}`}
            alt=""
            width={56}
            height={56}
            className="h-full w-full object-contain"
          />
        </span>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            {course.code} · {course.semester}
          </p>
          <p
            id={titleId}
            className="font-display text-xl text-heading md:text-2xl"
          >
            {course.name}
          </p>
        </div>
      </div>

      {course.description && (
        <p className="text-sm leading-relaxed text-muted">{course.description}</p>
      )}

      {course.skills.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-muted">
            Skills
          </p>
          <div className="flex flex-wrap gap-1">
            {course.skills.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        </div>
      )}

      {course.projects.length > 0 && (
        <div className="mt-6 space-y-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted">
            Projects
          </p>
          {course.projects.map((project) => (
            <div
              key={project.name}
              className="rounded-xl border border-border bg-elevated p-4"
            >
              <p className="font-display text-base text-heading">
                {project.name}
              </p>
              <p className="mt-1 text-sm text-muted">{project.description}</p>
              {project.highlights && project.highlights.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {project.highlights.map((h) => (
                    <li key={h} className="flex gap-2 text-xs text-muted">
                      <span className="shrink-0 text-accent">–</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {project.technologies.map((t) => (
                    <Badge key={t}>{t}</Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {course.url && (
        <div className="mt-6 border-t border-border pt-4">
          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded font-mono text-xs text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View Course Website →
          </a>
        </div>
      )}
    </div>
  );
}

export function CourseGrid({ courses }: { courses: Course[] }) {
  const [selected, setSelected] = useState<Course | null>(null);
  const uid = useId();
  const titleId = `${uid}-course-title`;

  return (
    <div>
      <Reveal stagger={0.05} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} onOpen={setSelected} />
        ))}
      </Reveal>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        labelledBy={titleId}
      >
        {selected && <CourseModalContent course={selected} titleId={titleId} />}
      </Modal>
    </div>
  );
}
