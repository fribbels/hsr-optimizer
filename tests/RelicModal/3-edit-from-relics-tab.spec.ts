import { expect, test } from '@playwright/test'

test('Open RelicModal in edit mode from the CharacterPreview tab', async ({ page }) => {
  // navigate to Relics tab
  await page.goto('/#showcase')
  await page.getByRole('menuitem', { name: 'Relics' }).click()

  await page.getByRole('row', { name: 'Head 15 HP 705 11.0 10.3 3.4' }).click()
  await page.getByText('+15HP705CRIT Rate11.0%CRIT').click()

  await expect(page.getByRole('dialog')).toContainText('Equipped by')
  await expect(page.getByRole('dialog')).toContainText('+15')
  await expect(page.getByRole('dialog')).toContainText('5 ★')
  // close
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click()
})
