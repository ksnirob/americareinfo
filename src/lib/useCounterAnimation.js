"use client";

import { useEffect } from "react";

function getCounterParts(text) {
  const match = text.match(/^(\D*?)([\d,]+)(.*)$/);

  if (!match) return null;

  const [, prefix, number, suffix] = match;
  const value = Number(number.replace(/,/g, ""));

  if (!Number.isFinite(value)) return null;

  return { prefix, value, suffix };
}

function formatCounterValue(value, parts) {
  return `${parts.prefix}${Math.round(value).toLocaleString()}${parts.suffix}`;
}

function animateCounter(counter) {
  if (counter.dataset.counterAnimated === "true") return;

  const parts = getCounterParts(counter.textContent.trim());

  if (!parts) return;

  counter.dataset.counterAnimated = "true";

  const duration = 1600;
  const start = performance.now();
  const from = parts.value > 1 ? 1 : 0;

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = 1 - (1 - progress) ** 3;
    const currentValue = from + (parts.value - from) * easedProgress;

    counter.textContent = formatCounterValue(currentValue, parts);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      counter.textContent = formatCounterValue(parts.value, parts);
    }
  }

  counter.textContent = formatCounterValue(from, parts);
  requestAnimationFrame(tick);
}

export function useCounterAnimation(rootRef, contentKey) {
  useEffect(() => {
    const root = rootRef.current;

    if (!root) return undefined;

    const counters = root.querySelectorAll(".counter-animation");

    if (!counters.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 },
    );

    counters.forEach((counter) => observer.observe(counter));

    return () => observer.disconnect();
  }, [rootRef, contentKey]);
}
