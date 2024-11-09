import { expect, test as setup } from '@playwright/test'
import { STORAGE_STATE } from './playwright.config'

setup('HSR Optimizer loading test data', async ({ page }) => {
  await page.goto('http://localhost:3000/hsr-optimizer#showcase')
  await expect(page.getByRole('banner')).toContainText('Fribbels Honkai Star Rail Optimizer')
  await page.getByRole('menuitem', { name: 'Get Started' }).click()
  await page.getByRole('button', { name: 'Try it out!' }).click()
  await page.getByRole('button', { name: 'Yes' }).click()
  await expect(page.locator('body')).toContainText('Successfully loaded data')

  await page.context().storageState({ path: STORAGE_STATE })
})
