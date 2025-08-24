"use client";

import { DelayedLink } from "@/components/DelayedLink";
import { ScrollablePageContainer } from "@/components/ScrollablePageContainer";
import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { item } from "../Hello/variants";
import { Arrow } from "./Arrow";
import { tiktokData, youtubeData } from "./data";
import type { TikTokContentData, YouTubeContentData } from "./types";

interface WorkContentDetailProps {
  id: string; // can be id or slug
}

function getContentByIdOrSlug(idOrSlug: string) {
  const all: Array<TikTokContentData | YouTubeContentData> = [
    ...tiktokData,
    ...youtubeData,
  ];
  return all.find((c) => c.id === idOrSlug || c.slug === idOrSlug);
}

export default function WorkContentDetail({ id }: WorkContentDetailProps) {
  const isExiting = useRouteTransitionStore((s) => s.isExiting);
  const startExit = useRouteTransitionStore((s) => s.startExit);
  const content = getContentByIdOrSlug(id);
  const backHref = "/what?tab=content";

  // Measure available space so the video can maintain 16:9 and shrink with height.
  const contentAreaRef = useRef<HTMLDivElement | null>(null);
  const [areaSize, setAreaSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const el = contentAreaRef.current;
    if (!el) return;
    const update = () =>
      setAreaSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("orientationchange", update);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const computedPlayerSize = useMemo(() => {
    if (!areaSize) return null;
    const aspectRatio = 16 / 9;
    // Width driven by the more restrictive dimension: container width vs height * AR
    const maxWidthFromHeight = areaSize.height * aspectRatio;
    const width = Math.min(areaSize.width, maxWidthFromHeight);
    const height = width / aspectRatio;
    return { width, height };
  }, [areaSize]);

  if (!content) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white/70">
        Not found
      </div>
    );
  }

  const renderEmbed = () => {
    if (content.platform === "youtube" && content.videoId) {
      const src = `https://www.youtube.com/embed/${content.videoId}`;
      return (
        <div
          className="bg-black overflow-hidden flex rounded-xl"
          style={{
            // Cap by Tailwind's max-w-3xl via a wrapper below; we still compute inline size.
            width: computedPlayerSize?.width,
            height: computedPlayerSize?.height,
          }}
        >
          {/* Fallback initial state before measurements: keep 16:9 and clamp width */}
          {!computedPlayerSize && <div className="w-full" />}
          {computedPlayerSize && (
            <iframe
              className="w-full h-full block"
              src={src}
              title={content.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
      );
    }
    if (content.platform === "tiktok" && content.videoId) {
      const src = `https://www.tiktok.com/player/v1/${content.videoId}?controls=1&description=0&loop=1&rel=0`;
      return (
        <div
          className="bg-black overflow-hidden flex rounded-xl"
          style={{
            width: computedPlayerSize?.width,
            height: computedPlayerSize?.height,
          }}
        >
          {!computedPlayerSize && <div className="w-full" />}
          {computedPlayerSize && (
            <iframe
              className="w-full h-full block"
              src={src}
              title={content.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <ScrollablePageContainer
      showScrollIndicator={false}
      verticalFade={false}
      centerWhenNotScrollable={false}
    >
      <div className="w-full max-w-5xl mx-auto h-full min-h-0 flex flex-col gap-6 pt-8">
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
            aria-label="Back to what"
          >
            <Arrow direction="left" />
            <span className="text-sm uppercase tracking-wide">Back</span>
          </DelayedLink>
        </motion.div>

        <div
          ref={contentAreaRef}
          className="flex-1 min-h-0 grid place-items-center"
        >
          {/* Center the player and cap width to max-w-3xl */}
          <motion.div
            variants={item}
            initial="hidden"
            animate={isExiting ? "exit" : "show"}
            transition={{ delay: 0.1 }}
            className="w-full mx-auto grid place-items-center"
          >
            {renderEmbed()}
          </motion.div>
        </div>
      </div>
    </ScrollablePageContainer>
  );
}
