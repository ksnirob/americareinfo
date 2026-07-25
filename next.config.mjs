const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(
  /\/+$/,
  "",
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      process.env.WORDPRESS_IMAGE_HOSTNAME && {
        protocol: process.env.WORDPRESS_IMAGE_PROTOCOL || "https",
        hostname: process.env.WORDPRESS_IMAGE_HOSTNAME,
        port: process.env.WORDPRESS_IMAGE_PORT || "",
        pathname: "/wp-content/uploads/**",
      },
    ].filter(Boolean),
  },
  async rewrites() {
    if (!wordpressUrl) return [];

    return [
      {
        source: "/sitemap_index.xml",
        destination: "/api/rankmath-sitemap/sitemap_index.xml",
      },
      {
        source: "/:file([A-Za-z0-9_-]+-sitemap[0-9]*).xml",
        destination: "/api/rankmath-sitemap/:file.xml",
      },
      {
        source: "/wp-content/:path*",
        destination: `${wordpressUrl}/wp-content/:path*`,
      },
      {
        source: "/:site/wp-content/:path*",
        destination: `${wordpressUrl}/:site/wp-content/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/sitemap.xml",
        destination: "/sitemap_index.xml",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
