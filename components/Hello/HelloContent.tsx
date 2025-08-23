"use client";

import { motion } from "motion/react";
import { Bodoni_Moda } from "next/font/google";
import { Fragment } from "react";
// Extracted shared variants
import { fastLine, fastWord, item, word, wordLine } from "./variants";
// Extracted framed image component
import { FramedImage } from "./FramedImage";
// Reusable scrollable container
import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { ScrollablePageContainer } from "../ScrollablePageContainer";
import { SkillsBadges } from "./SkillsBadges";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const HelloContent = () => {
  const isExiting = useRouteTransitionStore((s) => s.isExiting);

  return (
    <ScrollablePageContainer>
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10 min-h-0 pt-8">
        {/* meraki Feature - Mobile only (above image) */}
        <motion.div variants={item} className="mb-6 md:hidden">
          <motion.h1
            variants={wordLine}
            className={`${bodoni.className} font-semibold tracking-tight text-5xl md:text-6xl lg:text-7xl text-white/95 leading-[0.9] inline-block select-none`}
          >
            {/* Animate each letter for a richer effect */}
            {"meraki".split("").map((ch, i, arr) => (
              <motion.span
                key={`m-letter-mobile-${i}-${ch}`}
                variants={word}
                className={`${
                  i < arr.length - 1 ? "mr-[0.02ch]" : ""
                } inline-block`}
              >
                {ch}
              </motion.span>
            ))}
          </motion.h1>
          <motion.div
            variants={item}
            className="mt-3 text-sm md:text-base text-white/60 font-light space-y-1"
          >
            <p>
              <span className="text-white/70 italic mr-2">[meh-RAH-kee]</span>
              <span className="text-white/50">/ Greek: μεράκι /</span>
            </p>
            <p>
              (n.) Doing something with soul, creativity, love; leaving a piece
              of yourself in the work.
            </p>
          </motion.div>
        </motion.div>

        {/* IMAGE PANEL */}
        <motion.div
          variants={item}
          className="relative select-none md:sticky md:top-8 md:self-start shrink-0"
        >
          <FramedImage prefersReduced={false} isExiting={isExiting} />
        </motion.div>

        {/* TEXT PANEL */}
        <motion.div
          variants={item}
          className="text-center md:text-left w-full md:flex-1 md:min-w-0 md:max-w-none"
        >
          {/* meraki Feature - Desktop only */}
          <motion.div variants={item} className="mb-6 hidden md:block">
            <motion.h1
              variants={wordLine}
              className={`${bodoni.className} font-semibold tracking-tight text-5xl md:text-6xl lg:text-7xl text-white/95 leading-[0.9] inline-block select-none`}
            >
              {/* Animate each letter for a richer effect */}
              {"meraki".split("").map((ch, i, arr) => (
                <motion.span
                  key={`m-letter-desktop-${i}-${ch}`}
                  variants={word}
                  className={`${
                    i < arr.length - 1 ? "mr-[0.02ch]" : ""
                  } inline-block`}
                >
                  {ch}
                </motion.span>
              ))}
            </motion.h1>
            <motion.div
              variants={item}
              className="mt-3 text-sm md:text-base text-white/60 font-light space-y-1"
            >
              <p>
                <span className="text-white/70 italic mr-2">[meh-RAH-kee]</span>
                <span className="text-white/50">/ Greek: μεράκι /</span>
              </p>
              <p>
                (n.) Doing something with soul, creativity, love; leaving a
                piece of yourself in the work.
              </p>
            </motion.div>
          </motion.div>

          {/* Paragraph */}
          <motion.div
            variants={fastLine}
            className="text-white/80 text-base leading-relaxed text-justify"
          >
            <motion.div
              className="block"
              variants={{ show: { transition: { staggerChildren: 0.012 } } }}
            >
              {`Meraki. That's the bar. Whether I'm engineering your next high-value project, designing fluid animations that feel almost tactile, or educating over 100,000 curious minds through video, everything receives my obsessive attention to craft. I'm Yiannis, and I work on the principle that beautiful design and powerful technology are inseparable. I don't take shortcuts. I deliver polished solutions that perform and are built to endure.`
                .split(" ")
                .map((w, i, arr) => (
                  <Fragment key={`para-word-${i}-${w}`}>
                    <motion.span variants={fastWord}>
                      {w}
                      {i < arr.length - 1 && " "}
                    </motion.span>
                    {w.endsWith("craft.") && <div className="w-full h-4" />}
                  </Fragment>
                ))}
            </motion.div>
          </motion.div>

          {/* Skills Carousel */}
          <SkillsBadges variants={item} />
        </motion.div>
      </div>
    </ScrollablePageContainer>
  );
};

export default HelloContent;
