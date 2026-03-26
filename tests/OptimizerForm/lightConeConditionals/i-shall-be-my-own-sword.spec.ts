import {
  expect,
  test,
} from '@playwright/test'

test('I Shall Be My Own Sword LC conditional shows popover text', async ({ page }) => {
  await page.goto('/#showcase')
  await page.getByText('Optimizer', { exact: true }).click()

  await page.locator('#OPTIMIZER').getByText('Eclipse Stacks').hover()
  await expect(page.getByTestId('conditional-popover').getByText(
    'When an ally (excluding the wearer) gets attacked or loses HP, the wearer gains 1 stack of Eclipse',
  )).toBeVisible()

  await page.locator('#OPTIMIZER').getByText('Max Stack DEF Pen').hover()
  await expect(page.getByTestId('conditional-popover').getByText('This effect will be removed after the wearer uses an attack.')).toBeVisible()
})
