"use client";

import { useEffect } from "react";

export function useWordPressVideos(containerRef, contentKey) {
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const videos = Array.from(container.querySelectorAll("video"));

    videos.forEach((video) => {
      const deferredSrc = video.dataset.wpVideoSrc;

      const loadVideo = () => {
        if (deferredSrc && !video.getAttribute("src")) {
          video.setAttribute("src", deferredSrc);
        }

        video.load();

        if (!video.hasAttribute("autoplay")) return;

        video.muted = true;
        video.playsInline = true;

        const playPromise = video.play();

        if (playPromise?.catch) {
          playPromise.catch(() => {});
        }
      };

      if (!deferredSrc) {
        loadVideo();
        return;
      }

      const idleCallback = window.requestIdleCallback || ((callback) => setTimeout(callback, 1800));
      const idleId = idleCallback(loadVideo, { timeout: 2500 });

      if (window.cancelIdleCallback) {
        video.dataset.wpVideoIdleId = String(idleId);
      }
    });
  }, [containerRef, contentKey]);
}
