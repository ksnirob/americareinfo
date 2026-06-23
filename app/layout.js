import Header from "../src/components/Header";
/// import Footer from "@/components/Footer";
import {
  getWordPressFontFaces,
  getWordPressStyles,
} from "@/src/lib/wordpress-server";
import "../src/scss/global.scss";


export const metadata = {
  title: "My Headless WordPress Site",
  description: "Next.js + WordPress Headless CMS",
};

export default async function RootLayout({ children }) {
  const [fontFaces, wordpressStyles] = await Promise.all([
    getWordPressFontFaces(),
    getWordPressStyles(),
  ]);

  return (
    <html lang="en">
      <head>
        {wordpressStyles.urls.map((url) => (
          <link key={url} rel="stylesheet" href={url} />
        ))}

        <style
          id="wordpress-styles"
          dangerouslySetInnerHTML={{
            __html: `${fontFaces}\n${wordpressStyles.css}`,
          }}
        />
      </head>
      <body>
        {/* Site Header */}
        <Header />

        {/* Page Content */}
        <main>{children}</main>

        {/* Site Footer */}
        {/* <Footer /> */}
      </body>
    </html>
  );
}
