import { expect, test } from '@playwright/test'

test('Editing relics show the correct main stat at maxed value', async ({ page }) => {
  // navigate to Relics tab
  await page.goto('/#scorer')

  await page.getByRole('menuitem', { name: 'Characters' }).click()
  await page.locator('#characterGrid').getByText('Jingliu').click()

  await page.getByText('CRIT DMG64.8%').click()
  await expect(page.locator('#mainStatValue').first()).toHaveValue('64.8')
  await page.getByRole('button', { name: 'Cancel' }).click()
  await page.getByText('SPD25').click()
  await expect(page.locator('#mainStatValue').first()).toHaveValue('25')
  await page.getByRole('button', { name: 'Cancel' }).click()
  await page.getByText('ATK %43.2%').click()
  await expect(page.locator('#mainStatValue').first()).toHaveValue('43.2')
  await page.getByRole('button', { name: 'Cancel' }).click()
  await page.getByText('Ice DMG38.8%').click()
  await expect(page.locator('#mainStatValue').first()).toHaveValue('38.8')
  await page.getByRole('button', { name: 'Cancel' }).click()
  await page.getByText('HP705').click()
  await expect(page.locator('#mainStatValue').first()).toHaveValue('705')
  await page.getByRole('button', { name: 'Cancel' }).click()
  await page.getByText('ATK352').click()
  await expect(page.locator('#mainStatValue').first()).toHaveValue('352')
})
