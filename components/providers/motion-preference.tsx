"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";

type MotionPref = "system" | "reduce";

interface MotionPrefContextValue {
  pref: MotionPref;
  toggle: () => void;
}

const MotionPrefContext = createContext<MotionPrefContextValue>({
  pref: "system",
  toggle: () => {},
});

export function useMotionPreference() {
  return useContext(MotionPrefContext);
}

const STORAGE_KEY = "pp-motion-pref";

export function MotionPreferenceProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPref] = useState<MotionPref>("system");

  // Reflect the stored pref into React state for the toggle icon. The attribute
  // itself is already set pre-paint by the head script in app/layout.tsx.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as MotionPref | null;
    if (stored === "reduce") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPref("reduce");
    }
  }, []);

  // Persist the new pref and reload so every GSAP/3D/Lenis gate re-inits honoring
  // it (per the agreed UX). Reading the live attribute avoids a stale-state flip.
  const toggle = useCallback(() => {
    const reduced = document.documentElement.hasAttribute("data-reduce-motion");
    localStorage.setItem(STORAGE_KEY, reduced ? "system" : "reduce");
    window.location.reload();
  }, []);

  return (
    <MotionPrefContext.Provider value={{ pref, toggle }}>
      {children}
    </MotionPrefContext.Provider>
  );
}
