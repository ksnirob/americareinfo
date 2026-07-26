import { NextResponse } from "next/server";

const SITEMAP_REGEX =
  /^\/(?:sitemap_index|[A-Za-z0-9_-]+-sitemap(?:[0-9]+)?)\.xml$/;

export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/sitemap.xml") {
    const url = request.nextUrl.clone();
    url.pathname = "/sitemap_index.xml";
    url.search = "";

    return NextResponse.redirect(url, 301);
  }

  if (SITEMAP_REGEX.test(pathname)) {
    const file = pathname.slice(1);
    const url = request.nextUrl.clone();
    url.pathname = `/api/rankmath-sitemap/${file}`;
    url.search = "";

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|wp-content|wp-json|favicon.ico|images).*)",
  ],
};
