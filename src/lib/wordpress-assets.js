import { fetchWordPressWithTimeout } from "./wordpress-server";

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(
  /\/+$/,
  "",
);

const STATIC_ASSET_CACHE_CONTROL =
  "public, max-age=31536000, s-maxage=31536000, immutable";
const isDevelopment = process.env.NODE_ENV === "development";

function rewriteCssAssetUrls(css) {
  if (!css || !WORDPRESS_URL) return css || "";

  return css
    .split(WORDPRESS_URL)
    .join("")
    .replace(/\bfont-display\s*:\s*fallback\b/gi, "font-display:swap");
}

function getAssetUrl(pathSegments = [], sitePath = "") {
  const assetPath = pathSegments.map(encodeURIComponent).join("/");
  const sitePrefix = sitePath ? `/${sitePath}` : "";

  return `${WORDPRESS_URL}${sitePrefix}/wp-content/${assetPath}`;
}

export async function proxyWordPressAsset(request, pathSegments, sitePath = "") {
  if (!WORDPRESS_URL) {
    return new Response("WordPress URL is not configured", { status: 404 });
  }

  let response;

  try {
    response = await fetchWordPressWithTimeout(
      getAssetUrl(pathSegments, sitePath),
      {
        method: request.method,
        ...(isDevelopment
          ? { cache: "no-store" }
          : { next: { revalidate: 31536000 } }),
        timeoutMs: 15000,
      },
    );
  } catch {
    return new Response("WordPress asset request timed out", { status: 504 });
  }

  if (!response.ok) {
    return new Response("WordPress asset not found", {
      status: response.status,
    });
  }

  const headers = new Headers();
  const contentType = response.headers.get("content-type");

  if (contentType) headers.set("Content-Type", contentType);

  headers.set("Cache-Control", STATIC_ASSET_CACHE_CONTROL);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Cross-Origin-Resource-Policy", "cross-origin");

  if (request.method === "HEAD") {
    return new Response(null, { status: 200, headers });
  }

  if (
    contentType?.includes("text/css") ||
    pathSegments.at(-1)?.toLowerCase().endsWith(".css")
  ) {
    headers.set("Content-Type", "text/css; charset=utf-8");

    return new Response(rewriteCssAssetUrls(await response.text()), {
      status: 200,
      headers,
    });
  }

  return new Response(response.body, { status: 200, headers });
}
