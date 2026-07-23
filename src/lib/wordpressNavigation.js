function getNavigationContainer(target) {
  return target.closest(".wp-block-navigation");
}

function getResponsiveMenu(target) {
  return target.closest(".wp-block-navigation__responsive-container");
}

function getSubmenuPanel(item) {
  return item.querySelector(":scope > .wp-block-navigation__submenu-container");
}

function updateMenuAlignment(menu) {
  const dialog = menu?.querySelector(".wp-block-navigation__responsive-dialog");
  const content = menu?.querySelector(
    ".wp-block-navigation__responsive-container-content",
  );

  if (!dialog || !content) return;

  const availableHeight = menu.clientHeight;
  const contentHeight = content.scrollHeight;
  const shouldCenter = contentHeight + 132 <= availableHeight;
  const alignment = shouldCenter ? "center" : "flex-start";

  dialog.style.alignItems = alignment;
  dialog.style.justifyContent = alignment;
}

function setPanelHeight(panel, value) {
  panel.style.setProperty("height", value, "important");
  panel.style.setProperty("max-height", "none", "important");
}

function setPanelOpenLayout(panel, open) {
  panel.style.setProperty("display", "flex", "important");
  panel.style.setProperty("flex-basis", "100%", "important");
  panel.style.setProperty("flex-direction", "column", "important");
  panel.style.setProperty("align-items", "center", "important");
  panel.style.setProperty("justify-content", "flex-start", "important");
  panel.style.setProperty("gap", "8px", "important");
  panel.style.setProperty("width", "min(240px, 100%)", "important");
  panel.style.setProperty("min-width", "0", "important");
  panel.style.setProperty("position", "static", "important");
  panel.style.setProperty("background", "transparent", "important");
  panel.style.setProperty("margin-right", "auto", "important");
  panel.style.setProperty("margin-left", "auto", "important");
  panel.style.setProperty("padding-right", "0", "important");
  panel.style.setProperty("padding-left", "0", "important");
  panel.style.setProperty("border-top-style", "solid", "important");
  panel.style.setProperty("border-top-color", "#f8971c", "important");

  if (open) {
    panel.style.setProperty("margin-top", "12px", "important");
    panel.style.setProperty("padding-top", "16px", "important");
    panel.style.setProperty("border-top-width", "1px", "important");
  } else {
    panel.style.setProperty("margin-top", "0", "important");
    panel.style.setProperty("padding-top", "0", "important");
    panel.style.setProperty("border-top-width", "0", "important");
  }
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
    item.style.setProperty("flex-wrap", "wrap", "important");
    item.style.setProperty("align-items", "center", "important");
    item.style.setProperty("justify-content", "center", "important");
    setPanelOpenLayout(panel, false);
    setPanelHeight(panel, "0px");
    panel.style.opacity = "0";

    window.requestAnimationFrame(() => {
      setPanelOpenLayout(panel, true);
      setPanelHeight(panel, `${panel.scrollHeight}px`);
      panel.style.opacity = "1";
    });

    panel.aciAnimationTimer = window.setTimeout(() => {
      setPanelHeight(panel, `${panel.scrollHeight}px`);
      updateMenuAlignment(getResponsiveMenu(panel));
    }, 470);

    return;
  }

  setPanelHeight(panel, `${panel.scrollHeight}px`);
  setPanelOpenLayout(panel, true);
  panel.style.opacity = "1";

  panel.offsetHeight;
  toggle.setAttribute("aria-expanded", "false");

  window.requestAnimationFrame(() => {
    setPanelOpenLayout(panel, false);
    setPanelHeight(panel, "0px");
    panel.style.opacity = "0";
    window.setTimeout(() => updateMenuAlignment(getResponsiveMenu(panel)), 470);
  });
}

export function openNavigationMenu(target) {
  const navigation = getNavigationContainer(target);
  const menu = navigation?.querySelector(
    ".wp-block-navigation__responsive-container",
  );
  const closeWrapper = menu?.querySelector(
    ".wp-block-navigation__responsive-close",
  );
  const dialog = menu?.querySelector(".wp-block-navigation__responsive-dialog");

  if (!menu) return false;

  menu.classList.add("is-menu-open", "has-modal-open");
  menu.style.overflowX = "hidden";
  menu.style.overflowY = "auto";
  menu.style.scrollbarGutter = "auto";

  if (closeWrapper) {
    closeWrapper.style.minHeight = "100%";
  }

  if (dialog) {
    dialog.style.minHeight = "100%";
  }

  window.requestAnimationFrame(() => updateMenuAlignment(menu));

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
