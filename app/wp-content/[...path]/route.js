import { proxyWordPressAsset } from "@/src/lib/wordpress-assets";

export async function GET(request, { params }) {
  const { path } = await params;

  return proxyWordPressAsset(request, path);
}

export async function HEAD(request, { params }) {
  const { path } = await params;

  return proxyWordPressAsset(request, path);
}
