import { getHeadlessCssResponse } from "@/src/lib/headless-css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  const sitePath = (request.nextUrl.searchParams.get("site") || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");

  return getHeadlessCssResponse(sitePath);
}
