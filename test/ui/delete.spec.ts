import { test, expect } from "@playwright/test";

test.describe("UI tests for Epic 2 - Delete Functionality", () => {
  let logs: string[] = [];

  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    logs = []; // reset logs before each test
    page.on("console", (msg) => logs.push(msg.text()));
  });

  test("2.1 - shows delete confirmation popup with correct counts and buttons", async ({
    page,
  }) => {
    // Select two senders
    await selectAliceBob(page);

    const modal = page.locator("#delete-confirm-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("2 sender(s)");
    await expect(modal).toContainText("110 email(s)");
    await expect(
      page.getByRole("button", { name: "Show all emails" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
  });

  test("2.2 - “Show all senders” opens Gmail search, modal persists", async ({
    page,
  }) => {
    // select two senders
    await selectAliceBob(page);

    // click "Show all emails" button
    await page.getByRole("button", { name: "Show all emails" }).click();

    // check that the search function was called
    expect(logs).toContain(
      "[MOCK] Searching for emails: [alice@email.com, bob@email.com]",
    );

    // check that the modal is still visible
    const modal = page.locator("#delete-confirm-modal");
    await expect(modal).toBeVisible();
  });

  test("2.3 - clicking “Confirm” triggers deletion", async ({ page }) => {
    // Select two senders
    await selectAliceBob(page);

    // Confirm deletion
    await page.getByRole("button", { name: "Confirm" }).click();

    // "Success" modal appears at the end
    const modal = page.locator("#delete-success-modal");
    await expect(modal).toBeVisible();

    // Delete function was called with correct senders
    expect(logs).toContain(
      "[MOCK] Trashed senders successfully: [alice@email.com, bob@email.com]",
    );
  });
});

const selectAliceBob = async (page) => {
  // Helper function to select Alice and Bob senders
  await page
    .locator("div")
    .filter({ hasText: /^Alicealice@email\.com32$/ })
    .getByRole("checkbox")
    .check();
  await page
    .locator("div")
    .filter({ hasText: /^Bobbob@email\.com78$/ })
    .getByRole("checkbox")
    .check();
  await page.click("#delete-button");
};
