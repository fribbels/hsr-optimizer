import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE } from '../playwright.config';

setup('Opening HSR Optimizer and loading "Try it out" data', async ({ page }) => {
  await page.goto('http://localhost:3000/hsr-optimizer');
  await expect(page.getByRole('banner')).toContainText('Fribbels Honkai Star Rail Optimizer');
  await page.getByRole('menuitem', { name: 'Getting started' }).click();
  await page.getByRole('button', { name: 'Try it out!' }).click();
  await page.getByRole('button', { name: 'Yes' }).click();
  await expect(page.locator('body')).toContainText('Successfully loaded data');

  await page.context().storageState({ path: STORAGE_STATE });
});