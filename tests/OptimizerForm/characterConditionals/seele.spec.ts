import { expect, test } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('/')
  // dbl-click kafka TEXT
  await page.getByRole('menuitem', { name: 'Characters' }).click()
  await page.locator('#characterGrid').getByText('Seele').dblclick()

  await page.getByText('Buffed State').hover()
  const t1 = await page.locator('.ant-popover-content').getByText("Increases Elemental DMG by 80% and reduces the target's RES by 20%.")
  expect(t1).toBeTruthy()

  await page.getByText('Speed Boost Stacks').hover()
  const t2 = await page.locator('.ant-popover-content').getByText('Increases SPD by 25% per stack. Stacks up to 1 times.')
  expect(t2).toBeTruthy()

  await page.getByText('E6 Butterfly Flurry').hover()
  const t3 = await page.locator('.ant-popover-content').getByText("Increases DMG by 15% against enemies affected by Seele's Ultimate.")
  expect(t3).toBeTruthy()
})
