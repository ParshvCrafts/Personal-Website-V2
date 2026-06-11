import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import type { GpuTier } from "@/lib/webgl/capabilities";

let mockTier: GpuTier = "off";
vi.mock("@/components/three/use-gpu-tier", () => ({
  useGpuTier: () => mockTier,
}));
// Avoid IntersectionObserver gating in this test: mount children immediately.
vi.mock("@/components/three/lazy-mount", () => ({
  LazyMount: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { SceneSlot } from "@/components/three/scene-slot";

beforeEach(() => {
  mockTier = "off";
});

describe("SceneSlot", () => {
  it("renders only the fallback below minTier and never calls render()", () => {
    mockTier = "off";
    const renderScene = vi.fn(() => <span data-testid="scene" />);
    render(<SceneSlot minTier="low" fallback={<span data-testid="fallback" />} render={renderScene} />);
    expect(screen.getByTestId("fallback")).toBeInTheDocument();
    expect(screen.queryByTestId("scene")).toBeNull();
    expect(renderScene).not.toHaveBeenCalled();
  });

  it("renders the scene when the tier meets minTier", () => {
    mockTier = "high";
    render(
      <SceneSlot minTier="low" fallback={<span data-testid="fallback" />} render={() => <span data-testid="scene" />} />,
    );
    expect(screen.getByTestId("scene")).toBeInTheDocument();
  });
});
