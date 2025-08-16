"use client";

import { motion } from "motion/react";

export const ThinkingDots = () => {
  return (
    <span className="inline-flex items-center gap-0.5">
      Thinking
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut",
          }}
          className="inline-block"
        >
          .
        </motion.span>
      ))}
    </span>
  );
};
