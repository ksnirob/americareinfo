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

function setAttribute(tag, name, value) {
  const pattern = new RegExp(`\\s${name}\\s*=\\s*(["']).*?\\1`, "i");

  if (pattern.test(tag)) {
    return tag.replace(pattern, ` ${name}="${value}"`);
  }

  return tag.replace(/\/?>$/, (ending) => ` ${name}="${value}"${ending}`);
}

function removeAttribute(tag, name) {
  const pattern = new RegExp(`\\s${name}\\s*=\\s*(["']).*?\\1`, "i");

  return tag.replace(pattern, "");
}

function optimizeAboveFoldMedia(html) {
  const coverMatch = html.match(/<div\b[^>]*class=(["'])[^"']*wp-block-cover[^"']*\1[\s\S]*?<\/div>\s*<\/div>/i);
  let optimizedHtml = html;

  if (coverMatch) {
    let optimizedImageCount = 0;
    const optimizedCover = coverMatch[0].replace(/<img\b[^>]*>/gi, (tag) => {
      if (optimizedImageCount >= 2) return tag;

      optimizedImageCount += 1;

      const priorityTag = setAttribute(
        setAttribute(
          setAttribute(
            removeAttribute(tag, "loading").replace(
              /\ssizes=(["'])auto,\s*/i,
              " sizes=$1",
            ),
            "loading",
            "eager",
          ),
          "fetchpriority",
          "high",
        ),
        "decoding",
        "async",
      );

      return rewriteImageTagToNextOptimizer(priorityTag);
    });

    optimizedHtml = html.replace(coverMatch[0], optimizedCover);
  }

  return optimizedHtml.replace(
    /<video\b[^>]*class=(["'])[^"']*wp-block-cover__video-background[^"']*\1[^>]*>/i,
    (tag) => setAttribute(tag, "fetchpriority", "low"),
  );
}

function getOptimizedImageUrl(url, width = "1024") {
  if (!url || !url.startsWith("/wp-content/") && !/^\/[^/]+\/wp-content\//.test(url)) {
    return url;
  }

  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
}

function rewriteImageSrcSetToNextOptimizer(srcset) {
  return srcset
    .split(",")
    .map((candidate) => {
      const trimmedCandidate = candidate.trim();
      const [url, descriptor] = trimmedCandidate.split(/\s+/);
      const width = descriptor?.endsWith("w") ? descriptor.slice(0, -1) : "1024";

      return [getOptimizedImageUrl(url, width), descriptor].filter(Boolean).join(" ");
    })
    .join(", ");
}

function rewriteImageTagToNextOptimizer(tag) {
  return tag
    .replace(/(\ssrc\s*=\s*)(["'])(.*?)\2/i, (match, attribute, quote, src) =>
      `${attribute}${quote}${getOptimizedImageUrl(src)}${quote}`,
    )
    .replace(/(\ssrcset\s*=\s*)(["'])(.*?)\2/i, (match, attribute, quote, srcset) =>
      `${attribute}${quote}${rewriteImageSrcSetToNextOptimizer(srcset)}${quote}`,
    );
}

export function getPriorityImagePreloads(html) {
  if (!html || typeof html !== "string") return [];

  const rewrittenHtml = rewriteBackendUrlsInHtml(html);
  const matches = Array.from(rewrittenHtml.matchAll(/<img\b[^>]*fetchpriority=(["'])high\1[^>]*>/gi));

  return matches.slice(0, 2).map((match) => {
    const tag = match[0];
    const getAttribute = (name) =>
      tag.match(new RegExp(`\\s${name}\\s*=\\s*(["'])(.*?)\\1`, "i"))?.[2] || "";

    return {
      href: getAttribute("src"),
      imageSrcSet: getAttribute("srcset"),
      imageSizes: getAttribute("sizes"),
    };
  }).filter((image) => image.href);
}

export function getLcpImagePreload(html) {
  if (!html || typeof html !== "string") return "";

  const rewrittenHtml = rewriteBackendUrlsInHtml(html);
  const coverMatch = rewrittenHtml.match(/<div\b[^>]*class=(["'])[^"']*wp-block-cover[^"']*\1[\s\S]*?<\/div>\s*<\/div>/i);
  const coverHtml = coverMatch?.[0] || rewrittenHtml;
  const images = Array.from(coverHtml.matchAll(/<img\b[^>]*fetchpriority=(["'])high\1[^>]*>/gi));
  const match = images.at(-1);
  const tag = match?.[0] || "";

  return tag.match(/\ssrc\s*=\s*(["'])(.*?)\1/i)?.[2] || "";
}

export function rewriteBackendUrlsInHtml(html) {
  if (!html || typeof html !== "string") return "";

  const rewrittenHtml = html
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

  return optimizeAboveFoldMedia(rewrittenHtml);
}
