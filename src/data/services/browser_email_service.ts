// src/data/services/browser_email_service.ts

import { Sender } from "../../domain/entities/sender";
import { FetchProgress } from "../../domain/types/progress";
import { PageInteractionService } from "./page_interaction_service";

export interface FetchOptions {
  onProgress?: (progress: FetchProgress) => void;
  batchSize?: number;
  maxPages?: number;
  signal?: AbortSignal;
}

/**
 * Service class that implements browser-specific email operations to aid BrowserEmailRepo.
 * Provides methods to interact with email data within the browser environment.
 * All methods here must be run in the content script to work properly.
 */
export class BrowserEmailService {
  
  static async fetchSendersFromBrowser(
    options: FetchOptions = {}
  ): Promise<Sender[]> {
    const { 
      onProgress, 
      batchSize = 10, // Process pages sequentially in batches of 10, with a delay between batches
      maxPages, 
      signal 
    } = options;

    // Go to "All Mail" page
    const currentPage = window.location.href.split("#")[0];
    window.location.href = `${currentPage}#all`;

    // Wait for loading to complete
    await this._waitForLoaderToHide();
    const { messages: totalMessages, pages: totalPages } = this._getTotalMessagesPages();
    
    const pagesToProcess = maxPages ? Math.min(totalPages, maxPages) : totalPages;
    console.log(`Total messages: ${totalMessages}, pages to process: ${pagesToProcess}`);

    // Use a Map for efficient sender aggregation
    const senderMap = new Map<string, Sender>();
    let processedEmails = 0;

    // Process pages in batches
    for (let batchStart = 1; batchStart <= pagesToProcess; batchStart += batchSize) {
      // Check for cancellation
      if (signal?.aborted) {
        console.log("Fetch cancelled by user");
        break;
      }

      const batchEnd = Math.min(batchStart + batchSize - 1, pagesToProcess);
      
      // Process batch of pages sequentially
      for (let i = batchStart; i <= batchEnd; i++) {
        if (signal?.aborted) break;

        // Go to page
        window.location.href = `${currentPage}#all/p${i}`;
        await this._waitForLoaderToHide();

        // Process emails
        console.log(`Processing page ${i} of ${pagesToProcess}`);
        const pageEmails = this._extractSendersFromPage();
        
        // Aggregate senders incrementally
        this._aggregateSenders(pageEmails, senderMap);
        processedEmails += pageEmails.length;

        // Report progress
        if (onProgress) {
          const progress: FetchProgress = {
            currentPage: i,
            totalPages: pagesToProcess,
            processedEmails,
            totalEmails: totalMessages,
            percentage: Math.round((i / pagesToProcess) * 100)
          };
          onProgress(progress);
        }
      }

      // Small delay between batches to prevent browser freezing
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Convert map to sorted array
    const senders = Array.from(senderMap.values());
    senders.sort((a, b) => b.emailCount - a.emailCount);
    
    return senders;
  }

  private static _aggregateSenders(
    emails: { email: string; name: string }[],
    senderMap: Map<string, Sender>
  ): void {
    emails.forEach(({ email, name }) => {
      if (senderMap.has(email)) {
        const sender = senderMap.get(email)!;
        sender.names.add(name);
        sender.emailCount += 1;
      } else {
        senderMap.set(email, {
          email,
          names: new Set([name]),
          emailCount: 1
        });
      }
    });
  }

  // - BLOCK SENDER HELPERS -

  static async blockSenderFromBrowser(
    senderEmailAddress: string,
  ): Promise<void> {
    console.log("Blocking sender in browser: ", senderEmailAddress);
    const originalPageUrl = window.location.href;

    // Open filters page
    const currentPage = window.location.href.split("#")[0];
    window.location.href = `${currentPage}#settings/filters`;

    // Click "Create a new filter"
    const createFilterButtonFunc = () => {
      return Array.from(document.querySelectorAll('span[role="link"]')).find(
        (el) => el.textContent?.includes("Create a new filter"),
      );
    };
    await this._waitForElement(createFilterButtonFunc);
    const createFilterButton = createFilterButtonFunc() as HTMLElement;
    createFilterButton?.click();

    // Create the filter
    const confirmButtonFunc = () => {
      return Array.from(document.querySelectorAll('div[role="link"]')).filter(
        (el) => el.textContent?.includes("Create filter"),
      )[0] as HTMLElement;
    };
    await this._waitForElement(confirmButtonFunc);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for the input to be ready
    (document.activeElement! as HTMLInputElement).value = senderEmailAddress;
    const confirmButton = confirmButtonFunc();
    confirmButton?.click();

    // Choose deleting
    const labelFunc = () => {
      return Array.from(document.querySelectorAll("label")).find(
        (el) => el.textContent?.trim() === "Delete it",
      );
    };
    await this._waitForElement(labelFunc);
    const label = labelFunc();
    const checkbox = document.getElementById(
      label!.getAttribute("for")!,
    )! as HTMLInputElement;
    checkbox.checked = true;

    // Confirm
    const confirmCreateButton = Array.from(
      document.querySelectorAll('div[role="button"]'),
    ).filter((el) =>
      el.textContent?.includes("Create filter"),
    )[0] as HTMLElement;
    confirmCreateButton?.click();

    // Go back to old page
    window.location.href = originalPageUrl;
  }

  // - UNSUBSCRIBE SENDERS HELPERS -

  static async unsubscribeSendersFromBrowser(
    senderEmailAddresses: string[],
  ): Promise<string[]> {
    console.log("Unsubscribing senders in browser: ", senderEmailAddresses);
    const failures = [];
    for (const senderEmailAddress of senderEmailAddresses) {
      const success = await this._unsubscribeSingleSender(senderEmailAddress);
      if (!success) {
        failures.push(senderEmailAddress);
      }
    }
    return failures;
  }

  /**
   * Attempts to unsubscribe a single sender by automating browser interactions.
   * @param senderEmailAddress - The email address of the sender to unsubscribe from.
   * @returns A promise that resolves to `true` if the unsubscribe process was successful, or `false` if the "Unsubscribe" button was not found.
   */
  static async _unsubscribeSingleSender(
    senderEmailAddress: string,
  ): Promise<boolean> {
    console.log("Unsubscribing sender: ", senderEmailAddress);

    // Search for the sender's emails
    PageInteractionService.searchEmailSenders([senderEmailAddress]);
    await this._waitForEmailBodyToLoad();

    // Hover over the first email row
    const emailRows = this._getEmailRows();
    emailRows[0].dispatchEvent(new MouseEvent("mouseover", { bubbles: true })); // TODO: If this fails, maybe we could go down the list of rows?

    // Click the "Unsubscribe" button
    const unsubscribeButton = Array.from(
      document.querySelectorAll(".aJ6"),
    ).filter(
      (button) =>
        (button as HTMLElement).offsetParent !== null &&
        button.textContent?.includes("Unsubscribe"),
    )[0];
    if (!unsubscribeButton) {
      return false;
    }
    unsubscribeButton?.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true }),
    );
    unsubscribeButton?.dispatchEvent(
      new MouseEvent("mouseup", { bubbles: true }),
    );

    // Confirm unsubscribe
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait for unsubscribe confirmation to load
    const confirmButton = Array.from(
      document.querySelectorAll(".mUIrbf-anl"),
    ).filter((el) => el.textContent?.includes("Unsubscribe"))[0] as HTMLElement;
    confirmButton.click();

    console.log("Unsubscribe process completed for: ", senderEmailAddress);
    return true;
  }

  // - DELETE SENDERS HELPERS -

  static async deleteSendersFromBrowser(
    senderEmailAddresses: string[],
  ): Promise<void> {
    console.log("Deleting senders in browser: ", senderEmailAddresses);

    PageInteractionService.searchEmailSenders(senderEmailAddresses);
    await this._waitForEmailBodyToLoad();
    while (!document.querySelector("td.TC")) {
      // No 'No messages matched your search'
      await this._deleteEmailsOnPage();
    }
  }

  static async _deleteEmailsOnPage(): Promise<void> {
    const checkboxes = Array.from(
      document.querySelectorAll('span[role="checkbox"]'),
    );
    const checkbox = checkboxes.filter(
      (checkbox) => (checkbox as HTMLElement).offsetParent !== null,
    )[0] as HTMLElement;
    checkbox.click();

    const deleteButtons = Array.from(
      document.querySelectorAll('div[aria-label="Delete"]'),
    );
    const deleteButton = deleteButtons.filter(
      (button) => (button as HTMLElement).offsetParent !== null,
    )[0] as HTMLElement;
    deleteButton.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    deleteButton.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));

    await this._waitForDeleteConfirmation();
  }

  static async _waitForDeleteConfirmation(): Promise<void> {
    return new Promise<void>((resolve) => {
      const observer = new MutationObserver(() => {
        const confirmation = Array.from(document.querySelectorAll("span")).find(
          (span) => span.textContent?.includes("conversations moved to Bin"),
        );
        if (confirmation) {
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      // Fallback timeout in case confirmation never appears
      setTimeout(() => {
        observer.disconnect();
        resolve();
      }, 1000);
    });
  }

  // - GENERAL HELPERS -

  /**
   * Waits for the Gmail loading indicator to disappear, indicating that the page has finished loading.
   * @param timeout Optional timeout in milliseconds to stop waiting after a certain period. Default is 10000ms.
   */
  static async _waitForLoaderToHide(timeout = 10000): Promise<void> {
    const selector = ".vX.UC";
    return new Promise((resolve, reject) => {
      const el = document.querySelector(selector) as HTMLElement;
      if (!el) {
        reject(new Error(`Element ${selector} not found`));
        return;
      }

      const observer = new MutationObserver(() => {
        if (getComputedStyle(el).display === "none") {
          observer.disconnect();
          resolve();
        }
      });

      observer.observe(el, { attributes: true, attributeFilter: ["style"] });

      // Optional timeout
      setTimeout(() => {
        observer.disconnect();
      }, timeout);
    });
  }

  /**
   * Gets the total number of messages and pages in the inbox.
   */
  static _getTotalMessagesPages(): { messages: number; pages: number } {
    const infoDiv = Array.from(document.querySelectorAll(".Dj")).find(
      (el) => (el as HTMLElement).offsetParent !== null,
    );
    const [_, pageSize, totalMessages] = infoDiv?.querySelectorAll(".ts") || [];
    const messages = parseInt(
      (totalMessages?.textContent || "0").replace(/[.,\s]/g, ""),
    );
    const pages = Math.ceil(
      messages / parseInt((pageSize?.textContent || "0").replace(/,/g, "")) + 1,
    );

    return { messages, pages };
  }

  /**
   * Extracts sender information from all email rows within a table body element.
   */
  static _extractSendersFromPage(): { email: string; name: string }[] {
    const emailRows = this._getEmailRows();
    const senders: { email: string; name: string }[] = [];

    // Extract sender information from each email row
    emailRows.forEach((row) => {
      const sender = this._extractSenderFromEmailRow(row);
      if (sender) {
        senders.push(sender);
      }
    });

    return senders;
  }

  /**
   * Extracts sender information (email and display name) from an HTML email row (tr) element.
   */
  static _extractSenderFromEmailRow(
    row: HTMLElement,
  ): { email: string; name: string } | null {
    const emailElement = row.querySelector("span[email]");
    if (!emailElement) return null;

    const email: string = emailElement.getAttribute("email")!;
    const name: string = emailElement.textContent || email;

    return { email, name };
  }

  /**
   * Retrieves all email row elements from the current page.
   */
  static _getEmailRows(): HTMLElement[] {
    // Find the main email table body element
    const tables = Array.from(document.querySelectorAll("tbody")).filter(
      (el) => el.offsetParent !== null,
    );
    const tableBody = tables[tables.length - 1];

    // Find all email rows within the table body
    const emailRows = Array.from(tableBody.querySelectorAll("tr")).filter(
      (row) => !(row as HTMLElement).innerText.includes("No messages"),
    );
    return emailRows;
  }

  /**
   * Waits for a specific DOM element to appear in the document.
   * @param findFn A function that returns the desired element or null if not found.
   * @param timeout Optional timeout in milliseconds to stop waiting after a certain period. Default is 10000ms.
   * @returns A promise that resolves with the found element or rejects if the timeout is reached.
   */
  static _waitForElement(
    findFn: () => Element | undefined,
    timeout = 10000,
  ): Promise<Element> {
    function isVisible(el: Element) {
      return !!(
        el &&
        (el as HTMLElement).offsetParent !== null &&
        el.getClientRects().length > 0
      );
    }

    return new Promise((resolve, reject) => {
      const checkAndResolve = () => {
        const el = findFn();
        if (el && isVisible(el)) {
          return el;
        }
        return null;
      };

      // Check immediately in case it's already present and visible
      const existing = checkAndResolve();
      if (existing) {
        resolve(existing);
        return;
      }

      const observer = new MutationObserver(() => {
        const el = checkAndResolve();
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        reject(
          new Error(`Element not found or not visible within ${timeout}ms`),
        );
      }, timeout);
    });
  }

  /**
   * Waits until the email body is loaded in the DOM.
   *
   * This method repeatedly checks for the presence of exactly three visible `<tbody>` elements,
   * which indicates that the email table has finished loading. The check is performed every 100 milliseconds.
   * The returned promise resolves once the condition is met.
   *
   * @returns {Promise<void>} A promise that resolves when the email body is detected as loaded.
   */
  static async _waitForEmailBodyToLoad(): Promise<void> {
    return await new Promise<void>((resolve) => {
      const checkTables = () => {
        const tables = Array.from(document.querySelectorAll("tbody")).filter(
          (el) => (el as HTMLElement).offsetParent !== null,
        );
        if (tables.length === 3) {
          resolve();
        } else {
          setTimeout(checkTables, 100);
        }
      };
      checkTables();
    });
  }
}
