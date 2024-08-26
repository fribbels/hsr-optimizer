import { expect, test } from '@playwright/test'

test('Test GPU', async ({ page }) => {
  await page.goto('chrome://gpu')
  // await page.goto('/#webgpu')


  await expect(page.locator('body')).not.toContainText('WebGPU not supported', { timeout: 600000 })
  // await expect(page.locator('body')).toContainText('65535')

  console.log('x')
})