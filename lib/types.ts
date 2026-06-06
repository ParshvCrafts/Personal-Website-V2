import type { z } from "zod";
import type {
  projectSchema,
  courseSchema,
  courseProjectSchema,
  researchSchema,
  certificationSchema,
  professionalDevelopmentSchema,
} from "@/lib/schemas";

export type Project = z.infer<typeof projectSchema>;
export type Course = z.infer<typeof courseSchema>;
export type CourseProject = z.infer<typeof courseProjectSchema>;
export type Research = z.infer<typeof researchSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type ProfessionalDevelopment = z.infer<typeof professionalDevelopmentSchema>;
