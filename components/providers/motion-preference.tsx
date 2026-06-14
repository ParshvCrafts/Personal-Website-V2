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

  // Hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as MotionPref | null;
    if (stored === "reduce") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPref("reduce");
      document.documentElement.setAttribute("data-reduce-motion", "");
    }
  }, []);

  const toggle = useCallback(() => {
    setPref((prev) => {
      const next = prev === "system" ? "reduce" : "system";
      if (next === "reduce") {
        document.documentElement.setAttribute("data-reduce-motion", "");
        localStorage.setItem(STORAGE_KEY, "reduce");
      } else {
        document.documentElement.removeAttribute("data-reduce-motion");
        localStorage.setItem(STORAGE_KEY, "system");
      }
      return next;
    });
  }, []);

  return (
    <MotionPrefContext.Provider value={{ pref, toggle }}>
      {children}
    </MotionPrefContext.Provider>
  );
}
