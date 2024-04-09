import { expect, test } from '@playwright/test'

test('Delete relic from RelicsTab', async ({ page }) => {
  await page.goto('/#scorer')
  await page.getByRole('menuitem', { name: 'Getting started' }).click()
  await page.getByRole('button', { name: 'Try it out!' }).click()
  await page.getByRole('button', { name: 'Yes' }).click()
  await expect(page.locator('body')).toContainText('Successfully loaded data')

  // nav to RelicsTab
  await page.getByRole('menuitem', { name: 'Relics' }).locator('span').click()
  await page.getByRole('row', { name: 'Hunter of Glacial Forest Head 15 HP 705 11.0 10.3 3.4 5.1 32.4' }).click()
  await page.getByRole('button', { name: 'Delete Relic' }).click()
  await page.getByRole('button', { name: 'Yes' }).click()

  await expect(page.getByRole('row', { name: 'Hunter of Glacial Forest Head 15 HP 705 11.0 10.3 3.4 5.1 32.4' })).toHaveCount(0)
  await expect(page.locator('body')).toContainText('Successfully deleted relic')
})
