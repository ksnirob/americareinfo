import {
  getPageBySlug,  
} from "@/src/lib/wordpress-server";
import WordpressContent from "@/src/lib/WordpressContent";
import { getRankMathMetadata } from "@/src/utils/getRankMathMetadata";

export async function generateMetadata() {
  return getRankMathMetadata("/");
}

export default async function HomePage() {

  const [page] = await Promise.all([
    getPageBySlug("home"),
  ]);

  if (!page) {
    return <h1>Home page not found</h1>;
  }

  return <WordpressContent content={page.content.rendered} />;
}
