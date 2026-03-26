import {
  expect,
  test,
} from '@playwright/test'

test('Brighter Than the Sun LC conditional shows popover text', async ({ page }) => {
  await page.goto('/#showcase')
  await page.getByText('Optimizer', { exact: true }).click()

  await page.getByTitle('I Shall Be My Own Sword').click()
  await page.getByLabel('Select a light cone').getByText('Brighter Than the Sun').click()

  await page.getByText('Dragon\'s Call stacks').hover()
  await expect(page.getByTestId('conditional-popover').getByText('When the wearer uses their Basic ATK')).toBeVisible()
})
