import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
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
        'runLeaderboard': resolve(import.meta.dirname, 'src/leaderboard/runLeaderboard.ts'),
        'runPreFilterAnalysis': resolve(import.meta.dirname, 'src/leaderboard/runPreFilterAnalysis.ts'),
        'workers/profileWorkerThread': resolve(import.meta.dirname, 'src/leaderboard/workers/profileWorkerThread.ts'),
      },
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
})
