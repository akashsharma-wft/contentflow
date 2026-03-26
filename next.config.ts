import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  serverExternalPackages: ['sanity'],
  trailingSlash: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
}