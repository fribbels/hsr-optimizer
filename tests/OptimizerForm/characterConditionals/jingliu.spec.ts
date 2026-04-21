import {
  expect,
  test,
} from '@playwright/test'
import {
  initialMenuState,
  OptimizerMenuIds,
} from '../../../src/lib/tabs/tabOptimizer/optimizerForm/layout/optimizerMenuIds'

test('Jingliu conditionals show correct popover text', async ({ page }) => {
  await page.goto('/#showcase')
  await page.getByText('Optimizer', { exact: true }).click()
  if (!initialMenuState[OptimizerMenuIds.characterOptions]) {
    await page.getByText('Character options').click()
  }

  await page.locator('#OPTIMIZER').getByText('Enhanced state').hover()
  await expect(page.getByTestId('conditional-popover').getByText('Spectral Transmigration')).toBeVisible()

  await page.locator('#OPTIMIZER').getByText('HP drain ATK buff').hover()
  await expect(page.getByTestId('conditional-popover').getByText('ATK increases based on the total HP consumed')).toBeVisible()
})
