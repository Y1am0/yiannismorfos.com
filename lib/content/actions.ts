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
