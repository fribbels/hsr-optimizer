import {
  defineConfig,
  devices,
} from '@playwright/test'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import path from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const STORAGE_STATE = path.join(
  __dirname,
  'playwright/.cache/storage-state.json',
)

export default defineConfig({
  timeout: 30000,
  testDir: './',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? '75%' : undefined,

  expect: {
    timeout: 5000,
  },

  use: {
    actionTimeout: 10000,
    baseURL: 'http://localhost:3000/hsr-optimizer',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /global\.setup\.ts/,
    },
    {
      name: 'WITH test data',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
        launchOptions: {
          args: ['--disable-gpu', '--disable-dev-shm-usage'],
        },
      },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: process.env.CI ? 'npx vite preview' : 'npm run start',
    url: 'http://localhost:3000/hsr-optimizer',
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000,
  },
  reporter: [['html', { open: 'never' }]],
})
