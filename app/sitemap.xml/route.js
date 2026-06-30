import { GET as getRankMathSitemap } from "@/app/api/rankmath-sitemap/[file]/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  return getRankMathSitemap(request, {
    params: Promise.resolve({ file: "sitemap_index.xml" }),
  });
}
