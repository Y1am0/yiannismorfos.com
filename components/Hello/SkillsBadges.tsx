"use client";

import { motion, type Variants } from "motion/react";
import React, { useState } from "react";
import Marquee from "react-fast-marquee";

interface SkillsBadgesProps {
  prefersReduced: boolean;
  variants?: Variants;
  className?: string;
  skills?: string[];
  speedPxPerSecond?: number;
  appearDelayMs?: number;
}

const DEFAULT_SKILLS = [
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
  "Premiere Pro",
  "After Effects",
];

export const SkillsBadges: React.FC<SkillsBadgesProps> = ({
  prefersReduced,
  variants,
  className = "my-8 w-full",
  skills = DEFAULT_SKILLS,
  speedPxPerSecond = 20,
}) => {
  // Shared pause state so hovering one row pauses both
  const [isHoveredRow1, setIsHoveredRow1] = useState(false);
  const [isHoveredRow2, setIsHoveredRow2] = useState(false);
  const isPaused = isHoveredRow1 || isHoveredRow2;

  const chipClass =
    "px-3 py-1 rounded-full border border-white/15 bg-white/5 backdrop-blur-sm text-[11px] md:text-xs tracking-wide uppercase text-white/70 hover:text-white hover:border-white/30 transition-colors select-none whitespace-nowrap";

  const goIndex = skills.findIndex((s) => s.toLowerCase() === "go");
  const firstRow =
    goIndex >= 0
      ? skills.slice(0, goIndex + 1)
      : skills.slice(0, Math.ceil(skills.length / 2));
  const secondRow =
    goIndex >= 0
      ? skills.slice(goIndex + 1)
      : skills.slice(Math.ceil(skills.length / 2));

  // Speeds: top slightly faster than bottom, both slower than before
  const topSpeed = speedPxPerSecond;
  const bottomSpeed = Math.max(10, speedPxPerSecond - 3);

  return (
    <motion.div variants={variants} className={className}>
      {prefersReduced ? (
        <>
          <div className="overflow-x-auto scrollbar-hide">
            <ul className="flex flex-nowrap gap-2.5 pr-4">
              {firstRow.map((skill) => (
                <li key={`reduced-1-${skill}`}>
                  <span className={chipClass}>{skill}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-1 overflow-x-auto scrollbar-hide">
            <ul className="flex flex-nowrap gap-2.5 pr-4">
              {secondRow.map((skill) => (
                <li key={`reduced-2-${skill}`}>
                  <span className={chipClass}>{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : (
        <>
          <div
            className="overflow-hidden w-full"
            onMouseEnter={() => setIsHoveredRow1(true)}
            onMouseLeave={() => setIsHoveredRow1(false)}
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, rgba(0,0,0,0) 0%, #000 10%, #000 90%, rgba(0,0,0,0) 100%)",
              maskImage:
                "linear-gradient(to right, rgba(0,0,0,0) 0%, #000 10%, #000 90%, rgba(0,0,0,0) 100%)",
            }}
          >
            <Marquee
              gradient={false}
              speed={topSpeed}
              play={!isPaused}
              pauseOnHover={false}
              aria-label="Skills carousel row 1"
              className="[--gap:10px] py-1"
              direction="left"
              autoFill
            >
              <ul className="flex flex-nowrap gap-2.5 mr-2.5">
                {firstRow.map((skill) => (
                  <li key={`skills-1-${skill}`}>
                    <span className={chipClass}>{skill}</span>
                  </li>
                ))}
              </ul>
            </Marquee>
          </div>
          <div
            className="mt-1 overflow-hidden w-full"
            onMouseEnter={() => setIsHoveredRow2(true)}
            onMouseLeave={() => setIsHoveredRow2(false)}
            style={{
              WebkitMaskImage:
                "linear-gradient(to right, rgba(0,0,0,0) 0%, #000 10%, #000 90%, rgba(0,0,0,0) 100%)",
              maskImage:
                "linear-gradient(to right, rgba(0,0,0,0) 0%, #000 10%, #000 90%, rgba(0,0,0,0) 100%)",
            }}
          >
            <Marquee
              gradient={false}
              speed={bottomSpeed}
              play={!isPaused}
              pauseOnHover={false}
              aria-label="Skills carousel row 2"
              className="[--gap:10px] py-1"
              direction="right"
              autoFill
            >
              <ul className="flex flex-nowrap gap-2.5 mr-2.5">
                {secondRow.map((skill) => (
                  <li key={`skills-2-${skill}`}>
                    <span className={chipClass}>{skill}</span>
                  </li>
                ))}
              </ul>
            </Marquee>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default SkillsBadges;
