import "../src/scss/global.scss";

import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";
import { headers } from "next/headers";
import { resolveWordPressSitePath } from "@/src/lib/wordpress-server";

export const metadata = {
  title: "My Headless WordPress Site",
  description: "Next.js + WordPress Headless CMS",
};

export default async function RootLayout({ children }) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname") || "/";
  const firstPathSegment = pathname
    .replace(/^\/+/, "")
    .split("/")[0];
  const sitePath = await resolveWordPressSitePath(firstPathSegment);
  const stylesheetHref = sitePath
    ? `/${sitePath}/wp-json/aci/v1/headless-css`
    : "/wp-json/aci/v1/headless-css";

  return (
    <html lang="en">
      <head>
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
