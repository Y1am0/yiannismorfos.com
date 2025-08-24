"use client";

import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { useAutoCenterOnMobile } from "@/lib/What/useAutoCenterOnMobile";
import { useCardsNavigation } from "@/lib/What/useCardsNavigation";
import { useScrollEdges } from "@/lib/What/useScrollEdges";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { item } from "../Hello/variants";
import { ScrollablePageContainer } from "../ScrollablePageContainer";
import {
  CARD_WIDTH,
  DESKTOP_GAP,
  MASK_MARGIN,
  MOBILE_GAP,
  MOBILE_SIDE_PADDING,
  MOBILE_SINGLE_RATIO,
} from "./constants";
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
  const isExiting = useRouteTransitionStore((s) => s.isExiting);
  const [activeSet, setActiveSet] = useState<"dev" | "content">(() => {
    const tab = searchParams.get("tab");
    return tab === "content" ? "content" : "dev";
  });
  const [isMobile, setIsMobile] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollContainerRef, canScrollLeft, canScrollRight, maskVars } =
    useScrollEdges();
  const hasAutoCenteredRef = useRef(false);
  const hasMountedRef = useRef(false);
  const lastCenteredIndexRef = useRef(0);
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
  }, [isMobile, TOTAL_CARDS, scrollContainerRef]);

  // Mark component as mounted to skip initial title delay on subsequent swaps
  useEffect(() => {
    hasMountedRef.current = true;
  }, []);

  // mobile auto centering
  useAutoCenterOnMobile(isMobile, scrollContainerRef);

  // cards navigation helpers
  const nav = useCardsNavigation({
    isMobile,
    visibleCount,
    totalCards: TOTAL_CARDS,
    cardWidth: CARD_WIDTH,
    desktopGap: DESKTOP_GAP,
    mobileGap: MOBILE_GAP,
    scrollContainerRef,
  });
  const canGoNext = canScrollRight;
  const canGoPrev = canScrollLeft;
  const handleNext = nav.handleNext;
  const handlePrev = nav.handlePrev;

  // Center the first card on mobile after layout to align with snap-center and padding
  useEffect(() => {
    if (!isMobile) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    // Run once per mount/responsive recalculation
    if (hasAutoCenteredRef.current) return;
    hasAutoCenteredRef.current = true;

    // Use multiple frame delay and retry logic for smartphones
    const centerFirstCard = () => {
      const first = el.children.item(0) as HTMLElement | null;
      if (!first || first.offsetWidth === 0) {
        // Card not ready yet, retry
        return false;
      }
      const target =
        first.offsetLeft + first.clientWidth / 2 - el.clientWidth / 2;
      el.scrollTo({ left: Math.max(0, target), behavior: "auto" });
      return true;
    };

    // Try immediately
    if (centerFirstCard()) return;

    // If not ready, use progressive delays
    const timeouts: number[] = [];
    [50, 150, 300, 500].forEach((delay) => {
      timeouts.push(
        window.setTimeout(() => {
          if (centerFirstCard()) {
            // Clear remaining timeouts
            timeouts.forEach(clearTimeout);
          }
        }, delay)
      );
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isMobile, scrollContainerRef]);

  // Helpers to detect current centered index and scroll to target index
  const getCurrentCenteredIndex = nav.getCurrentCenteredIndex;
  const scrollToIndex = nav.scrollToIndex;
  const centerToIndex = nav.centerToIndex;

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
  }, [activeSet, TOTAL_CARDS, isMobile, containerWidth, scrollToIndex]);

  // nav already declared above

  const computeCardWidth = useMemo(() => {
    return () => {
      const GAP = isMobile ? MOBILE_GAP : DESKTOP_GAP;
      const innerWidth =
        containerWidth - (isMobile ? MOBILE_SIDE_PADDING * 2 : 0);
      const fullWidthSingle =
        visibleCount === 1 && innerWidth < CARD_WIDTH + GAP;
      const baseWidth = CARD_WIDTH;
      return fullWidthSingle
        ? innerWidth * (isMobile ? MOBILE_SINGLE_RATIO : 1) - MASK_MARGIN
        : visibleCount === 1
        ? Math.min(baseWidth, innerWidth) *
            (isMobile ? MOBILE_SINGLE_RATIO : 1) -
          MASK_MARGIN
        : baseWidth;
    };
  }, [isMobile, containerWidth, visibleCount]);

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
            isExiting={isExiting}
            className="!pt-2 !pb-2 text-center lg:text-left"
          />
          <motion.div variants={item} className="w-full lg:w-auto">
            <WhatTabs
              active={activeSet}
              onSelect={async (next) => {
                lastCenteredIndexRef.current = getCurrentCenteredIndex();
                // Start centering but don't block the dataset swap
                void centerToIndex(0);
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
              }`}
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
              <AnimatePresence mode="sync" initial={!hasMountedRef.current}>
                {(() => {
                  const cardWidth = computeCardWidth();
                  const baseDelayValue = hasMountedRef.current ? 0 : 0.7;
                  const disableStagger = hasMountedRef.current;
                  return [
                    <NewIdeaCard
                      key="new-idea"
                      index={0}
                      isMobile={isMobile}
                      cardWidth={cardWidth}
                      baseDelay={baseDelayValue}
                      disableStagger={disableStagger}
                    />,
                    ...cards.map((card: WorkCardData, index) => (
                      <WorkCard
                        key={`${activeSet}-${card.id}`}
                        card={card}
                        index={index + 1}
                        isMobile={isMobile}
                        cardWidth={cardWidth}
                        baseDelay={baseDelayValue}
                        disableStagger={disableStagger}
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
