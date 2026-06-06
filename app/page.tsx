import {
  getProjects,
  getCourses,
  getResearch,
  getCertifications,
  getProfessionalDevelopment,
} from "@/lib/data";

export default function Home() {
  const counts = {
    projects: getProjects().length,
    courses: getCourses().length,
    research: getResearch().length,
    certifications: getCertifications().length,
    professionalDevelopment: getProfessionalDevelopment().length,
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">Portfolio v2 — data pipeline OK</h1>
      <ul className="grid grid-cols-2 gap-3 font-mono text-sm">
        <li data-testid="count-projects">Projects: {counts.projects}</li>
        <li data-testid="count-courses">Courses: {counts.courses}</li>
        <li data-testid="count-research">Research: {counts.research}</li>
        <li data-testid="count-certifications">Certifications: {counts.certifications}</li>
        <li data-testid="count-profdev">Professional Dev: {counts.professionalDevelopment}</li>
      </ul>
    </main>
  );
}
