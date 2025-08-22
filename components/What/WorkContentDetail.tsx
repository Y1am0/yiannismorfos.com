"use client";

import { DelayedLink } from "@/components/DelayedLink";
import { ScrollablePageContainer } from "@/components/ScrollablePageContainer";
import { useRouteTransitionStore } from "@/lib/routeTransitionStore";
import { motion } from "motion/react";
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
  const startExit = useRouteTransitionStore((s) => s.startExit);
  const content = getContentByIdOrSlug(id);
  const backHref = "/what?tab=content";

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
        <div className="w-full h-full max-w-3xl mx-auto bg-black overflow-hidden rounded-xl">
          <iframe
            className="w-full h-full"
            src={src}
            title={content.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      );
    }
    if (content.platform === "tiktok" && content.videoId) {
      const src = `https://www.tiktok.com/player/v1/${content.videoId}?controls=1&description=0&loop=1&rel=0`;
      return (
        <div className="w-full h-full max-w-xl mx-auto bg-black overflow-hidden rounded-xl">
          <iframe
            className="w-full h-full"
            src={src}
            title={content.title}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
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
        <motion.div className="self-start">
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

        <div className="flex-1 min-h-0">{renderEmbed()}</div>
      </div>
    </ScrollablePageContainer>
  );
}
