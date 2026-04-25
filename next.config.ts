/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

// Only enable PWA in production non-Vercel environments
const isVercel = process.env.VERCEL === "1"

if (!isVercel) {
  const withPWA = require("next-pwa")({
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: false,
  })
  module.exports = withPWA(nextConfig)
} else {
  module.exports = nextConfig
}