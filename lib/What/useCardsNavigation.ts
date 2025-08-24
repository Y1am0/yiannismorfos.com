"use client";

import { useCallback } from "react";

/**
 * useCardsNavigation
 *
 * Purpose:
 * - Encapsulates all logic for horizontally navigating a card carousel.
 * - Provides imperative helpers (next/prev) and index utilities used by the UI.
 *
 * How it works:
 * - Computes the current centered index by measuring child positions vs the
 *   container center.
 * - scrollToIndex: centers a specific child smoothly.
 * - centerToIndex: returns a promise that resolves when the scroll reaches the
 *   desired center (or after a timeout). Used to avoid blocking animations.
 * - handleNext/handlePrev: jump behavior that adapts to single-card and
 *   multi-card layouts (mobile vs desktop), with distance based on gaps.
 *
 * Arguments:
 * - isMobile, visibleCount: affect behavior and distances
 * - totalCards, cardWidth, desktopGap, mobileGap: layout constants
 * - scrollContainerRef: ref to the horizontal scroll element
 */
export function useCardsNavigation(params: {
  isMobile: boolean;
  visibleCount: number;
  totalCards: number;
  cardWidth: number;
  desktopGap: number;
  mobileGap: number;
  scrollContainerRef:
    | React.RefObject<HTMLDivElement>
    | React.MutableRefObject<HTMLDivElement | null>;
}) {
  const {
    isMobile,
    visibleCount,
    totalCards,
    cardWidth,
    desktopGap,
    mobileGap,
    scrollContainerRef,
  } = params;

  const getCurrentCenteredIndex = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return 0;
    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return 0;
    const containerCenter = el.scrollLeft + el.clientWidth / 2;
    const centers = children.map((c) => c.offsetLeft + c.clientWidth / 2);
    let current = 0;
    let minDist = Number.POSITIVE_INFINITY;
    centers.forEach((cx, i) => {
      const d = Math.abs(cx - containerCenter);
      if (d < minDist) {
        minDist = d;
        current = i;
      }
    });
    return current;
  }, [scrollContainerRef]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const el = scrollContainerRef.current;
      if (!el) return;
      const children = Array.from(el.children) as HTMLElement[];
      if (children.length === 0) return;
      const clamped = Math.max(0, Math.min(index, children.length - 1));
      const centers = children.map((c) => c.offsetLeft + c.clientWidth / 2);
      const target = centers[clamped] - el.clientWidth / 2;
      el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
    },
    [scrollContainerRef]
  );

  const centerToIndex = useCallback(
    (index: number) =>
      new Promise<void>((resolve) => {
        const el = scrollContainerRef.current;
        if (!el) return resolve();
        const children = Array.from(el.children) as HTMLElement[];
        if (children.length === 0) return resolve();
        const clamped = Math.max(0, Math.min(index, children.length - 1));
        const centers = children.map((c) => c.offsetLeft + c.clientWidth / 2);
        const targetLeft = Math.max(0, centers[clamped] - el.clientWidth / 2);
        const tol = 2;
        const start = performance.now();
        const maxMs = 650;
        const check = () => {
          if (!el) return resolve();
          if (Math.abs(el.scrollLeft - targetLeft) <= tol) return resolve();
          if (performance.now() - start > maxMs) return resolve();
          requestAnimationFrame(check);
        };
        el.scrollTo({ left: targetLeft, behavior: "smooth" });
        requestAnimationFrame(check);
      }),
    [scrollContainerRef]
  );

  const handleNext = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (visibleCount === 1) {
      const children = Array.from(el.children) as HTMLElement[];
      if (children.length === 0) return;
      const containerCenter = el.scrollLeft + el.clientWidth / 2;
      const centers = children.map((c) => c.offsetLeft + c.clientWidth / 2);
      let current = 0;
      let minDist = Number.POSITIVE_INFINITY;
      centers.forEach((cx, i) => {
        const d = Math.abs(cx - containerCenter);
        if (d < minDist) {
          minDist = d;
          current = i;
        }
      });
      const next = Math.min(current + 1, children.length - 1);
      const target = centers[next] - el.clientWidth / 2;
      el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
      return;
    }
    const GAP = isMobile ? mobileGap : desktopGap;
    const move = Math.min(visibleCount, totalCards - 1);
    const amount = move * (cardWidth + GAP);
    el.scrollBy({ left: amount, behavior: "smooth" });
  }, [
    scrollContainerRef,
    visibleCount,
    isMobile,
    mobileGap,
    desktopGap,
    totalCards,
    cardWidth,
  ]);

  const handlePrev = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    if (visibleCount === 1) {
      const children = Array.from(el.children) as HTMLElement[];
      if (children.length === 0) return;
      const containerCenter = el.scrollLeft + el.clientWidth / 2;
      const centers = children.map((c) => c.offsetLeft + c.clientWidth / 2);
      let current = 0;
      let minDist = Number.POSITIVE_INFINITY;
      centers.forEach((cx, i) => {
        const d = Math.abs(cx - containerCenter);
        if (d < minDist) {
          minDist = d;
          current = i;
        }
      });
      const prev = Math.max(current - 1, 0);
      const target = centers[prev] - el.clientWidth / 2;
      el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
      return;
    }
    const GAP = isMobile ? mobileGap : desktopGap;
    const move = Math.min(visibleCount, totalCards - 1);
    const amount = move * (cardWidth + GAP);
    el.scrollBy({ left: -amount, behavior: "smooth" });
  }, [
    scrollContainerRef,
    visibleCount,
    isMobile,
    mobileGap,
    desktopGap,
    totalCards,
    cardWidth,
  ]);

  return {
    getCurrentCenteredIndex,
    scrollToIndex,
    centerToIndex,
    handleNext,
    handlePrev,
  };
}
