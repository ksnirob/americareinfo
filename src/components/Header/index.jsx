import { getTemplatePart } from "@/src/lib/wordpress-server";
import WordpressContent from "@/src/lib/WordpressContent";

export default async function Header({ sitePath = "" }) {
    const header = await getTemplatePart('header', sitePath);

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
        <WordpressContent as="header" className="wp-block-template-part" content={header.html} />
    </>;
}
