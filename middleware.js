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

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
