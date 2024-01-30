import { expect, test } from '@playwright/test';

test('Delete relic from RelicsTab', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('menuitem', { name: 'Getting started' }).click();
  await page.getByRole('button', { name: 'Try it out!' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page.locator('body')).toContainText('Successfully loaded data');


  // nav to RelicsTab
  await page.getByText('Relics', { exact: true }).click();
  await page.locator('div').filter({ hasText: /^Head15HP70511\.010\.43\.55\.2000$/ }).getByRole('img').first().click();
  await page.getByRole('button', { name: 'Delete Relic' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();

  await expect(page.locator('div').filter({ hasText: /^Head15HP70511\.010\.43\.55\.2000$/ })).toHaveCount(0);
  await expect(page.locator('body')).toContainText('Successfully deleted relic');
});
