const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(
  /\/+$/,
  "",
);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");

export function convertBackendUrlToFrontendRoute(url) {
  if (!url || typeof url !== "string") {
    return "#";
  }

  if (!WORDPRESS_API_URL || !SITE_URL) {
    return url;
  }

  return url.replace(WORDPRESS_API_URL, SITE_URL);
}
