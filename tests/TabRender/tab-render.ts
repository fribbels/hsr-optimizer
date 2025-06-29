import {
  expect,
  test,
} from '@playwright/test'

test('Tab render happy-path', async ({ page }) => {
  await page.goto('/#showcase')
  await expect(page.getByRole('banner')).toContainText('Fribbels Honkai Star Rail Optimizer')

  // OptimizerTab
  await page.getByRole('menuitem', { name: 'Optimizer' }).click()
  await expect(page.locator('a').filter({ hasText: 'Fribbels Honkai Star Rail' })).toBeVisible()
  await expect(page.getByRole('main')).toContainText('Character options')

  // CharacterPreviewTab
  await page.getByRole('menuitem', { name: 'Characters' }).click()
  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.locator('#characterGrid')).toContainText('Icon Rank Character')

  // RelicsTab
  await page.getByRole('menuitem', { name: 'Relics' }).click()
  await expect(page.getByRole('main')).toContainText('Relic recommendation character')
  await expect(page.getByRole('main')).toContainText('Scoring algorithm')

  // Import/Save
  await page.getByRole('menuitem', { name: 'Import / Save' }).click()
  await expect(page.locator('#rc-tabs-0-tab-0')).toContainText('Kel-Z scanner importer (Recommended)')
  await expect(page.locator('#rc-tabs-0-tab-1')).toContainText('Fribbels scanner importer')
  await expect(page.locator('#rc-tabs-0-tab-2')).toContainText('Save optimizer data')
  await expect(page.locator('#rc-tabs-0-tab-3')).toContainText('Load optimizer data')
  await expect(page.locator('#rc-tabs-0-tab-4')).toContainText('Clear optimizer data')

  // Getting Started
  await page.getByRole('menuitem', { name: 'Get Started' }).click()
  await page.getByRole('heading', { name: 'Try it out!' }).click()
  await expect(page.getByRole('main')).toContainText('Importing')

  // RelicScorer
  await page.getByRole('menuitem', { name: 'Relic Scorer' }).click()
  await expect(page.getByRole('main')).toContainText('Account ID:')

  // Coming soon
  await page.getByRole('menuitem', { name: 'Coming soon' }).click()
  await expect(page.getByRole('main')).toContainText(
    'More Star Rail tools coming soon! Drop by the Discord server for updates, to share ideas, or just hang out.',
  )
})
