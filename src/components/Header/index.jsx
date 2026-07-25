import { getTemplatePart } from "@/src/lib/wordpress-server";
import { resolveWordPressSitePath } from "@/src/lib/wordpress-server";
import WordpressContent from "@/src/lib/WordpressContent";
import { headers } from "next/headers";

export default async function Footer() {
    const requestHeaders = await headers();
    const sitePath = await resolveWordPressSitePath(requestHeaders.get("x-pathname") || "");
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
