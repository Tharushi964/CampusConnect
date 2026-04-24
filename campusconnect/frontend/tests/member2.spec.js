import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Login / Register' }).click();
  await page.getByRole('textbox', { name: 'Enter your username' }).click();
  await page.getByRole('textbox', { name: 'Enter your username' }).fill('admin');
  await page.getByRole('textbox', { name: 'Enter your password' }).click();
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('123456');
  await page.getByRole('button', { name: 'Login' }).click();

});