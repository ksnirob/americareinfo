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

function rewriteWordPressLinks(html) {
  if (!html || !WORDPRESS_URL || !SITE_URL) return html || "";

  return html.replaceAll(WORDPRESS_URL, SITE_URL);
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

    const header = await res.json();

    return {
      ...header,
      html: rewriteWordPressLinks(header?.html),
    };
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
  const stylesUrl = new URL(`${WORDPRESS_URL}/wp-json/aci/v1/styles`);

  if (cleanSlug) {
    stylesUrl.searchParams.set("slug", cleanSlug);
  }

  try {
    const res = await fetch(stylesUrl, { cache: "no-store" });

    if (!res.ok) return "";

    const data = await res.json();

    return rewriteWordPressAssetUrls(data.pageCss || "");
  } catch {
    return "";
  }
}
