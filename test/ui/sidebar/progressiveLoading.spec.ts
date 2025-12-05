import { test, expect } from "@playwright/test";
import { setupSidebarTest } from "./helpers";

test.describe("Progressive Loading functionality", () => {
  const logs: string[] = [];

  test.beforeEach(async ({ page }) => {
    await setupSidebarTest(page, logs);
  });

  test("should display progress bar when loading senders", async ({ page }) => {
    // Progress container should appear
    const progressContainer = page.locator(".fetch-progress-container");
    await expect(progressContainer).toBeVisible();

    // Progress bar elements should be visible
    await expect(progressContainer.locator("h3")).toContainText(
      "Scanning inbox...",
    );
    await expect(progressContainer.locator(".cancel-button")).toBeVisible();
    await expect(progressContainer.locator(".progress-stats")).toBeVisible();
    await expect(
      progressContainer.locator(".progress-bar-container"),
    ).toBeVisible();
  });

  test("should show progress updates during scan", async ({ page }) => {
    // Check initial progress state
    const progressStats = page.locator(".progress-stats");
    await expect(progressStats).toContainText("Page");
    await expect(progressStats).toContainText("emails processed");

    // Check progress bar fill
    const progressBarFill = page.locator(".progress-bar-fill");
    await expect(progressBarFill).toBeVisible();

    // Verify percentage is shown
    const progressPercentage = page.locator(".progress-percentage");
    await expect(progressPercentage).toBeVisible();
    await expect(progressPercentage).toHaveText(/\d+%/);
  });

  test("should handle cancel button during scan", async ({ page }) => {
    // Wait for progress to start
    const progressContainer = page.locator(".fetch-progress-container");
    await expect(progressContainer).toBeVisible();

    // Click cancel button
    await page.locator(".cancel-button").click();

    // Progress should disappear
    await expect(progressContainer).not.toBeVisible();

    // Should return to empty state or previous state
    const emptySendersContainer = page.locator(".e-container");
    await expect(emptySendersContainer).toBeVisible();
  });

  test("should transition from progress to loaded senders", async ({
    page,
  }) => {
    // Wait for progress to appear
    const progressContainer = page.locator(".fetch-progress-container");
    await expect(progressContainer).toBeVisible();

    // Wait for loading to complete and senders to appear
    await expect(progressContainer).not.toBeVisible({ timeout: 5000 });

    // Senders should now be visible
    await expect(page.locator(".sender-line-real")).toHaveCount(20);
  });

  test("should maintain search functionality after progressive load", async ({
    page,
  }) => {
    // Wait for loading to complete
    await page.waitForSelector(".sender-line-real", { timeout: 5000 });

    // Search should work normally
    const searchInput = page.locator('input[aria-label="Search senders"]');
    await searchInput.fill("alice");
    await expect(page.locator(".sender-line-real")).toHaveCount(1);
  });

  test("should allow reloading while showing progress", async ({ page }) => {
    await expect(page.locator(".fetch-progress-container")).toBeVisible();

    // Click reload button while loading
    await page.locator(".reload-button").click();

    // Should still show progress (new scan started)
    await expect(page.locator(".fetch-progress-container")).toBeVisible();
  });

  test("progress bar should update smoothly", async ({ page }) => {
    // Get initial width of progress bar
    const progressBarFill = page.locator(".progress-bar-fill");
    const initialWidth = await progressBarFill.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).width);
    });

    // Wait a bit
    await page.waitForTimeout(500);

    // Get updated width
    const updatedWidth = await progressBarFill.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).width);
    });

    // Progress should have increased (unless already complete)
    if (await progressBarFill.isVisible()) {
      expect(updatedWidth).toBeGreaterThanOrEqual(initialWidth);
    }
  });

  test("should show correct email count in progress", async ({ page }) => {
    // Check that email count is formatted with commas for large numbers
    const progressStats = page.locator(".progress-stats");
    await expect(progressStats).toContainText(
      /\d{1,3}(,\d{3})* emails processed/,
    );
  });

  test("should handle errors during progressive loading gracefully", async ({
    page,
  }) => {
    // Even if an error occurs, the UI should remain functional
    // Cancel button should always be clickable
    const cancelButton = page.locator(".cancel-button");
    await expect(cancelButton).toBeEnabled();
  });

  test("should not show progress when loading from cache", async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector(".sender-line-real", { timeout: 5000 });

    // Reload page to simulate loading from cache
    await page.reload();
    await setupSidebarTest(page, logs);

    // Should show senders without progress bar
    await expect(page.locator(".sender-line-real")).toHaveCount(20);
    await expect(page.locator(".fetch-progress-container")).not.toBeVisible();
  });
});
