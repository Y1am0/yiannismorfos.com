import { tiktokData, workData, youtubeData } from "@/components/What/data";
import { WorkCardData } from "@/components/What/types";
import { WhatContent } from "@/components/What/WhatContent";
import { getTikTokThumbnailUrl } from "@/lib/content/actions";

export default async function WhatPage() {
  // Resolve thumbnails for TikTok content on the server
  const contentCards: WorkCardData[] = await Promise.all(
    [...tiktokData, ...youtubeData].map(async (c) => {
      if (c.platform === "tiktok" && c.videoId && c.authorHandle) {
        const thumb = await getTikTokThumbnailUrl(c.authorHandle, c.videoId);
        return { ...c, image: thumb ?? c.image };
      }
      return c;
    })
  );

  return (
    <WhatContent
      initialWorkCards={workData}
      initialContentCards={contentCards}
    />
  );
}
