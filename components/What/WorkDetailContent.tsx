"use client";

import { DelayedLink } from "@/components/DelayedLink";
import { ScrollablePageContainer } from "@/components/ScrollablePageContainer";
import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { motion } from "motion/react";
import Image from "next/image";
import { fastLine, fastWord, item, word, wordLine } from "../Hello/variants";
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

  return (
    <ScrollablePageContainer>
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10 min-h-0 pt-8">
        {/* IMAGE PANEL */}
        <motion.div
          variants={item}
          className="relative select-none md:sticky md:top-8 md:self-start shrink-0 w-full md:w-auto"
        >
          <div className="relative w-[320px] h-[320px] md:w-[360px] md:h-[360px] rounded-2xl overflow-hidden border border-white/10 bg-white/5">
            <Image
              src={work.image}
              alt={work.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </motion.div>

        {/* TEXT PANEL */}
        <motion.div
          variants={item}
          className="text-center md:text-left max-w-xl"
        >
          {/* Title */}
          <motion.h1
            variants={wordLine}
            initial="hidden"
            animate={isExiting ? "exit" : "show"}
            className={`font-semibold tracking-tight text-4xl md:text-5xl lg:text-6xl text-white/95 leading-[0.95] inline-block select-none`}
          >
            {work.title.split("").map((ch, i, arr) => (
              <motion.span
                key={`detail-letter-${i}-${ch}`}
                variants={word}
                className={`${
                  i < arr.length - 1 ? "mr-[0.02ch]" : ""
                } inline-block`}
              >
                {ch}
              </motion.span>
            ))}
          </motion.h1>

          {/* Description */}
          <motion.div
            variants={fastLine}
            className="mt-4 text-white/80 text-base leading-relaxed text-justify"
          >
            <motion.p
              className="block"
              variants={{ show: { transition: { staggerChildren: 0.012 } } }}
            >
              {work.long.split(" ").map((w, i, arr) => (
                <motion.span key={`detail-word-${i}-${w}`} variants={fastWord}>
                  {w}
                  {i < arr.length - 1 && " "}
                </motion.span>
              ))}
            </motion.p>
          </motion.div>

          {/* Back link */}
          <motion.div variants={item} className="mt-8">
            <DelayedLink
              href={backHref}
              beforeNavigate={startExit}
              className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors"
              aria-label="Back to projects"
            >
              <Arrow direction="left" />
              <span className="text-sm uppercase tracking-wide">
                Back to work
              </span>
            </DelayedLink>
          </motion.div>
        </motion.div>
      </div>
    </ScrollablePageContainer>
  );
};

export default WorkDetailContent;
