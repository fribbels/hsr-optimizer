import { test, expect } from '@playwright/test';
import { exec } from 'child_process';

// let server;
// let serverStarted = false;

test.beforeAll(async () => {
  // server = exec('npm start'); // replace with your start command
});

test.afterAll(async () => {
  // server.kill();
});

test('check if URL is responsive', async ({ page }) => {
  const response = await page.goto('http://localhost:3000/hsr-optimizer');
  expect(response.status()).toBe(200);
});

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000/hsr-optimizer');
  await expect(page).toHaveTitle(/HSR Optimizer/);
});

test('loads test data', async ({ page }) => {
  await page.goto('http://localhost:3000/hsr-optimizer');
  await page.click('text=Getting started');
  await expect(page.locator('button :text("Try it out!")')).toHaveText('text=Try it out!');
});

// test('get started link', async ({ page }) => {
//   await page.goto('https://playwright.dev/');

//   // Click the get started link.
//   await page.getByRole('link', { name: 'Get started' }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
// });
