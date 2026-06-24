import {
  getPageBySlug,
  getWordPressPageStyles,
} from "@/src/lib/wordpress-server";
import WordpressContent from "@/src/lib/WordpressContent";

export default async function DynamicPage({ params }) {

  const { slug } = await params;
  const pageSlug = slug.join("/");

  const [page, pageStyles] = await Promise.all([
    getPageBySlug(pageSlug),
    getWordPressPageStyles(pageSlug),
  ]);

  if (!page) {
    return <h1>Page not found</h1>;
  }

  return (
    <div>
      {pageStyles && (
        <style
          id="wp-page-styles"
          dangerouslySetInnerHTML={{ __html: pageStyles }}
        />
      )}

      {/* Page Title */}
      <h1
        dangerouslySetInnerHTML={{
          __html: page.title.rendered,
        }}
      />

      {/* Page Content */}
      <WordpressContent content={page.content.rendered} />

    </div>
  );
}
