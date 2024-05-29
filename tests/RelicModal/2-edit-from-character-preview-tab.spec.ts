import { expect, test } from '@playwright/test'

test('Open RelicModal in edit mode from the CharacterPreview tab', async ({ page }) => {
  await page.goto('/#scorer')

  // navigate to Character tab
  await page.getByRole('menuitem', { name: 'Characters' }).click()

  // select seele
  await page.getByRole('gridcell', { name: 'Seele' }).locator('div').first().click()
  await expect(page.getByRole('main')).toContainText('Seele')
  await expect(page.getByRole('main')).toContainText('Lv80 E0')
  await expect(page.getByRole('main')).toContainText('Cruising in the Stellar Sea')

  // click on 1st relic (head)
  await page.getByRole('img', { name: 'Genius of Brilliant Stars' }).first().click()

  // edit modal visible with expected value
  await expect(page.getByRole('dialog').locator('div').filter({ hasText: 'PartSetGenius' }).first()).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('Equipped by')
  await expect(page.getByRole('dialog')).toContainText('+15')
  await expect(page.getByRole('dialog')).toContainText('5 ★')

  // close
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click()
})
