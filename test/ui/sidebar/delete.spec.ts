import { test, expect } from "@playwright/test";
import { selectAliceBob, setupSidebarTest } from "./helpers";

test.describe("UI tests for Epic 2 - Delete Functionality", () => {
  const logs: string[] = [];

  test.beforeEach(async ({ page }) => {
    await setupSidebarTest(page, logs);
  });

  test("2.1 - shows delete confirmation popup with correct counts and buttons", async ({
    page,
  }) => {
    // Select two senders
    await selectAliceBob(page, "delete");

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
    await selectAliceBob(page, "delete");

    // click "Show all emails" button
    await page.getByRole("button", { name: "Show all emails" }).click();

    // check that the search function was called
    expect(logs).toContain(
      "[MOCK] Searching email senders: [alice@email.com, bob@email.com]",
    );

    // check that the modal is still visible
    const modal = page.locator("#delete-confirm-modal");
    await expect(modal).toBeVisible();
  });

  test("2.3 - clicking “Confirm” triggers deletion", async ({ page }) => {
    // Select two senders
    await selectAliceBob(page, "delete");

    // Confirm deletion
    await page.getByRole("button", { name: "Confirm" }).click();

    // "Success" modal appears at the end
    const modal = page.locator("#delete-success-modal");
    await expect(modal).toBeVisible();

    // Delete function was called with correct senders
    expect(logs).toContain(
      "[MOCK] Deleting senders: [alice@email.com, bob@email.com]",
    );
  });
});
