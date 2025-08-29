import { Sender } from "../../domain/entities/sender";
import { PageInteractionService } from "./page_interaction_service";

// Parse email list (list of email/name entries) to sender entities
function parseEmailsToSenders(emails: { email: string, name: string }[]): Sender[] {
    const senderMap = new Map<string, Sender>();
    emails.forEach(email => {
        if (senderMap.has(email.email)) {
            const sender = senderMap.get(email.email)!;
            sender.names.add(email.name);
            sender.emailCount += 1;
        } else {
            const sender = { email: email.email, names: new Set([email.name]), emailCount: 1 };
            senderMap.set(email.email, sender);
        }
    });

    return Array.from(senderMap.values());
}

/**
 * Service class that implements browser-specific email operations to aid BrowserEmailRepo.
 * Provides methods to interact with email data within the browser environment.
 * All methods here must be run in the content script to work properly.
 */
export class BrowserEmailService {

    // - UNSUBSCRIBE SENDERS HELPERS -

    static async unsubscribeSendersFromBrowser(senderEmailAddresses: string[]): Promise<string[]> {
        console.log("Unsubscribing senders in browser: ", senderEmailAddresses);
        let failures = [];
        for (const senderEmailAddress of senderEmailAddresses) {
            const success = await this._unsubscribeSingleSender(senderEmailAddress);
            if (!success) { failures.push(senderEmailAddress); }
        }
        return failures;
    }

    /**
     * Attempts to unsubscribe a single sender by automating browser interactions.
     * @param senderEmailAddress - The email address of the sender to unsubscribe from.
     * @returns A promise that resolves to `true` if the unsubscribe process was successful, or `false` if the "Unsubscribe" button was not found.
     */
    static async _unsubscribeSingleSender(senderEmailAddress: string): Promise<boolean> {
        console.log("Unsubscribing sender: ", senderEmailAddress);

        // Search for the sender's emails
        PageInteractionService.searchEmailSenders([senderEmailAddress]);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for search results to load

        // Hover over the first email row
        const emailRows = this._getEmailRows();
        emailRows[0].dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); // TODO: If this fails, maybe we could go down the list of rows?

        // Click the "Unsubscribe" button
        const unsubscribeButton = Array.from(document.querySelectorAll('.aJ6'))
            .filter(button => (button as HTMLElement).offsetParent !== null)[0];
        if (!unsubscribeButton) {
            console.warn('Unsubscribe button not found for sender:', senderEmailAddress);
            return false;
        }
        unsubscribeButton?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        unsubscribeButton?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

        // Confirm unsubscribe
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait for unsubscribe confirmation to load
        const confirmButton = Array.from(document.querySelectorAll(".mUIrbf-anl"))
            .filter(el => el.textContent?.includes('Unsubscribe'))[0] as HTMLElement;
        confirmButton.click();

