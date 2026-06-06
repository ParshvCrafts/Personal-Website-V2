import { z } from "zod";

export const projectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string(),
  categories: z.array(z.string()),
  tags: z.array(z.string()),
  technologies: z.array(z.string()),
  githubUrl: z.string().nullable(),
  liveUrl: z.string().nullable(),
  presentationUrl: z.string(),
  detailPage: z.boolean(),
  featured: z.boolean().optional(),
  highlights: z.array(z.string()),
});
export const projectsSchema = z.array(projectSchema);

export const courseProjectSchema = z.object({
  name: z.string(),
  description: z.string(),
  highlights: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  paperUrl: z.string().optional(),
});
export const courseSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  grade: z.string(),
  semester: z.string(),
  // "in-progress" is forward-tolerant; current data only uses "completed" | "upcoming".
  status: z.enum(["completed", "in-progress", "upcoming"]),
  url: z.string(),
  image: z.string(),
  description: z.string(),
  skills: z.array(z.string()),
  topics: z.array(z.string()),
  projects: z.array(courseProjectSchema).default([]),
});
export const coursesSchema = z.array(courseSchema);

export const researchSchema = z.object({
  id: z.string(),
  displayTitle: z.string(),
  fullTitle: z.string(),
  field: z.string(),
  fieldColor: z.string(),
  link: z.string(),
  abstractSummary: z.string(),
  fullAbstract: z.string(),
  keyTopics: z.array(z.string()),
  skills: z.array(z.string()),
  relatedCourse: z.string().nullable(),
});
export const researchListSchema = z.array(researchSchema);

export const certificationSchema = z.object({
  id: z.string(),
  title: z.string(),
  issuer: z.string(),
  issuerIcon: z.string(),
  link: z.string(),
  description: z.string(),
  skills: z.array(z.string()),
});
export const professionalDevelopmentSchema = z.object({
  id: z.string(),
  title: z.string(),
  organization: z.string(),
  type: z.string(),
  icon: z.string(),
  // Canonical data stores these keys explicitly as null when empty (not absent),
  // so they must be nullable as well as optional. (Plan assumed absent-only.)
  link: z.string().nullable().optional(),
  description: z.string(),
  skills: z.array(z.string()),
  status: z.enum(["Completed", "In Progress", "Active"]),
  duration: z.string().nullable().optional(),
  impact: z.string().nullable().optional(),
});
export const certificationsFileSchema = z.object({
  certifications: z.array(certificationSchema),
  professionalDevelopment: z.array(professionalDevelopmentSchema),
});
