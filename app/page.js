import {
  getPageBySlug,  
} from "@/src/lib/wordpress-server";
import WordpressContent from "@/src/lib/WordpressContent";

export default async function HomePage() {

  // **NEW UPDATE** Request home page generated CSS with the home slug.
  const [page] = await Promise.all([
    getPageBySlug("home"),
  ]);

  if (!page) {
    return <h1>Home page not found</h1>;
  }

  return (
    <div>
      <main>
        <WordpressContent content={page.content.rendered} />
      </main>
    </div>
  );
}
