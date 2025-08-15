import { Variants } from "motion/react";

// Shared animation variants used by Hello section components.
// Keeping them centralized avoids duplication and ensures consistency if timing tweaks are needed later.

export const item: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 0,
    filter: "blur(10px)",
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

export const wordLine: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
      delayChildren: 0.08,
      staggerChildren: 0.035,
    },
  },
  exit: {
    opacity: 0,
    y: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
  },
};

export const word: Variants = {
  hidden: { opacity: 0, y: "0.5em", filter: "blur(8px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 0,
    filter: "blur(8px)",
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
};

export const fastLine: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: 0.02,
      staggerChildren: 0.012,
    },
  },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const fastWord: Variants = {
  hidden: { opacity: 0, y: "0.35em", filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 0,
    filter: "blur(6px)",
    transition: { duration: 0.15 },
  },
};
