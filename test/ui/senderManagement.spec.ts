import { test, expect } from "@playwright/test";

test.describe("UI tests for Epic 1 - Sender Management", () => {
  let logs: string[] = [];

  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    logs = []; // reset logs before each test
    page.on("console", (msg) => logs.push(msg.text()));
  });

  test("1.1 - displays senders sorted by email count", async ({ page }) => {
    // Wait for the senders list to be visible
    await page.waitForSelector("#senders");

    // Get all sender items
    const senderItems = await page.$$(".sender-line");

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

  test("1.2 - clicking a sender opens searches it on Gmail", async ({
    page,
  }) => {
    // Click the first sender link
    await page.locator(".sender-email").first().click();

    // Verify that the Gmail search function is called
    expect(logs).toContain("[MOCK] Searching for emails: [alice@email.com]");
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
