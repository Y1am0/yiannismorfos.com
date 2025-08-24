"use client";
import { motion } from "motion/react";
import { Arrow } from "./Arrow";

interface SliderArrowsProps {
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  isMobile: boolean;
}

export const SliderArrows = ({
  canPrev,
  canNext,
  isMobile,
  onPrev,
  onNext,
}: SliderArrowsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className={`flex px-4 gap-3 ${
        isMobile ? "justify-center" : "justify-end"
      }`}
    >
      <motion.button
        onClick={onPrev}
        disabled={!canPrev}
        whileHover={canPrev ? { scale: 1.05 } : {}}
        whileTap={canPrev ? { scale: 0.95 } : {}}
        className={`px-6 py-3 rounded-full transition-all duration-300 ${
          canPrev
            ? "text-white cursor-pointer hover:bg-white/10"
            : "text-white/30 cursor-not-allowed"
        }`}
        aria-label="Previous project"
      >
        <Arrow direction="left" disabled={!canPrev} />
      </motion.button>
      <motion.button
        onClick={onNext}
        disabled={!canNext}
        whileHover={canNext ? { scale: 1.05 } : {}}
        whileTap={canNext ? { scale: 0.95 } : {}}
        className={`px-6 py-3 rounded-full transition-all duration-300 ${
          canNext
            ? "text-white cursor-pointer hover:bg-white/10"
            : "text-white/30 cursor-not-allowed"
        }`}
        aria-label="Next project"
      >
        <Arrow direction="right" disabled={!canNext} />
      </motion.button>
    </motion.div>
  );
};
