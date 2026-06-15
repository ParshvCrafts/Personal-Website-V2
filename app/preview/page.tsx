import type { Metadata } from "next";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eyebrow } from "@/components/ui/eyebrow";
import { palettes, THEMES, THEME_LABELS } from "@/lib/theme/palettes";
import { ProofSceneMount } from "@/components/three/proof-scene-mount";

export const metadata: Metadata = {
  title: "Design System Preview",
  robots: { index: false, follow: false },
};

export default function PreviewPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <h1 className="sr-only">Design System Preview</h1>

      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <Container className="flex items-center justify-between py-4">
          <Eyebrow>Design System</Eyebrow>
          <ThemeSwitcher />
        </Container>
      </div>

      <Section eyebrow="Typography" heading="Type scale & families">
        <div className="space-y-6">
          <p className="font-display text-6xl font-semibold leading-[0.95] tracking-tight text-heading">
            Fraunces display
          </p>
          <p className="font-sans text-lg text-foreground">
            Hanken Grotesk body: the quick brown fox builds intelligent systems.
          </p>
          <p className="font-sans text-base text-muted">
            Muted body: secondary supporting copy.
          </p>
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted">
            Geist Mono label
          </p>
        </div>
      </Section>

      <Section eyebrow="Color" heading="Palette tokens (current theme)">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {(
            ["background", "elevated", "surface", "foreground", "heading", "muted", "accent", "accent-2", "on-accent", "border", "ring"] as const
          ).map((token) => (
            <div key={token} className="rounded-xl border border-border p-3">
              <div
                className="mb-2 h-12 w-full rounded-lg border border-border"
                style={{ background: `var(--${token})` }}
              />
              <code className="font-mono text-xs text-muted">--{token}</code>
            </div>
          ))}
          <div key="accent-3" className="rounded-xl border border-border p-3">
            <div
              className="mb-2 h-12 w-full rounded-lg border border-border"
              style={{ background: "var(--accent-3, transparent)" }}
            />
            <code className="font-mono text-xs text-muted">--accent-3</code>
          </div>
        </div>
      </Section>

      <Section eyebrow="Components" heading="Primitives">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {THEMES.map((name) => (
            <Card key={name}>
              <Eyebrow>{THEME_LABELS[name]}</Eyebrow>
              <p className="mt-2 font-display text-2xl text-heading">{palettes[name].accent}</p>
              <div className="mt-3 flex gap-2">
                <Badge>accent</Badge>
                <Badge>{palettes[name].colorScheme}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section eyebrow="3D Foundation" heading="WebGL rig proof (P13)">
        <p className="mb-6 max-w-prose text-muted">
          Decorative scene mounted through the SceneSlot gateway: lazy-loaded, DPR-scaled,
          scroll-bridged, and replaced by an accessible fallback under reduced motion / no WebGL.
        </p>
        <ProofSceneMount />
      </Section>
    </main>
  );
}
