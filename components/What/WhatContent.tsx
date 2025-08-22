"use client";

import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ScrollablePageContainer } from "../ScrollablePageContainer";
import { tiktokData, workData, youtubeData } from "./data";
import { NewIdeaCard } from "./NewIdeaCard";
import { SliderArrows } from "./SliderArrows";
import { WorkCardData } from "./types";
import { WhatTabs } from "./WhatTabs";
import { WhatTitle } from "./WhatTitle";
import { WorkCard } from "./WorkCard";

interface WhatContentProps {
  initialWorkCards?: WorkCardData[];
  initialContentCards?: WorkCardData[];
}

export const WhatContent = ({
  initialWorkCards = workData,
  initialContentCards = [...tiktokData, ...youtubeData],
}: WhatContentProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReduced = usePrefersReducedMotion();
  const isExiting = useRouteTransitionStore((s) => s.isExiting);
  const [activeSet, setActiveSet] = useState<"dev" | "content">(() => {
    const tab = searchParams.get("tab");
    return tab === "content" ? "content" : "dev";
  });
  const [isMobile, setIsMobile] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [visibleCount, setVisibleCount] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasAutoCenteredRef = useRef(false);
  const hasMountedRef = useRef(false);
  const lastCenteredIndexRef = useRef(0);

  const CARD_WIDTH = 280;
  const DESKTOP_GAP = 24;
  const MOBILE_GAP = 16; // matches Tailwind gap-4
  const MOBILE_SIDE_PADDING = 16; // px-4 on mobile track
  const MASK_MARGIN = 8; // reduce width slightly so mask doesn't cover edges
  const MOBILE_SINGLE_RATIO = 0.9; // narrow single card to 85% of inner width
  const cards = activeSet === "dev" ? initialWorkCards : initialContentCards;
  const TOTAL_CARDS = cards.length + 1; // include NewIdeaCard

  // Sync active tab from URL on mount and when the query changes (back/forward)
  useEffect(() => {
    const tab = searchParams.get("tab");
    const isValid = tab === "dev" || tab === "content";
    if (isValid && tab !== activeSet) {
      setActiveSet(tab as "dev" | "content");
    }
  }, [searchParams, activeSet]);

  // Ensure a default tab is present in the URL (dev) on first mount
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab !== "dev" && tab !== "content") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "dev");
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [pathname, router, searchParams]);

  // Resize & visible count
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      setContainerWidth(width);
      const wasMobile = isMobile;
      let visibleCards: number;
      if (width < 768) {
        visibleCards = 1; // always one card on mobile
        setIsMobile(true);
      } else {
        const availableWidth = width; // full width for calculation
        visibleCards = Math.floor(
          (availableWidth + DESKTOP_GAP) / (CARD_WIDTH + DESKTOP_GAP)
        );
        visibleCards = Math.max(1, Math.min(visibleCards, TOTAL_CARDS));
        setIsMobile(false);
      }
      setVisibleCount(visibleCards);
      if (wasMobile !== width < 768 && scrollContainerRef.current) {
        setTimeout(() => {
          scrollContainerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
        }, 80);
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [isMobile, TOTAL_CARDS]);

  // Mark component as mounted to skip initial title delay on subsequent swaps
  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  // Scroll position detection
  useEffect(() => {
    const check = () => {
      const el = scrollContainerRef.current;
      if (!el) return;
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const tol = 2;
      setCanScrollLeft(scrollLeft > tol);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - tol);
    };
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    check();
    const tids = [50, 150, 300].map((d) => setTimeout(check, d));
    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
      tids.forEach(clearTimeout);
    };
  }, [isMobile]);

  const item = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
    },
    exit: {
      opacity: 0,
      y: 0,
      filter: "blur(10px)",
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const },
    },
  } as const;

  const canGoNext = canScrollRight;
  const canGoPrev = canScrollLeft;

  const handleNext = () => {
    if (!canGoNext || !scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
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
    const GAP = isMobile ? MOBILE_GAP : DESKTOP_GAP;
    const move = Math.min(visibleCount, TOTAL_CARDS - 1);
    const amount = move * (CARD_WIDTH + GAP);
    el.scrollBy({ left: amount, behavior: "smooth" });
  };
  const handlePrev = () => {
    if (!canGoPrev || !scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
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
    const GAP = isMobile ? MOBILE_GAP : DESKTOP_GAP;
    const move = Math.min(visibleCount, TOTAL_CARDS - 1);
    const amount = move * (CARD_WIDTH + GAP);
    el.scrollBy({ left: -amount, behavior: "smooth" });
  };

  // Center the first card on mobile after layout to align with snap-center and padding
  useEffect(() => {
    if (!isMobile) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    // Run once per mount/responsive recalculation
    if (hasAutoCenteredRef.current) return;
    hasAutoCenteredRef.current = true;
    const id = window.requestAnimationFrame(() => {
      const first = el.children.item(0) as HTMLElement | null;
      if (!first) return;
      const target =
        first.offsetLeft + first.clientWidth / 2 - el.clientWidth / 2;
      el.scrollTo({ left: Math.max(0, target), behavior: "auto" });
    });
    return () => cancelAnimationFrame(id);
  }, [isMobile]);

  // Helpers to detect current centered index and scroll to target index
  const getCurrentCenteredIndex = () => {
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
    return current; // includes NewIdeaCard at index 0
  };

  const scrollToIndex = (index: number) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const children = Array.from(el.children) as HTMLElement[];
    if (children.length === 0) return;
    const clamped = Math.max(0, Math.min(index, children.length - 1));
    const centers = children.map((c) => c.offsetLeft + c.clientWidth / 2);
    const target = centers[clamped] - el.clientWidth / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  };

  // Smoothly center to a given index and resolve when close enough or timeout
  const centerToIndex = (index: number) =>
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
        if (Math.abs(el.scrollLeft - targetLeft) <= tol) return resolve();
        if (performance.now() - start > maxMs) return resolve();
        requestAnimationFrame(check);
      };
      el.scrollTo({ left: targetLeft, behavior: "smooth" });
      requestAnimationFrame(check);
    });

  // When switching dataset, preserve the approximate centered index
  useEffect(() => {
    // After cards re-render, align to previous center if possible
    if (!hasMountedRef.current) return;
    // Defer to next frame so children measurements are ready
    const id = requestAnimationFrame(() => {
      const prev = lastCenteredIndexRef.current;
      // If previous index exceeds new length, clamp
      scrollToIndex(Math.min(prev, TOTAL_CARDS - 1));
    });
    return () => cancelAnimationFrame(id);
  }, [activeSet, TOTAL_CARDS, isMobile, containerWidth]);

  // Animated mask variables (fade) -------------------------------------------------
  // We keep a single gradient mask and animate the edge transparency/width via CSS custom properties.
  // Left/right fade active when we *can* scroll in that direction.
  const leftFadeActive = canScrollLeft;
  const rightFadeActive = canScrollRight;
  // Widths chosen to match previous hard-coded 15% & 80% stops logic (15% per side)
  const FADE_WIDTH = 15; // percent
  // Custom property values
  const maskVars = {
    "--left-alpha": leftFadeActive ? "0" : "1",
    "--left-width": leftFadeActive ? `${FADE_WIDTH}%` : "0%",
    "--right-alpha": rightFadeActive ? "0" : "1",
    "--right-width": rightFadeActive ? `${FADE_WIDTH}%` : "0%",
  } as React.CSSProperties;

  const computeCardWidth = () => {
    const GAP = isMobile ? MOBILE_GAP : DESKTOP_GAP;
    const innerWidth =
      containerWidth - (isMobile ? MOBILE_SIDE_PADDING * 2 : 0);
    const fullWidthSingle = visibleCount === 1 && innerWidth < CARD_WIDTH + GAP;
    const baseWidth = CARD_WIDTH;
    return fullWidthSingle
      ? innerWidth * (isMobile ? MOBILE_SINGLE_RATIO : 1) - MASK_MARGIN
      : visibleCount === 1
      ? Math.min(baseWidth, innerWidth) * (isMobile ? MOBILE_SINGLE_RATIO : 1) -
        MASK_MARGIN
      : baseWidth;
  };

  return (
    <ScrollablePageContainer
      className=""
      showScrollIndicator={false}
      verticalFade={true}
      deferTopFadeUntilScrolled={true}
      fadeSize="10%"
    >
      <div className="w-full max-w-5xl mx-auto flex flex-col justify-center">
        <div className="w-full flex flex-col items-center gap-2 lg:flex-row lg:items-center lg:justify-between">
          <WhatTitle
            prefersReduced={prefersReduced}
            isExiting={isExiting}
            className="!pt-2 !pb-2 text-center lg:text-left"
          />
          <motion.div variants={item} className="w-full lg:w-auto">
            <WhatTabs
              active={activeSet}
              onSelect={async (next) => {
                lastCenteredIndexRef.current = getCurrentCenteredIndex();
                await centerToIndex(0);
                lastCenteredIndexRef.current = 0;
                setActiveSet(next);
                // Update URL query param without adding history entries
                const params = new URLSearchParams(searchParams.toString());
                params.set("tab", next);
                if (typeof window !== "undefined") {
                  const url = `${pathname}?${params.toString()}`;
                  window.history.replaceState(null, "", url);
                }
              }}
            />
          </motion.div>
        </div>
        <motion.div
          variants={item}
          className="relative mt-4"
          ref={containerRef}
        >
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className={`flex overflow-x-auto scrollbar-hide pb-4 scroll-fade-mask ${
                isMobile ? "gap-4 px-4 snap-x snap-mandatory" : "gap-6"
              } ${prefersReduced ? "reduce-motion" : ""}`}
              style={{
                ...maskVars,
                WebkitMaskImage:
                  "linear-gradient(to right, rgba(0,0,0,var(--left-alpha)) 0%, #000 var(--left-width), #000 calc(100% - var(--right-width)), rgba(0,0,0,var(--right-alpha)) 100%)",
                maskImage:
                  "linear-gradient(to right, rgba(0,0,0,var(--left-alpha)) 0%, #000 var(--left-width), #000 calc(100% - var(--right-width)), rgba(0,0,0,var(--right-alpha)) 100%)",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <AnimatePresence
                mode="popLayout"
                initial={!hasMountedRef.current}
              >
                {(() => {
                  const cardWidth = computeCardWidth();
                  const baseDelayValue = hasMountedRef.current ? 0 : 0.7;
                  return [
                    <NewIdeaCard
                      key="new-idea"
                      index={0}
                      isMobile={isMobile}
                      cardWidth={cardWidth}
                      baseDelay={baseDelayValue}
                    />,
                    ...cards.map((card: WorkCardData, index) => (
                      <WorkCard
                        key={`${activeSet}-${card.id}`}
                        card={card}
                        index={index + 1}
                        isMobile={isMobile}
                        cardWidth={cardWidth}
                        baseDelay={baseDelayValue}
                      />
                    )),
                  ];
                })()}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        <div className="mt-2">
          <SliderArrows
            canPrev={canGoPrev}
            canNext={canGoNext}
            onPrev={handlePrev}
            isMobile={isMobile}
            onNext={handleNext}
          />
        </div>
      </div>
    </ScrollablePageContainer>
  );
};

export default WhatContent;
