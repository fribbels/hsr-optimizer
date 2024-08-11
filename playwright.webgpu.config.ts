import path from 'path'
import { defineConfig, devices } from '@playwright/test'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const STORAGE_STATE = path.join(
  __dirname,
  'playwright/.cache/storage-state.json',
)

export default defineConfig({
  timeout: 45000,
  testDir: 'tests-webgpu',
  fullyParallel: true, // Run all tests in parallel.
  forbidOnly: !!process.env.CI, // Fail the build on CI if you accidentally left test.only in the source code.
  retries: process.env.CI ? 2 : 0, // Retry on CI only.
  workers: process.env.CI ? 1 : undefined, // Opt out of parallel tests on CI.

  expect: {
    timeout: 5000, // Maximum time expect() should wait for the condition to be met.
  },

  use: {
    actionTimeout: 0, // Maximum time each action such as `click()` can take. Defaults to 0 (no limit).
    baseURL: 'chrome://gpu', // Base URL to use in actions like `await page.goto('/')`.
    trace: 'on-first-retry', // Collect trace when retrying the failed test.
    video: 'off',// // Record video only when retrying a test for the first time.
    headless: true, // Set to false if you want to see the browser during tests
    browserName: 'chromium',
    channel: 'chrome', // Use Chrome for better WebGPU support
    launchOptions: {
      args: ["--enable-gpu"],
    },
  },
  // Configure projects for major browsers.
  projects: [
    {
      name: 'setup',
      testMatch: /webgpu\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    }
  ],
  reporter: [['html', { open: 'never' }]],
})
