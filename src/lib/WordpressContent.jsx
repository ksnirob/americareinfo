"use client";

import { useRouter } from "next/navigation";
import { convertBackendUrlToFrontendRoute } from "./wordpress";

export default function WordpressContent({ content }) {
  const router = useRouter();
  const convertedContent =
    typeof content === "string"
      ? content.replace(
          /(\bhref\s*=\s*)(["'])(.*?)\2/gi,
          (match, attribute, quote, url) =>
            `${attribute}${quote}${convertBackendUrlToFrontendRoute(url)}${quote}`,
        )
      : "";

  function handleNavigation(event) {
    const link = event.target.closest("a");

    if (!link || link.target === "_blank") return;

    const url = new URL(link.href);

    if (url.origin !== window.location.origin) return;

    event.preventDefault();
    router.push(url.pathname + url.search + url.hash);
  }

  return (
    <div
      className="wp-content"
      onClick={handleNavigation}
      dangerouslySetInnerHTML={{ __html: convertedContent }}
    />
  );
}
