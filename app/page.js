import {
  getPageBySlug,  
} from "@/src/lib/wordpress-server";
import SiteFrame from "@/src/components/SiteFrame";
import WordpressContent from "@/src/lib/WordpressContent";
import { getPriorityImagePreloads } from "@/src/lib/wordpress";
import { getRankMathMetadata } from "@/src/utils/getRankMathMetadata";

export const revalidate = 86400;

export async function generateMetadata() {
  return getRankMathMetadata("/");
}

export default async function HomePage() {

  const [page] = await Promise.all([
    getPageBySlug("home"),
  ]);

  if (!page) {
    return (
      <SiteFrame>
        <h1>Home page not found</h1>
      </SiteFrame>
    );
  }

  const lcpImage = getPriorityImagePreloads(page.content.rendered).at(-1);

  return (
    <SiteFrame>
      {lcpImage ? (
        <link
          rel="preload"
          as="image"
          href={lcpImage.href}
          imageSrcSet={lcpImage.imageSrcSet || undefined}
          imageSizes={lcpImage.imageSizes || undefined}
          fetchPriority="high"
        />
      ) : null}
      <WordpressContent content={page.content.rendered} />
    </SiteFrame>
  );
}
