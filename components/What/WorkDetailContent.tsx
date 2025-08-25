"use client";

import { DelayedLink } from "@/components/DelayedLink";
import { ScrollablePageContainer } from "@/components/ScrollablePageContainer";
import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { motion } from "motion/react";
import Image from "next/image";
import { fastWord, item, word, wordLine } from "../Hello/variants";
import { Arrow } from "./Arrow";
import { workData } from "./data";
import type { WorkItemData } from "./types";

interface WorkDetailContentProps {
  id: string;
}

function getWorkById(id: string): WorkItemData | undefined {
  return workData.find((c) => c.id === id);
}

export const WorkDetailContent = ({ id }: WorkDetailContentProps) => {
  const isExiting = useRouteTransitionStore((s) => s.isExiting);
  const startExit = useRouteTransitionStore((s) => s.startExit);
  const backHref = "/what?tab=dev";

  const work = getWorkById(id);

  if (!work) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/70">
        Not found
      </div>
    );
  }

  const paragraphs = work.long.split(/\n\s*\n/);
  const paragraphsGroup = {
    hidden: { opacity: 1 },
    show: {
      opacity: 1,
      transition: { delay: 0.6, delayChildren: 0.06, staggerChildren: 0.22 },
    },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  } as const;

  const imageStep = {
    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
    exit: {
      opacity: 0,
      y: 0,
      filter: "blur(10px)",
      transition: { duration: 0.2, ease: [0.4, 0, 1, 1] },
    },
  } as const;

  return (
    <ScrollablePageContainer>
      <div className="w-full max-w-5xl mx-auto h-full min-h-0 flex flex-col gap-6 pt-8">
        {/* Top-left back button (matches WorkContentDetail) */}
        <motion.div
          variants={item}
          initial="hidden"
          animate={isExiting ? "exit" : "show"}
          className="self-start"
        >
          <DelayedLink
            href={backHref}
            beforeNavigate={startExit}
            className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            aria-label="Back to projects"
          >
            <Arrow direction="left" />
            <span className="text-sm uppercase tracking-wide">Back</span>
          </DelayedLink>
        </motion.div>

        {/* Centered when fits; aligns to top when overflowing */}
        <div className="flex-1 min-h-0 flex">
          <div className="w-full my-auto">
            {/* Title */}
            <motion.h1
              variants={wordLine}
              initial="hidden"
              animate={isExiting ? "exit" : "show"}
              className={`font-semibold tracking-tight text-4xl md:text-5xl lg:text-6xl text-white/95 leading-[0.95] inline-block select-none`}
            >
              <span className="inline-flex select-none flex-wrap gap-x-[0.5ch] align-top">
                {work.title.split(" ").map((w, wi) => (
                  <span key={`detail-word-${wi}`} className="inline-block">
                    {w.split("").map((ch, i, arr) => (
                      <motion.span
                        key={`detail-letter-${wi}-${i}-${ch}`}
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

            {/* Full-width image with border frame and inset image */}
            <motion.div
              variants={imageStep}
              initial="hidden"
              animate={isExiting ? "exit" : "show"}
              className="w-full mt-6"
            >
              <div className="relative w-full h-[240px] md:h-[400px] border border-white/80">
                <Image
                  src={work.image}
                  alt={work.title}
                  fill
                  className="object-cover object-center"
                  priority
                />
              </div>
            </motion.div>

            {/* Description (multi-paragraph), full width and not justified */}
            <div className="mt-6 text-white/80 text-base leading-relaxed">
              <motion.div
                variants={paragraphsGroup}
                initial="hidden"
                animate={isExiting ? "exit" : "show"}
                className="space-y-4"
              >
                {paragraphs.map((para, pi) => (
                  <motion.p
                    key={`para-${pi}`}
                    variants={{
                      hidden: { opacity: 0, y: 8, filter: "blur(6px)" },
                      show: {
                        opacity: 1,
                        y: 0,
                        filter: "blur(0px)",
                        transition: {
                          duration: 0.4,
                          ease: [0.22, 1, 0.36, 1],
                          staggerChildren: 0.012,
                        },
                      },
                      exit: {
                        opacity: 0,
                        y: 0,
                        transition: { duration: 0.15 },
                      },
                    }}
                    className="block"
                  >
                    {para.split(" ").map((w, i, arr) => (
                      <motion.span
                        key={`detail-word-${pi}-${i}-${w}`}
                        variants={fastWord}
                      >
                        {w}
                        {i < arr.length - 1 && " "}
                      </motion.span>
                    ))}
                  </motion.p>
                ))}

                {work.link && (
                  <motion.div variants={wordLine} className="mt-6 mb-12">
                    <a
                      href={work.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link inline-block text-white font-medium md:text-base relative after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-[1px] after:w-0 after:bg-current after:transition-[width] after:duration-300 after:ease-out hover:after:w-full focus-visible:after:w-full"
                    >
                      <span className="inline-flex select-none flex-wrap gap-x-[0.5ch] align-top">
                        {"Explore it for yourself here"
                          .split(" ")
                          .map((w, wi) => (
                            <span
                              key={`explore-word-${wi}`}
                              className="inline-block"
                            >
                              {w.split("").map((ch, i, arr) => (
                                <motion.span
                                  key={`explore-letter-${wi}-${i}-${ch}`}
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
                    </a>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* External link (optional) */}
            {/* moved inside paragraph group for staggered timing */}
          </div>
        </div>
      </div>
    </ScrollablePageContainer>
  );
};

export default WorkDetailContent;
