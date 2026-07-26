import { proxyWordPressAsset } from "@/src/lib/wordpress-assets";

export async function GET(request, { params }) {
  const { path, site } = await params;

  return proxyWordPressAsset(request, path, site);
}

export async function HEAD(request, { params }) {
  const { path, site } = await params;

  return proxyWordPressAsset(request, path, site);
}
