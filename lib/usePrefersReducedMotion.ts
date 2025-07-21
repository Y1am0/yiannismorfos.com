import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * React hook that returns `true` when the user has enabled
 * the **Reduce Motion** accessibility setting at OS level.
 */
export const usePrefersReducedMotion = (): boolean => {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(QUERY);

    // Set initial value
    setPrefersReduced(mediaQuery.matches);

    // MediaQueryListListener signature differs between browsers
    const handler = () => setPrefersReduced(mediaQuery.matches);
    if ("addEventListener" in mediaQuery) {
      mediaQuery.addEventListener("change", handler);
    } else if ("addListener" in mediaQuery) {
      // Fallback for older Safari
      (
        mediaQuery as unknown as { addListener: (cb: () => void) => void }
      ).addListener(handler);
    }

    return () => {
      if ("removeEventListener" in mediaQuery) {
        mediaQuery.removeEventListener("change", handler);
      } else if ("removeListener" in mediaQuery) {
        (
          mediaQuery as unknown as { removeListener: (cb: () => void) => void }
        ).removeListener(handler);
      }
    };
  }, []);

  return prefersReduced;
};
