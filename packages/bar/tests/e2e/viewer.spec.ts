import { test, expect } from '@playwright/test';

// Server is started by Playwright's webServer config in playwright.config.ts
// baseURL is set to http://localhost:4799

test('viewer serves HTML', async ({ page }) => {
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
});

test('renders VibeLens header and tabs', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.vl-logo')).toHaveText('VibeLens');
  await expect(page.locator('.vl-tab')).toHaveCount(6);
});

test('Summary tab is active by default', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.vl-tab-active')).toHaveText('Summary');
  await expect(page.locator('.vl-markdown h1')).toContainText('Test Project');
});

test('clicking Stack Guide tab switches content', async ({ page }) => {
  await page.goto('/');
  await page.click('.vl-tab:nth-child(2)');
  await expect(page.locator('.vl-tab-active')).toHaveText('Stack Guide');
  await expect(page.locator('.vl-markdown')).toContainText('stack');
});

test('tables render correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.vl-markdown table')).toBeVisible();
  await expect(page.locator('.vl-markdown th')).toHaveCount(2);
});

test('Quiz tab shows start screen', async ({ page }) => {
  await page.goto('/');
  await page.click('.vl-tab:nth-child(5)');
  await expect(page.locator('.vl-quiz-start h2')).toHaveText('Test Your Knowledge');
  await expect(page.locator('.vl-quiz-btn')).toHaveText('Start Quiz');
});

test('Quiz: start, answer, next, results, retake', async ({ page }) => {
  await page.goto('/');
  await page.click('.vl-tab:nth-child(5)');

  // Start quiz
  await page.click('.vl-quiz-btn');
  await expect(page.locator('.vl-quiz-qtext')).toBeVisible();

  // Answer first question (option B is correct)
  await page.click('.vl-quiz-option:nth-child(2)');
  await expect(page.locator('.vl-quiz-option-correct')).toBeVisible();
  await expect(page.locator('.vl-quiz-explanation')).toBeVisible();

  // Next question
  await page.click('.vl-quiz-next-btn');
  await expect(page.locator('.vl-quiz-qtext')).toContainText('format');

  // Answer second question (option B is correct)
  await page.click('.vl-quiz-option:nth-child(2)');
  await page.click('.vl-quiz-next-btn');

  // Results
  await expect(page.locator('.vl-quiz-start h2')).toHaveText('Quiz Complete');
  await expect(page.locator('.vl-quiz-grade')).toHaveText('A');

  // Retake
  await page.click('.vl-quiz-btn');
  await expect(page.locator('.vl-quiz-start h2')).toHaveText('Test Your Knowledge');
});

test('Review tab shows severity badges', async ({ page }) => {
  await page.goto('/');
  await page.click('.vl-tab:nth-child(6)');
  await expect(page.locator('.vl-markdown')).toContainText('Code Review');
  await expect(page.locator('.vl-severity-badge')).toBeVisible();
});

test('all 6 tabs render without errors', async ({ page }) => {
  await page.goto('/');
  const tabs = page.locator('.vl-tab');

  for (let i = 0; i < 6; i++) {
    await tabs.nth(i).click();
    await expect(page.locator('.vl-main')).not.toBeEmpty();
    await expect(page.locator('.vl-content')).toBeVisible();
  }
});
