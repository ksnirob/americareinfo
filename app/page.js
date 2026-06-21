import { getPageBySlug } from "@/src/lib/wordpress-server";
import WordpressContent from "@/src/lib/WordpressContent";

export default async function HomePage() {

  const page = await getPageBySlug("home");

  if (!page) {
    return <h1>Home page not found</h1>;
  }

  return (
    <div>
      <h1>{page.title.rendered}</h1>
      <main>
        <WordpressContent content={page.content.rendered} />
      </main>
    </div>
  );
}
