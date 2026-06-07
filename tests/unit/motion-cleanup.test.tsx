import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { gsap } from "@/lib/motion";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { TextReveal } from "@/components/motion/text-reveal";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("matchMedia cleanup", () => {
  it.each([
    ["Reveal", () => <Reveal><div>content</div></Reveal>],
    ["Parallax", () => <Parallax><div>content</div></Parallax>],
    ["TextReveal", () => <TextReveal text="Hello world" />],
  ])("%s reverts its matchMedia context on unmount", (_label, renderComponent) => {
    const revert = vi.fn();
    const add = vi.fn();
    vi.spyOn(gsap, "matchMedia").mockReturnValue({ add, revert } as never);

    const { unmount } = render(renderComponent());
    unmount();

    expect(add).toHaveBeenCalled();
    expect(revert).toHaveBeenCalledTimes(1);
  });
});
