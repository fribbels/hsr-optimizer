import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
    alias: {
      'cross-fetch': resolve(import.meta.dirname, 'src/lib/utils/nativeFetch.ts'),
      'colorthief-pipeline': resolve(import.meta.dirname, 'node_modules/colorthief/src/pipeline.ts'),
      'colorthief-swatches': resolve(import.meta.dirname, 'node_modules/colorthief/src/swatches.ts'),
      'colorthief-mmcq': resolve(import.meta.dirname, 'node_modules/colorthief/src/quantizers/mmcq.ts'),
    },
  },
  build: {
    ssr: true,
    outDir: '.leaderboard-build',
    emptyOutDir: true,
    target: 'esnext',
    minify: false,
    sourcemap: false,
    rollupOptions: {
      input: {
        'runLeaderboard': resolve(import.meta.dirname, 'scripts/leaderboard/runLeaderboard.ts'),
        'workers/profileWorkerThread': resolve(import.meta.dirname, 'scripts/leaderboard/workers/profileWorkerThread.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
})
