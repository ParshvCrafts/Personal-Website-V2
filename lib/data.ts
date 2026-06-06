import projectsJson from "@/data/projects.json";
import coursesJson from "@/data/courses.json";
import researchJson from "@/data/research.json";
import certificationsJson from "@/data/certifications.json";
import {
  projectsSchema,
  coursesSchema,
  researchListSchema,
  certificationsFileSchema,
} from "@/lib/schemas";
import type {
  Project,
  Course,
  Research,
  Certification,
  ProfessionalDevelopment,
} from "@/lib/types";

export function getProjects(): Project[] {
  return projectsSchema.parse(projectsJson);
}
export function getCourses(): Course[] {
  return coursesSchema.parse(coursesJson);
}
export function getResearch(): Research[] {
  return researchListSchema.parse(researchJson);
}
export function getCertifications(): Certification[] {
  return certificationsFileSchema.parse(certificationsJson).certifications;
}
export function getProfessionalDevelopment(): ProfessionalDevelopment[] {
  return certificationsFileSchema.parse(certificationsJson).professionalDevelopment;
}
