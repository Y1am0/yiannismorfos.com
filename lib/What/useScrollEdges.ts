"use client";

import { useEffect, useRef, useState } from "react";

/**
 * useScrollEdges
 *
 * Purpose:
 * - Detects whether a horizontally scrollable container can scroll left/right.
 * - Produces CSS custom properties for a gradient mask that fades the edges
 *   when additional content is available in that direction.
 *
 * How it works:
 * - Exposes a ref for the scroll container. Once attached, the hook:
 *   - Subscribes to 'scroll' events and a ResizeObserver to recompute edges.
 *   - Computes canScrollLeft/canScrollRight by comparing scrollLeft to bounds.
 *   - Returns 'maskVars' with CSS variables used to render a horizontal fade
 *     via mask-image/WebkitMaskImage.
 *
 * Return shape:
 * - scrollContainerRef: ref to attach to the scrollable element
 * - canScrollLeft/canScrollRight: booleans for arrow enablement/UX
 * - maskVars: CSSProperties with --left-alpha/--left-width/--right-* values
 */
export function useScrollEdges() {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const check = () => {
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const tol = 2;
      setCanScrollLeft(scrollLeft > tol);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - tol);
    };

    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    check();
    const tids = [50, 150, 300].map((d) => window.setTimeout(check, d));

    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
      tids.forEach(clearTimeout);
    };
  }, []);

  const FADE_WIDTH = 15; // percent
  const maskVars = {
    "--left-alpha": canScrollLeft ? "0" : "1",
    "--left-width": canScrollLeft ? `${FADE_WIDTH}%` : "0%",
    "--right-alpha": canScrollRight ? "0" : "1",
    "--right-width": canScrollRight ? `${FADE_WIDTH}%` : "0%",
  } as React.CSSProperties;

  return { scrollContainerRef, canScrollLeft, canScrollRight, maskVars };
}
