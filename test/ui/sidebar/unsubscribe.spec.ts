import { test, expect } from "@playwright/test";
import { selectAliceBob, selectEveFrank } from "./helpers";

test.describe("UI tests for Epic 3 - Unsubscribe Flow", () => {
  let logs: string[] = [];

  test.beforeEach(async ({ page }) => {
    await page.goto("/sidebar/");

    logs = []; // reset logs before each test
    page.on("console", (msg) => logs.push(msg.text()));
  });

  test("3.1 - shows modal with correct email & sender count & buttons", async ({
    page,
  }) => {
    // select two senders
    await selectAliceBob(page, "unsubscribe");

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
    await selectAliceBob(page, "unsubscribe");

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

  test("3.3 - 'Confirm' goes through automatic unsubscription process", async ({
    page,
  }) => {
    // select two senders
    await selectAliceBob(page, "unsubscribe");

    // click "Confirm" button
    await page.getByRole("button", { name: "Confirm" }).click();

    // check that the unsubscribe action was called once we see success modal
    const successModal = page.locator("#unsubscribe-success-modal");
    await expect(successModal).toBeVisible();
    expect(logs).toContain(
      "[MOCK] Automatically unsubscribing: [alice@email.com, bob@email.com]",
    );
  });

  test("3.4 - Manual Unsubscribe Link Wizard", async ({ page }) => {
    // select two senders
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

    // "Go to Website" modal appears
    const modal1 = page.locator("#unsubscribe-continue-modal");
    await expect(modal1).toBeVisible();

    // Clicking "Go to Website" opens a new tab with the link
    const [newTab1] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: "Go to Website" }).click(),
    ]);
    await newTab1.waitForLoadState("domcontentloaded");
    expect(newTab1.url()).toBe("https://example.com/unsubscribe/carol");

    // Continue to next sender
    await page.getByRole("button", { name: "Continue" }).click();

    // The next "Go to Website" modal appears
    const modal2 = page.locator("#unsubscribe-continue-modal");
    await expect(modal2).toBeVisible();
    const [newTab2] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: "Go to Website" }).click(),
    ]);
    await newTab2.waitForLoadState("domcontentloaded");
    expect(newTab2.url()).toBe("https://example.com/unsubscribe/dave");

    // "Success" modal appears at the end
    page.getByRole("button", { name: "Continue" }).click();
    const modal3 = page.locator("#unsubscribe-success-modal");
    await expect(modal3).toBeVisible();

    // Emails were deleted (by default)
    expect(logs).toContain(
      "[MOCK] Trashed senders successfully: [carol@email.com, dave@email.com]",
    );

    // Blocking action was not called (by default)
    expect(logs).not.toContain("[MOCK] Blocked carol@email.com successfully");
    expect(logs).not.toContain("[MOCK] Blocked dave@email.com successfully");
  });

  test("3.5 - lack of unsubscribe link flows into block-sender prompt", async ({
    page,
  }) => {
    // select two senders
    selectEveFrank(page, "unsubscribe");
    await page.getByRole("button", { name: "Confirm" }).click();

    // check that the modal is visible
    const modal = page.locator("#unsubscribe-error-modal");
    await expect(modal).toBeVisible();

    // click "Don't Block" button
    await page.locator(".secondary").click();

    // "Block" the next sender
    await expect(modal).toBeVisible();
    await page.locator(".primary").click();

    // check that the success modal appears
    const successModal = page.locator("#unsubscribe-success-modal");
    await expect(successModal).toBeVisible();

    // check that the right blocking action was called
    expect(logs).not.toContain("[MOCK] Blocked eve@email.com successfully");
    expect(logs).toContain("[MOCK] Blocked frank@email.com successfully");

    // check that the delete action was called
    expect(logs).toContain(
      "[MOCK] Trashed senders successfully: [eve@email.com, frank@email.com]",
    );
  });

  test("3.5a - multiple senders can be blocked in a row", async ({ page }) => {
    // select a sender
    selectEveFrank(page, "unsubscribe");
    await page.getByRole("button", { name: "Confirm" }).click();

    // click "Block" button twice
    await page.locator(".primary").click();
    await page.locator(".primary").click();

    // check that the success modal appears
    const successModal = page.locator("#unsubscribe-success-modal");
    await expect(successModal).toBeVisible();

    // check that both blocking actions were called
    expect(logs).toContain("[MOCK] Blocked eve@email.com successfully");
    expect(logs).toContain("[MOCK] Blocked frank@email.com successfully");

    // check that the delete action was called
    expect(logs).toContain(
      "[MOCK] Trashed senders successfully: [eve@email.com, frank@email.com]",
    );
  });

  test("3.6 - Combination Unsubscribe Wizard", async ({ page }) => {
    // select six senders
    await page
      .locator("div")
      .filter({ hasText: /^Alicealice@email\.com32$/ })
      .getByRole("checkbox")
      .check();
    await page
      .locator("div")
      .filter({ hasText: /^Carolcarol@email\.com15$/ })
      .getByRole("checkbox")
      .check();
    await page
      .locator("div")
      .filter({ hasText: /^Frankfrank@email\.com12$/ })
      .getByRole("checkbox")
      .check();
    await page
      .locator("div")
      .filter({ hasText: /^Bobbob@email\.com78$/ })
      .getByRole("checkbox")
      .check();
    await page
      .locator("div")
      .filter({ hasText: /^Davedave@email\.com56$/ })
      .getByRole("checkbox")
      .check();
    await page
      .locator("div")
      .filter({ hasText: /^Eveeve@email\.com49$/ })
      .getByRole("checkbox")
      .check();
    await page.click("#unsubscribe-button");
    await page.getByRole("button", { name: "Confirm" }).click();

    // Carol & Dave are processed with manual unsubscribe links
    const modal1 = page.locator("#unsubscribe-continue-modal");
    await expect(modal1).toBeVisible();
    const [newTab1] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: "Go to Website" }).click(),
    ]);
    await newTab1.waitForLoadState("domcontentloaded");
    expect(newTab1.url()).toBe("https://example.com/unsubscribe/carol");

    await page.getByRole("button", { name: "Continue" }).click();

    const modal2 = page.locator("#unsubscribe-continue-modal");
    await expect(modal2).toBeVisible();
    const [newTab2] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("button", { name: "Go to Website" }).click(),
    ]);
    await newTab2.waitForLoadState("domcontentloaded");
    expect(newTab2.url()).toBe("https://example.com/unsubscribe/dave");

    await page.getByRole("button", { name: "Continue" }).click();

    // Frank & Eve are processed with block-sender prompt
    const modal3 = page.locator("#unsubscribe-error-modal");
    await expect(modal3).toBeVisible();
    await page.locator(".primary").click(); // Block Frank
    await page.locator(".primary").click(); // Block Eve

    // "Success" modal appears at the end
    const modal4 = page.locator("#unsubscribe-success-modal");
    await expect(modal4).toBeVisible();

    // Emails were deleted (by default)
    expect(logs).toContain(
      "[MOCK] Trashed senders successfully: [alice@email.com, carol@email.com, frank@email.com, bob@email.com, dave@email.com, eve@email.com]",
    );

    // Blocking action was called only on manually blocked senders (by default)
    expect(logs).toContain("[MOCK] Blocked frank@email.com successfully");
    expect(logs).toContain("[MOCK] Blocked eve@email.com successfully");
    expect(logs).not.toContain("[MOCK] Blocked alice@email.com successfully");
    expect(logs).not.toContain("[MOCK] Blocked bob@email.com successfully");
    expect(logs).not.toContain("[MOCK] Blocked carol@email.com successfully");
    expect(logs).not.toContain("[MOCK] Blocked dave@email.com successfully");
  });

  test("3.7 - delete-emails toggle defaults on and can be toggled off", async ({
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
    const toggle = page
      .locator("div")
      .filter({ hasText: /^Delete 32 email\(s\) from selected senders$/ })
      .locator(".switch");
    await expect(toggle).toBeChecked();

    // toggle it off
    await toggle.click();
    await expect(toggle).not.toBeChecked();

    // go through the unsubscribe flow
    page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.locator("#unsubscribe-success-modal")).toBeVisible();

    // check that delete action was not called
    expect(logs).not.toContain(
      "[MOCK] Trashed senders successfully: [alice@email.com]",
    );
  });

  test("3.8 - senders can be blocked even when link is found", async ({
    page,
  }) => {
    // select two senders
    await selectAliceBob(page, "unsubscribe");

    // check that the toggle is not checked by default
    const toggle = page
      .locator("div")
      .filter({ hasText: /^Also block senders$/ })
      .locator("span");
    await expect(toggle).not.toBeChecked();

    // toggle it on
    await toggle.click();
    await expect(toggle).toBeChecked();

    // click through the unsubscribe flow
    page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.locator("#unsubscribe-success-modal")).toBeVisible();

    // check that block action was called
    expect(logs).toContain("[MOCK] Blocked alice@email.com successfully");
    expect(logs).toContain("[MOCK] Blocked bob@email.com successfully");
  });
});
