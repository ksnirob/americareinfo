import "../src/scss/global.scss";

import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";

export const metadata = {
  title: "My Headless WordPress Site",
  description: "Next.js + WordPress Headless CMS",
};

export default async function RootLayout({ children }) {
  // **NEW UPDATE** Load WordPress font-face CSS and global styles with cached server fetches.
  
  // const cssFiles = [
  //   ...new Set(
  //     sources
  //       .filter((item) => item?.type === "file" && item?.url)
  //       .map((item) => item.url)
  //   ),
  // ];

  

  return (
    <html lang="en">
      <head> 

                <link
                  rel="stylesheet"
                  href={`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp-content/uploads/headless-css/style.css`}
                />

                {/* <link
                  rel="stylesheet"
                  href={`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp-content/uploads/wp-headless.css?v=1782580206`}
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
        
      </head>

      <body>
        <Header />

        <main>{children}</main>

        <Footer />
      </body>
    </html>
  );
}
