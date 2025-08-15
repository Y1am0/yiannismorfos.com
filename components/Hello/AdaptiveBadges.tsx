"use client";

import { motion, type Variants } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";

interface AdaptiveBadgesProps {
  prefersReduced: boolean;
  // Framer Motion variants passed from parent for entrance sequencing
  variants?: Variants;
  className?: string;
  items?: string[];
  speedPxPerSecond?: number; // marquee speed control
}

// Default badges list (can be overridden via props)
const DEFAULT_BADGES = [
  "TypeScript",
  "React",
  "Next.js",
  "Motion",
  "Three.js",
  "Node",
  "Go",
  "Python",
  "SQL",
  "Figma",
  "Illustrator",
  "Premiere Pro",
  "After Effects",
];

/**
 * AdaptiveBadges
 * Renders badges in a single static row when they fit.
 * Automatically switches to an infinite horizontal marquee when content would overflow / wrap.
 * Honors reduced-motion preference: falls back to a horizontal scroll instead of animation.
 */
export const AdaptiveBadges: React.FC<AdaptiveBadgesProps> = ({
  prefersReduced,
  variants,
  className = "my-8",
  items = DEFAULT_BADGES,
  speedPxPerSecond = 32, // lower = slower
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLUListElement | null>(null);
  const [isMarquee, setIsMarquee] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      if (!containerRef.current || !contentRef.current) return;
      const cW = containerRef.current.clientWidth;
      const scrollW = contentRef.current.scrollWidth;
      // If badges would overflow => enable marquee (unless prefers reduced motion)
      setIsMarquee(!prefersReduced && scrollW > cW + 1); // +1 for sub-pixel tolerance
    };

    evaluate();

    const roContainer = new ResizeObserver(evaluate);
    const roContent = new ResizeObserver(evaluate);
    if (containerRef.current) roContainer.observe(containerRef.current);
    if (contentRef.current) roContent.observe(contentRef.current);

    window.addEventListener("orientationchange", evaluate);
    window.addEventListener("resize", evaluate);
    return () => {
      roContainer.disconnect();
      roContent.disconnect();
      window.removeEventListener("orientationchange", evaluate);
      window.removeEventListener("resize", evaluate);
    };
  }, [prefersReduced]);

  // Static (non-marquee) rendering with per-item entrance animation
  const staticList = (
    <motion.ul
      ref={contentRef}
      className="flex flex-nowrap gap-2.5 justify-center md:justify-start"
    >
      {items.map((tech, i) => (
        <motion.li
          key={tech}
          initial={
            prefersReduced ? false : { opacity: 0, y: 12, filter: "blur(4px)" }
          }
          animate={
            prefersReduced ? false : { opacity: 1, y: 0, filter: "blur(0px)" }
          }
          transition={{
            delay: 0.5 + i * 0.04,
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="px-3 py-1 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-[11px] md:text-xs tracking-wide uppercase text-white/70 hover:text-white hover:border-white/30 transition-colors whitespace-nowrap"
        >
          {tech}
        </motion.li>
      ))}
    </motion.ul>
  );

  // Marquee rendering using react-fast-marquee for smoother, battle-tested behavior
  const marquee = (
    <div className="relative w-full" aria-label="Technology badges carousel">
      <div className="overflow-hidden" ref={containerRef}>
        <Marquee
          gradient={false}
          speed={speedPxPerSecond} // maps reasonably; user can tune prop name later
          pauseOnHover
          aria-label="Technology badges carousel marquee"
          className="[--gap:10px]"
        >
          <ul className="flex flex-nowrap gap-2.5 mr-10" aria-hidden={false}>
            {items.map((tech) => (
              <li
                key={`marquee-lib-1-${tech}`}
                className="px-3 py-1 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-[11px] md:text-xs tracking-wide uppercase text-white/70 whitespace-nowrap"
              >
                {tech}
              </li>
            ))}
          </ul>
          {/* Duplicate sequence not required; library handles looping, but we add slight visual variety by a subtle opacity shift */}
          <ul className="flex flex-nowrap gap-2.5 mr-10" aria-hidden="true">
            {items.map((tech) => (
              <li
                key={`marquee-lib-2-${tech}`}
                className="px-3 py-1 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-[11px] md:text-xs tracking-wide uppercase text-white/60 whitespace-nowrap"
              >
                {tech}
              </li>
            ))}
          </ul>
        </Marquee>
      </div>
      {/* Edge fade masks */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#0a0a0a] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#0a0a0a] to-transparent" />
    </div>
  );

  // When reduced motion is preferred and overflow happens, allow manual horizontal scroll instead of marquee.
  const reducedOverflow = (
    <div ref={containerRef} className="overflow-x-auto no-scrollbar">
      <ul
        ref={contentRef}
        className="flex flex-nowrap gap-2.5 pr-4"
        aria-label="Technology badges list (horizontal scroll)"
      >
        {items.map((tech) => (
          <li
            key={`reduced-${tech}`}
            className="px-3 py-1 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-[11px] md:text-xs tracking-wide uppercase text-white/70 whitespace-nowrap"
          >
            {tech}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <motion.div variants={variants} className={className} ref={containerRef}>
      {isMarquee ? marquee : prefersReduced ? reducedOverflow : staticList}
    </motion.div>
  );
};

export default AdaptiveBadges;
