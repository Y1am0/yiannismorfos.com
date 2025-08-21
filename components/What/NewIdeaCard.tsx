"use client";

import { DelayedLink } from "@/components/DelayedLink";
import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { motion } from "motion/react";

interface NewIdeaCardProps {
  index: number;
  isMobile: boolean;
  cardWidth: number;
  baseDelay?: number;
}

export const NewIdeaCard = ({
  index,
  isMobile,
  cardWidth,
  baseDelay = 0,
}: NewIdeaCardProps) => {
  const stagger = 0.16;
  const startDelay = baseDelay + index * stagger;
  const startExit = useRouteTransitionStore((s) => s.startExit);

  return (
    <motion.div
      key="new-idea"
      layout="position"
      initial={{ opacity: 0, y: -28, filter: "blur(14px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
      transition={{
        opacity: { duration: 0.6, delay: startDelay, ease: [0.22, 1, 0.36, 1] },
        y: { duration: 0.65, delay: startDelay, ease: [0.22, 1, 0.36, 1] },
        filter: { duration: 0.6, delay: startDelay, ease: [0.22, 1, 0.36, 1] },
      }}
      className={`group relative overflow-hidden flex-shrink-0 border border-dashed border-white/60 ${
        isMobile ? "h-60 snap-center" : "h-64"
      }`}
      style={{ width: cardWidth, minWidth: cardWidth }}
    >
      {/* Background layer scales on hover; border remains unchanged */}
      <div
        className="absolute inset-0 origin-center bg-white/5 transition-all duration-500 ease-[0.22,1,0.36,1] group-hover:scale-[0.94] group-hover:bg-white/10 will-change-transform"
        aria-hidden
      />

      {/* Full-card delayed link; keeps underline animation on inner text */}
      <DelayedLink
        href="/connect"
        beforeNavigate={startExit}
        aria-label="Start a project—let's build something amazing"
        className="group/link absolute inset-0 p-6 flex flex-col justify-end text-left focus:outline-none"
      >
        <h3 className="text-xl md:text-2xl font-semibold text-white mb-2">
          Your next big idea goes here
        </h3>
        <span className="text-white font-medium md:text-base relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[1px] after:w-0 after:bg-current after:transition-[width] after:duration-300 after:ease-out group-hover/link:after:w-full focus-visible:after:w-full">
          Let’s work together
        </span>
      </DelayedLink>
    </motion.div>
  );
};

export default NewIdeaCard;
