/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    staleTimes: {
      dynamic: 180,
      static: 300,
    },
  },
};

export default nextConfig;
