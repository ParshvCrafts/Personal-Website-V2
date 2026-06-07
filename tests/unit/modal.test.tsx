import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { gsap } from "@/lib/motion";
import { Modal } from "@/components/ui/modal";

afterEach(() => vi.restoreAllMocks());

// Prevent any real GSAP tween from running in jsdom (mirrors motion-cleanup.test).
function mockMatchMedia() {
  vi.spyOn(gsap, "matchMedia").mockReturnValue({ add: vi.fn(), revert: vi.fn() } as never);
}

describe("Modal", () => {
  it("renders nothing when closed", () => {
    mockMatchMedia();
    render(
      <Modal open={false} onClose={() => {}} labelledBy="t">
        <p id="t">Hidden</p>
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders children in a labelled, modal dialog when open", () => {
    mockMatchMedia();
    render(
      <Modal open onClose={() => {}} labelledBy="t">
        <p id="t">Award title</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "t");
    expect(screen.getByText("Award title")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("calls onClose on Escape", () => {
    mockMatchMedia();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} labelledBy="t">
        <p id="t">x</p>
      </Modal>,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when the scrim is clicked", () => {
    mockMatchMedia();
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} labelledBy="t">
        <p id="t">x</p>
      </Modal>,
    );
    fireEvent.click(screen.getByTestId("modal-scrim"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
