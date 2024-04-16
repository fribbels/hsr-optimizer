import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react-swc'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import viteTsconfigPaths from 'vite-tsconfig-paths'

const pathPlugin = viteTsconfigPaths()

export default defineConfig({
  base: '/hsr-optimizer',
  plugins: [
    react(),
    pathPlugin,
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
    splitVendorChunkPlugin(),
  ],
  server: {
    open: true,
    port: 3000,
  },

  worker: {
    plugins: () => [pathPlugin],
  },

  test: {
    include: ['./unit-tests/**/*.{test,spec}.[jt]s?(x)'],
  },
})
