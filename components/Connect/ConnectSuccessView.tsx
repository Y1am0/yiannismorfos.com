"use client";

import { RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { word, wordLineFaster } from "../Hello/variants";

interface ConnectSuccessViewProps {
  onReset: () => void;
}

export default function ConnectSuccessView({
  onReset,
}: ConnectSuccessViewProps) {
  const bigLine = "This is the start of something great!";
  const wordsArr = bigLine.split(" ");

  const contentVariants = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: { delayChildren: 0.15, staggerChildren: 0.06 },
    },
  } as const;

  const childIn = {
    hidden: { opacity: 0, y: 8, filter: "blur(6px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  } as const;

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
      exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mt-10"
    >
      <div className="relative p-6 md:p-8 text-center overflow-hidden">
        <motion.div variants={contentVariants} initial="hidden" animate="show">
          {/* Check badge container enters with childIn */}
          <motion.div variants={childIn} className="mx-auto mb-4">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/90">
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                <path
                  d="M20 6L9 17l-5-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </motion.div>

          <div className="space-y-3 md:space-y-4">
            <motion.p
              variants={childIn}
              className="text-base md:text-lg font-medium text-white/90"
            >
              Your message has been sent.
            </motion.p>

            <motion.h2
              variants={wordLineFaster}
              className="text-xl md:text-3xl font-semibold text-white select-none"
            >
              <span className="inline-flex select-none flex-wrap justify-center gap-x-[0.5ch] align-top">
                {wordsArr.map((w, wi) => (
                  <span key={`succ-word-${wi}`} className="inline-block">
                    {w.split("").map((ch, i, arr) => (
                      <motion.span
                        key={`succ-letter-${wi}-${i}-${ch}`}
                        variants={word}
                        className={`${
                          i < arr.length - 1 ? "mr-[0.04ch]" : ""
                        } inline-block`}
                      >
                        {ch}
                      </motion.span>
                    ))}
                  </span>
                ))}
              </span>
            </motion.h2>

            <motion.p variants={childIn} className="text-white/70">
              I will get back to you as soon as possible.
            </motion.p>
          </div>

          <motion.div variants={childIn} className="mt-6">
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-5 py-3 text-white/90 hover:border-white/30 hover:bg-white/12 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              Send another
            </button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
