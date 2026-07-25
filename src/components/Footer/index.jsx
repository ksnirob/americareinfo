import { getTemplatePart } from "@/src/lib/wordpress-server";
import { resolveWordPressSitePath } from "@/src/lib/wordpress-server";
import WordpressContent from "@/src/lib/WordpressContent";
import { headers } from "next/headers";

export default async function Footer() {
    const requestHeaders = await headers();
    const sitePath = await resolveWordPressSitePath(requestHeaders.get("x-pathname") || "");
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
        <WordpressContent as="footer" className="" content={footer.html} />
    </>;
}
