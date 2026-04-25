import { test, expect } from '@playwright/test';

test('Successfully submitted a rating', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Login / Register' }).click();
  await page.getByRole('textbox', { name: 'Enter your username' }).click();
  await page.getByRole('textbox', { name: 'Enter your username' }).fill('rehanp');
  await page.getByRole('textbox', { name: 'Enter your password' }).click();
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('123456');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForTimeout(2000);
  await page.locator('.absolute > rect').first().click();
  await page.getByRole('button', { name: 'Rate' }).first().click();
  await page.waitForTimeout(2000);
  await page.locator('.flex > button:nth-child(4)').click();
  await page.getByRole('textbox', { name: 'Add a comment (optional)…' }).click();
  await page.getByRole('textbox', { name: 'Add a comment (optional)…' }).fill('Good very helpful');
  await page.getByRole('button', { name: 'Submit' }).click();
});

test('Successfully edited a rating', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Login / Register' }).click();
  await page.getByRole('textbox', { name: 'Enter your username' }).click();
  await page.getByRole('textbox', { name: 'Enter your username' }).fill('rehanp');
  await page.getByRole('textbox', { name: 'Enter your password' }).click();
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('123456');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForTimeout(2000);
  await page.locator('.h-28.relative.bg-gradient-to-br.from-\\[\\#0EA5E9\\] > .absolute.inset-0 > rect').click();
  await page.getByRole('button', { name: 'Edit Rating' }).click();
  await page.getByRole('textbox', { name: 'Add a comment (optional)…' }).click();
  await page.getByRole('textbox', { name: 'Add a comment (optional)…' }).fill('Recommended resource');
  await page.getByRole('button', { name: 'Update' }).click();
});

test('Successfuly tested the chatbot', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Login / Register' }).click();
  await page.getByRole('textbox', { name: 'Enter your username' }).click();
  await page.getByRole('textbox', { name: 'Enter your username' }).fill('rehanp');
  await page.getByRole('textbox', { name: 'Enter your password' }).click();
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('123456');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Recomandations' }).click();
  await page.getByRole('main').getByRole('button').filter({ hasText: /^$/ }).click();
  await page.getByRole('textbox', { name: 'Ask me anything...' }).click();
  await page.getByRole('textbox', { name: 'Ask me anything...' }).fill('tell me about study groups');
  await page.getByRole('button', { name: 'Send' }).click();
  await page.getByRole('main').getByRole('button').filter({ hasText: /^$/ }).click();
});