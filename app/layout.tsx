import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { MotionPreferenceProvider } from "@/components/providers/motion-preference";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll";
import { GrainOverlay } from "@/components/layout/grain-overlay";
import { CustomCursor } from "@/components/layout/custom-cursor";
import { ScrollProgress } from "@/components/layout/scroll-progress";
import { ClickSpark } from "@/components/motion/click-spark";
import { CommandPaletteIsland } from "@/components/command-palette/command-palette-island";
import { RippleFallback } from "@/components/easter-egg/ripple-fallback";
import { GuidedTour } from "@/components/tour/guided-tour";
import { TourPrompt } from "@/components/tour/tour-prompt";
import { THEMES, DEFAULT_THEME } from "@/lib/theme/palettes";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Parshv Patel | Data Science & AI - UC Berkeley",
    template: "%s | Parshv Patel",
  },
  description:
    "UC Berkeley Data Science student (4.0 GPA, Dean's List) and Amazon SWE Intern 2026. Multimodal AI, agentic systems, and machine learning projects.",
  keywords: [
    "Parshv Patel",
    "UC Berkeley",
    "Data Science",
    "Machine Learning",
    "AI",
    "Artificial Intelligence",
    "Software Engineering",
    "Amazon Intern",
    "Portfolio",
    "Python",
    "PyTorch",
    "Computer Vision",
    "Full Stack",
  ],
  authors: [{ name: "Parshv Patel", url: "https://www.portfolio.parshvpatel.com" }],
  creator: "Parshv Patel",
  metadataBase: new URL("https://www.portfolio.parshvpatel.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.portfolio.parshvpatel.com",
    siteName: "Parshv Patel",
    title: "Parshv Patel | Data Science & AI - UC Berkeley",
    description:
      "UC Berkeley Data Science student (4.0 GPA, Dean's List) and Amazon SWE Intern 2026. Multimodal AI, agentic systems, and machine learning projects.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Parshv Patel, UC Berkeley Data Science & AI Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Parshv Patel | Data Science & AI - UC Berkeley",
    description:
      "UC Berkeley Data Science student (4.0 GPA, Dean's List) and Amazon SWE Intern 2026. Multimodal AI, agentic systems, and machine learning projects.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "F3htqqNlwBFXFrcEVSgRt9C13hi2VfjwNDTdgYMZ8ec",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fraunces.variable} ${hanken.variable} ${geistMono.variable}`}
    >
      <body>
        <script
          // Apply the stored motion preference before paint so the reduced-motion
          // gate is correct on first render (no animation flash). When the toggle is
          // on we also force window.matchMedia's prefers-reduced-motion result, so the
          // many gsap.matchMedia("(prefers-reduced-motion: no-preference)") gates honor
          // it too (CSS is covered by the [data-reduce-motion] rule in globals.css).
          // Mirrors the next-themes pre-paint pattern.
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('pp-motion-pref')==='reduce'){document.documentElement.setAttribute('data-reduce-motion','');var _mm=window.matchMedia.bind(window);window.matchMedia=function(q){return /prefers-reduced-motion/.test(q)?{matches:!/no-preference/.test(q),media:q,onchange:null,addListener:function(){},removeListener:function(){},addEventListener:function(){},removeEventListener:function(){},dispatchEvent:function(){return false}}:_mm(q)}}}catch(e){}",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Parshv Patel",
              url: "https://www.portfolio.parshvpatel.com",
              jobTitle: "Data Science Student",
              worksFor: {
                "@type": "Organization",
                name: "Amazon",
                url: "https://www.amazon.com",
              },
              affiliation: {
                "@type": "CollegeOrUniversity",
                name: "University of California, Berkeley",
              },
              sameAs: [
                "https://www.linkedin.com/in/parshv-patel-65a90326b/",
                "https://github.com/ParshvCrafts",
              ],
            }),
          }}
        />
        <MotionPreferenceProvider>
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
              <ScrollProgress />
              <ClickSpark />
              {children}
              <CommandPaletteIsland />
              <RippleFallback />
              <GuidedTour />
              <TourPrompt />
            </SmoothScrollProvider>
          </ThemeProvider>
        </MotionPreferenceProvider>
      </body>
    </html>
  );
}
