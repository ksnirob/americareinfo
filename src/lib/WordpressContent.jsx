"use client";

import { useRouter } from "next/navigation";
import { rewriteBackendUrlsInHtml } from "./wordpress";

export default function WordpressContent({
  content,
  as: Component = "div",
  className = "wp-content",
}) {
  const router = useRouter();
  const convertedContent =
    typeof content === "string" ? rewriteBackendUrlsInHtml(content) : "";

  function getNavigationContainer(target) {
    return target.closest(".wp-block-navigation");
  }

  function openNavigationMenu(target) {
    const navigation = getNavigationContainer(target);
    const menu = navigation?.querySelector(
      ".wp-block-navigation__responsive-container",
    );

    if (!menu) return false;

    menu.classList.add("is-menu-open", "has-modal-open");
    document.documentElement.classList.add("has-modal-open");
    document.body.classList.add("has-modal-open");

    return true;
  }

  function closeNavigationMenu(target) {
    const menu = target.closest(".wp-block-navigation__responsive-container");
    const navigation = getNavigationContainer(target);
    const menus = [
      ...(menu ? [menu] : []),
      ...(navigation
        ? navigation.querySelectorAll(".wp-block-navigation__responsive-container")
        : []),
    ];

    menus.forEach((responsiveMenu) => {
      responsiveMenu.classList.remove("is-menu-open", "has-modal-open");
      responsiveMenu
        .querySelectorAll(".wp-block-navigation-submenu__toggle")
        .forEach((toggle) => toggle.setAttribute("aria-expanded", "false"));
    });

    document.documentElement.classList.remove("has-modal-open");
    document.body.classList.remove("has-modal-open");

    return menus.length > 0;
  }

  function toggleSubmenu(target) {
    const trigger = target.closest(
      ".wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation-submenu > .wp-block-navigation-item__content, .wp-block-navigation__responsive-container.is-menu-open .wp-block-navigation-submenu > .wp-block-navigation-submenu__toggle",
    );

    if (!trigger) return false;

    const item = trigger.closest(".wp-block-navigation-submenu");
    const toggle = item?.querySelector(
      ":scope > .wp-block-navigation-submenu__toggle",
    );

    if (!toggle) return false;

    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    const menu = item.closest(".wp-block-navigation__responsive-container");

    if (!isOpen) {
      menu
        ?.querySelectorAll(
          ".wp-block-navigation-submenu__toggle[aria-expanded='true']",
        )
        .forEach((openToggle) => {
          if (openToggle !== toggle) {
            openToggle.setAttribute("aria-expanded", "false");
          }
        });
    }

    toggle.setAttribute("aria-expanded", isOpen ? "false" : "true");

    return true;
  }

  function handleNavigationControl(event) {
    const openButton = event.target.closest(
      ".wp-block-navigation__responsive-container-open",
    );

    if (openButton) {
      event.preventDefault();
      event.stopPropagation();
      return openNavigationMenu(openButton);
    }

    const closeButton = event.target.closest(
      ".wp-block-navigation__responsive-container-close",
    );

    if (closeButton) {
      event.preventDefault();
      event.stopPropagation();
      return closeNavigationMenu(closeButton);
    }

    if (toggleSubmenu(event.target)) {
      event.preventDefault();
      event.stopPropagation();
      return true;
    }

    return false;
  }

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
