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
  testDir: 'tests',
  fullyParallel: true, // Run all tests in parallel.
  forbidOnly: !!process.env.CI, // Fail the build on CI if you accidentally left test.only in the source code.
  retries: process.env.CI ? 2 : 0, // Retry on CI only.
  workers: process.env.CI ? 1 : undefined, // Opt out of parallel tests on CI.

  expect: {
    timeout: 5000, // Maximum time expect() should wait for the condition to be met.
    // toHaveScreenshot: {
    //   maxDiffPixels: 10, // An acceptable amount of pixels that could be different, unset by default.
    // },
    // toMatchSnapshot: {
    //   maxDiffPixelRatio: 0.1,// An acceptable ratio of pixels that are different to the total amount of pixels, between 0 and 1.
    // },
  },

  use: {
    actionTimeout: 0, // Maximum time each action such as `click()` can take. Defaults to 0 (no limit).
    baseURL: 'http://localhost:3000/hsr-optimizer', // Base URL to use in actions like `await page.goto('/')`.
    trace: 'on-first-retry', // Collect trace when retrying the failed test.
    screenshot: 'only-on-failure', // Capture screenshot after each test failure.
    // video: 'on-first-retry',// // Record video only when retrying a test for the first time.
  },
  // Configure projects for major browsers.
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
      },
      dependencies: ['setup'],
    } /* {
      name: 'NO test data',
      use: {
        ...devices['Desktop Chrome'],
      },
      testMatch: '!global.setup.ts',
    }, */,
  ],
  // Run your local dev server before starting the tests.
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000/hsr-optimizer',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2min max to startup
  },
  reporter: [['html', { open: 'never' }]],
})
