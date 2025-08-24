"use client";

import { AnimatePresence } from "motion/react";
import React from "react";

interface CardsTrackProps {
  isMobile: boolean;
  maskVars: React.CSSProperties;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
  initial?: boolean;
}

export function CardsTrack({
  isMobile,
  maskVars,
  scrollContainerRef,
  children,
  initial = false,
}: CardsTrackProps) {
  return (
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
        <AnimatePresence mode="sync" initial={initial}>
          {children}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CardsTrack;
