"use client";

import { DelayedLink } from "@/components/DelayedLink";
import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { motion } from "motion/react";

export const HomeHero = () => {
  const prefersReduced = usePrefersReducedMotion();
  const isExiting = useRouteTransitionStore((s) => s.isExiting);
  const startExit = useRouteTransitionStore((s) => s.startExit);

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.25, // clearer but faster line stagger
        delayChildren: 0, // no initial pause
      },
    },
    // Keep container exit simple so children control motion
    exit: {
      opacity: 0,
      filter: "blur(24px)",
      transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
    },
  } as const;

  const line = {
    hidden: { opacity: 0, y: 16 }, // remove blur from line wrapper
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        delayChildren: 0.08, // words start shortly after line begins
      },
    },
    // Prevent fallback to hidden on exit; keep y at 0
    exit: {
      opacity: 0,
      y: 0,
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
    },
  } as const;

  // Nested word-level animation with blur
  const wordParent = {
    hidden: {},
    show: { transition: { staggerChildren: 0.035 } },
    // Reverse-stagger out so the last words leave first; delegates y to words
    exit: { transition: { staggerChildren: 0.02, staggerDirection: -1 } },
  } as const;

  const word = {
    hidden: { opacity: 0, y: "0.5em", filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
    // Keep y at 0 on exit to avoid downward movement; fade and blur instead
    exit: {
      opacity: 0,
      y: 0,
      filter: "blur(8px)",
      transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
    },
  } as const;

  const line1Tokens = [
    { text: "Crafting", dim: true },
    { text: "web", dim: false },
    { text: "experiences", dim: false },
    { text: "is", dim: true },
    { text: "like", dim: true },
    { text: "storytelling", dim: false },
  ];

  const line2Tokens = [
    { text: "Lucky", dim: true },
    { text: "you,", dim: true },
    { text: "I'm", dim: true },
    { text: "good", dim: true },
    { text: "at", dim: true },
    { text: "both", dim: false },
  ];

  return (
    <motion.div
      className="w-full h-full flex items-center justify-center px-10 lg:px-18"
      variants={container}
      initial={prefersReduced ? false : "hidden"}
      animate={prefersReduced ? false : isExiting ? "exit" : "show"}
      // Subtle vignette mask to blend edges with the mesh background
      style={{
        WebkitMaskImage:
          "radial-gradient(120% 160% at 50% 40%, #000 60%, transparent 100%)",
        maskImage:
          "radial-gradient(120% 160% at 50% 40%, #000 60%, transparent 100%)",
      }}
    >
      <div className="max-w-5xl text-center leading-[1.05] tracking-tight">
        {/* Line 1 */}
        <motion.div className="overflow-hidden py-2" variants={line}>
          <motion.p
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white text-balance"
            variants={wordParent}
          >
            {line1Tokens.map((tok, i) => (
              <motion.span
                key={`l1-${tok.text}-${i}`}
                variants={word}
                className={`${
                  tok.dim ? "text-white/70" : "text-white"
                } inline-block ${
                  i !== line1Tokens.length - 1 ? "mr-[0.35ch]" : ""
                }`}
              >
                {tok.text}
              </motion.span>
            ))}
          </motion.p>
        </motion.div>

        {/* Line 2 */}
        <motion.div className="overflow-hidden py-2" variants={line}>
          <motion.p
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white/90 text-balance"
            variants={wordParent}
          >
            {line2Tokens.map((tok, i) => (
              <motion.span
                key={`l2-${tok.text}-${i}`}
                variants={word}
                className={`${
                  tok.dim ? "text-white/80" : "text-white"
                } inline-block ${
                  i !== line2Tokens.length - 1 ? "mr-[0.35ch]" : ""
                }`}
              >
                {tok.text}
              </motion.span>
            ))}
          </motion.p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-5"
          variants={line}
        >
          <DelayedLink
            href="/hello"
            beforeNavigate={startExit}
            className="relative inline-block text-white font-light md:text-lg lg:text-xl after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[1px] after:w-0 after:bg-current after:transition-[width] after:duration-300 after:ease-out hover:after:w-full focus-visible:after:w-full"
            aria-label="Learn more about me"
          >
            Learn more
          </DelayedLink>
          <DelayedLink
            href="/connect"
            beforeNavigate={startExit}
            className="relative inline-block text-white font-medium md:text-lg lg:text-xl after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[1px] after:w-0 after:bg-current after:transition-[width] after:duration-300 after:ease-out hover:after:w-full focus-visible:after:w-full"
            aria-label="Start a project—let's build something amazing"
          >
            Let&apos;s work together
          </DelayedLink>
        </motion.div>
      </div>
    </motion.div>
  );
};
