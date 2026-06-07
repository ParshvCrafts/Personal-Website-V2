import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { TextReveal } from "@/components/motion/text-reveal";
import { Magnetic } from "@/components/motion/magnetic";
import { Marquee } from "@/components/motion/marquee";
import { CountUp } from "@/components/motion/count-up";
import { TiltCard } from "@/components/motion/tilt-card";
import { PlaceholderSequence } from "./placeholder-sequence";

export const metadata: Metadata = {
  title: "Motion — Preview",
  robots: { index: false, follow: false },
};

export default function MotionPreviewPage() {
  return (
    <main className="bg-background text-foreground">
      <h1 className="sr-only">Motion Primitives Preview</h1>

      <Section eyebrow="Motion" heading="Primitives in motion">
        <div className="space-y-12">
          <Reveal stagger={0.08} className="grid gap-4 md:grid-cols-3">
            <Card>Reveal A</Card>
            <Card>Reveal B</Card>
            <Card>Reveal C</Card>
          </Reveal>

          <TextReveal as="h3" text="Headlines reveal word by word" className="font-display text-4xl text-heading md:text-6xl" />

          <div className="flex flex-wrap items-center gap-6">
            <Magnetic>
              <Button>Magnetic button</Button>
            </Magnetic>
            <p className="text-4xl font-display text-heading">
              <CountUp to={4} decimals={1} /> GPA
            </p>
            <p className="text-4xl font-display text-heading">
              <CountUp to={136} suffix="+" /> hrs
            </p>
          </div>

          <Marquee className="border-y border-border py-4">
            {["Python", "PyTorch", "FastAPI", "Next.js", "GSAP", "SQL"].map((s) => (
              <span key={s} className="font-mono text-sm uppercase tracking-widest text-muted">
                {s}
              </span>
            ))}
          </Marquee>

          <TiltCard className="mx-auto max-w-sm">
            <Card className="text-center">Tilt me (desktop)</Card>
          </TiltCard>
        </div>
      </Section>

      <PlaceholderSequence />

      <Section eyebrow="Parallax" heading="Depth on scroll">
        <Parallax amount={80}>
          <Container>
            <Card className="mx-auto max-w-md text-center">I drift on scroll</Card>
          </Container>
        </Parallax>
      </Section>
    </main>
  );
}
