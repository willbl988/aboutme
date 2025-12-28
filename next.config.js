const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Only modify what we need, preserve everything else
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    
    // Add @ alias without overwriting existing aliases
    if (!config.resolve.alias) {
      config.resolve.alias = {}
    }
    config.resolve.alias['@'] = path.resolve(__dirname)
    
    return config
  },
}

module.exports = nextConfig
