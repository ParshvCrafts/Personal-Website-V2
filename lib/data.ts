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
// Parse the certifications file once; both loaders read from the single result.
const certificationsData = certificationsFileSchema.parse(certificationsJson);
export function getCertifications(): Certification[] {
  return certificationsData.certifications;
}
export function getProfessionalDevelopment(): ProfessionalDevelopment[] {
  return certificationsData.professionalDevelopment;
}
