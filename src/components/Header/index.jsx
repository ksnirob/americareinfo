import { getHeader } from "@/src/lib/wordpress-server";
import WordpressContent from "@/src/lib/WordpressContent";

export default async function Header() {
    const header = await getHeader();

    if (!header) {
        return <h1>Header not found</h1>;
    }

    return <WordpressContent as="header" className="" content={header.html} />;
}
