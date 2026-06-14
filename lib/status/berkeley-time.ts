export interface BerkeleyTime {
  time: string;
  zone: string;
}

/** Format an instant as Berkeley (America/Los_Angeles) wall-clock time. Pure. */
export function formatBerkeleyTime(date: Date): BerkeleyTime {
  const time = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  const zone =
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles",
      timeZoneName: "short",
    })
      .formatToParts(date)
      .find((p) => p.type === "timeZoneName")?.value ?? "PT";
  return { time, zone };
}
