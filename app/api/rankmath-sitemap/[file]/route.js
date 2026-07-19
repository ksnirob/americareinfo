import { fetchWordPressWithTimeout } from "@/src/lib/wordpress-server";

const WORDPRESS_URL = (process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "").replace(
  /\/+$/,
  "",
);
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");
const WORDPRESS_HAG_KEY = process.env.WORDPRESS_HAG_KEY || "";
const WORDPRESS_HAG_SECRET = process.env.WORDPRESS_HAG_SECRET || "";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isAllowedSitemapFile(file) {
  return (
    file === "sitemap_index.xml" ||
    /^[A-Za-z0-9_-]+-sitemap([0-9]+)?\.xml$/.test(file)
  );
}

function getWordPressHeaders() {
  const headers = {};

  if (WORDPRESS_HAG_KEY && WORDPRESS_HAG_SECRET) {
    headers["X-HAG-Key"] = WORDPRESS_HAG_KEY;
    headers["X-HAG-Secret"] = WORDPRESS_HAG_SECRET;
  }

  return headers;
}

export async function GET(request, context) {
  const { file: encodedFile } = await context.params;
  const file = decodeURIComponent(encodedFile || "");

  if (!WORDPRESS_URL || !isAllowedSitemapFile(file)) {
    return new Response("Sitemap not found", { status: 404 });
  }

  let response;

  try {
    response = await fetchWordPressWithTimeout(`${WORDPRESS_URL}/${file}`, {
      headers: getWordPressHeaders(),
      cache: "no-store",
    });
  } catch {
    return new Response(`Sitemap request timed out: ${file}`, { status: 504 });
  }

  if (!response.ok) {
    return new Response(`Sitemap not found from WordPress: ${file}`, {
      status: response.status,
    });
  }

  let xml = await response.text();

  xml = xml.replace(/<\?xml-stylesheet[^?]+\?>\s*/i, "");

  if (SITE_URL) {
    xml = xml.split(WORDPRESS_URL).join(SITE_URL);
  }

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
