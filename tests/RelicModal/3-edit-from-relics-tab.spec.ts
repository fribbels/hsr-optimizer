import {
  expect,
  test,
} from '@playwright/test'

test('Open RelicModal in edit mode from the CharacterPreview tab', async ({ page }) => {
  // navigate to Relics tab
  await page.goto('/#showcase')
  await page.getByRole('menuitem', { name: 'Relics' }).click()

  await page.getByRole('row', { name: '9 Rope Energy 7.7 10.2 16 8.6 7.7' }).click()
  await page.getByText('+9Energy Regen7.7%Def16DEF %').click()

  await expect(page.getByRole('dialog')).toContainText('Equipped by')
  await expect(page.getByRole('dialog')).toContainText('+9')
  await expect(page.getByRole('dialog')).toContainText('3 ★')
  // close
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click()
})
