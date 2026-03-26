import {
  expect,
  test,
} from '@playwright/test'

test('Jingliu conditionals show correct popover text', async ({ page }) => {
  await page.goto('/#showcase')
  await page.getByText('Optimizer', { exact: true }).click()

  await page.locator('#OPTIMIZER').getByText('Enhanced state').hover()
  await expect(page.getByTestId('conditional-popover').getByText('When Jingliu has 2 stack(s)')).toBeVisible()

  await page.locator('#OPTIMIZER').getByText('HP drain ATK buff').hover()
  await expect(page.getByTestId('conditional-popover').getByText('Jingliu\'s ATK increases by 540%')).toBeVisible()
})
