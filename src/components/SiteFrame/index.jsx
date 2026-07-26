import Header from "@/src/components/Header";
import Footer from "@/src/components/Footer";
import { getHeadlessCssHref } from "@/src/lib/wordpress-server";

export default async function SiteFrame({ children, sitePath = "" }) {
  const stylesheetHref = await getHeadlessCssHref(sitePath);

  return (
    <>
      {stylesheetHref ? <link rel="stylesheet" href={stylesheetHref} /> : null}
      <Header sitePath={sitePath} />
      <main className="site-main">{children}</main>
      <Footer sitePath={sitePath} />
    </>
  );
}
