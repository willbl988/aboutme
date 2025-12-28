const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, webpack }) => {
    // Handle fs fallback
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    }
    
    // Add @ alias - do this carefully to avoid PostCSS issues
    // Only modify if alias doesn't exist
    if (!config.resolve.alias) {
      config.resolve.alias = {}
    }
    
    // Set the alias
    config.resolve.alias['@'] = path.resolve(__dirname)
    
    return config
  },
}

module.exports = nextConfig
