import { expect, test } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('/#scorer')
  await page.getByText('Optimizer', { exact: true }).click()

  await page.getByTitle('I Shall Be My Own Sword').click()
  await page.getByLabel('Select a light cone').getByText('Brighter Than the Sun').click()

  await page.getByText('Dragon\'s Call stacks').hover()
  const t1 = await page.locator('.ant-popover-content').getByText(`When the wearer uses their Basic ATK`)
  expect(t1).toBeTruthy()
})
