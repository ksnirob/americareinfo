import {
  getPageBySlug,
  getWordPressPathWithoutSite,
  resolveWordPressSitePath,
} from "@/src/lib/wordpress-server";
import WordpressContent from "@/src/lib/WordpressContent";
import { getLcpImagePreload } from "@/src/lib/wordpress";
import { getRankMathMetadata } from "@/src/utils/getRankMathMetadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const path = `/${slug.join("/")}`;

  return getRankMathMetadata(path);
}

export default async function DynamicPage({ params }) {

  const { slug } = await params;
  const path = slug.join("/");
  const sitePath = await resolveWordPressSitePath(path);
  const pageSlug = getWordPressPathWithoutSite(path, sitePath) || "home";

  const [page] = await Promise.all([
    getPageBySlug(pageSlug, sitePath)
  ]);

  if (!page) {
    return <h1>Page not found</h1>;
  }

  const lcpImage = pageSlug === "home" ? getLcpImagePreload(page.content.rendered) : "";

  return (
    <>
      {lcpImage ? (
        <link rel="preload" as="image" href={lcpImage} fetchPriority="high" />
      ) : null}
      <WordpressContent content={page.content.rendered} />

    </>
  );
}
