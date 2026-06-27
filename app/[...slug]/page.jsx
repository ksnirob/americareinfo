import {
  getPageBySlug,
} from "@/src/lib/wordpress-server";
import WordpressContent from "@/src/lib/WordpressContent";

export default async function DynamicPage({ params }) {

  const { slug } = await params;
  const pageSlug = slug.join("/");

  const [page] = await Promise.all([
    getPageBySlug(pageSlug)
  ]);

  if (!page) {
    return <h1>Page not found</h1>;
  }

  return (
    <div>
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
