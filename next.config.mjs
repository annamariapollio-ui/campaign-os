/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.clerk.com" },
    ],
  },
};

export default nextConfig;
