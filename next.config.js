/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  distDir: 'out',
  swcMinify: false
};

module.exports = nextConfig;
