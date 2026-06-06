import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  id?: string;
  eyebrow?: string;
  heading?: string;
}

export function Section({ id, eyebrow, heading, className, children, ...props }: SectionProps) {
  return (
    <section id={id} className={cn("py-24 md:py-32", className)} {...props}>
      <Container>
        {(eyebrow || heading) && (
          <header className="mb-12 md:mb-16">
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {heading && (
              <h2 className="mt-3 font-display text-4xl font-semibold leading-[0.95] tracking-tight text-heading md:text-6xl">
                {heading}
              </h2>
            )}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
