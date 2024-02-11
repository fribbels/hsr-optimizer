import {
  defineConfig,
  splitVendorChunkPlugin,
} from 'vite'
import react from '@vitejs/plugin-react-swc'
import viteTsconfigPaths from 'vite-tsconfig-paths'
import legacy from '@vitejs/plugin-legacy'

const pathPlugin = viteTsconfigPaths()

export default defineConfig({
  base: '/hsr-optimizer',
  plugins: [
    react(),
    pathPlugin,
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
    splitVendorChunkPlugin(),
  ],
  server: {
    open: true,
    port: 3000
  },
  worker:{
    plugins: () => [pathPlugin]
  }
})
