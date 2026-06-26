import {
  getPageBySlug,
  getWordPressPageStyles,
} from "@/src/lib/wordpress-server";
import WordpressContent from "@/src/lib/WordpressContent";

export default async function HomePage() {

  // **NEW UPDATE** Request home page generated CSS with the home slug.
  const [page, pageStyles] = await Promise.all([
    getPageBySlug("home"),
    getWordPressPageStyles("home"),
  ]);

  if (!page) {
    return <h1>Home page not found</h1>;
  }

  return (
    <div>
      {pageStyles && (
        // **NEW UPDATE** Inject page-specific generated WordPress CSS.
        <style
          id="wp-page-styles"
          dangerouslySetInnerHTML={{ __html: pageStyles }}
        />
      )}

      <main>
        <WordpressContent content={page.content.rendered} />
      </main>
    </div>
  );
}
