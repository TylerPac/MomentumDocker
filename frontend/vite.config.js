import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      include: /\.[tj]sx?$/,
    }),
  ],
  build: {
    outDir: 'dist',
  },
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET ?? 'http://localhost:8085',
        changeOrigin: true,
      },
    },
  },
});
