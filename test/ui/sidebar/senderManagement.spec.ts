import { test, expect } from "@playwright/test";
import { setupSidebarTest } from "./helpers";

test.describe("UI tests for Epic 1 - Sender Management", () => {
  const logs: string[] = [];

  test.beforeEach(async ({ page }) => {
    await setupSidebarTest(page, logs);
  });

  test("1.1 - displays senders sorted by email count", async ({ page }) => {
    // Wait for the senders list to be visible
    await page.waitForSelector("#senders");
    await page.waitForSelector(".sender-line-real");

    // Get all sender items
    const senderItems = await page.$$(".sender-line-real");

    // Verify that it shows all senders (mock data has 20 senders)
    expect(senderItems.length).toBe(20);

    // Verify that the sender counts are sorted in descending order
    let max = Number.MAX_SAFE_INTEGER;
    for (const sender of senderItems) {
      const senderCountElement = await sender.$(".email-count");
      const countText: string =
        (await senderCountElement!.textContent()) || "0";
      const count: number = parseInt(countText);
      expect(count).toBeGreaterThanOrEqual(0); // Ensure count is a valid number
      expect(count).toBeLessThanOrEqual(max); // Ensure count is not greater than previous max
      max = count; // Update max for next iteration
    }
  });

  test("1.1a - displays skeleton loader while loading senders", async ({
    page,
  }) => {
    // Wait for the senders list to be visible
    await page.waitForSelector("#senders");

    // Verify that skeleton loaders are displayed
    const skeletons = await page.$$(".sender-line-skeleton");
    expect(skeletons.length).toBeGreaterThan(0); // Ensure there are skeletons
  });

  test("1.2 - clicking a sender opens searches it on Gmail", async ({
    page,
  }) => {
    // Click the first sender link
    await page.locator(".sender-email").first().click();

    // Verify that the Gmail search function is called
    expect(logs).toContain("[MOCK] Searching email senders: [grace@email.com]");
  });

  test("1.3a - shows 'No senders' modal when no senders are selected and unsubscribe button is clicked", async ({
    page,
  }) => {
    await page.locator("#unsubscribe-button").click();
    const modal = page.locator("#no-sender-modal");
    await expect(modal).toBeVisible();
  });

  test("1.3b - shows 'No senders' modal when no senders are selected and delete button is clicked", async ({
    page,
  }) => {
    await page.locator("#delete-button").click();
    const modal = page.locator("#no-sender-modal");
    await expect(modal).toBeVisible();
  });
});
