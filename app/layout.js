import "../src/scss/global.scss";

import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";
import { headers } from "next/headers";

export const metadata = {
  title: "My Headless WordPress Site",
  description: "Next.js + WordPress Headless CMS",
};

export default async function RootLayout({ children }) {
  const requestHeaders = await headers();
  const firstPathSegment = (requestHeaders.get("x-pathname") || "")
    .replace(/^\/+/, "")
    .split("/")[0];
  const stylesheetHref = `/wp-json/aci/v1/headless-css${firstPathSegment ? `?site=${firstPathSegment}` : ""}`;

  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/wp-content/uploads/fonts/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsiH0C4iY1M2xLER.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/wp-content/uploads/fonts/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0C4iY1M2xLER.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/wp-content/uploads/fonts/avenir-regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/wp-content/uploads/fonts/avenir-medium.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/wp-content/uploads/fonts/avenir-black.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/wp-content/uploads/fonts/avenir-heavy.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        {stylesheetHref && <link rel="stylesheet" href={stylesheetHref} />}
      </head>
      <body>
        <Header />
        <main className="site-main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

