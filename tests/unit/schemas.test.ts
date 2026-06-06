import { describe, it, expect } from "vitest";
import {
  projectSchema,
  courseSchema,
  researchSchema,
  certificationsFileSchema,
} from "@/lib/schemas";

const validProject = {
  id: "p1",
  title: "T",
  description: "D",
  image: "a.jpg",
  categories: ["all"],
  tags: ["ML"],
  technologies: ["Python"],
  githubUrl: null,
  liveUrl: "https://x.com",
  presentationUrl: "https://y.com",
  detailPage: false,
  highlights: ["h"],
};

const validCourse = {
  id: "c1",
  code: "DATA C8",
  name: "Foundations",
  grade: "A+",
  semester: "Fall 2025",
  status: "completed",
  url: "https://x.com",
  image: "a.png",
  description: "D",
  skills: ["s"],
  topics: ["t"],
  projects: [{ name: "n", description: "d" }],
};

const validResearch = {
  id: "r1",
  displayTitle: "T",
  fullTitle: "Full T",
  field: "Physics",
  fieldColor: "#14b8a6",
  link: "https://x.com",
  abstractSummary: "s",
  fullAbstract: "f",
  keyTopics: ["k"],
  skills: ["s"],
  relatedCourse: null,
};

const validCertsFile = {
  certifications: [
    {
      id: "x",
      title: "T",
      issuer: "I",
      issuerIcon: "fas fa-robot",
      link: "https://x.com",
      description: "D",
      skills: ["s"],
    },
  ],
  professionalDevelopment: [
    {
      id: "y",
      title: "T",
      organization: "O",
      type: "Leadership",
      icon: "fas fa-users",
      description: "D",
      skills: ["s"],
      status: "Active",
    },
  ],
};

describe("schemas accept valid data", () => {
  it("project", () => expect(projectSchema.safeParse(validProject).success).toBe(true));
  it("project with optional featured", () =>
    expect(projectSchema.safeParse({ ...validProject, featured: true }).success).toBe(true));
  it("course", () => expect(courseSchema.safeParse(validCourse).success).toBe(true));
  it("research", () => expect(researchSchema.safeParse(validResearch).success).toBe(true));
  it("certifications file", () =>
    expect(certificationsFileSchema.safeParse(validCertsFile).success).toBe(true));
});

describe("schemas reject drift", () => {
  it("missing required project field", () => {
    const { id, ...broken } = validProject;
    expect(projectSchema.safeParse(broken).success).toBe(false);
  });
  it("wrong type for categories", () => {
    expect(projectSchema.safeParse({ ...validProject, categories: "all" }).success).toBe(false);
  });
  it("invalid course status", () => {
    expect(courseSchema.safeParse({ ...validCourse, status: "nope" }).success).toBe(false);
  });
});
