import {
  expect,
  test,
} from '@playwright/test'

test('pressing Enter confirms character deletion', async ({ page }) => {
  await page.goto('/#main')
  await page.getByText('Characters', { exact: true }).click()

  const characterRow = page.locator('#characterGrid [data-character-id="1202"]')
  await expect(characterRow).toContainText('Tingyun')

  await characterRow.hover()
  await characterRow.getByRole('button', { name: 'Delete character: Tingyun' }).click()

  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('Are you sure you want to delete Tingyun?')
  await expect(dialog.getByRole('button', { name: 'Confirm' })).toBeFocused()

  await page.keyboard.press('Enter')

  await expect(dialog).toBeHidden()
  await expect(characterRow).toHaveCount(0)
})
