import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import viteTsconfigPaths from 'vite-tsconfig-paths'

const pathPlugin = viteTsconfigPaths()

export default defineConfig({
  base: '/hsr-optimizer',
  plugins: [
    react(),
    pathPlugin,
  ],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    cssCodeSplit: true,
    sourcemap: false,
  },
  server: {
    open: true,
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    slowTestThreshold: 500,
  },
  worker: {
    format: 'es',
    plugins: () => [pathPlugin],
    rollupOptions: {
      output: {
        format: 'es',
        inlineDynamicImports: true,
      },
    },
  },
})
