import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Optimizer', { exact: true }).click();

  await page.getByTitle('I Shall Be My Own Sword').click();
  await page.getByText('In the Name of the World').click();  

  await page.getByText('Enemy Debuffed DMG Boost').hover();
  const t1 = await page.locator('.ant-popover-content').getByText(`Increases the wearer's DMG to debuffed enemies by`);
  expect(t1).toBeTruthy();

  await page.getByText('Skill ATK Boost').click();
  const t2 = await page.locator('.ant-popover-content').getByText("When the wearer uses their Skill, the Effect Hit Rate for this attack increases by ");
  expect(t2).toBeTruthy();
});