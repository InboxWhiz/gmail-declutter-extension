import { test, expect } from '@playwright/test';

test.describe('UI tests for Epic 3 - Unsubscribe Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('3.1 - shows modal with correct email & sender count & buttons', async ({ page }) => {
    // select two senders
    await page.locator('div').filter({ hasText: /^Alicealice@email\.com32$/ }).getByRole('checkbox').check();
    await page.locator('div').filter({ hasText: /^Bobbob@email\.com78$/ }).getByRole('checkbox').check();
    await page.click('#unsubscribe-button');

    const modal = page.locator('#unsubscribe-confirm-modal');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('2 selected sender(s)');
    await expect(modal).toContainText('110 email(s)');
    await expect(page.getByRole('button', { name: 'Show all emails' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Unsubscribe' })).toBeVisible();
  });

  // test('3.2 - “Show all senders” opens Gmail search in new tab, modal persists', async ({ page, context }) => {
  //   // stub out new‐tab capture
  //   const [newPage] = await Promise.all([
  //     context.waitForEvent('page'),
  //     page.click('#unsubscribe-button'),
  //     page.click('.unsubscribe-modal button:has-text("Show all senders")'),
  //   ]);

  //   await expect(newPage).toHaveURL(/#search\/from%3A/);
  //   await expect(page.locator('.unsubscribe-modal')).toBeVisible();
  // });

  // test('3.3 & 3.4 - “Confirm” calls unsubscribe link', async ({ page }) => {
  //   // hijack window.open to capture URL
  //   await page.evaluate(() => {
  //     window.open = (url: string) => { (window as any).lastUrl = url; };
  //   });
  //   await page.click('#unsubscribe-button');
  //   await page.click('.unsubscribe-modal button:has-text("Confirm")');

  //   const opened = await page.evaluate(() => (window as any).lastUrl);
  //   expect(opened).toBe('https://unsubscribe.me');
  // });

  // test('3.5 - missing link flows into block‑sender prompt', async ({ page }) => {
  //   // override unsubscribe‑link to 404
  //   await page.route('**/api/getUnsubscribeLink?*', r => r.fulfill({ status: 404 }));
  //   await page.click('#unsubscribe-button');
  //   await page.click('.unsubscribe-modal button:has-text("Confirm")');

  //   const blockModal = page.locator('.block-sender-modal');
  //   await expect(blockModal).toBeVisible();
  //   await expect(blockModal).toContainText("Couldn't find an unsubscribe link");
  // });

  // test('3.6 - delete-emails toggle defaults on and can be toggled off', async ({ page }) => {
  //   const toggle = page.locator('#delete-toggle');
  //   await expect(toggle).toBeChecked();
  //   await toggle.click();
  //   await expect(toggle).not.toBeChecked();
  // });
});
