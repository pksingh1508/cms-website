import type { NextConfig } from "next"

const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL ?? "https://media.eucareerserwis.pl"

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Thumbnails and previews of images stored in R2
    remotePatterns: [new URL(`${mediaUrl.replace(/\/+$/, "")}/**`)],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ]
  },
}

export default nextConfig
