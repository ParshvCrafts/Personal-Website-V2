import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useGpuTier } from "@/components/three/use-gpu-tier";

function Probe() {
  return <span data-testid="tier">{useGpuTier()}</span>;
}

// Helper: install matchMedia + a webgl2-capable canvas getContext.
function installEnv({ reduce = false, webgl2 = true, coarse = false }) {
  window.matchMedia = vi.fn().mockImplementation((q: string) => ({
    matches: (q.includes("reduced-motion") && reduce) || (q.includes("coarse") && coarse),
    media: q,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    (id: string) => (id === "webgl2" && webgl2 ? ({} as never) : null),
  );
}

beforeEach(() => {
  // 8 cores, 8GB by default so the heuristic yields "high".
  Object.defineProperty(navigator, "hardwareConcurrency", { value: 8, configurable: true });
  (navigator as unknown as { deviceMemory?: number }).deviceMemory = 8;
});
afterEach(() => vi.restoreAllMocks());

describe("useGpuTier", () => {
  it("resolves to 'high' on a capable device after mount", async () => {
    installEnv({});
    render(<Probe />);
    expect(await screen.findByText("high")).toBeInTheDocument();
  });
  it("resolves to 'off' under reduced motion", async () => {
    installEnv({ reduce: true });
    render(<Probe />);
    expect(await screen.findByText("off")).toBeInTheDocument();
  });
  it("resolves to 'off' when WebGL2 is unavailable", async () => {
    installEnv({ webgl2: false });
    render(<Probe />);
    expect(await screen.findByText("off")).toBeInTheDocument();
  });

  it("downgrades to 'off' live when reduced motion is toggled on", async () => {
    let reduce = false;
    let onChange: (() => void) | null = null;
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
      get matches() {
        return q.includes("reduced-motion") ? reduce : false;
      },
      media: q,
      addEventListener: (_: string, cb: () => void) => {
        if (q.includes("reduced-motion")) onChange = cb;
      },
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    // WebGL2 stays available the whole time — only the RM preference flips, proving the
    // tier re-resolves on toggle (and that the one-time WebGL2 probe is not re-run).
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      (id: string) => (id === "webgl2" ? ({} as never) : null),
    );

    render(<Probe />);
    expect(await screen.findByText("high")).toBeInTheDocument();

    await act(async () => {
      reduce = true;
      onChange?.();
    });
    expect(await screen.findByText("off")).toBeInTheDocument();
  });
});
