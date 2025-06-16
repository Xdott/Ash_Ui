/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.us-west-000.backblazeb2.com',
        pathname: '/proxycurl/**',
      },
    ],
  },
  assetPrefix: '/static',
  basePath: '',
}

module.exports = nextConfig
