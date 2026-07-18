// https://your-site.com/api/revalidate?secret=your-long-random-secret-here
/**
 * Revalidate WordPress unstable_cache by browsing:
 *
 * https://your-site.com/api/revalidate?secret=your-long-random-secret-here
 */
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { WORDPRESS_CACHE_TAG } from "@/src/lib/wordpress-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const configuredSecret = process.env.NEXT_REVALIDATE_SECRET;

  if (!configuredSecret) {
    return NextResponse.json(
      {
        revalidated: false,
        message: "NEXT_REVALIDATE_SECRET is not configured.",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const url = new URL(request.url);
  const providedSecret = url.searchParams.get("secret");

  if (providedSecret !== configuredSecret) {
    return NextResponse.json(
      {
        revalidated: false,
        message: "Invalid revalidation secret.",
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  revalidateTag(WORDPRESS_CACHE_TAG);

  return NextResponse.json(
    {
      revalidated: true,
      message: "WordPress cache revalidated successfully.",
      tag: WORDPRESS_CACHE_TAG,
      now: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
