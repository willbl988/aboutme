const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Preserve existing resolve config
    const originalResolve = config.resolve || {}
    
    config.resolve = {
      ...originalResolve,
      fallback: {
        ...originalResolve.fallback,
        fs: false,
      },
    }
    
    // Only add alias for client/server bundles, not for PostCSS
    // Add it after other resolve configs are set
    if (!config.resolve.alias) {
      config.resolve.alias = {}
    }
    // Use a conditional check to avoid interfering with PostCSS
    const aliasPath = path.resolve(__dirname)
    if (aliasPath && !config.resolve.alias['@']) {
      config.resolve.alias['@'] = aliasPath
    }
    
    return config
  },
}

module.exports = nextConfig
