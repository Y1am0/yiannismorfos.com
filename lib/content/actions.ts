"use server";

export async function getTikTokThumbnailUrl(
  username: string,
  videoId: string
): Promise<string | null> {
  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(
      `https://www.tiktok.com/@${username}/video/${videoId}`
    )}`;
    const res = await fetch(oembedUrl, { next: { revalidate: 60 * 60 } });
    if (!res.ok) return null;
    const data = (await res.json()) as { thumbnail_url?: string };
    return data.thumbnail_url ?? null;
  } catch {
    return null;
  }
}

export async function resolveYouTubeThumbnailUrl(
  videoId: string
): Promise<string> {
  const base = `https://i.ytimg.com/vi/${videoId}`;
  const candidates = [
    `${base}/maxresdefault.jpg`, // 1280x720 (best)
    `${base}/hq720.jpg`, // 1280x720
    `${base}/mqdefault.jpg`, // 320x180 (16:9)
    `${base}/hqdefault.jpg`, // 480x360 (4:3, may letterbox)
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        method: "HEAD",
        next: { revalidate: 60 * 60 * 24 },
      });
      if (res.ok) return url;
    } catch {}
  }
  return `${base}/hqdefault.jpg`;
}
