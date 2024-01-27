import { expect, test } from '@playwright/test';

test('Delete character from Characters tab', async ({ page }) => {
  await page.goto('/');

  // dbl-click kafka TEXT
  await page.getByRole('menuitem', { name: 'Characters' }).click();
  await page.getByText('Jingliu').click();
  await page.getByRole('button', { name: 'Remove' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();

  await expect(page.getByRole('gridcell', { name: 'Jingliu' }).locator('div')).toHaveCount(0);
  await expect(page.locator('body')).toContainText('Successfully removed character');
});