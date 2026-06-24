/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    outputFileTracingExcludes: {
      "/*": [
        "./public/seo-images/**/*",
        "./public/seo-assets/**/*",
        "./public/golfmap_title_only_og_kit/**/*",
        "./public/golfmap_og_svg_assets/**/*",
        "./public/promo-assets/**/*",
        "./public/*.png",
        "./public/*.jpg",
        "./public/*.jpeg",
        "./public/*.webp",
      ],
    },
  },
};

export default nextConfig;
