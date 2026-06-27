import "server-only";

import { unstable_cache } from "next/cache";

const API_URL = process.env.WORDPRESS_API_URL?.replace(/\/+$/, "");
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(/\/+$/, "");
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");

// function rewriteWordPressAssetUrls(css) {
//   if (!css || !WORDPRESS_URL) return css || "";

//   const frontendContentPath = SITE_URL ? `${SITE_URL}/wp-content/` : "/wp-content/";

//   return css.replaceAll(`${WORDPRESS_URL}/wp-content/`, frontendContentPath);
// }

 
function rewriteWordPressLinks(html) {
  if (!html || !WORDPRESS_URL || !SITE_URL) return html || "";
 
  return html.replace(
    /(\bhref\s*=\s*)(["'])(.*?)\2/gi,
    (match, attribute, quote, url) => {
      if (!url.startsWith(WORDPRESS_URL)) return match;
 
      return `${attribute}${quote}${url.replace(WORDPRESS_URL, SITE_URL)}${quote}`;
    },
  );
}

export const getCachedWordPressData = unstable_cache(
  async (endpoint) => {
    const response = await fetch(`${API_URL}/${endpoint}`);

    if (!response.ok) throw new Error("WordPress request failed");

    return response.json();
  },
  ["wordpress-api"],
  { revalidate: 3600, tags: ["wordpress"] },
);

export async function getPageBySlug(slug) {
  const pages = await getCachedWordPressData(
    `pages?slug=${encodeURIComponent(slug)}&_embed`,
  );

  return pages[0] ?? null;
}


export async function getHeader() {
  try {
    // **NEW UPDATE** Cache header HTML so WordPress is not hit on every request.
    const res = await fetch(
      `${WORDPRESS_URL}/wp-json/aci/v1/header`,
      { next: { revalidate: 300, tags: ["wordpress-header"] } }
    );

    if (!res.ok) return null;

    const header = await res.json();

    return {
      ...header,
      html: rewriteWordPressLinks(header?.html),
    };
  } catch {
    return null;
  }
}


export async function getTemplatePart( template ) {
  try {
    // **NEW UPDATE** Cache header HTML so WordPress is not hit on every request.
    const res = await fetch(
      `${WORDPRESS_URL}/wp-json/aci/v1/template-part?includeStyles=true&name=${template}`,
      { next: { revalidate: 300, tags: ["wordpress-header"] } }
    );

    if (!res.ok) return null;

    const response = await res.json();

    return {
      ...response,
      html: rewriteWordPressLinks(response?.html),
    };
  } catch {
    return null;
  }
}



// export async function getWordPressStyles() {
//   try {
//     // **NEW UPDATE** Cache the heavy global styles API response.
//     const res = await fetch(
//       `${WORDPRESS_URL}/wp-json/aci/v1/styles`,
//       { next: { revalidate: 3600, tags: ["wordpress-styles"] } }
//     );

//     if (!res.ok) {
//       return { css: "", sources: [] };
//     }

//     const data = await res.json();

//     return {
//       css: data.css || "",
//       sources: Array.isArray(data.sources) ? data.sources : [],
//     };
//   } catch {
//     return { css: "", sources: [] };
//   }
// }

// export async function getWordPressFontFaces() {
//   try {
//     // **NEW UPDATE** Keep font-face extraction, but cache it to avoid slowing every request.
//     const res = await fetch(`${WORDPRESS_URL}`, {
//       next: { revalidate: 3600, tags: ["wordpress-fonts"] },
//     });

//     if (!res.ok) return "";

//     const html = await res.text();

//     // FIXED: multi-line safe font extraction
//     const fonts = html.match(/@font-face\s*{[\s\S]*?}/g) || [];

//     return rewriteWordPressAssetUrls(fonts.join("\n"));
//   } catch {
//     return "";
//   }
// }

// export async function getWordPressPageStyles(slug = "") {
//   if (!WORDPRESS_URL) return "";

//   // **NEW UPDATE** Fetch pageCss from the custom styles API instead of scraping rendered HTML.
//   const cleanSlug = String(slug).replace(/^\/+|\/+$/g, "");
//   const stylesUrl = new URL(`${WORDPRESS_URL}/wp-json/aci/v1/styles`);

//   if (cleanSlug) {
//     stylesUrl.searchParams.set("slug", cleanSlug);
//   }

//   try {
//     // **NEW UPDATE** Cache page-generated styles by slug for faster repeated loads.
//     const res = await fetch(stylesUrl, {
//       next: { revalidate: 300, tags: ["wordpress-page-styles"] },
//     });

//     if (!res.ok) return "";

//     const data = await res.json();

//     return rewriteWordPressAssetUrls(data.pageCss || "");
//   } catch {
//     return "";
//   }
// }
