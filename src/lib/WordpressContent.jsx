"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCounterAnimation } from "./useCounterAnimation";
import { useWordPressVideos } from "./useWordPressVideos";
import {
  closeDesktopSubmenus,
  closeNavigationMenu,
  handleNavigationControl,
} from "./wordpressNavigation";
import { rewriteBackendUrlsInHtml } from "./wordpress";

export default function WordpressContent({
  content,
  as: Component = "div",
  className = "wp-content",
}) {
  const router = useRouter();
  const contentRef = useRef(null);
  const convertedContent =
    typeof content === "string" ? rewriteBackendUrlsInHtml(content) : "";

  useCounterAnimation(contentRef, convertedContent);
  useWordPressVideos(contentRef, convertedContent);

  useEffect(() => {
    const container = contentRef.current;

    if (!container) return;

    const links = Array.from(container.querySelectorAll("a[href]"));
    const prefetchedUrls = new Set();

    links.forEach((link) => {
      const href = link.getAttribute("href");

      if (!href || href.startsWith("#") || link.target === "_blank") return;

      let url;

      try {
        url = new URL(href, window.location.origin);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      const route = url.pathname + url.search + url.hash;

      if (prefetchedUrls.has(route)) return;

      prefetchedUrls.add(route);
      router.prefetch(route);
    });
  }, [convertedContent, router]);

  function getInternalUrl(event) {
    const link = event.target.closest("a");

    if (!link || link.target === "_blank") return null;

    const href = link.getAttribute("href");

    if (!href || href.startsWith("#")) return null;

    let url;

    try {
      url = new URL(href, window.location.origin);
    } catch {
      return null;
    }

    if (url.origin !== window.location.origin) return null;

    return url;
  }

  function prefetchNavigation(event) {
    const url = getInternalUrl(event);

    if (!url) return;

    router.prefetch(url.pathname + url.search + url.hash);
  }

  function handleNavigation(event) {
    if (handleNavigationControl(event)) return;

    const url = getInternalUrl(event);

    if (!url) return;

    event.preventDefault();
    router.push(url.pathname + url.search + url.hash);
    closeNavigationMenu(event.target);
    closeDesktopSubmenus(event.target);
  }

  return (
    <Component
      ref={contentRef}
      className={className}
      onClick={handleNavigation}
      onMouseOver={prefetchNavigation}
      dangerouslySetInnerHTML={{ __html: convertedContent }}
    />
  );
}
