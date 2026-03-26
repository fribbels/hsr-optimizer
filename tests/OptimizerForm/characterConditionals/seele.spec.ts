import {
  expect,
  test,
} from '@playwright/test'

test('Seele conditionals show correct popover text', async ({ page }) => {
  await page.goto('/#showcase')
  await page.getByRole('menuitem', { name: 'Characters' }).click()
  await page.locator('#characterGrid').getByText('Seele').dblclick()

  await page.locator('#OPTIMIZER').getByText('Buffed state').hover()
  await expect(page.getByTestId('conditional-popover').getByText('Increases Elemental DMG by 80% and reduces the target\'s RES by 20%.')).toBeVisible()

  await page.locator('#OPTIMIZER').getByText('Speed buff stacks').hover()
  await expect(page.getByTestId('conditional-popover').getByText('Increases SPD by 25% per stack. Stacks up to 1 times.')).toBeVisible()

  await page.locator('#OPTIMIZER').getByText('E6 Butterfly Flurry').hover()
  await expect(page.getByTestId('conditional-popover').getByText('Increases DMG by 15% against enemies affected by Seele\'s Ultimate.')).toBeVisible()
})
