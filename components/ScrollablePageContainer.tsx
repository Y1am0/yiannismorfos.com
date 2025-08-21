"use client";

import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { motion, Variants } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface ScrollablePageContainerProps {
  children: React.ReactNode;
  className?: string;
  variants?: { container?: Variants };
  maskGradient?: string; // radial or other overall page mask
  showScrollIndicator?: boolean; // progress bar
  verticalFade?: boolean; // enable vertical top/bottom fade mask inside scroll area
  deferTopFadeUntilScrolled?: boolean; // only reveal top fade after user scrolls
  fadeSize?: string; // size of fade region (e.g. '10%')
  centerWhenNotScrollable?: boolean; // center content vertically when it fits
}

const defaultContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18 } },
  exit: {
    opacity: 0,
    filter: "blur(24px)",
    transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
  },
};

const defaultMaskGradient =
  "radial-gradient(120% 160% at 50% 40%, #000 60%, transparent 100%)";

export const ScrollablePageContainer = ({
  children,
  className = "",
  variants,
  maskGradient = defaultMaskGradient,
  showScrollIndicator = true,
  verticalFade = true,
  deferTopFadeUntilScrolled = true,
  fadeSize = "10%",
  centerWhenNotScrollable = true,
}: ScrollablePageContainerProps) => {
  const prefersReduced = usePrefersReducedMotion();
  const isExiting = useRouteTransitionStore((s) => s.isExiting);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [segment, setSegment] = useState({ left: 0, width: 100 });
  const [isScrolling, setIsScrolling] = useState(false);
  const inactivityTimerRef = useRef<number | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  // Update progress + scroll states
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let frame: number | null = null;

    const hideLater = () => {
      if (inactivityTimerRef.current)
        window.clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = window.setTimeout(
        () => setIsScrolling(false),
        650
      );
    };

    const update = () => {
      frame = null;
      const { scrollHeight, clientHeight, scrollTop } = el;
      const canScroll = scrollHeight > clientHeight + 1;
      setIsScrollable(canScroll);
      setHasScrolled(scrollTop > 8);
      if (!canScroll) {
        setSegment({ left: 0, width: 100 });
        setIsScrolling(false);
        setHasScrolled(false);
        return;
      }
      const visibleRatio = clientHeight / scrollHeight;
      const topRatio = scrollTop / (scrollHeight - clientHeight);
      setSegment({
        left: topRatio * (100 - visibleRatio * 100),
        width: visibleRatio * 100,
      });
    };

    const onScroll = () => {
      if (!isScrolling) setIsScrolling(true);
      hideLater();
      if (frame != null) return;
      frame = window.requestAnimationFrame(update);
    };
    const onResize = () => {
      if (frame != null) return;
      frame = window.requestAnimationFrame(update);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    update();
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (frame != null) cancelAnimationFrame(frame);
      if (inactivityTimerRef.current)
        window.clearTimeout(inactivityTimerRef.current);
    };
  }, [showScrollIndicator, isScrolling]);

  const containerVariants = variants?.container ?? defaultContainer;

  // Build vertical fade gradient (applied only when scrollable & enabled)
  const verticalMask = (() => {
    if (!verticalFade) return undefined;
    if (!isScrollable) return undefined; // no need to fade if content fits
    const topFadeActive = !deferTopFadeUntilScrolled || hasScrolled;
    if (topFadeActive) {
      return `linear-gradient(to bottom, rgba(0,0,0,0) 0%, #000 ${fadeSize}, #000 calc(100% - ${fadeSize}), rgba(0,0,0,0) 100%)`;
    }
    // Top fully opaque until user scrolls => only bottom fade visible
    return `linear-gradient(to bottom, #000 ${fadeSize}, #000 calc(100% - ${fadeSize}), rgba(0,0,0,0) 100%)`;
  })();

  return (
    <motion.div
      className={`relative w-full h-full min-h-0 flex flex-col overflow-hidden ${className}`}
      variants={containerVariants}
      initial={prefersReduced ? false : "hidden"}
      animate={prefersReduced ? false : isExiting ? "exit" : "show"}
      style={{ WebkitMaskImage: maskGradient, maskImage: maskGradient }}
    >
      {/* Sticky top custom horizontal scroll indicator */}
      {showScrollIndicator && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 right-0 z-20"
          initial={false}
          animate={{ opacity: isScrolling ? 1 : 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="relative w-full h-px">
            <div className="absolute inset-0 bg-white/60" />
            <motion.div
              className="absolute top-0 h-px bg-white"
              style={{ left: `${segment.left}%`, width: `${segment.width}%` }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 34,
                mass: 0.4,
              }}
            />
          </div>
        </motion.div>
      )}
      {/* Scrollable content (centers vertically only when NOT scrollable) */}
      <div
        ref={scrollRef}
        className={`scrollable-content scrollable-area overflow-y-auto scrollbar-hide h-full flex flex-col ${
          centerWhenNotScrollable && !isScrollable
            ? "justify-center"
            : "justify-start"
        }`}
        style={{
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain",
          touchAction: "pan-y",
          ...(verticalMask
            ? { WebkitMaskImage: verticalMask, maskImage: verticalMask }
            : {}),
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

export default ScrollablePageContainer;
