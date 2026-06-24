import "server-only";

import { unstable_cache } from "next/cache";

const API_URL = process.env.WORDPRESS_API_URL?.replace(/\/+$/, "");
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(/\/+$/, "");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");

function rewriteWordPressAssetUrls(css) {
  if (!css || !WORDPRESS_URL) return css || "";

  const frontendContentPath = SITE_URL ? `${SITE_URL}/wp-content/` : "/wp-content/";

  return css.replaceAll(`${WORDPRESS_URL}/wp-content/`, frontendContentPath);
}

function extractInlineStyles(html) {
  const styles = [];
  const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let match;

  while ((match = styleRegex.exec(html)) !== null) {
    const css = match[1]?.trim();

    if (css) {
      styles.push(css);
    }
  }

  return styles.join("\n");
}

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
  try {
    const res = await fetch(
      `${WORDPRESS_URL}/wp-json/aci/v1/header`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    return res.json();
  } catch {
    return null;
  }
}

export async function getWordPressStyles() {
  try {
    const res = await fetch(
      `${WORDPRESS_URL}/wp-json/aci/v1/styles`,
      { cache: "no-store" }
    );

    if (!res.ok) {
      return { css: "", sources: [] };
    }

    const data = await res.json();

    return {
      css: data.css || "",
      sources: Array.isArray(data.sources) ? data.sources : [],
    };
  } catch {
    return { css: "", sources: [] };
  }
}

export async function getWordPressFontFaces() {
  try {
    const res = await fetch(`${WORDPRESS_URL}`, {
      cache: "no-store",
    });

    if (!res.ok) return "";

    const html = await res.text();

    // FIXED: multi-line safe font extraction
    const fonts = html.match(/@font-face\s*{[\s\S]*?}/g) || [];

    return rewriteWordPressAssetUrls(fonts.join("\n"));
  } catch {
    return "";
  }
}

export async function getWordPressPageStyles(slug = "") {
  if (!WORDPRESS_URL) return "";

  const cleanSlug = String(slug).replace(/^\/+|\/+$/g, "");
  const pageUrl = cleanSlug ? `${WORDPRESS_URL}/${cleanSlug}/` : `${WORDPRESS_URL}/`;

  try {
    const res = await fetch(pageUrl, { cache: "no-store" });

    if (!res.ok) return "";

    const html = await res.text();

    return rewriteWordPressAssetUrls(extractInlineStyles(html));
  } catch {
    return "";
  }
}
