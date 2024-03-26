import { expect, test } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('/#scorer')
  // dbl-click kafka TEXT
  await page.getByRole('menuitem', { name: 'Characters' }).click()
  await page.locator('#characterGrid').getByText('Kafka').dblclick()

  await page.getByText('E1 DoT DMG Debuff').hover()
  const t1 = await page.locator('.ant-popover-content').getByText('E1 DoT DMG Debuff')
  expect(t1).toBeTruthy()
})
