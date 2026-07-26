import { getTemplatePart } from "@/src/lib/wordpress-server";
import WordpressContent from "@/src/lib/WordpressContent";

export default async function Footer({ sitePath = "" }) {
    const footer = await getTemplatePart('footer', sitePath);

    if (!footer) {
        return null;
    }

    return <>
        {footer?.blockSupportCss && (
            <style
                id={`wp-${footer.name}-block-support-css`}
                dangerouslySetInnerHTML={{
                __html: footer.blockSupportCss,
                }}
            />
        )}
        <WordpressContent
            as="div"
            className="wp-block-template-part-wrapper"
            content={footer.html}
        />
    </>;
}
