import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders its label", () => {
    render(<Button>Explore</Button>);
    expect(screen.getByRole("button", { name: "Explore" })).toBeInTheDocument();
  });
  it("applies the primary accent variant by default", () => {
    render(<Button>Go</Button>);
    expect(screen.getByRole("button", { name: "Go" }).className).toContain("bg-accent");
  });
  it("applies the outline variant when requested", () => {
    render(<Button variant="outline">Edge</Button>);
    const cls = screen.getByRole("button", { name: "Edge" }).className;
    expect(cls).toContain("border-border");
    expect(cls).not.toContain("bg-accent");
  });
  it("is disabled when disabled", () => {
    render(<Button disabled>Nope</Button>);
    expect(screen.getByRole("button", { name: "Nope" })).toBeDisabled();
  });
});
