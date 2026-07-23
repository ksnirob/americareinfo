function getNavigationContainer(target) {
  return target.closest(".wp-block-navigation");
}

function getResponsiveMenu(target) {
  return target.closest(".wp-block-navigation__responsive-container");
}

function getSubmenuPanel(item) {
  return item.querySelector(":scope > .wp-block-navigation__submenu-container");
}

function setPanelHeight(panel, value) {
  panel.style.setProperty("height", value, "important");
  panel.style.setProperty("max-height", "none", "important");
}

function animateSubmenu(item, toggle, open) {
  const panel = getSubmenuPanel(item);

  if (!panel) {
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    return;
  }

  window.clearTimeout(panel.aciAnimationTimer);
  panel.style.boxSizing = "border-box";
  panel.style.setProperty("overflow", "hidden", "important");
  panel.style.transition =
    "height 0.45s ease, opacity 0.3s ease, padding-top 0.35s ease, margin-top 0.35s ease, border-top-width 0.35s ease";

  if (open) {
    toggle.setAttribute("aria-expanded", "true");
    setPanelHeight(panel, "0px");
    panel.style.opacity = "0";

    window.requestAnimationFrame(() => {
      setPanelHeight(panel, `${panel.scrollHeight}px`);
      panel.style.opacity = "1";
    });

    panel.aciAnimationTimer = window.setTimeout(() => {
      setPanelHeight(panel, `${panel.scrollHeight}px`);
    }, 470);

    return;
  }

  setPanelHeight(panel, `${panel.scrollHeight}px`);
  panel.style.opacity = "1";

  panel.offsetHeight;
  toggle.setAttribute("aria-expanded", "false");

  window.requestAnimationFrame(() => {
    setPanelHeight(panel, "0px");
    panel.style.opacity = "0";
  });
}

export function openNavigationMenu(target) {
  const navigation = getNavigationContainer(target);
  const menu = navigation?.querySelector(
    ".wp-block-navigation__responsive-container",
  );

  if (!menu) return false;

  menu.classList.add("is-menu-open", "has-modal-open");
  menu.style.overflowX = "hidden";
  menu.style.overflowY = "auto";
  menu.style.scrollbarGutter = "auto";
  document.documentElement.classList.add("has-modal-open");
  document.body.classList.add("has-modal-open");

  return true;
}

export function closeNavigationMenu(target) {
  const menu = getResponsiveMenu(target);
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

export function toggleSubmenu(target) {
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
  const menu = getResponsiveMenu(item);

  if (!isOpen) {
    menu
      ?.querySelectorAll(
        ".wp-block-navigation-submenu__toggle[aria-expanded='true']",
      )
      .forEach((openToggle) => {
        if (openToggle === toggle) return;

        const openItem = openToggle.closest(".wp-block-navigation-submenu");

        if (openItem) {
          animateSubmenu(openItem, openToggle, false);
        } else {
          openToggle.setAttribute("aria-expanded", "false");
        }
      });
  }

  animateSubmenu(item, toggle, !isOpen);

  return true;
}

export function handleNavigationControl(event) {
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
