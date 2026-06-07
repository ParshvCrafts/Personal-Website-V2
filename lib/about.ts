/** Maps a roving-tablist navigation key to the next tab index. Pure (unit-tested). */
export function tabKeyToIndex(key: string, current: number, count: number): number {
  if (count <= 0) return 0;
  switch (key) {
    case "ArrowRight":
      return (current + 1) % count;
    case "ArrowLeft":
      return (current - 1 + count) % count;
    case "Home":
      return 0;
    case "End":
      return count - 1;
    default:
      return current;
  }
}
