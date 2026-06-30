const WORDPRESS_URL = (process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "").replace(
  /\/+$/,
  "",
);
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, "");

export const dynamic = "force-dynamic";
export const revalidate = 0;

function isAllowedSitemapFile(file) {
  return (
    file === "sitemap_index.xml" ||
    /^[A-Za-z0-9_-]+-sitemap([0-9]+)?\.xml$/.test(file)
  );
}

export async function GET(request, context) {
  const { file: encodedFile } = await context.params;
  const file = decodeURIComponent(encodedFile || "");

  if (!WORDPRESS_URL || !isAllowedSitemapFile(file)) {
    return new Response("Sitemap not found", { status: 404 });
  }

  const response = await fetch(`${WORDPRESS_URL}/${file}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return new Response(`Sitemap not found from WordPress: ${file}`, {
      status: response.status,
    });
  }

  let xml = await response.text();

  if (SITE_URL) {
    xml = xml.split(WORDPRESS_URL).join(SITE_URL);
  }

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
