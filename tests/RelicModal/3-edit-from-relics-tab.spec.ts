import { expect, test } from '@playwright/test';

test('Open RelicModal in edit mode from the CharacterPreview tab', async ({ page }) => {
  // navigate to Relics tab
  await page.goto('/');

  // got relics tab
  await page.getByRole('menuitem', { name: 'Relics' }).click();
  await page.locator('div').filter({ hasText: /^Head15HP70511\.010\.33\.45\.1000$/ }).getByRole('img').nth(1).click();
  await page.getByText('+15HP705CRIT Rate11.0%CRIT').click();

  await expect(page.getByRole('dialog')).toContainText('Equipped by');
  await expect(page.getByRole('dialog')).toContainText('+15');
  await expect(page.getByRole('dialog')).toContainText('5 star');
  // close
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel' }).click();
});