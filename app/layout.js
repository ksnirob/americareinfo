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
        {stylesheetHref && <link rel="stylesheet" href={stylesheetHref} />}
      </head>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
