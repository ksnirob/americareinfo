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
        source: "/wp-content/:path*",
        destination: `${wordpressUrl}/wp-content/:path*`,
      },
    ];
  },
};

export default nextConfig;
