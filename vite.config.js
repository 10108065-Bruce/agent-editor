import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

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
