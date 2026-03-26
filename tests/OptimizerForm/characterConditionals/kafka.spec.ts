import {
  expect,
  test,
} from '@playwright/test'

test('Kafka conditionals show correct popover text', async ({ page }) => {
  await page.goto('/#showcase')
  await page.getByRole('menuitem', { name: 'Characters' }).click()
  await page.locator('#characterGrid').getByText('Kafka').dblclick()

  await page.getByText('E1 DoT vulnerability').hover()
  await expect(page.getByTestId('conditional-popover').getByText('E1 DoT vulnerability')).toBeVisible()
})
