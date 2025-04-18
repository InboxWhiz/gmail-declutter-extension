import { test, expect } from "@playwright/test";

test.describe("UI tests for Epic 3 - Unsubscribe Flow", () => {
  let logs: string[] = [];

  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    logs = []; // reset logs before each test
    page.on("console", (msg) => logs.push(msg.text()));
  });

  test("3.1 - shows modal with correct email & sender count & buttons", async ({
    page,
  }) => {
    // select two senders
    await selectAliceBob(page);

    const modal = page.locator("#unsubscribe-confirm-modal");
    await expect(modal).toBeVisible();
    await expect(modal).toContainText("2 selected sender(s)");
    await expect(modal).toContainText("110 email(s)");
    await expect(
      page.getByRole("button", { name: "Show all emails" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Unsubscribe" }),
    ).toBeVisible();
  });

  test("3.2 - “Show all senders” opens Gmail search, modal persists", async ({
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
    const modal = page.locator("#unsubscribe-confirm-modal");
    await expect(modal).toBeVisible();
  });

  test("3.3a - “Confirm” gets unsubscribe link", async ({ page }) => {
    // select a sender
    await page
      .locator("div")
      .filter({ hasText: /^Alicealice@email\.com32$/ })
      .getByRole("checkbox")
      .check();
    await page.click("#unsubscribe-button");

    // click "Confirm" button
    const [newTab] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: "Confirm" }).click(),
    ]);

    // Wait for it to load, then assert its URL
    await newTab.waitForLoadState("domcontentloaded");
    expect(newTab.url()).toBe(
      "https://example.com/unsubscribe/alice@email.com",
    );
  });

  test("3.3b - Unsubscribe Flow Wizard", async ({ page }) => {
    // select two senders
    await selectAliceBob(page);

    // click "Confirm" button
    const [newTab1] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: "Confirm" }).click(),
    ]);

    // Wait for it to load, then assert its URL
    await newTab1.waitForLoadState("domcontentloaded");
    expect(newTab1.url()).toBe(
      "https://example.com/unsubscribe/alice@email.com",
    );

    // "Link found" modal appears
    const modal1 = page.locator("#unsubscribe-continue-modal");
    await expect(modal1).toBeVisible();

    // click "Continue" button
    const [newTab2] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: "Continue" }).click(),
    ]);

    // Wait for it to load, then assert its URL
    await newTab2.waitForLoadState("domcontentloaded");
    expect(newTab2.url()).toBe("https://example.com/unsubscribe/bob@email.com");

    // Able to re-open link
    const [newTab3] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: "Reopen Link" }).click(),
    ]);
    await newTab3.waitForLoadState("domcontentloaded");
    expect(newTab3.url()).toBe("https://example.com/unsubscribe/bob@email.com");

    // "Success" modal appears at the end
    page.getByRole("button", { name: "Continue" }).click();
    const modal2 = page.locator("#unsubscribe-success-modal");
    await expect(modal2).toBeVisible();

    // Emails were deleted (by default)
    expect(logs).toContain("[MOCK] Trashed senders successfully");

    // Blocking action was not called (by default)
    expect(logs).not.toContain("[MOCK] Blocked alice@email.com successfully");
  });

  test("3.4 - lack of unsubscribe link flows into block-sender prompt", async ({
    page,
  }) => {
    // select a sender
    await page
      .locator("div")
      .filter({ hasText: /^Carolcarol@email\.com15$/ })
      .getByRole("checkbox")
      .check();
    await page.click("#unsubscribe-button");
    await page.getByRole("button", { name: "Confirm" }).click();

    // check that the modal is visible
    const modal = page.locator("#unsubscribe-error-modal");
    await expect(modal).toBeVisible();

    // click "Block" button
    await page.locator(".primary").click();

    // check that the success modal appears
    const successModal = page.locator("#unsubscribe-success-modal");
    await expect(successModal).toBeVisible();

    // check that the blocking action was called
    expect(logs).toContain("[MOCK] Blocked carol@email.com successfully");

    // check that the delete action was called
    expect(logs).toContain("[MOCK] Trashed senders successfully");
  });

  test("3.4a - multiple senders can be blocked in a row", async ({ page }) => {
    // select a sender
    await page
      .locator("div")
      .filter({ hasText: /^Carolcarol@email\.com15$/ })
      .getByRole("checkbox")
      .check();
    await page
      .locator("div")
      .filter({ hasText: /^Davedave@email\.com56$/ })
      .getByRole("checkbox")
      .check();
    await page.click("#unsubscribe-button");
    await page.getByRole("button", { name: "Confirm" }).click();

    // click "Block" button twice
    await page.locator(".primary").click();
    await page.locator(".primary").click();

    // check that the success modal appears
    const successModal = page.locator("#unsubscribe-success-modal");
    await expect(successModal).toBeVisible();

    // check that both blocking actions were called
    expect(logs).toContain("[MOCK] Blocked carol@email.com successfully");
    expect(logs).toContain("[MOCK] Blocked dave@email.com successfully");

    // check that the delete action was called
    expect(logs).toContain("[MOCK] Trashed senders successfully");
  });

  test("3.5 - delete-emails toggle defaults on and can be toggled off", async ({
    page,
  }) => {
    // select a sender
    await page
      .locator("div")
      .filter({ hasText: /^Alicealice@email\.com32$/ })
      .getByRole("checkbox")
      .check();
    await page.click("#unsubscribe-button");

    // check that the delete toggle is checked by default
    const toggle = page.locator(".switch");
    await expect(toggle).toBeChecked();

    // toggle it off
    await toggle.click();
    await expect(toggle).not.toBeChecked();

    // go through the unsubscribe flow
    page.getByRole("button", { name: "Confirm" }).click();
    page.getByRole("button", { name: "Continue" }).click();
    await expect(page.locator("#unsubscribe-success-modal")).toBeVisible();

    // check that delete action was not called
    expect(logs).not.toContain("[MOCK] Trashed senders successfully");
  });

  test("3.6 - senders can be blocked even when link is found", async ({
    page,
  }) => {
    // select a sender
    await page
      .locator("div")
      .filter({ hasText: /^Alicealice@email\.com32$/ })
      .getByRole("checkbox")
      .check();
    await page.click("#unsubscribe-button");
    page.getByRole("button", { name: "Confirm" }).click();

    // check that the toggle is not checked by default
    const toggle = page.locator(".switch");
    await expect(toggle).not.toBeChecked();

    // toggle it on
    await toggle.click();
    await expect(toggle).toBeChecked();

    // click "Continue" button
    page.getByRole("button", { name: "Continue" }).click();
    await expect(page.locator("#unsubscribe-success-modal")).toBeVisible();

    // check that block action was called
    expect(logs).toContain("[MOCK] Blocked alice@email.com successfully");
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
  await page.click("#unsubscribe-button");
};
