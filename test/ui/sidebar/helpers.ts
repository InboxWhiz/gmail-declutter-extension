import { Page } from "@playwright/test";

export const selectAliceBob = async (
  page: Page,
  action: "delete" | "unsubscribe",
) => {
  // Helper function to select Alice and Bob senders, then click action
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
  await page.click(`#${action}-button`);
};

export const selectEveFrank = async (
  page: Page,
  action: "delete" | "unsubscribe",
) => {
  // Helper function to select Eve and Frank senders, then click action
  await page
    .locator("div")
    .filter({ hasText: /^Eveeve@email\.com49$/ })
    .getByRole("checkbox")
    .check();
  await page
    .locator("div")
    .filter({ hasText: /^Frankfrank@email\.com12$/ })
    .getByRole("checkbox")
    .check();
  await page.click(`#${action}-button`);
};

export const setupSidebarTest = async (page: Page, logs: string[]) => {
  await page.goto("/presentation/apps/sidebar/");

  logs.length = 0; // reset logs before each test
  page.on("console", (msg) => logs.push(msg.text()));

  // Load senders
  await page.locator("#load-senders").click();
};

export const waitForProgressToComplete = async (
  page: Page,
  timeout = 10000,
) => {
  // Wait for progress bar to appear and then disappear
  await page.waitForSelector(".fetch-progress-container", {
    state: "visible",
    timeout: 5000,
  });

  await page.waitForSelector(".fetch-progress-container", {
    state: "hidden",
    timeout,
  });
};

export const getProgressPercentage = async (page: Page): Promise<number> => {
  const percentageText = await page
    .locator(".progress-percentage")
    .textContent();
  return parseInt(percentageText?.replace("%", "") || "0");
};

export const isProgressBarVisible = async (page: Page): Promise<boolean> => {
  return await page.locator(".fetch-progress-container").isVisible();
};
