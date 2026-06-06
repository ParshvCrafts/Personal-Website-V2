import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll";
import { GrainOverlay } from "@/components/layout/grain-overlay";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { THEMES, DEFAULT_THEME } from "@/lib/theme/palettes";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Parshv Patel — Portfolio",
  description: "UC Berkeley Data Science · AI/ML · building intelligent systems.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${hanken.variable} ${geistMono.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="data-theme"
          themes={THEMES}
          defaultTheme={DEFAULT_THEME}
          enableSystem={false}
          disableTransitionOnChange
        >
          <SmoothScrollProvider>
            <GrainOverlay />
            <CustomCursor />
            {children}
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
