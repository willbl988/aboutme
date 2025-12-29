#!/usr/bin/env node
/**
 * Force database migration script
 * This can be run manually or via Vercel CLI
 */

const { execSync } = require('child_process');

console.log('🔧 Starting database migration...');

try {
  console.log('📦 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  console.log('🚀 Deploying migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });

  console.log('✅ Migration complete!');
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

