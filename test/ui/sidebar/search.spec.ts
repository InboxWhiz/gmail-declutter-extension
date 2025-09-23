import { test, expect } from "@playwright/test";
import { setupSidebarTest } from "./helpers";

test.describe("Search functionality", () => {
  const logs: string[] = [];

  test.beforeEach(async ({ page }) => {
    await setupSidebarTest(page, logs);
  });

  test("should display search input", async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Search senders"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute(
      "placeholder",
      "Search senders...",
    );
  });

  test("should filter senders by email address", async ({ page }) => {
    // Initially all senders should be visible
    await expect(page.locator(".sender-line-real")).toHaveCount(20);

    // Type in search input
    const searchInput = page.locator('input[aria-label="Search senders"]');
    await searchInput.fill("alice@email.com");

    // Should only show Alice
    await expect(page.locator(".sender-line-real")).toHaveCount(1);
    await expect(page.locator(".sender-line-real")).toContainText(
      "alice@email.com",
    );
  });

  test("should filter senders by name", async ({ page }) => {
    // Search by sender name
    const searchInput = page.locator('input[aria-label="Search senders"]');
    await searchInput.fill("Bob");

    // Should only show Bob
    await expect(page.locator(".sender-line-real")).toHaveCount(1);
    await expect(page.locator(".sender-line-real")).toContainText(
      "bob@email.com",
    );
  });

  test("should perform case-insensitive search", async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Search senders"]');

    // Search with lowercase
    await searchInput.fill("grace");
    await expect(page.locator(".sender-line-real")).toHaveCount(1);

    // Search with uppercase
    await searchInput.clear();
    await searchInput.fill("GRACE");
    await expect(page.locator(".sender-line-real")).toHaveCount(1);

    // Search with mixed case
    await searchInput.clear();
    await searchInput.fill("GrAcE");
    await expect(page.locator(".sender-line-real")).toHaveCount(1);
  });

  test("should filter multiple senders with partial match", async ({
    page,
  }) => {
    const searchInput = page.locator('input[aria-label="Search senders"]');
    await searchInput.fill("e@email.com");

    await page.waitForSelector(".sender-line-real", {
      state: "visible",
      timeout: 5000,
    });

    // Should show all senders whose email contains "e@email.com"
    const senderCount = await page.locator(".sender-line-real").count();
    expect(senderCount).toBeGreaterThan(1);

    // Verify all visible senders contain the search term
    const visibleEmails = await page.locator(".sender-email").allTextContents();
    for (const email of visibleEmails) {
      expect(email.toLowerCase()).toContain("e@email.com");
    }
  });

  test("should show no results message when no matches found", async ({
    page,
  }) => {
    const searchInput = page.locator('input[aria-label="Search senders"]');
    await searchInput.fill("nonexistent@email.com");

    // Should show no senders
    await expect(page.locator(".sender-line-real")).toHaveCount(0);

    // Should show "no results" message
    await expect(page.locator("#senders")).toContainText(
      'No senders match "nonexistent@email.com"',
    );
  });

  test("should show clear button when search term exists", async ({ page }) => {
    const searchInput = page.locator('input[aria-label="Search senders"]');
    const clearButton = page.locator('button[aria-label="Clear search"]');

    // Initially no clear button
    await expect(clearButton).not.toBeVisible();

    // Type something
    await searchInput.fill("test");

    // Clear button should appear
    await expect(clearButton).toBeVisible();
  });

  test("should clear search and restore all senders when clear button clicked", async ({
    page,
  }) => {
    const searchInput = page.locator('input[aria-label="Search senders"]');
    const clearButton = page.locator('button[aria-label="Clear search"]');

    // Filter senders
    await searchInput.fill("alice");
    await expect(page.locator(".sender-line-real")).toHaveCount(1);

    // Click clear button
    await clearButton.click();

    // Search input should be empty
    await expect(searchInput).toHaveValue("");

    // All senders should be visible again
    await expect(page.locator(".sender-line-real")).toHaveCount(20);
  });

  test("should update search results in real-time as user types", async ({
    page,
  }) => {
    const searchInput = page.locator('input[aria-label="Search senders"]');

    // Type character by character
    await searchInput.type("ali", { delay: 100 });

    // Should filter progressively
    const initialCount = await page.locator(".sender-line-real").count();
    expect(initialCount).toBeLessThan(20);

    // Continue typing
    await searchInput.type("ce", { delay: 100 });

    // Should narrow down results
    await expect(page.locator(".sender-line-real")).toHaveCount(1);
  });

  test("should maintain search state when selecting/deselecting senders", async ({
    page,
  }) => {
    const searchInput = page.locator('input[aria-label="Search senders"]');

    // Search for a sender
    await searchInput.fill("alice");
    await expect(page.locator(".sender-line-real")).toHaveCount(1);

    // Select the sender
    await page.locator(".sender-line-real").getByRole("checkbox").check();

    // Search should still be active
    await expect(searchInput).toHaveValue("alice");
    await expect(page.locator(".sender-line-real")).toHaveCount(1);

    // Deselect the sender
    await page.locator(".sender-line-real").getByRole("checkbox").uncheck();

    // Search should still be active
    await expect(searchInput).toHaveValue("alice");
    await expect(page.locator(".sender-line-real")).toHaveCount(1);
  });

  test("should work with action buttons on filtered results", async ({
    page,
  }) => {
    const searchInput = page.locator('input[aria-label="Search senders"]');

    // Search for specific senders
    await searchInput.fill("e@email.com");

    // Select first two visible senders
    const checkboxes = page.locator(".sender-line-real").getByRole("checkbox");
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();

    // Click delete button
    await page.locator("#delete-button").click();

    // Should show delete confirmation modal
    const modal = page.locator("#delete-confirm-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("2 sender(s)");
  });
});
