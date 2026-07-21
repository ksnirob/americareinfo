import "server-only";

import { unstable_cache } from "next/cache";
import { rewriteBackendUrlsInHtml } from "./wordpress";

const API_URL = process.env.WORDPRESS_API_URL?.replace(/\/+$/, "");
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(/\/+$/, "");

export const WORDPRESS_CACHE_TAG = "wordpress";

const WORDPRESS_CACHE_REVALIDATE_SECONDS =
  Number(process.env.WORDPRESS_CACHE_REVALIDATE_SECONDS) || 3600;
const WORDPRESS_FETCH_TIMEOUT_MS =
  Number(process.env.WORDPRESS_FETCH_TIMEOUT_MS) || 5000;

export async function fetchWordPressWithTimeout(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    WORDPRESS_FETCH_TIMEOUT_MS,
  );

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
 
export const getCachedWordPressData = unstable_cache(
  async (endpoint) => {
    if (!API_URL) throw new Error("WORDPRESS_API_URL is not configured");

    const response = await fetchWordPressWithTimeout(`${API_URL}/${endpoint}`);

    if (!response.ok) throw new Error("WordPress request failed");

    return response.json();
  },
  ["wordpress-api"],
  {
    revalidate: WORDPRESS_CACHE_REVALIDATE_SECONDS,
    tags: [WORDPRESS_CACHE_TAG],
  },
);

export async function getPageBySlug(slug) {
  try {
    const pages = await getCachedWordPressData(
      `pages?slug=${encodeURIComponent(slug)}&_embed`,
    );

    return pages[0] ?? null;
  } catch (error) {
    console.error(`[getPageBySlug] failed for "${slug}":`, error);
    return null;
  }
}


export async function getHeader() {
  try {
    const res = await fetchWordPressWithTimeout(
      `${WORDPRESS_URL}/wp-json/aci/v1/header`,
      { next: { revalidate: 300, tags: ["wordpress-header"] } }
    );

    if (!res.ok) return null;

    const header = await res.json();

    return {
      ...header,
      html: rewriteBackendUrlsInHtml(header?.html),
    };
  } catch {
    return null;
  }
}


export async function getTemplatePart( template ) {
  try {
    const res = await fetchWordPressWithTimeout(
      `${WORDPRESS_URL}/wp-json/aci/v1/template-part?includeStyles=true&name=${template}`,
      { next: { revalidate: 300, tags: ["wordpress-header"] } }
    );

    if (!res.ok) return null;

    const response = await res.json();

    return {
      ...response,
      html: rewriteBackendUrlsInHtml(response?.html),
    };
  } catch {
    return null;
  }
}
