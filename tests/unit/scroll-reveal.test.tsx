import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { gsap } from "@/lib/motion";
import { ScrollReveal } from "@/components/motion/scroll-reveal";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ScrollReveal", () => {
  it("renders its children", () => {
    render(
      <ScrollReveal>
        <p data-testid="child">Hello</p>
      </ScrollReveal>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(screen.getByTestId("child").textContent).toBe("Hello");
  });

  it.each<[string]>([
    ["fade-rise"],
    ["clip-up"],
    ["clip-left"],
    ["blur-in"],
    ["stagger-cascade"],
  ])("renders without error for variant '%s'", (variant) => {
    const { container } = render(
      <ScrollReveal variant={variant as never}>
        <span>A</span>
        <span>B</span>
      </ScrollReveal>,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("applies the className prop", () => {
    const { container } = render(
      <ScrollReveal className="my-custom-class">
        <div>Content</div>
      </ScrollReveal>,
    );
    expect((container.firstChild as HTMLElement).className).toContain(
      "my-custom-class",
    );
  });

  it("applies motion-safe:will-change-transform class", () => {
    const { container } = render(
      <ScrollReveal>
        <div>Content</div>
      </ScrollReveal>,
    );
    expect((container.firstChild as HTMLElement).className).toContain(
      "motion-safe:will-change-transform",
    );
  });

  it("reverts its matchMedia context on unmount", () => {
    const revert = vi.fn();
    const add = vi.fn();
    vi.spyOn(gsap, "matchMedia").mockReturnValue({ add, revert } as never);

    const { unmount } = render(
      <ScrollReveal>
        <div>content</div>
      </ScrollReveal>,
    );
    unmount();

    expect(add).toHaveBeenCalled();
    expect(revert).toHaveBeenCalledTimes(1);
  });
});
