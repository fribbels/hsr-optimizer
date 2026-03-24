import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/hsr-optimizer',
  plugins: [
    react(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom)[\\/]/, priority: 20 },
            { name: 'ag-grid', test: /node_modules[\\/]ag-grid/, priority: 15 },
            { name: 'recharts', test: /node_modules[\\/](recharts|d3-)/, priority: 15 },
            { name: 'mantine', test: /node_modules[\\/]@mantine/, priority: 15 },
            { name: 'spine', test: /node_modules[\\/]@esotericsoftware/, priority: 15 },
            { name: 'i18n', test: /node_modules[\\/](i18next|js-yaml|react-i18next)/, priority: 15 },
          ],
        },
        minify: {
          compress: {
            dropConsole: true,
            dropDebugger: true,
          },
        },
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
    rolldownOptions: {
      output: {
        format: 'es',
        codeSplitting: false,
      },
    },
  },
})
