import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Optimizer', { exact: true }).click();
  
  await page.getByText('Enhanced state').hover();
  const t1 = await page.locator('.ant-popover-content').getByText('When Jingliu has 2 stack(s)');
  expect(t1).toBeTruthy();

  await page.getByText('HP drain ATK buff').click();
  const t2 = await page.locator('.ant-popover-content').getByText("Jingliu's ATK increases by 540%");
  expect(t2).toBeTruthy();
});