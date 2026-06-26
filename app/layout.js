import "../src/scss/global.scss";

import Header from "@/src/components/Header";
import {
  getWordPressFontFaces,
  getWordPressStyles,
} from "@/src/lib/wordpress-server";

export const metadata = {
  title: "My Headless WordPress Site",
  description: "Next.js + WordPress Headless CMS",
};

export default async function RootLayout({ children }) {
  // **NEW UPDATE** Load WordPress font-face CSS and global styles with cached server fetches.
  const [fontFaces, wordpressStyles] = await Promise.all([
    getWordPressFontFaces(),
    getWordPressStyles(),
  ]);

  const sources = wordpressStyles?.sources || [];

  const cssFiles = [
    ...new Set(
      sources
        .filter((item) => item?.type === "file" && item?.url)
        .map((item) => item.url)
    ),
  ];

  return (
    <html lang="en">
      <head>

                {/* <link
                  rel="stylesheet"
                  href={`http://localhost/wordpress/wp-content/uploads/wp-headless.css`}
                /> */}
        {/* =========================
            1. WORDPRESS CSS FIRST
        ========================= */}
        {/* {cssFiles.map((url) => (
          <link key={url} rel="stylesheet" href={url} />
        ))} */}

        {/* =========================
            2. WORDPRESS INLINE CSS
        ========================= */}
        {(fontFaces || wordpressStyles?.css) && (
          // **NEW UPDATE** Inject WordPress font faces + global CSS into the document head.
          <style
            id="wp-inline"
            dangerouslySetInnerHTML={{
              __html: `${fontFaces || ""}\n${wordpressStyles?.css || ""}`,
            }}
          />
        )}
      </head>

      <body>
        <Header />

        <main>{children}</main>
      </body>
    </html>
  );
}
