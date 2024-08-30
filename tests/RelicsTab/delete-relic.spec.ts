import { expect, test } from '@playwright/test'

test('Delete relic from RelicsTab', async ({ page }) => {
  await page.goto('/#scorer')
  await page.getByRole('menuitem', { name: 'Get Started' }).click()
  await page.getByRole('button', { name: 'Try it out!' }).click()
  await page.getByRole('button', { name: 'Yes' }).click()
  await expect(page.locator('body')).toContainText('Successfully loaded data')

  // nav to RelicsTab
  await page.getByRole('menuitem', { name: 'Relics' }).click()
  await page.getByRole('columnheader', {name: 'Date Imported'}).click()// oldest relics to top
  await page.getByRole('columnheader', {name: 'Date Imported'}).click()
  await page.getByRole('row', { name: 'Head 15 HP 705 11.0 10.3 3.4' }).click()
  await page.getByRole('button', { name: 'Delete Relic' }).click()
  await page.getByRole('button', { name: 'Yes' }).click()

  await expect(page.getByRole('row', { name: 'Head 15 HP 705 11.0 10.3 3.4' })).toHaveCount(0)
  await expect(page.locator('body')).toContainText('Successfully deleted relic')
})
