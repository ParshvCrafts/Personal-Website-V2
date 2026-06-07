import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CodeShowcase } from "@/components/sections/about/code-showcase";

describe("CodeShowcase", () => {
  it("shows the first sample by default", () => {
    render(<CodeShowcase />);
    expect(screen.getByRole("tab", { name: "app.py" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent(/AtlasMind/);
  });

  it("switches the panel when another tab is clicked", () => {
    render(<CodeShowcase />);
    fireEvent.click(screen.getByRole("tab", { name: "main.js" }));
    expect(screen.getByRole("tab", { name: "main.js" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent(/Portfolio Animation/);
  });

  it("moves selection with ArrowRight", () => {
    render(<CodeShowcase />);
    fireEvent.keyDown(screen.getByRole("tab", { name: "app.py" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "main.js" })).toHaveAttribute("aria-selected", "true");
  });
});
