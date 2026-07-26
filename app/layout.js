import "../src/scss/global.scss";

export const revalidate = 86400;

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
