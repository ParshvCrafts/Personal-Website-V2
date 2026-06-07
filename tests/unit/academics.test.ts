import { describe, it, expect } from "vitest";
import { groupCoursesByState, sortCourses } from "@/lib/academics";
import type { Course } from "@/lib/types";

const stub = (overrides: Partial<Course> = {}): Course => ({
  id: "x",
  code: "TEST 1",
  name: "Test",
  grade: "A+",
  semester: "Fall 2025",
  status: "completed",
  url: "",
  image: "",
  description: "",
  skills: [],
  topics: [],
  projects: [],
  ...overrides,
});

describe("groupCoursesByState", () => {
  it("puts completed courses in completed group", () => {
    const { completed, inProgress, upcoming } = groupCoursesByState([stub()]);
    expect(completed).toHaveLength(1);
    expect(inProgress).toHaveLength(0);
    expect(upcoming).toHaveLength(0);
  });

  it("puts grade=Ongoing upcoming in inProgress", () => {
    const { inProgress } = groupCoursesByState([
      stub({ status: "upcoming", grade: "Ongoing" }),
    ]);
    expect(inProgress).toHaveLength(1);
  });

  it("puts grade=Planned upcoming in upcoming", () => {
    const { upcoming } = groupCoursesByState([
      stub({ status: "upcoming", grade: "Planned" }),
    ]);
    expect(upcoming).toHaveLength(1);
  });

  it("handles mixed input correctly", () => {
    const groups = groupCoursesByState([
      stub({ status: "completed", code: "A" }),
      stub({ status: "upcoming", grade: "Ongoing", code: "B" }),
      stub({ status: "upcoming", grade: "Planned", code: "C" }),
    ]);
    expect(groups.completed).toHaveLength(1);
    expect(groups.inProgress).toHaveLength(1);
    expect(groups.upcoming).toHaveLength(1);
  });

  it("returns three empty arrays for empty input", () => {
    const { completed, inProgress, upcoming } = groupCoursesByState([]);
    expect(completed).toHaveLength(0);
    expect(inProgress).toHaveLength(0);
    expect(upcoming).toHaveLength(0);
  });
});

describe("sortCourses", () => {
  it("sorts earlier semester before later", () => {
    const sorted = sortCourses([
      stub({ semester: "Fall 2026", code: "Z" }),
      stub({ semester: "Fall 2025", code: "A" }),
    ]);
    expect(sorted[0].semester).toBe("Fall 2025");
  });

  it("does not mutate the input array", () => {
    const input = [stub({ code: "B" }), stub({ code: "A" })];
    sortCourses(input);
    expect(input[0].code).toBe("B");
  });
});
