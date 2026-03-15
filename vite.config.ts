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
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react-vendor'
          if (id.includes('node_modules/ag-grid')) return 'ag-grid'
          if (id.includes('node_modules/recharts') || id.includes('node_modules/d3-')) return 'recharts'
          if (id.includes('node_modules/@mantine')) return 'mantine'
          if (id.includes('node_modules/@esotericsoftware')) return 'spine'
          if (id.includes('node_modules/i18next') || id.includes('node_modules/js-yaml') || id.includes('node_modules/react-i18next')) return 'i18n'
          if (id.includes('node_modules/node-vibrant') || id.includes('node_modules/@vibrant')) return 'vibrant'
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
    environment: 'node',
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
