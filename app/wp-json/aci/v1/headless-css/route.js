import {
  fetchWordPressWithTimeout,
  getHeadlessCssUrl,
} from "@/src/lib/wordpress-server";

const WORDPRESS_URL = (process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "").replace(
  /\/+$/,
  "",
);

export const dynamic = "force-dynamic";
export const revalidate = 0;

function rewriteCssUrls(css) {
  if (!css || !WORDPRESS_URL) return css || "";

  return css.split(WORDPRESS_URL).join("");
}

export async function GET(request) {
  const sitePath = (request.nextUrl.searchParams.get("site") || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
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
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
