"use client";

import { useEffect } from "react";

export function useWordPressVideos(containerRef, contentKey) {
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    const videos = Array.from(container.querySelectorAll("video"));

    videos.forEach((video) => {
      video.load();

      if (!video.hasAttribute("autoplay")) return;

      video.muted = true;
      video.playsInline = true;

      const playPromise = video.play();

      if (playPromise?.catch) {
        playPromise.catch(() => {});
      }
    });
  }, [containerRef, contentKey]);
}
