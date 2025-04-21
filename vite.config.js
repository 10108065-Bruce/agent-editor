import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import fs from 'fs';
// Function to get package version
function getPackageVersion() {
  try {
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    return pkg.version || '0.0.0';
  } catch (e) {
    console.warn('Could not read package.json version:', e);
    return '0.0.0';
  }
}

// Create development version of env-config.js
function createDevEnvConfig() {
  const content = `// Development version generated at ${new Date().toISOString()}
window.ENV = {
  VITE_APP_VERSION: "${getPackageVersion()}",
  VITE_APP_BUILD_TIME: "${new Date().toISOString()}",
  VITE_APP_BUILD_ID: "dev-${Date.now()}",
  MODE: "development"
};`;

  // Ensure public directory exists
  if (!fs.existsSync('./public')) {
    fs.mkdirSync('./public', { recursive: true });
  }

  fs.writeFileSync('./public/env-config.js', content);
  console.log('✅ Development environment config generated');
}

// Create the dev config file when Vite starts
createDevEnvConfig();
export default defineConfig({
  base: '/agent-editor/',
  plugins: [
    react(),
    federation({
      name: 'drawingApp',
      filename: 'remoteEntry.js',
      exposes: {
        './FlowEditor': './src/views/FlowEditor.jsx'
      },
      shared: ['react', 'react-dom']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'esm',
        // Ensure remoteEntry.js is at the root of the dist folder
        entryFileNames: 'remoteEntry.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/styles.css'; // This will output all CSS as styles.css
          }
          return 'assets/[name]-[hash][extname]';
        },
        // Add this to ensure the module is properly exposed on window
        intro: 'window.drawingApp = window.drawingApp || {};'
      }
    }
  }
});
