import { getTemplatePart } from "@/src/lib/wordpress-server";
import WordpressContent from "@/src/lib/WordpressContent";

export default async function Footer() {
    const footer = await getTemplatePart('footer');

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
        <WordpressContent as="footer" className="" content={footer.html} />
    </>;
}
