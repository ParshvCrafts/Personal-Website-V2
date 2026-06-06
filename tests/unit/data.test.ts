import { describe, it, expect } from "vitest";
import {
  getProjects,
  getCourses,
  getResearch,
  getCertifications,
  getProfessionalDevelopment,
} from "@/lib/data";

describe("data loaders return validated, typed data", () => {
  // These exact counts are an intentional snapshot of the canonical static/data JSON.
  // If v1 data legitimately grows, update these numbers — a mismatch here means the
  // loader/sync pulled the wrong or incomplete data.
  it("projects: 12 items, each has id+title", () => {
    const projects = getProjects();
    expect(projects).toHaveLength(12);
    expect(projects.every((p) => p.id && p.title)).toBe(true);
  });
  it("courses: 13 items", () => {
    expect(getCourses()).toHaveLength(13);
  });
  it("research: 5 items", () => {
    expect(getResearch()).toHaveLength(5);
  });
  it("certifications: 10 items", () => {
    expect(getCertifications()).toHaveLength(10);
  });
  it("professional development: 9 items", () => {
    expect(getProfessionalDevelopment()).toHaveLength(9);
  });
});
