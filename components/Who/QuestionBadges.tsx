"use client";

import { motion, type Variants } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";

interface QuestionBadgesProps {
  variants?: Variants;
  className?: string;
  questions?: string[];
  speedPxPerSecond?: number;
  onQuestionClick?: (question: string) => void;
  appearDelayMs?: number; // delay before showing (for sync with initial hero animation)
}

// Default questions list
const DEFAULT_QUESTIONS = [
  "I have an app idea. Can Yiannis build it?",
  "I need a website for my business.",
  "I would like to create sponsored video content with Yiannis.",
];

/**
 * QuestionBadges
 * Similar to AdaptiveBadges but for clickable questions.
 * Renders questions in a single static row when they fit.
 * Automatically switches to an infinite horizontal marquee when content would overflow.
 */
export const QuestionBadges: React.FC<QuestionBadgesProps> = ({
  variants,
  className = "my-6",
  questions = DEFAULT_QUESTIONS,
  speedPxPerSecond = 28,
  onQuestionClick,
  appearDelayMs = 220, // earlier so it feels part of main reveal
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLUListElement | null>(null);
  const [isMarquee, setIsMarquee] = useState(false);
  const [show, setShow] = useState(false); // start hidden unless reduced motion
  const questionsKey = questions.join("|");

  // Orchestrate delayed reveal (on first mount and on remount after reset)
  useEffect(() => {
    // only trigger if not already shown
    if (!show) {
      const t = window.setTimeout(() => setShow(true), appearDelayMs);
      return () => window.clearTimeout(t);
    }
  }, [appearDelayMs, questionsKey, show]);

  useEffect(() => {
    const evaluate = () => {
      if (!containerRef.current || !contentRef.current) return;
      const cW = containerRef.current.clientWidth;
      const scrollW = contentRef.current.scrollWidth;
      setIsMarquee(scrollW > cW + 1);
    };

    // Only evaluate once content is rendered (after show)
    if (show) {
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
    }
  }, [show]);

  // Marquee rendering
  const marquee = (
    <div className="relative w-full" aria-label="Question suggestions carousel">
      <div
        className="overflow-hidden"
        ref={containerRef}
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, rgba(0,0,0,0) 0%, #000 10%, #000 90%, rgba(0,0,0,0) 100%)",
          maskImage:
            "linear-gradient(to right, rgba(0,0,0,0) 0%, #000 10%, #000 90%, rgba(0,0,0,0) 100%)",
        }}
      >
        <Marquee
          gradient={false}
          speed={speedPxPerSecond}
          pauseOnHover
          aria-label="Question suggestions carousel marquee"
          className="[--gap:12px]"
        >
          <ul className="flex flex-nowrap gap-3" aria-hidden={false}>
            {questions.map((question, index) => (
              <li
                key={`marquee-q-1-${question}`}
                className={index === questions.length - 1 ? "mr-3" : ""}
              >
                <button
                  onClick={() => onQuestionClick?.(question)}
                  className="px-4 py-2 rounded-full border border-white/20 bg-white/8 backdrop-blur-sm text-xs md:text-sm text-white/75 hover:text-white hover:border-white/40 hover:bg-white/12 transition-all duration-300 whitespace-nowrap cursor-pointer"
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
          <ul className="flex flex-nowrap gap-3" aria-hidden="true">
            {questions.map((question, index) => (
              <li
                key={`marquee-q-2-${question}`}
                className={index === questions.length - 1 ? "mr-3" : ""}
              >
                <button
                  onClick={() => onQuestionClick?.(question)}
                  className="px-4 py-2 rounded-full border border-white/15 bg-white/6 backdrop-blur-sm text-xs md:text-sm text-white/65 hover:text-white hover:border-white/40 hover:bg-white/12 transition-all duration-300 whitespace-nowrap cursor-pointer"
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
        </Marquee>
      </div>
    </div>
  );

  // When reduced motion is preferred and overflow happens, allow manual horizontal scroll instead of marquee.
  const reducedOverflow = (
    <div ref={containerRef} className="overflow-x-auto scrollbar-hide">
      <ul
        ref={contentRef}
        className="flex flex-nowrap gap-3 pr-4"
        aria-label="Question suggestions list (horizontal scroll)"
      >
        {questions.map((question) => (
          <li key={`reduced-${question}`}>
            <button
              onClick={() => onQuestionClick?.(question)}
              className="px-4 py-2 rounded-full border border-white/20 bg-white/8 backdrop-blur-sm text-xs md:text-sm text-white/75 hover:text-white hover:border-white/40 hover:bg-white/12 transition-all duration-300 whitespace-nowrap cursor-pointer"
            >
              {question}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <motion.div variants={variants} className={className} ref={containerRef}>
      <motion.div
        initial={{ opacity: 0, y: 6, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={!show ? { pointerEvents: "none" } : undefined}
      >
        {isMarquee ? marquee : reducedOverflow}
      </motion.div>
    </motion.div>
  );
};

export default QuestionBadges;
