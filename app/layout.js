import "../src/scss/global.scss";

import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";

export const metadata = {
  title: "My Headless WordPress Site",
  description: "Next.js + WordPress Headless CMS",
};

export default async function RootLayout({ children }) {

  return (
    <html lang="en">
      <head> 
        <link
          rel="stylesheet"
          href={`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp-content/uploads/headless-css/style.css`}
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
