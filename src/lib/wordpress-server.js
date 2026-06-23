import "server-only";

import { unstable_cache } from "next/cache";

const API_URL = process.env.WORDPRESS_API_URL?.replace(/\/+$/, "");
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(
  /\/+$/,
  "",
);

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


export async function getHeader() {
  const header = await fetch(`${WORDPRESS_URL}/wp-json/aci/v1/header`);
  return header.json();
}

export async function getWordPressStyles() {
  const response = await fetch(`${WORDPRESS_URL}/wp-json/aci/v1/styles`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      css: "",
      urls: [],
    };
  }

  const styles = await response.json();
  const urls =
    styles.sources
      ?.filter((source) => source.type === "file" && source.url)
      .map((source) => source.url) ?? [];

  return {
    css: styles.css ?? "",
    urls: [...new Set(urls)],
  };
}

export async function getWordPressFontFaces() {
  const response = await fetch(`${WORDPRESS_URL}/`, {
    cache: "no-store",
  });

  if (!response.ok) return "";

  const html = await response.text();
  const fontFaces = html.match(/@font-face\s*{[^}]+}/g);

  return (
    fontFaces
      ?.join("\n")
      .replaceAll(`${WORDPRESS_URL}/wp-content/`, "/wp-content/") ?? ""
  );
}
