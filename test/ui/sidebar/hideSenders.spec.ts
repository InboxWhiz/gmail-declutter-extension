import { test, expect } from "@playwright/test";
import { selectAliceBob, setupSidebarTest } from "./helpers";

test.describe("UI tests for Hide Senders Functionality", () => {
  const logs: string[] = [];

  test.beforeEach(async ({ page }) => {
    await setupSidebarTest(page, logs);
  });

  test("hiding senders removes them from list", async ({ page }) => {
    // Select two senders
    await selectAliceBob(page, "hide");

    // Wait for senders to be hidden (check they disappear)
    await expect(
      page.locator("div").filter({ hasText: /^Alicealice@email\.com32$/ }),
    ).not.toBeVisible();
    await expect(
      page.locator("div").filter({ hasText: /^Bobbob@email\.com78$/ }),
    ).not.toBeVisible();

    // Check that hide function was called
    expect(logs).toContain("[MOCK] Hiding sender: alice@email.com");
    expect(logs).toContain("[MOCK] Hiding sender: bob@email.com");

    // Other senders should still be visible
    await expect(
      page.locator("div").filter({ hasText: /^Carolcarol@email\.com15$/ }),
    ).toBeVisible();
  });

  test("settings modal displays hidden senders with unhide buttons", async ({
    page,
  }) => {
    // First hide some senders
    await selectAliceBob(page, "hide");

    // Wait for senders to be hidden
    await expect(
      page.locator("div").filter({ hasText: /^Alicealice@email\.com32$/ }),
    ).not.toBeVisible();

    // Open settings modal
    await page.click("button[aria-label='Settings']");

    // Settings modal should be visible
    const settingsModal = page.locator(".settings-modal");
    await expect(settingsModal).toBeVisible();
    await expect(settingsModal).toContainText("Settings");
    await expect(settingsModal).toContainText("Hidden Senders");

    // Hidden senders should be listed
    await expect(settingsModal).toContainText("alice@email.com");
    await expect(settingsModal).toContainText("bob@email.com");

    // Unhide buttons should be visible (icon-only buttons with aria-label)
    const unhideButtons = settingsModal.locator(".unhide-button");
    await expect(unhideButtons).toHaveCount(2);

    // Unhide All button should be visible
    await expect(settingsModal.locator(".unhide-all-button")).toBeVisible();
  });

  test("unhiding a sender restores it to the main list", async ({ page }) => {
    // First hide some senders
    await selectAliceBob(page, "hide");

    // Wait for senders to be hidden
    await expect(
      page.locator("div").filter({ hasText: /^Alicealice@email\.com32$/ }),
    ).not.toBeVisible();

    // Open settings modal
    await page.click("button[aria-label='Settings']");

    // Unhide Alice
    const aliceItem = page
      .locator(".hidden-sender-item")
      .filter({ hasText: "alice@email.com" });
    await aliceItem.locator(".unhide-button").click();

    // Check that unhide function was called
    expect(logs).toContain("[MOCK] Unhiding sender: alice@email.com");

    // Close settings modal
    await page.click("button[aria-label='Close']");

    // Alice should now be visible in the main list
    await expect(
      page.locator("div").filter({ hasText: /^Alicealice@email\.com32$/ }),
    ).toBeVisible();

    // Bob should still be hidden
    await expect(
      page.locator("div").filter({ hasText: /^Bobbob@email\.com78$/ }),
    ).not.toBeVisible();
  });

  test("unhide all button restores all hidden senders", async ({ page }) => {
    // First hide some senders
    await selectAliceBob(page, "hide");

    // Wait for senders to be hidden
    await expect(
      page.locator("div").filter({ hasText: /^Alicealice@email\.com32$/ }),
    ).not.toBeVisible();

    // Open settings modal
    await page.click("button[aria-label='Settings']");

    // Click Unhide All
    await page.click(".unhide-all-button");

    // Check that unhide function was called for both
    expect(logs).toContain("[MOCK] Unhiding sender: alice@email.com");
    expect(logs).toContain("[MOCK] Unhiding sender: bob@email.com");

    // Close settings modal
    await page.click("button[aria-label='Close']");

    // Both senders should now be visible
    await expect(
      page.locator("div").filter({ hasText: /^Alicealice@email\.com32$/ }),
    ).toBeVisible();
    await expect(
      page.locator("div").filter({ hasText: /^Bobbob@email\.com78$/ }),
    ).toBeVisible();
  });

  test("shows empty state when no senders are hidden", async ({ page }) => {
    // Open settings modal without hiding anything
    await page.click("button[aria-label='Settings']");

    const settingsModal = page.locator(".settings-modal");
    await expect(settingsModal).toBeVisible();

    // Should show empty state
    await expect(settingsModal).toContainText("No hidden senders");
    await expect(settingsModal).toContainText(
      "Use the Hide button to remove senders from your view.",
    );

    // Unhide All button should not be visible
    await expect(settingsModal.locator(".unhide-all-button")).not.toBeVisible();
  });

  test("clicking background closes settings modal", async ({ page }) => {
    // Open settings modal
    await page.click("button[aria-label='Settings']");

    const settingsModal = page.locator(".settings-modal");
    await expect(settingsModal).toBeVisible();

    // Click close button
    await page.click("button[aria-label='Close']");

    // Modal should be closed
    await expect(settingsModal).not.toBeVisible();
  });

  test("shows no-sender modal when hide is clicked with no selection", async ({
    page,
  }) => {
    // Click hide button without selecting any senders
    await page.click("#hide-button");

    // No-sender modal should appear
    const modal = page.locator("#no-sender-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("Oops!");
    await expect(modal).toContainText("You haven't selected a sender yet.");
  });
});
