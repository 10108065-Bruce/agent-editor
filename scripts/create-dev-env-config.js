// scripts/create-dev-env-config.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Function to get package version
function getPackageVersion() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(rootDir, 'package.json'), 'utf8')
    );
    return pkg.version || '0.0.0';
  } catch (e) {
    console.warn('Could not read package.json version:', e);
    return '0.0.0';
  }
}

// Create environment config for development
function createDevEnvConfig() {
  const content = `// Development version generated at ${new Date().toISOString()}
window.ENV = {
  VITE_APP_VERSION: "${getPackageVersion()}",
  VITE_APP_BUILD_TIME: "${new Date().toISOString()}",
  VITE_APP_BUILD_ID: "dev-${Date.now()}",
  MODE: "development"
};`;

  const publicDir = path.resolve(rootDir, 'public');
  const outputPath = path.resolve(publicDir, 'env-config.js');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, content);
  console.log(`✅ Development environment config generated: ${outputPath}`);
}

// Run the function
createDevEnvConfig();
