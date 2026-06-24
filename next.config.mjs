const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace(
  /\/+$/,
  "",
);
const wordpressImageSource = wordpressUrl ? new URL(wordpressUrl) : null;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      wordpressImageSource && {
        protocol: wordpressImageSource.protocol.replace(":", ""),
        hostname: wordpressImageSource.hostname,
        port: wordpressImageSource.port,
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
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
