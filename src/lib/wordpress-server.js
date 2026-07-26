import "server-only";

import { unstable_cache } from "next/cache";
import {
  convertBackendUrlToFrontendRoute,
  rewriteBackendUrlsInHtml,
} from "./wordpress";

const API_URL = process.env.WORDPRESS_API_URL?.replace(/\/+$/, "");
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(/\/+$/, "");

export const WORDPRESS_CACHE_TAG = "wordpress";

const WORDPRESS_CACHE_REVALIDATE_SECONDS =
  Number(process.env.WORDPRESS_CACHE_REVALIDATE_SECONDS) || 86400;
const WORDPRESS_FETCH_TIMEOUT_MS =
  Number(process.env.WORDPRESS_FETCH_TIMEOUT_MS) || 5000;

export async function fetchWordPressWithTimeout(url, options = {}) {
  const { timeoutMs = WORDPRESS_FETCH_TIMEOUT_MS, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    timeoutMs,
  );

  try {
    return await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function getFirstPathSegment(path = "") {
  const firstSegment = path.replace(/^\/+/, "").split("/")[0];

  return firstSegment || "";
}

export function getWordPressPathWithoutSite(path = "", sitePath = "") {
  const normalizedPath = path.replace(/^\/+|\/+$/g, "");

  if (!sitePath) return normalizedPath;

  return normalizedPath.slice(sitePath.length).replace(/^\/+/, "");
}

function getWordPressUrl(sitePath = "") {
  return [WORDPRESS_URL, sitePath].filter(Boolean).join("/");
}

function getWordPressApiUrl(sitePath = "") {
  if (!sitePath) return API_URL;

  return `${getWordPressUrl(sitePath)}/wp-json/wp/v2`;
}

const getCachedWordPressSiteProbe = unstable_cache(
  async (sitePath) => {
    if (!sitePath || !WORDPRESS_URL) return false;

    try {
      const response = await fetchWordPressWithTimeout(
        `${getWordPressApiUrl(sitePath)}/pages?per_page=1&_fields=id`,
      );

      return response.ok;
    } catch {
      return false;
    }
  },
  ["wordpress-multisite-probe"],
  {
    revalidate: WORDPRESS_CACHE_REVALIDATE_SECONDS,
    tags: [WORDPRESS_CACHE_TAG],
  },
);

export async function resolveWordPressSitePath(path = "") {
  const firstSegment = getFirstPathSegment(path);

  if (!firstSegment) return "";

  return (await getCachedWordPressSiteProbe(firstSegment)) ? firstSegment : "";
}
 
export const getCachedWordPressData = unstable_cache(
  async (endpoint, apiUrl = API_URL) => {
    if (!apiUrl) throw new Error("WORDPRESS_API_URL is not configured");

    const response = await fetchWordPressWithTimeout(`${apiUrl}/${endpoint}`);

    if (!response.ok) throw new Error("WordPress request failed");

    return response.json();
  },
  ["wordpress-api"],
  {
    revalidate: WORDPRESS_CACHE_REVALIDATE_SECONDS,
    tags: [WORDPRESS_CACHE_TAG],
  },
);

export async function getPageBySlug(slug, sitePath = "") {
  try {
    const apiUrl = getWordPressApiUrl(sitePath);
    const pages = await getCachedWordPressData(
      `pages?slug=${encodeURIComponent(slug)}&_embed`,
      apiUrl,
    );

    return pages[0] ?? null;
  } catch (error) {
    console.error(`[getPageBySlug] failed for "${slug}":`, error);
    return null;
  }
}


export async function getHeader(sitePath = "") {
  try {
    const wordpressUrl = getWordPressUrl(sitePath);
    const res = await fetchWordPressWithTimeout(
      `${wordpressUrl}/wp-json/aci/v1/header`,
      {
        next: {
          revalidate: WORDPRESS_CACHE_REVALIDATE_SECONDS,
          tags: ["wordpress-header"],
        },
      }
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

export async function getHeadlessCssUrl(sitePath = "") {
  try {
    const wordpressUrl = getWordPressUrl(sitePath);
    const res = await fetchWordPressWithTimeout(
      `${wordpressUrl}/wp-json/aci/v1/headless-css`,
      {
        next: {
          revalidate: WORDPRESS_CACHE_REVALIDATE_SECONDS,
          tags: ["headless-css"],
        },
      },
    );

    if (!res.ok) return "";

    const response = await res.json();

    return response?.url || "";
  } catch {
    return "";
  }
}

export async function getHeadlessCssHref(sitePath = "") {
  const cssUrl = (await getHeadlessCssUrl(sitePath)) || (
    sitePath ? await getHeadlessCssUrl("") : ""
  );

  return convertBackendUrlToFrontendRoute(cssUrl);
}


export async function getTemplatePart( template, sitePath = "" ) {
  try {
    const wordpressUrl = getWordPressUrl(sitePath);
    const res = await fetchWordPressWithTimeout(
      `${wordpressUrl}/wp-json/aci/v1/template-part?includeStyles=true&name=${template}`,
      {
        next: {
          revalidate: WORDPRESS_CACHE_REVALIDATE_SECONDS,
          tags: ["wordpress-header"],
        },
      }
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
