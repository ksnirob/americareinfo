import "server-only";

import { unstable_cache } from "next/cache";

const API_URL = process.env.WORDPRESS_API_URL?.replace(/\/+$/, "");

export const getCachedWordPressData = unstable_cache(
  async (endpoint) => {
    const response = await fetch(`${API_URL}/${endpoint}`);

    if (!response.ok) throw new Error("WordPress request failed");

    return response.json();
  },
  ["wordpress-api"],
  { revalidate: 3600, tags: ["wordpress"] },
);

export async function getPageBySlug(slug) {
  const pages = await getCachedWordPressData(
    `pages?slug=${encodeURIComponent(slug)}&_embed`,
  );

  return pages[0] ?? null;
}
