import { getHeadlessCssResponse } from "@/src/lib/headless-css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request, { params }) {
  const { site } = await params;

  return getHeadlessCssResponse(site);
}
