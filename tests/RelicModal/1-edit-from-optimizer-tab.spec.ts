import { test } from '@playwright/test'

// Disabled since Webgpu doesnt work that well in tests
test('Open RelicModal in edit mode from the Optimizer tab', async ({ page }) => {
  // await page.goto('/#scorer')
  //
  // await page.getByRole('menuitem', { name: 'Optimizer' }).click()
  //
  // // start filter
  // await page.getByRole('button', { name: 'Start' }).click()
  //
  // // click on first filtered row
  // await page.locator('div:nth-child(2) > .ant-image-img').first().click()
  //
  // // relic preview renders with CRIT DMG
  // await expect(page.locator('#optimizerBuildPreviewContainer')).toContainText('CRIT DMG')
  //
  // // click relic header to show edit modal
  // await page.locator('.ant-card-body > div > div').first().click()
  // await expect(page.getByRole('dialog')).toContainText('Equipped by')
  //
  // // close modal
  // await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click()
})
