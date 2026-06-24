"use client";

import { useRouter } from "next/navigation";
import { convertBackendUrlToFrontendRoute } from "./wordpress";

export default function WordpressContent({
  content,
  as: Component = "div",
  className = "wp-content",
}) {
  const router = useRouter();
  const convertedContent =
    typeof content === "string"
      ? content.replace(
          /(\bhref\s*=\s*)(["'])(.*?)\2/gi,
          (match, attribute, quote, url) =>
            `${attribute}${quote}${convertBackendUrlToFrontendRoute(url)}${quote}`,
        )
      : "";

  function getInternalUrl(event) {
    const link = event.target.closest("a");

    if (!link || link.target === "_blank") return null;

    const url = new URL(link.href);

    if (url.origin !== window.location.origin) return null;

    return url;
  }

  function prefetchNavigation(event) {
    const url = getInternalUrl(event);

    if (!url) return;

    router.prefetch(url.pathname + url.search + url.hash);
  }

  function handleNavigation(event) {
    const url = getInternalUrl(event);

    if (!url) return;

    event.preventDefault();
    router.push(url.pathname + url.search + url.hash);
  }

  return (
    <Component
      className={className}
      onClick={handleNavigation}
      onMouseOver={prefetchNavigation}
      dangerouslySetInnerHTML={{ __html: convertedContent }}
    />
  );
}
