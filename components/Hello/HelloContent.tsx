"use client";

import { motion } from "motion/react";
import { Bodoni_Moda } from "next/font/google";
// Extracted shared variants
import { fastLine, fastWord, item, word, wordLine } from "./variants";
// Extracted framed image component
import { FramedImage } from "./FramedImage";
// Reusable scrollable container
import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { ScrollablePageContainer } from "../ScrollablePageContainer";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const HelloContent = () => {
  const prefersReduced = usePrefersReducedMotion();
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
          <FramedImage prefersReduced={prefersReduced} isExiting={isExiting} />
        </motion.div>

        {/* TEXT PANEL */}
        <motion.div
          variants={item}
          className="text-center md:text-left max-w-xl"
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
            <motion.p
              className="block"
              variants={{ show: { transition: { staggerChildren: 0.012 } } }}
            >
              {`Meraki. That's the bar. Whether I'm engineering your next high-value project, designing fluid animations that feel almost tactile, or educating over 100,000 curious minds through video, everything receives my obsessive craft. I'm Yiannis, and I work from the principle that beautiful design and powerful technology are inseparable. I don't take shortcuts; I deliver polished solutions that perform and are built to endure.`
                .split(" ")
                .map((w, i, arr) => (
                  <motion.span key={`para-word-${i}-${w}`} variants={fastWord}>
                    {w}
                    {i < arr.length - 1 && " "}
                  </motion.span>
                ))}
            </motion.p>
          </motion.div>

          {/* Badges */}
          <motion.ul variants={item} className="my-8 flex flex-wrap gap-2.5">
            {[
              "TypeScript",
              "React",
              "Next.js",
              "Motion",
              "Three.js",
              "Node",
              "Go",
              "Python",
              "SQL",
              "Figma",
              "Illustrator",
              "Premiere",
              "After Effects",
            ].map((tech, i) => (
              <motion.li
                key={tech}
                initial={
                  prefersReduced
                    ? false
                    : { opacity: 0, y: 12, filter: "blur(4px)" }
                }
                animate={
                  prefersReduced
                    ? false
                    : { opacity: 1, y: 0, filter: "blur(0px)" }
                }
                transition={{
                  delay: 0.5 + i * 0.04,
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="px-3 py-1 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-[11px] md:text-xs tracking-wide uppercase text-white/70 hover:text-white hover:border-white/30 transition-colors"
              >
                {tech}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </ScrollablePageContainer>
  );
};

export default HelloContent;
