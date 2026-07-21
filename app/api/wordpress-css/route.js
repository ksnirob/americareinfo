import { fetchWordPressWithTimeout } from "@/src/lib/wordpress-server";

const WORDPRESS_URL = (process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "").replace(
  /\/+$/,
  "",
);
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
const CSS_PATH = "/wp-content/uploads/headless-css/style.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function rewriteCssUrls(css, frontendUrl) {
  if (!css || !WORDPRESS_URL || !frontendUrl) return css || "";

  return css.split(WORDPRESS_URL).join(frontendUrl);
}

export async function GET(request) {
  if (!WORDPRESS_URL) {
    return new Response("WordPress URL is not configured", { status: 404 });
  }

  let response;

  try {
    response = await fetchWordPressWithTimeout(`${WORDPRESS_URL}${CSS_PATH}`, {
      cache: "no-store",
    });
  } catch {
    return new Response("WordPress CSS request timed out", { status: 504 });
  }

  if (!response.ok) {
    return new Response("WordPress CSS not found", {
      status: response.status,
    });
  }

  const frontendUrl = SITE_URL || request.nextUrl.origin;
  const css = rewriteCssUrls(await response.text(), frontendUrl);

  return new Response(css, {
    status: 200,
    headers: {
      "Content-Type": "text/css; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
