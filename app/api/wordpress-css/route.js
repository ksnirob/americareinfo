import { fetchWordPressWithTimeout } from "@/src/lib/wordpress-server";

const WORDPRESS_URL = (process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "").replace(
  /\/+$/,
  "",
);
const CSS_PATH = "/wp-content/uploads/headless-css/style.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getWordPressUrl(sitePath = "") {
  return [WORDPRESS_URL, sitePath].filter(Boolean).join("/");
}

function rewriteCssUrls(css) {
  if (!css || !WORDPRESS_URL) return css || "";

  return css.split(WORDPRESS_URL).join("");
}

function getSitePath(request) {
  return (request.nextUrl.searchParams.get("site") || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
}

async function getHeadlessCssUrl(sitePath) {
  const wordpressUrl = getWordPressUrl(sitePath);
  const response = await fetchWordPressWithTimeout(
    `${wordpressUrl}/wp-json/aci/v1/headless-css`,
    { cache: "no-store" },
  );

  if (!response.ok) return "";

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await response.json();

    return data?.url || "";
  }

  return "";
}

export async function GET(request) {
  if (!WORDPRESS_URL) {
    return new Response("WordPress URL is not configured", { status: 404 });
  }

  let response;
  const sitePath = getSitePath(request);

  try {
    const headlessCssUrl = await getHeadlessCssUrl(sitePath);
    const cssUrl = headlessCssUrl || `${getWordPressUrl(sitePath)}${CSS_PATH}`;

    response = await fetchWordPressWithTimeout(cssUrl, { cache: "no-store" });
  } catch {
    return new Response("WordPress CSS request timed out", { status: 504 });
  }

  if (!response.ok) {
    return new Response("WordPress CSS not found", {
      status: response.status,
    });
  }

  const css = rewriteCssUrls(await response.text());

  return new Response(css, {
    status: 200,
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
