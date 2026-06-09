import { describe, it, expect } from "vitest";
import { getProjects } from "@/lib/data";
import { FILTER_KEYS, FILTER_LABELS, CURRENTLY_BUILDING } from "@/content/projects";

describe("projects data", () => {
  it("returns 12 projects", () => {
    expect(getProjects()).toHaveLength(12);
  });

  it("exactly 2 projects have featured: true", () => {
    const featured = getProjects().filter((p) => p.featured === true);
    expect(featured).toHaveLength(2);
  });

  it("every project has 'all' in its categories array", () => {
    const allHaveAll = getProjects().every((p) => p.categories.includes("all"));
    expect(allHaveAll).toBe(true);
  });

  it("featured projects are interlace and atlasmind", () => {
    const featuredIds = getProjects()
      .filter((p) => p.featured === true)
      .map((p) => p.id);
    expect(featuredIds).toContain("interlace-fashion-search");
    expect(featuredIds).toContain("atlasmind-ai-trip-planner");
  });
});

describe("filter logic", () => {
  it("FILTER_KEYS contains 'all' as first entry", () => {
    expect(FILTER_KEYS[0]).toBe("all");
  });

  it("every FILTER_KEY has a label in FILTER_LABELS", () => {
    for (const key of FILTER_KEYS) {
      expect(FILTER_LABELS[key]).toBeTruthy();
    }
  });

  it("filtering by 'cv' returns only projects with 'cv' in categories", () => {
    const projects = getProjects();
    const cvProjects = projects.filter((p) => p.categories.includes("cv"));
    expect(cvProjects.length).toBeGreaterThan(0);
    expect(cvProjects.every((p) => p.categories.includes("cv"))).toBe(true);
  });

  it("filtering by 'all' returns all 12 projects", () => {
    const projects = getProjects();
    const filtered = projects.filter((p) => p.categories.includes("all"));
    expect(filtered).toHaveLength(12);
  });
});

describe("CURRENTLY_BUILDING", () => {
  it("has name, description, and tech array", () => {
    expect(CURRENTLY_BUILDING.name).toBeTruthy();
    expect(CURRENTLY_BUILDING.description).toBeTruthy();
    expect(CURRENTLY_BUILDING.tech.length).toBeGreaterThan(0);
  });
});
