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
  globalSetup: './global.setup.ts',

  expect: {
    timeout: 5000,
  },

  use: {
    actionTimeout: 10000,
    baseURL: 'http://127.0.0.1:3000/hsr-optimizer',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
    ...devices['Desktop Chrome'],
    storageState: STORAGE_STATE,
    launchOptions: {
      args: ['--disable-gpu', '--disable-dev-shm-usage'],
    },
  },

  webServer: {
    command: process.env.CI ? 'npm run preview' : 'npm run start',
    url: 'http://127.0.0.1:3000/hsr-optimizer',
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,
  },
  reporter: [['html', { open: 'never' }]],
})
