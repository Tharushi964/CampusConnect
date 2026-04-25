import { test, expect } from '@playwright/test';

test('Successful Login', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Login / Register' }).click();
  await page.getByRole('textbox', { name: 'Enter your username' }).click();
  await page.getByRole('textbox', { name: 'Enter your username' }).fill('admin');
  await page.getByRole('textbox', { name: 'Enter your password' }).click();
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('123456');
  await page.getByRole('button', { name: 'Login' }).click();

});

// Test 1: Faculty Creation
test('Successfully Signed up', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Login Flow
  await page.getByRole('button', { name: 'Login / Register' }).click();
  await page.getByRole('textbox', { name: 'Enter your username' }).fill('admin');
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('123456');
  await page.getByRole('button', { name: 'Login' }).click();

  // Navigate to Entities
  await page.getByRole('button', { name: 'Entities' }).click();
  
  // Add Faculty
  await page.getByRole('button', { name: 'Add' }).first().click();
  await page.getByRole('textbox', { name: 'e.g. Faculty of Computing' }).fill('Business Faculty');
  await page.getByRole('button', { name: 'Save' }).click();

});

test('Successfuly submit a feedback', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByRole('button', { name: 'Login / Register' }).click();
  await page.getByRole('textbox', { name: 'Enter your username' }).click();
  await page.getByRole('textbox', { name: 'Enter your username' }).fill('rehanp');
  await page.getByRole('textbox', { name: 'Enter your username' }).press('Tab');
  await page.getByRole('textbox', { name: 'Enter your password' }).fill('123456');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Study Groups' }).click();
  await page.getByText('📚ACTIVE').nth(1).click();
  await page.getByRole('button', { name: 'Leave Session' }).click();
  await page.getByRole('button', { name: '🙂' }).click();
  await page.getByRole('button', { name: 'Suggestion' }).click();
  await page.getByRole('textbox', { name: 'Tell us what you think…' }).click();
  await page.getByRole('textbox', { name: 'Tell us what you think…' }).fill('good session');
  await page.getByRole('button', { name: 'Send' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
});
