import { describe, expect, it } from "vitest";
import { summarizeGithubActivity, relativeTimeFrom } from "@/lib/status/github-activity";

const now = new Date("2026-06-14T12:00:00Z");

describe("relativeTimeFrom", () => {
  it("buckets seconds/minutes/hours/days", () => {
    expect(relativeTimeFrom(new Date("2026-06-14T11:59:30Z"), now)).toBe("just now");
    expect(relativeTimeFrom(new Date("2026-06-14T11:45:00Z"), now)).toBe("15m ago");
    expect(relativeTimeFrom(new Date("2026-06-14T09:00:00Z"), now)).toBe("3h ago");
    expect(relativeTimeFrom(new Date("2026-06-12T12:00:00Z"), now)).toBe("2d ago");
  });
});

describe("summarizeGithubActivity", () => {
  it("summarizes the first recognized event (PushEvent)", () => {
    const events = [
      { type: "PushEvent", repo: { name: "ParshvCrafts/Personal-Website-V2" }, created_at: "2026-06-14T10:00:00Z" },
    ];
    expect(summarizeGithubActivity(events, now)).toEqual({
      verb: "pushed to",
      repo: "Personal-Website-V2",
      repoUrl: "https://github.com/ParshvCrafts/Personal-Website-V2",
      relativeTime: "2h ago",
    });
  });
  it("skips unrecognized events and finds the next recognized one", () => {
    const events = [
      { type: "MemberEvent", repo: { name: "a/b" }, created_at: "2026-06-14T11:00:00Z" },
      { type: "CreateEvent", repo: { name: "ParshvCrafts/foo" }, created_at: "2026-06-14T11:30:00Z" },
    ];
    expect(summarizeGithubActivity(events, now)?.verb).toBe("created");
    expect(summarizeGithubActivity(events, now)?.repo).toBe("foo");
  });
  it("returns null for empty or all-unrecognized", () => {
    expect(summarizeGithubActivity([], now)).toBeNull();
    expect(summarizeGithubActivity([{ type: "MemberEvent", repo: { name: "a/b" }, created_at: now.toISOString() }], now)).toBeNull();
  });
  it("returns null for non-array input", () => {
    // @ts-expect-error testing defensive guard
    expect(summarizeGithubActivity(null, now)).toBeNull();
  });
});
