import "../src/scss/global.scss";

export const revalidate = 86400;

export const metadata = {
  title: "My Headless WordPress Site",
  description: "Next.js + WordPress Headless CMS",
};

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
