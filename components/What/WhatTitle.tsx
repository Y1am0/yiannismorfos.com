"use client";
import { motion } from "motion/react";
import { word, wordLine } from "../Hello/variants";

interface WhatTitleProps {
  prefersReduced: boolean;
  isExiting: boolean;
  text?: string;
  className?: string;
}

export const WhatTitle = ({
  prefersReduced,
  isExiting,
  text = "Recent work",
  className = "",
}: WhatTitleProps) => {
  const wordsArr = text.split(" ");
  return (
    <motion.h1
      variants={wordLine}
      initial={prefersReduced ? false : "hidden"}
      animate={prefersReduced ? false : isExiting ? "exit" : "show"}
      className={`text-4xl md:text-5xl lg:text-6xl font-semibold text-white text-center pt-4 pb-6 lg:pb-8 ${className}`}
    >
      <span className="inline-flex flex-wrap justify-center gap-x-[0.5ch] align-top">
        {wordsArr.map((w, wi) => (
          <span key={`what-word-${wi}`} className="inline-block">
            {w.split("").map((ch, i, arr) => (
              <motion.span
                key={`what-letter-${wi}-${i}-${ch}`}
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
    </motion.h1>
  );
};