        return true;
    }


    // - DELETE SENDERS HELPERS -

    static async deleteSendersFromBrowser(senderEmailAddresses: string[]): Promise<void> {
        console.log("Deleting senders in browser: ", senderEmailAddresses);

        PageInteractionService.searchEmailSenders(senderEmailAddresses);
        var rows = this._getEmailRows().length;
        while (rows > 0) {
            console.log(`Found ${rows} email rows to delete. Deleting...`);
            await new Promise(resolve => setTimeout(resolve, 500)); //THIS ONE
            await this._deleteEmailsOnPage();
            rows = this._getEmailRows().length;
        }
        console.log("Finished deleting senders in browser.");

    }

    static async _deleteEmailsOnPage(): Promise<void> {
        const checkboxes = Array.from(document.querySelectorAll('span[role="checkbox"]'));
        const checkbox = checkboxes.filter(checkbox => (checkbox as HTMLElement).offsetParent !== null)[0] as HTMLElement;
        checkbox.click();

        const deleteButtons = Array.from(document.querySelectorAll('div[aria-label="Delete"]'));
        const deleteButton = deleteButtons.filter(button => (button as HTMLElement).offsetParent !== null)[0] as HTMLElement;
        deleteButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        deleteButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        deleteButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

        await this._waitForDeleteConfirmation();
    }

    static async _waitForDeleteConfirmation(): Promise<void> {
        return new Promise<void>((resolve) => {
            const observer = new MutationObserver(() => {
                const confirmation = Array.from(document.querySelectorAll('span'))
                    .find(span => span.textContent?.includes("conversations moved to Bin"));
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

    // - FETCH SENDERS HELPERS -

    static async fetchSendersFromBrowser(): Promise<Sender[]> {

        // In the sidebar, click "More"
        (document.querySelector('.CJ') as HTMLElement)!.click()

        // Click "All Mail"
        Array.from(document.querySelectorAll('a')).find(a => a!.textContent!.trim() === 'All Mail')!.click();

        // Take note of the number of emails it says we have
        await this._waitForLoaderToHide();
        const { messages: totalMessages, pages: totalPages } = this._getTotalMessagesPages();
        console.log(`Total messages: ${totalMessages}, with pages: ${totalPages}`)

        // Fetch sender metadata for all emails from each page
        var emails: { email: string, name: string }[] = [];
        for (let i = 1; i <= totalPages; i++) {
            // Process emails
            console.log(`Processing page ${i} of ${totalPages}`);
            const pageEmails = this._extractSendersFromPage();
            emails.push(...pageEmails);

            // Wait for the next page to load
            if (i < totalPages) {
                await this._goToNextPage();
            }
        }

        const senders = parseEmailsToSenders(emails);
        return senders;
    }

    /**
     * Navigates to the next page of emails in the Gmail interface.
     * Waits for the loading indicator to disappear before resolving.
     */
    static async _goToNextPage(): Promise<void> {
        const buttons = document.querySelectorAll('[aria-label="Older"]');
        const nextButton = buttons[buttons.length - 1] as HTMLElement;
        if (nextButton) {
            // Dispatch a real mouse event
            nextButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            nextButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            nextButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            await this._waitForLoaderToHide(); // Wait for loading indicator to disappear
        }
    }

    /**
     * Waits for the Gmail loading indicator to disappear, indicating that the page has finished loading.
     * @param timeout Optional timeout in milliseconds to stop waiting after a certain period. Default is 1000ms.
     */
    static async _waitForLoaderToHide(timeout = 1000): Promise<void> {
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
    static _getTotalMessagesPages(): { messages: number, pages: number } {
        const infoDiv = Array.from(document.querySelectorAll('.Dj')).find(el => (el as HTMLElement).offsetParent !== null);
        const [_, pageSize, totalMessages] = infoDiv?.querySelectorAll(".ts") || [];
        const messages = parseInt((totalMessages?.textContent || "0").replace(/,/g, ""));
        const pages = Math.ceil(messages / (parseInt((pageSize?.textContent || "0").replace(/,/g, "")) + 1));

        return { messages, pages };
    }

    /**
     * Extracts sender information from all email rows within a table body element.
     */
    static _extractSendersFromPage(): { email: string, name: string }[] {
        const emailRows = this._getEmailRows();
        var senders: { email: string, name: string }[] = [];

        // Extract sender information from each email row
        emailRows.forEach(row => {
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
    static _extractSenderFromEmailRow(row: HTMLElement): { email: string, name: string } | null {
        const emailElement = row.querySelector('span[email]');
        if (!emailElement) return null;

        const email: string = emailElement.getAttribute('email')!;
        const name: string = emailElement.textContent || email;

        return { email, name };
    }

    // - GENERAL HELPERS -

    /**
     * Retrieves all email row elements from the current page.
     */
    static _getEmailRows(): HTMLElement[] {
        // Find the main email table body element
        const tables = Array.from(document.querySelectorAll("tbody")).filter(el => el.offsetParent !== null);
        const tableBody = tables[tables.length - 1];

        // Find all email rows within the table body
        const emailRows = tableBody.querySelectorAll('tr');
        return Array.from(emailRows);
    }
}