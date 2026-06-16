import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/hsr-optimizer',
  plugins: [
    react(),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      'cross-fetch': resolve(__dirname, 'src/lib/utils/nativeFetch.ts'),
      // colorthief/internals barrel includes WasmQuantizer with a broken wasm import.
      // Alias to the specific source modules we need, bypassing the barrel entirely.
      'colorthief-pipeline': resolve(__dirname, 'node_modules/colorthief/src/pipeline.ts'),
      'colorthief-swatches': resolve(__dirname, 'node_modules/colorthief/src/swatches.ts'),
      'colorthief-mmcq': resolve(__dirname, 'node_modules/colorthief/src/quantizers/mmcq.ts'),
    },
  },
  optimizeDeps: {
    include: ['colorthief-pipeline', 'colorthief-swatches', 'colorthief-mmcq'],
  },
  build: {
    target: 'esnext',
    modulePreload: { polyfill: false },
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
            { name: 'vendor-misc', test: /node_modules/, priority: 1 },
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
  preview: {
    port: 3000,
    host: '127.0.0.1',
    strictPort: true,
  },
  server: {
    open: true,
    port: 3000,
    warmup: {
      clientFiles: [
        'src/index.tsx',
        'src/App.tsx',
        'src/lib/tabs/Tabs.tsx',
        'src/lib/sets/setConfigRegistry.ts',
      ],
    },
    watch: {
      ignored: [
        '**/public/assets/**',
      ],
    },
  },
  test: {
    environment: 'node',
    slowTestThreshold: 500,
    exclude: [],
  },
  worker: {
    format: 'iife',
    rolldownOptions: {
      output: {
        format: 'iife',
        codeSplitting: false,
      },
    },
  },
})
