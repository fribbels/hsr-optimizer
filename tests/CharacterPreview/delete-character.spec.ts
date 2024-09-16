import { expect, test } from '@playwright/test'

test('Delete character from Characters tab', async ({ page }) => {
  await page.goto('/#scorer')

  // dbl-click kafka TEXT
  await page.getByRole('menuitem', { name: 'Characters' }).click()

  await page.locator('#characterGrid').getByText('Jingliu').click()
  await page.getByRole('button', { name: 'user Character menu down' }).click()
  await page.getByText('Delete character').click()
  await page.getByRole('button', { name: 'Confirm' }).click()

  await expect(page.getByRole('gridcell', { name: 'Jingliu' }).locator('div')).toHaveCount(0)
  await expect(page.locator('body')).toContainText('Successfully removed character')
})
