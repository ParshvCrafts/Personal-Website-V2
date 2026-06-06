import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { THEMES, DEFAULT_THEME } from "@/lib/theme/palettes";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "Parshv Patel — Portfolio",
  description: "UC Berkeley Data Science · AI/ML · building intelligent systems.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${hanken.variable} ${jetbrains.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="data-theme"
          themes={THEMES}
          defaultTheme={DEFAULT_THEME}
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
