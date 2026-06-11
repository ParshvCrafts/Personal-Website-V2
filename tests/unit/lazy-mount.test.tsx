import { describe, expect, it, vi, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { LazyMount } from "@/components/three/lazy-mount";

afterEach(() => vi.restoreAllMocks());

describe("LazyMount", () => {
  it("mounts children immediately when IntersectionObserver is unavailable", () => {
    const orig = globalThis.IntersectionObserver;
    // @ts-expect-error force the no-IO branch
    globalThis.IntersectionObserver = undefined;
    render(
      <LazyMount poster={<span data-testid="poster" />}>
        <span data-testid="child" />
      </LazyMount>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
    globalThis.IntersectionObserver = orig;
  });

  it("shows poster first, then mounts children when intersecting", () => {
    let trigger: (entries: Partial<IntersectionObserverEntry>[]) => void = () => {};
    class FakeIO {
      constructor(cb: (e: IntersectionObserverEntry[]) => void) {
        trigger = cb as never;
      }
      observe() {}
      disconnect() {}
    }
    // @ts-expect-error test double
    globalThis.IntersectionObserver = FakeIO;
    render(
      <LazyMount poster={<span data-testid="poster" />}>
        <span data-testid="child" />
      </LazyMount>,
    );
    expect(screen.getByTestId("poster")).toBeInTheDocument();
    expect(screen.queryByTestId("child")).toBeNull();
    act(() => {
      trigger([{ isIntersecting: true }]);
    });
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
