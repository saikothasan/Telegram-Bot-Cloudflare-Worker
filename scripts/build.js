#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🏗️  Building telegram-bot-cloudflare-worker...\n');

// Clean dist directory
console.log('🧹 Cleaning dist directory...');
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}
fs.mkdirSync('dist', { recursive: true });

// Compile TypeScript
console.log('📦 Compiling TypeScript...');
try {
  execSync('npx tsc', { stdio: 'inherit' });
  console.log('✅ TypeScript compilation completed');
} catch (error) {
  console.error('❌ TypeScript compilation failed');
  process.exit(1);
}

// Copy package.json and update it for distribution
console.log('📄 Preparing package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Remove dev dependencies and scripts not needed in distribution
const distPackageJson = {
  ...packageJson,
  main: 'index.js',
  types: 'index.d.ts',
  scripts: {
    // Keep only essential scripts
    test: packageJson.scripts.test,
  },
  devDependencies: undefined,
  // Ensure files field includes only what we want to publish
  files: [
    'dist/**/*',
    'README.md',
    'LICENSE',
    'CHANGELOG.md'
  ]
};

fs.writeFileSync(
  path.join('dist', 'package.json'),
  JSON.stringify(distPackageJson, null, 2)
);

// Copy essential files
console.log('📋 Copying essential files...');
const filesToCopy = ['README.md', 'LICENSE'];

for (const file of filesToCopy) {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('dist', file));
    console.log(`  ✅ Copied ${file}`);
  } else {
    console.log(`  ⚠️  ${file} not found, skipping`);
  }
}

// Copy CHANGELOG.md if it exists
if (fs.existsSync('CHANGELOG.md')) {
  fs.copyFileSync('CHANGELOG.md', path.join('dist', 'CHANGELOG.md'));
  console.log('  ✅ Copied CHANGELOG.md');
}

// Validate build output
console.log('\n🔍 Validating build output...');

const requiredFiles = [
  'dist/index.js',
  'dist/index.d.ts',
  'dist/package.json',
  'dist/README.md'
];

let validationPassed = true;

for (const file of requiredFiles) {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    validationPassed = false;
  }
}

// Check if main exports are present
console.log('\n📊 Checking exports...');
try {
  const indexPath = path.join('dist', 'index.js');
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  const expectedExports = [
    'TelegramClient',
    'UpdateHandler',
    'CloudflareWorkersAdapter',
    'createBot'
  ];
  
  for (const exportName of expectedExports) {
    if (indexContent.includes(exportName)) {
      console.log(`  ✅ ${exportName} exported`);
    } else {
      console.log(`  ⚠️  ${exportName} export not found`);
    }
  }
} catch (error) {
  console.log('  ❌ Could not validate exports');
  validationPassed = false;
}

// Check TypeScript declarations
console.log('\n🔤 Checking TypeScript declarations...');
try {
  const dtsPath = path.join('dist', 'index.d.ts');
  const dtsContent = fs.readFileSync(dtsPath, 'utf8');
  
  if (dtsContent.includes('export')) {
    console.log('  ✅ TypeScript declarations present');
  } else {
    console.log('  ❌ No exports found in TypeScript declarations');
    validationPassed = false;
  }
} catch (error) {
  console.log('  ❌ Could not validate TypeScript declarations');
  validationPassed = false;
}

// Calculate bundle size
console.log('\n📏 Bundle size analysis...');
try {
  const stats = fs.statSync('dist/index.js');
  const sizeKB = (stats.size / 1024).toFixed(2);
  console.log(`  📦 Main bundle: ${sizeKB} KB`);
  
  // Calculate total dist size
  function getDirSize(dirPath) {
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += getDirSize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  }
  
  const totalSize = getDirSize('dist');
  const totalSizeKB = (totalSize / 1024).toFixed(2);
  console.log(`  📁 Total package: ${totalSizeKB} KB`);
  
} catch (error) {
  console.log('  ⚠️  Could not calculate bundle size');
}

// Final result
console.log('\n' + '='.repeat(50));
if (validationPassed) {
  console.log('🎉 Build completed successfully!');
  console.log('📦 Package is ready for publishing');
  console.log('\nNext steps:');
  console.log('  • Run tests: npm test');
  console.log('  • Publish: npm publish');
} else {
  console.log('❌ Build completed with issues');
  console.log('Please fix the issues above before publishing');
  process.exit(1);
}

console.log('='.repeat(50));

