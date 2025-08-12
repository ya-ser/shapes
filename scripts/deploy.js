#!/usr/bin/env node

/**
 * Deployment script with optimizations
 * Runs build optimizations before deploying to Cloudflare Workers
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting optimized deployment process...');

// Step 1: Clean previous build
console.log('🧹 Cleaning previous build...');
if (fs.existsSync('build')) {
  fs.rmSync('build', { recursive: true, force: true });
}

// Step 2: Run optimized build
console.log('📦 Running optimized build...');
execSync('npm run build', { stdio: 'inherit' });

// Step 3: Optimize build output
console.log('⚡ Optimizing build output...');

// Remove source maps in production (optional)
if (process.env.NODE_ENV === 'production' && process.env.REMOVE_SOURCEMAPS === 'true') {
  const buildDir = path.join(__dirname, '..', 'build');
  const removeSourceMaps = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        removeSourceMaps(filePath);
      } else if (file.endsWith('.map')) {
        fs.unlinkSync(filePath);
        console.log(`  Removed: ${file}`);
      }
    });
  };
  removeSourceMaps(buildDir);
}

// Step 4: Validate build
console.log('✅ Validating build...');
const buildStats = getBuildStats();
console.log('Build Statistics:');
console.log(`  Total files: ${buildStats.totalFiles}`);
console.log(`  Total size: ${(buildStats.totalSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`  Gzipped files: ${buildStats.gzippedFiles}`);

// Step 5: Deploy to Cloudflare Workers
console.log('🌐 Deploying to Cloudflare Workers...');
try {
  execSync('npx wrangler deploy', { stdio: 'inherit' });
  console.log('✅ Deployment successful!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}

/**
 * Get build statistics
 */
function getBuildStats() {
  const buildDir = path.join(__dirname, '..', 'build');
  let totalFiles = 0;
  let totalSize = 0;
  let gzippedFiles = 0;
  
  const scanDir = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        scanDir(filePath);
      } else {
        totalFiles++;
        totalSize += stat.size;
        if (file.endsWith('.gz')) {
          gzippedFiles++;
        }
      }
    });
  };
  
  scanDir(buildDir);
  
  return { totalFiles, totalSize, gzippedFiles };
}