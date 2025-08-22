import { tiktokData, workData, youtubeData } from "@/components/What/data";
import { WorkCardData } from "@/components/What/types";
import { WhatContent } from "@/components/What/WhatContent";
import {
  getTikTokThumbnailUrl,
  resolveYouTubeThumbnailUrl,
} from "@/lib/content/actions";
import { Suspense } from "react";

export default async function WhatPage() {
  // Resolve thumbnails for TikTok content on the server
  const contentCards: WorkCardData[] = await Promise.all(
    [...tiktokData, ...youtubeData].map(async (c) => {
      if (c.platform === "tiktok" && c.videoId && c.authorHandle) {
        const thumb = await getTikTokThumbnailUrl(c.authorHandle, c.videoId);
        return { ...c, image: thumb ?? c.image };
      }
      if (c.platform === "youtube" && c.videoId) {
        const thumb = await resolveYouTubeThumbnailUrl(c.videoId);
        return { ...c, image: thumb };
      }
      return c;
    })
  );

  return (
    <Suspense fallback={null}>
      <WhatContent
        initialWorkCards={workData}
        initialContentCards={contentCards}
      />
    </Suspense>
  );
}
