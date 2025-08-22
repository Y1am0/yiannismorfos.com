"use client";

import { DelayedLink } from "@/components/DelayedLink";
import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { motion } from "motion/react";
import Image from "next/image";
import { WorkCardData } from "./types";

interface WorkCardProps {
  card: WorkCardData;
  index: number;
  isMobile: boolean;
  cardWidth: number;
  onClick?: (id: string) => void; // now optional (no expansion currently)
  baseDelay?: number; // delay before starting stagger (e.g., wait for title)
}

export const WorkCard = ({
  card,
  index,
  isMobile,
  cardWidth,
  onClick,
  baseDelay = 0,
}: WorkCardProps) => {
  const stagger = 0.1;
  const startDelay = baseDelay + index * stagger;
  const startExit = useRouteTransitionStore((s) => s.startExit);
  return (
    <motion.div
      key={card.id}
      layout="position"
      initial={{ opacity: 0, y: -28, filter: "blur(14px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
      transition={{
        opacity: {
          duration: 0.45,
          delay: startDelay,
          ease: [0.22, 1, 0.36, 1],
        },
        y: { duration: 0.5, delay: startDelay, ease: [0.22, 1, 0.36, 1] },
        filter: { duration: 0.45, delay: startDelay, ease: [0.22, 1, 0.36, 1] },
      }}
      className={`group relative overflow-hidden flex-shrink-0 border border-white/50 transition-colors duration-300 ease-[0.22,1,0.36,1] hover:border-white/90 ${
        isMobile ? "h-60 snap-center" : "h-64"
      }`}
      style={{
        width: cardWidth,
        minWidth: cardWidth,
      }}
    >
      <div className="absolute inset-0 origin-center transition-transform duration-500 ease-[0.22,1,0.36,1] group-hover:scale-[0.94] will-change-transform">
        <Image
          src={card.image}
          alt={card.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 280px, 280px"
          priority={index < 2}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 to-black/65" />
      </div>
      <div className="absolute inset-0 p-6 flex flex-col justify-end pointer-events-none">
        <motion.div
          key="collapsed"
          initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{
            duration: 0.36,
            delay: startDelay + 0.05,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-white"
        >
          <h3 className="text-xl md:text-2xl font-semibold mb-2">
            {card.title}
          </h3>
          <p className="text-white/80 text-sm md:text-base">{card.short}</p>
        </motion.div>
      </div>
      <DelayedLink
        href={`/what/${card.id}`}
        beforeNavigate={startExit}
        aria-label={card.title}
        className="absolute inset-0 cursor-pointer focus:outline-none"
        onClick={() => onClick?.(card.id)}
      >
        <span className="sr-only">View {card.title}</span>
      </DelayedLink>
    </motion.div>
  );
};
