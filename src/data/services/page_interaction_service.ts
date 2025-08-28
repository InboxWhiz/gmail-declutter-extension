/**
 * Service class for interacting with the Gmail page (must be used within content script).
 * Actions here are reused regardless of implementation of EmailRepo.
 */
export class PageInteractionService {

    /**
     * Opens a search for specific senders in Gmail interface.
     */
    static searchEmailSenders(emails: string[]): void {
        // Concatenate emails
        const email = emails.join(" OR ");

        // Get the search input element
        const searchInput = document.querySelector("input[name='q']")! as HTMLInputElement;

        // Set the search input value to the email address
        searchInput.value = `from:(${email})`;

        // Submit the search form
        (document.querySelector("button[aria-label='Search mail']") as HTMLElement).click();
    }

    /**
     * Extracts the email address of the account on the currently open tab.
     */
    static getActiveTabEmailAccount(): string | undefined {
        const title = document.querySelector("title")?.textContent;
        return title?.split(" - ")[1].trim();
    }
}