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
