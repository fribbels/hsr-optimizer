import { test, expect } from '@playwright/test';

test('Open RelicModal in edit mode from the CharacterPreview tab', async ({ page }) => {
  // navigate to Relics tab
  await page.goto('/');

  // got relics tab
  await page.getByRole('menuitem', { name: 'Relics' }).click();

  await page.locator('.ag-cell').first().click();
  await page.locator('.ant-card-body > div > div').first().click();

  await expect(page.getByRole('dialog')).toContainText('Equipped by');
  await expect(page.getByRole('dialog')).toContainText('+15');
  await expect(page.getByRole('dialog')).toContainText('5 star');
  // close
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
});