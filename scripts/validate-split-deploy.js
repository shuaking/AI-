#!/usr/bin/env node

/**
 * Validation script for split deployment setup
 * 
 * This script validates that the split deployment configuration is working correctly.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Split Deployment Setup...\n');

let errors = 0;
let warnings = 0;

// Check 1: Verify package.json has build:frontend script
console.log('✓ Check 1: package.json build:frontend script');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  if (packageJson.scripts && packageJson.scripts['build:frontend']) {
    console.log('  ✓ build:frontend script exists\n');
  } else {
    console.error('  ✗ build:frontend script not found\n');
    errors++;
  }
} catch (error) {
  console.error('  ✗ Failed to read package.json:', error.message, '\n');
  errors++;
}

// Check 2: Verify generate-config.js exists
console.log('✓ Check 2: generate-config.js script');
const scriptPath = path.join(__dirname, 'generate-config.js');
if (fs.existsSync(scriptPath)) {
  console.log('  ✓ generate-config.js exists\n');
} else {
  console.error('  ✗ generate-config.js not found\n');
  errors++;
}

// Check 3: Verify index.html has runtime-config script tag
console.log('✓ Check 3: index.html runtime-config integration');
try {
  const indexHtml = fs.readFileSync(path.join(__dirname, '../public/index.html'), 'utf8');
  if (indexHtml.includes('runtime-config.js')) {
    console.log('  ✓ index.html loads runtime-config.js\n');
  } else {
    console.error('  ✗ index.html does not load runtime-config.js\n');
    errors++;
  }
  if (indexHtml.includes('window.APP_CONFIG')) {
    console.log('  ✓ index.html has APP_CONFIG fallback\n');
  } else {
    console.warn('  ⚠ index.html missing APP_CONFIG fallback\n');
    warnings++;
  }
} catch (error) {
  console.error('  ✗ Failed to read index.html:', error.message, '\n');
  errors++;
}

// Check 4: Verify apiClient.js reads from APP_CONFIG
console.log('✓ Check 4: apiClient.js APP_CONFIG integration');
try {
  const apiClient = fs.readFileSync(path.join(__dirname, '../public/js/apiClient.js'), 'utf8');
  if (apiClient.includes('window.APP_CONFIG')) {
    console.log('  ✓ apiClient.js reads from APP_CONFIG\n');
  } else {
    console.error('  ✗ apiClient.js does not read from APP_CONFIG\n');
    errors++;
  }
} catch (error) {
  console.error('  ✗ Failed to read apiClient.js:', error.message, '\n');
  errors++;
}

// Check 5: Verify socketClient.js reads from APP_CONFIG
console.log('✓ Check 5: socketClient.js APP_CONFIG integration');
try {
  const socketClient = fs.readFileSync(path.join(__dirname, '../public/js/socketClient.js'), 'utf8');
  if (socketClient.includes('window.APP_CONFIG')) {
    console.log('  ✓ socketClient.js reads from APP_CONFIG\n');
  } else {
    console.error('  ✗ socketClient.js does not read from APP_CONFIG\n');
    errors++;
  }
} catch (error) {
  console.error('  ✗ Failed to read socketClient.js:', error.message, '\n');
  errors++;
}

// Check 6: Verify server/config.js has CORS configuration
console.log('✓ Check 6: server/config.js CORS configuration');
try {
  const config = fs.readFileSync(path.join(__dirname, '../server/config.js'), 'utf8');
  if (config.includes('CORS_ORIGINS')) {
    console.log('  ✓ server/config.js handles CORS_ORIGINS\n');
  } else {
    console.error('  ✗ server/config.js does not handle CORS_ORIGINS\n');
    errors++;
  }
  if (config.includes('SOCKET_ALLOWED_ORIGINS')) {
    console.log('  ✓ server/config.js handles SOCKET_ALLOWED_ORIGINS\n');
  } else {
    console.warn('  ⚠ server/config.js does not handle SOCKET_ALLOWED_ORIGINS\n');
    warnings++;
  }
} catch (error) {
  console.error('  ✗ Failed to read server/config.js:', error.message, '\n');
  errors++;
}

// Check 7: Verify deployment config files exist
console.log('✓ Check 7: Deployment configuration files');
const vercelConfig = path.join(__dirname, '../vercel.json');
const netlifyConfig = path.join(__dirname, '../netlify.toml');

if (fs.existsSync(vercelConfig)) {
  console.log('  ✓ vercel.json exists\n');
} else {
  console.warn('  ⚠ vercel.json not found\n');
  warnings++;
}

if (fs.existsSync(netlifyConfig)) {
  console.log('  ✓ netlify.toml exists\n');
} else {
  console.warn('  ⚠ netlify.toml not found\n');
  warnings++;
}

// Check 8: Verify .gitignore excludes runtime-config.js
console.log('✓ Check 8: .gitignore configuration');
try {
  const gitignore = fs.readFileSync(path.join(__dirname, '../.gitignore'), 'utf8');
  if (gitignore.includes('runtime-config.js')) {
    console.log('  ✓ .gitignore excludes runtime-config.js\n');
  } else {
    console.warn('  ⚠ .gitignore does not exclude runtime-config.js\n');
    warnings++;
  }
} catch (error) {
  console.error('  ✗ Failed to read .gitignore:', error.message, '\n');
  errors++;
}

// Check 9: Test config generation
console.log('✓ Check 9: Config generation test');
try {
  // Set test environment variables
  process.env.PUBLIC_API_URL = 'https://test-api.example.com';
  process.env.PUBLIC_SOCKET_URL = 'https://test-socket.example.com';
  
  // Generate config
  require('./generate-config.js');
  
  // Read generated file
  const generatedConfig = fs.readFileSync(path.join(__dirname, '../public/runtime-config.js'), 'utf8');
  
  if (generatedConfig.includes('test-api.example.com')) {
    console.log('  ✓ Config generation works with PUBLIC_API_URL\n');
  } else {
    console.error('  ✗ Config generation failed to use PUBLIC_API_URL\n');
    errors++;
  }
  
  if (generatedConfig.includes('test-socket.example.com')) {
    console.log('  ✓ Config generation works with PUBLIC_SOCKET_URL\n');
  } else {
    console.error('  ✗ Config generation failed to use PUBLIC_SOCKET_URL\n');
    errors++;
  }
} catch (error) {
  console.error('  ✗ Config generation test failed:', error.message, '\n');
  errors++;
}

// Summary
console.log('═══════════════════════════════════════════════════════');
if (errors === 0 && warnings === 0) {
  console.log('✅ All checks passed! Split deployment setup is valid.');
} else {
  if (errors > 0) {
    console.error(`❌ ${errors} error(s) found.`);
  }
  if (warnings > 0) {
    console.warn(`⚠️  ${warnings} warning(s) found.`);
  }
}
console.log('═══════════════════════════════════════════════════════');

process.exit(errors > 0 ? 1 : 0);
