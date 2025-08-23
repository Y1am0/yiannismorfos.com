"use client";

import { motion } from "motion/react";
import Image from "next/image";

interface FramedImageProps {
  prefersReduced: boolean;
  isExiting: boolean;
}

export const FramedImage = ({
  prefersReduced,
  isExiting,
}: FramedImageProps) => {
  return (
    <div
      className="md:ml-5 relative p-4 sm:p-5 md:p-6 select-none"
      aria-label="Portrait frame container"
    >
      {/* Overshooting frame lines with draw animation */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* Top */}
        <motion.span
          className="absolute top-0 left-[-18px] right-[-18px] h-px bg-white/55"
          style={{ transformOrigin: "left" }}
          initial={prefersReduced ? false : { scaleX: 0, opacity: 0 }}
          animate={
            prefersReduced
              ? false
              : { scaleX: [0, 1.07, 1], opacity: [0, 1, 1] }
          }
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.7, 1],
            delay: 0.3,
          }}
        />
        {/* Right */}
        <motion.span
          className="absolute right-0 top-[-18px] bottom-[-18px] w-px bg-white/55"
          style={{ transformOrigin: "top" }}
          initial={prefersReduced ? false : { scaleY: 0, opacity: 0 }}
          animate={
            prefersReduced
              ? false
              : { scaleY: [0, 1.07, 1], opacity: [0, 1, 1] }
          }
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.7, 1],
            delay: 0.5,
          }}
        />
        {/* Bottom */}
        <motion.span
          className="absolute bottom-0 left-[-18px] right-[-18px] h-px bg-white/55"
          style={{ transformOrigin: "left" }}
          initial={prefersReduced ? false : { scaleX: 0, opacity: 0 }}
          animate={
            prefersReduced
              ? false
              : { scaleX: [0, 1.07, 1], opacity: [0, 1, 1] }
          }
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.7, 1],
            delay: 0.6,
          }}
        />
        {/* Left */}
        <motion.span
          className="absolute left-0 top-[-18px] bottom-[-18px] w-px bg-white/55"
          style={{ transformOrigin: "top" }}
          initial={prefersReduced ? false : { scaleY: 0, opacity: 0 }}
          animate={
            prefersReduced
              ? false
              : { scaleY: [0, 1.07, 1], opacity: [0, 1, 1] }
          }
          transition={{
            duration: 0.9,
            ease: [0.22, 1, 0.36, 1],
            times: [0, 0.7, 1],
            delay: 0.4,
          }}
        />
      </div>
      {/* Image */}
      <motion.div
        className="relative w-[240px] h-[300px] max-[349px]:w-[160px] max-[349px]:h-[200px] max-[399px]:w-[200px] max-[399px]:h-[250px] sm:w-[260px] sm:h-[340px] lg:w-[300px] lg:h-[380px] overflow-hidden"
        initial={
          prefersReduced
            ? false
            : { opacity: 0, filter: "blur(28px) scale(1.02)" }
        }
        animate={
          prefersReduced
            ? false
            : isExiting
            ? {
                opacity: 0,
                filter: "blur(18px)",
                transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
              }
            : {
                opacity: 1,
                filter: "blur(0px) scale(1)",
                transition: {
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.3,
                },
              }
        }
      >
        <Image
          src="/me.png"
          alt="Yiannis Morfos portrait"
          fill
          draggable={false}
          priority
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 260px, 240px"
          className="object-cover object-center select-none"
        />
        {/* Internal vignette */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_90%_at_50%_55%,rgba(0,0,0,0)_55%,rgba(0,0,0,0.35)_100%)]" />
      </motion.div>
    </div>
  );
};

export default FramedImage;
