import { getTemplatePart } from "@/src/lib/wordpress-server";
import WordpressContent from "@/src/lib/WordpressContent";

export default async function Footer() {
    const header = await getTemplatePart('header');

    if (!header) {
        return null;
    }

    return <>
        {header?.blockSupportCss && (
            <style
                id={`wp-${header.name}-block-support-css`}
                dangerouslySetInnerHTML={{
                __html: header.blockSupportCss,
                }}
            />
        )}
        <WordpressContent as="header" className="" content={header.html} />
    </>;
}
