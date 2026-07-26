import "server-only";

import {
  fetchWordPressWithTimeout,
  getHeadlessCssUrl,
} from "@/src/lib/wordpress-server";

const WORDPRESS_URL = (process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "").replace(
  /\/+$/,
  "",
);

function rewriteCssUrls(css) {
  if (!css || !WORDPRESS_URL) return css || "";

  return css
    .split(WORDPRESS_URL)
    .join("")
    .replace(/\bfont-display\s*:\s*fallback\b/gi, "font-display:swap");
}

export async function getHeadlessCssResponse(sitePath = "") {
  const cssUrl = (await getHeadlessCssUrl(sitePath)) || (
    sitePath ? await getHeadlessCssUrl("") : ""
  );

  if (!cssUrl) {
    return new Response("Headless CSS not found", { status: 404 });
  }

  let response;

  try {
    response = await fetchWordPressWithTimeout(cssUrl, {
      next: { revalidate: 86400 },
      timeoutMs: 15000,
    });
  } catch {
    return new Response("Headless CSS request timed out", { status: 504 });
  }

  if (!response.ok) {
    return new Response("Headless CSS not found", {
      status: response.status,
    });
  }

  return new Response(rewriteCssUrls(await response.text()), {
    status: 200,
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
