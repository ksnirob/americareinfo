import {
  getPageBySlug,
  getWordPressPathWithoutSite,
  resolveWordPressSitePath,
} from "@/src/lib/wordpress-server";
import WordpressContent from "@/src/lib/WordpressContent";
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

  return (
    <>
      {/* Page Content */}
      <WordpressContent content={page.content.rendered} />

    </>
  );
}
