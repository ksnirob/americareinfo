const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(
  /\/+$/,
  "",
);

export function convertBackendUrlToFrontendRoute(url) {
  if (!url || typeof url !== "string") {
    return "#";
  }

  if (!WORDPRESS_API_URL || !url.startsWith(WORDPRESS_API_URL)) {
    return url;
  }

  return url.slice(WORDPRESS_API_URL.length) || "/";
}

function convertBackendSrcSetToFrontendRoute(srcset) {
  return srcset
    .split(",")
    .map((candidate) => {
      const trimmedCandidate = candidate.trim();
      const [url, ...descriptors] = trimmedCandidate.split(/\s+/);
      const convertedUrl = convertBackendUrlToFrontendRoute(url);

      return [convertedUrl, ...descriptors].filter(Boolean).join(" ");
    })
    .join(", ");
}

function convertBackendCssToFrontendRoute(css) {
  if (!css || typeof css !== "string") return "";

  return convertBackendUrlToFrontendRoute(css);
}

export function rewriteBackendUrlsInHtml(html) {
  if (!html || typeof html !== "string") return "";

  return html
    .replace(
      /(\b(?:href|src|action|poster|data-src|data-large_image|data-thumb)\s*=\s*)(["'])(.*?)\2/gi,
      (match, attribute, quote, url) =>
        `${attribute}${quote}${convertBackendUrlToFrontendRoute(url)}${quote}`,
    )
    .replace(
      /(\bsrcset\s*=\s*)(["'])(.*?)\2/gi,
      (match, attribute, quote, srcset) =>
        `${attribute}${quote}${convertBackendSrcSetToFrontendRoute(srcset)}${quote}`,
    )
    .replace(
      /(\bstyle\s*=\s*)(["'])(.*?)\2/gi,
      (match, attribute, quote, css) =>
        `${attribute}${quote}${convertBackendCssToFrontendRoute(css)}${quote}`,
    );
}
