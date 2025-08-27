import { Sender } from "../../domain/entities/sender";
import { EmailRepo } from "../../domain/repositories/email_repo";

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

export class BrowserEmailRepo implements EmailRepo {
    async fetchSenders(): Promise<Sender[]> {
        // Save current page to come back to

        // In the sidebar, click "More"
        (document.querySelector('.CJ') as HTMLElement)!.click()

        // Click "All Mail"
        Array.from(document.querySelectorAll('a')).find(a => a!.textContent!.trim() === 'All Mail')!.click();

        // Take note of the number of emails it says we have
        await BrowserEmailService.waitForLoaderToHide();
        const { messages: totalMessages, pages: totalPages } = BrowserEmailService.getTotalMessagesPages();
        console.log(`Total messages: ${totalMessages}, with pages: ${totalPages}`)

        // Fetch sender metadata for all emails from each page
        var emails: { email: string, name: string }[] = [];
        for (let i = 1; i <= totalPages; i++) {
            // Process emails
            console.log(`Processing page ${i} of ${totalPages}`);
            const pageEmails = BrowserEmailService.extractSendersFromPage();
            emails.push(...pageEmails);

            // Wait for the next page to load
            if (i < totalPages) {
                await BrowserEmailService.goToNextPage();
            }
        }

        const senders = parseEmailsToSenders(emails);
        return senders;
    }
    deleteSenders(senderEmailAddresses: string[]): Promise<void> {
        throw new Error("Method not implemented.");
        senderEmailAddresses
    }
    blockSender(senderEmailAddress: string): Promise<void> {
        throw new Error("Method not implemented.");
        senderEmailAddress
    }
}

/**
 * Service class that implements browser-specific email operations for the BrowserEmailRepo.
 * Provides methods to interact with email data within the browser environment.
 */
class BrowserEmailService {

    static async goToNextPage(): Promise<void> {
        const buttons = document.querySelectorAll('[aria-label="Older"]');
        const nextButton = buttons[buttons.length - 1] as HTMLElement;
        if (nextButton) {
            // Dispatch a real mouse event
            nextButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
            nextButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            nextButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            await this.waitForLoaderToHide(); // Wait for loading indicator to disappear
        }
    }

    static async waitForLoaderToHide(timeout = 1000): Promise<void> {
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

    static getTotalMessagesPages(): { messages: number, pages: number } {
        const infoDiv = Array.from(document.querySelectorAll('.Dj')).find(el => (el as HTMLElement).offsetParent !== null);
        const [_, pageSize, totalMessages] = infoDiv?.querySelectorAll(".ts") || [];

        const messages = parseInt((totalMessages?.textContent || "0").replace(/,/g, ""));
        const pages = Math.ceil(messages / parseInt((pageSize?.textContent || "1").replace(/,/g, "")));

        return { messages, pages };
    }

    /**
     * Extracts sender information from all email rows within a table body element.
     */
    static extractSendersFromPage(): { email: string, name: string }[] {
        // Find the main email table body element
        const tables = document.querySelectorAll("tbody");
        const tableBody = tables[tables.length - 1];

        // Find all email rows within the table body
        var senders: { email: string, name: string }[] = [];
        const emailRows = tableBody.querySelectorAll('tr');

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
}