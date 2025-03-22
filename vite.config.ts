import react from '@vitejs/plugin-react-swc'
import { defineConfig, splitVendorChunkPlugin } from 'vite'
import viteTsconfigPaths from 'vite-tsconfig-paths'

const pathPlugin = viteTsconfigPaths()

export default defineConfig({
  base: '/hsr-optimizer',
  plugins: [
    react(),
    pathPlugin,
    splitVendorChunkPlugin(),
  ],
  server: {
    open: true,
    port: 3000,
  },
  test: {
    environment: 'jsdom',
  },
  worker: {
    format: 'es',
    plugins: () => [pathPlugin],
  },
})
