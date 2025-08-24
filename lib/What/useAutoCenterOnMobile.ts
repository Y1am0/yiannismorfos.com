"use client";

import { useEffect, useRef } from "react";

/**
 * useAutoCenterOnMobile
 *
 * Purpose:
 * - On smartphones, initial layout/paint timing can cause a first-frame where
 *   card measurements aren't stable yet. This hook ensures the first card is
 *   centered once the DOM is actually ready.
 *
 * How it works:
 * - Runs only when `isMobile` is true and only once per mount (internal ref).
 * - Attempts immediate centering; if the first card has no size yet, it
 *   retries at progressive delays (50/150/300/500ms) until it succeeds.
 *
 * Arguments:
 * - isMobile: boolean that indicates mobile layout mode
 * - scrollContainerRef: ref to the horizontal scroll container element
 */
export function useAutoCenterOnMobile(
  isMobile: boolean,
  scrollContainerRef:
    | React.RefObject<HTMLDivElement>
    | React.MutableRefObject<HTMLDivElement | null>
) {
  const hasAutoCenteredRef = useRef(false);

  useEffect(() => {
    if (!isMobile) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    if (hasAutoCenteredRef.current) return;
    hasAutoCenteredRef.current = true;

    const centerFirstCard = () => {
      const first = el.children.item(0) as HTMLElement | null;
      if (!first || first.offsetWidth === 0) {
        return false;
      }
      const target =
        first.offsetLeft + first.clientWidth / 2 - el.clientWidth / 2;
      el.scrollTo({ left: Math.max(0, target), behavior: "auto" });
      return true;
    };

    if (centerFirstCard()) return;

    const timeouts: number[] = [];
    [50, 150, 300, 500].forEach((delay) => {
      timeouts.push(
        window.setTimeout(() => {
          if (centerFirstCard()) {
            timeouts.forEach(clearTimeout);
          }
        }, delay)
      );
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isMobile, scrollContainerRef]);
}
