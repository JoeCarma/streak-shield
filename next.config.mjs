/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "basepaint.net" },
      { protocol: "https", hostname: "basepaint.xyz" },
    ],
  },
};

export default nextConfig;
