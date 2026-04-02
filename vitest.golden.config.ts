import { defineConfig } from 'vitest/config'
import baseConfig from './vite.config.ts'

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    exclude: [],
    dir: 'src/lib',
  },
})
