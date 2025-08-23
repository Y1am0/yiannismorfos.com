"use client";

import { motion, type Variants } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";

interface AdaptiveBadgesProps {
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
  variants,
  className = "my-8",
  items = DEFAULT_BADGES,
  speedPxPerSecond = 32, // lower = slower
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLUListElement | null>(null);
  const [, setIsMarquee] = useState(false);

  useEffect(() => {
    const evaluate = () => {
      if (!containerRef.current || !contentRef.current) return;
      const cW = containerRef.current.clientWidth;
      const scrollW = contentRef.current.scrollWidth;
      setIsMarquee(scrollW > cW + 1); // +1 for sub-pixel tolerance
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
  }, []);

  const marquee = (
    <div className="relative w-full" aria-label="Technology badges carousel">
      <div className="overflow-hidden" ref={containerRef}>
        <Marquee
          gradient={false}
          speed={speedPxPerSecond}
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

  return (
    <motion.div variants={variants} className={className} ref={containerRef}>
      {marquee}
    </motion.div>
  );
};

export default AdaptiveBadges;
