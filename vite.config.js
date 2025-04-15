import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'drawingApp',
      filename: 'remoteEntry.js',
      exposes: {
        './DrawingApp': './src/DrawingApp.js' // 可以是 .js
      },
      shared: ['react', 'react-dom']
    })
  ],
  esbuild: {
    loader: 'jsx', // << 把所有 .js 當作含 JSX 處理
    include: /\.js$/ // << 限定只影響 .js
  }
});
