import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
              'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/app-check'],
              'vendor-charts': ['recharts'],
              'vendor-motion': ['motion/react'],
            }
          }
        }
      }
    };
});
