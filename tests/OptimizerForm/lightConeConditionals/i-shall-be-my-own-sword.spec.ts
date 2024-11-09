import { expect, test } from '@playwright/test'

test('test', async ({ page }) => {
  await page.goto('/#showcase')
  await page.getByText('Optimizer', { exact: true }).click()

  await page.locator('#OPTIMIZER').getByText('Eclipse Stacks').hover()
  const t1 = await page.locator('.ant-popover-content').getByText('When an ally (excluding the wearer) gets attacked or loses HP, the wearer gains 1 stack of Eclipse')
  expect(t1).toBeTruthy()

  await page.locator('#OPTIMIZER').getByText('Max Stack DEF Pen').click()
  const t2 = await page.locator('.ant-popover-content').getByText('This effect will be removed after the wearer uses an attack.')
  expect(t2).toBeTruthy()
})
