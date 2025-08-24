"use client";

import { motion } from "motion/react";
import { word, wordLine } from "../Hello/variants";

export default function ConnectHeader() {
  const title = "Let's Talk";
  const wordsArr = title.split(" ");
  return (
    <div>
      <motion.h1
        variants={wordLine}
        initial="hidden"
        animate="show"
        className="text-center text-4xl md:text-5xl lg:text-6xl font-semibold text-white/95"
      >
        <span className="inline-flex select-none flex-wrap justify-center gap-x-[0.5ch] align-top">
          {wordsArr.map((w, wi) => (
            <span key={`connect-word-${wi}`} className="inline-block">
              {w.split("").map((ch, i, arr) => (
                <motion.span
                  key={`connect-letter-${wi}-${i}-${ch}`}
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

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="mt-3 text-center text-white/60 md:text-lg"
      >
        Have an idea worth building? Time to make it happen.
      </motion.p>
    </div>
  );
}
