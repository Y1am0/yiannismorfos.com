"use client";

import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ScrollablePageContainer } from "../ScrollablePageContainer";
import { WORK_CARDS } from "./data";
import { NewIdeaCard } from "./NewIdeaCard";
import { SliderArrows } from "./SliderArrows";
import { WorkCardData } from "./types";
import { WhatTitle } from "./WhatTitle";
import { WorkCard } from "./WorkCard";

export const WhatContent = () => {
  const prefersReduced = usePrefersReducedMotion();
  const isExiting = useRouteTransitionStore((s) => s.isExiting);
  const [isMobile, setIsMobile] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [visibleCount, setVisibleCount] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const CARD_WIDTH = 280;
  const DESKTOP_GAP = 24;
  const MOBILE_GAP = 16; // matches Tailwind gap-4
  const MOBILE_SIDE_PADDING = 16; // px-4 on mobile track
  const MASK_MARGIN = 8; // reduce width slightly so mask doesn't cover edges
  const MOBILE_SINGLE_RATIO = 0.9; // narrow single card to 85% of inner width
  const TOTAL_CARDS = WORK_CARDS.length + 1; // include NewIdeaCard

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
    const GAP = isMobile ? MOBILE_GAP : DESKTOP_GAP;
    let amount: number;
    if (visibleCount === 1) {
      const innerWidth =
        containerWidth - (isMobile ? MOBILE_SIDE_PADDING * 2 : 0);
      const fullWidthSingle = innerWidth < CARD_WIDTH + GAP;
      const rawWidth = fullWidthSingle
        ? innerWidth * (isMobile ? MOBILE_SINGLE_RATIO : 1)
        : Math.min(CARD_WIDTH, innerWidth);
      const cardWidth = rawWidth - MASK_MARGIN;
      amount = cardWidth + GAP;
    } else {
      const move = Math.min(visibleCount, TOTAL_CARDS - 1);
      amount = move * (CARD_WIDTH + GAP);
    }
    el.scrollBy({ left: amount, behavior: "smooth" });
  };
  const handlePrev = () => {
    if (!canGoPrev || !scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const GAP = isMobile ? MOBILE_GAP : DESKTOP_GAP;
    let amount: number;
    if (visibleCount === 1) {
      const innerWidth =
        containerWidth - (isMobile ? MOBILE_SIDE_PADDING * 2 : 0);
      const fullWidthSingle = innerWidth < CARD_WIDTH + GAP;
      const rawWidth = fullWidthSingle
        ? innerWidth * (isMobile ? MOBILE_SINGLE_RATIO : 1)
        : Math.min(CARD_WIDTH, innerWidth);
      const cardWidth = rawWidth - MASK_MARGIN;
      amount = cardWidth + GAP;
    } else {
      const move = Math.min(visibleCount, TOTAL_CARDS - 1);
      amount = move * (CARD_WIDTH + GAP);
    }
    el.scrollBy({ left: -amount, behavior: "smooth" });
  };

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
        <WhatTitle prefersReduced={prefersReduced} isExiting={isExiting} />
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
              <AnimatePresence mode="popLayout">
                {(() => {
                  const cardWidth = computeCardWidth();
                  return [
                    <NewIdeaCard
                      key="new-idea"
                      index={0}
                      isMobile={isMobile}
                      cardWidth={cardWidth}
                      baseDelay={0.7}
                    />,
                    ...WORK_CARDS.map((card: WorkCardData, index) => (
                      <WorkCard
                        key={card.id}
                        card={card}
                        index={index + 1}
                        isMobile={isMobile}
                        cardWidth={cardWidth}
                        baseDelay={0.7}
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
