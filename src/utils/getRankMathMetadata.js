import "server-only";

import { unstable_cache } from "next/cache";
import {
  fetchWordPressWithTimeout,
  WORDPRESS_CACHE_TAG,
} from "@/src/lib/wordpress-server";

const WORDPRESS_CACHE_REVALIDATE_SECONDS =
  Number(process.env.WORDPRESS_CACHE_REVALIDATE_SECONDS) || 3600;

function stripTrailingSlash(value = "") {
  return value.replace(/\/+$/, "");
}

function rewriteFrontendUrl(url, wordpressUrl, siteUrl) {
  if (!url || !siteUrl || !url.startsWith(wordpressUrl)) return url;

  return `${siteUrl}${url.slice(wordpressUrl.length)}`;
}

function getTagContent(html, tagName) {
  const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
  return html.match(regex)?.[1]?.trim();
}

function getMetaContent(html, attribute, value) {
  const regex = new RegExp(
    `<meta[^>]+${attribute}=["']${value}["'][^>]+content=["']([^"']*)["'][^>]*>|<meta[^>]+content=["']([^"']*)["'][^>]+${attribute}=["']${value}["'][^>]*>`,
    "i",
  );
  const match = html.match(regex);

  return match?.[1] || match?.[2] || undefined;
}

function getLinkHref(html, rel) {
  const regex = new RegExp(
    `<link[^>]+rel=["']${rel}["'][^>]+href=["']([^"']*)["'][^>]*>|<link[^>]+href=["']([^"']*)["'][^>]+rel=["']${rel}["'][^>]*>`,
    "i",
  );
  const match = html.match(regex);

  return match?.[1] || match?.[2] || undefined;
}

async function fetchRankMathHead(wordpressUrl, targetUrl) {
  const endpoint = `${wordpressUrl}/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(targetUrl)}`;
  const response = await fetchWordPressWithTimeout(endpoint, {
    cache: "no-store",
  });

  if (response.ok) {
    const data = await response.json();

    if (data?.head) return data.head;
  }

  const pageResponse = await fetchWordPressWithTimeout(targetUrl, {
    cache: "no-store",
  });

  if (!pageResponse.ok) return "";

  return pageResponse.text();
}

async function getRankMathMetadataUncached(path = "/") {
  try {
    const wordpressUrl = stripTrailingSlash(
      process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "",
    );
    const siteUrl = stripTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || "");

    if (!wordpressUrl) return {};

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const targetUrl = `${wordpressUrl}${normalizedPath}`;
    const head = await fetchRankMathHead(wordpressUrl, targetUrl);

    if (!head) return {};

    const title = getTagContent(head, "title");
    const description = getMetaContent(head, "name", "description");
    const robots = getMetaContent(head, "name", "robots");
    const canonical = rewriteFrontendUrl(
      getLinkHref(head, "canonical"),
      wordpressUrl,
      siteUrl,
    );
    const ogTitle = getMetaContent(head, "property", "og:title");
    const ogDescription = getMetaContent(head, "property", "og:description");
    const ogUrl = rewriteFrontendUrl(
      getMetaContent(head, "property", "og:url"),
      wordpressUrl,
      siteUrl,
    );
    const ogImage = getMetaContent(head, "property", "og:image");
    const ogType = getMetaContent(head, "property", "og:type");
    const ogSiteName = getMetaContent(head, "property", "og:site_name");
    const twitterTitle = getMetaContent(head, "name", "twitter:title");
    const twitterDescription = getMetaContent(
      head,
      "name",
      "twitter:description",
    );
    const twitterImage = getMetaContent(head, "name", "twitter:image");
    const twitterCard = getMetaContent(head, "name", "twitter:card");

    return {
      title: title || undefined,
      description: description || undefined,
      robots: robots || undefined,
      alternates: canonical ? { canonical } : undefined,
      openGraph: {
        title: ogTitle || title || undefined,
        description: ogDescription || description || undefined,
        url: ogUrl || canonical || targetUrl,
        siteName: ogSiteName || undefined,
        images: ogImage ? [{ url: ogImage }] : undefined,
        type: ogType || "website",
      },
      twitter: {
        card: twitterCard || "summary_large_image",
        title: twitterTitle || ogTitle || title || undefined,
        description:
          twitterDescription || ogDescription || description || undefined,
        images: twitterImage ? [twitterImage] : ogImage ? [ogImage] : undefined,
      },
    };
  } catch (error) {
    console.error("[getRankMathMetadata] error:", error);
    return {};
  }
}

const getRankMathMetadataCached = unstable_cache(
  getRankMathMetadataUncached,
  ["rank-math-metadata"],
  {
    revalidate: WORDPRESS_CACHE_REVALIDATE_SECONDS,
    tags: [WORDPRESS_CACHE_TAG],
  },
);

export async function getRankMathMetadata(path = "/") {
  return getRankMathMetadataCached(path);
}
