import "../src/scss/global.scss";

import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";
import { resolveWordPressSitePath } from "@/src/lib/wordpress-server";
import { headers } from "next/headers";

export const metadata = {
  title: "My Headless WordPress Site",
  description: "Next.js + WordPress Headless CMS",
};

export default async function RootLayout({ children }) {
  const requestHeaders = await headers();
  const sitePath = await resolveWordPressSitePath(
    requestHeaders.get("x-pathname") || "",
  );
  const stylesheetHref = `/api/wordpress-css${sitePath ? `?site=${sitePath}` : ""}`;

  return (
    <html lang="en">
      <head> 
        <link
          rel="stylesheet"
          href={stylesheetHref}
        />
      </head>

      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
