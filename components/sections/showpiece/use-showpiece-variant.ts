"use client";

import { useEffect, useState } from "react";
import { parseShowpieceVariant, type ShowpieceVariant } from "@/lib/showpiece/showpiece-variant";

const SHOWPIECE_DEFAULT: ShowpieceVariant = "keystroke";

/** Returns the configured default until mounted, then the `?show=` override. */
export function useShowpieceVariant(): ShowpieceVariant {
  const [variant, setVariant] = useState<ShowpieceVariant>(SHOWPIECE_DEFAULT);
  useEffect(() => {
    const read = () =>
      setVariant(parseShowpieceVariant(window.location.search, SHOWPIECE_DEFAULT));
    read();
  }, []);
  return variant;
}
