import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react-swc'
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
    plugins: () => [pathPlugin],
  },
})
