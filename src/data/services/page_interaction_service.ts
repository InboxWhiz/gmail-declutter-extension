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
    const searchInput = document.querySelector(
      "input[name='q']",
    )! as HTMLInputElement;

    // Set the search input value to the email address
    searchInput.value = `from:(${email})`;

    // Submit the search form
    (
      document.querySelector("button[aria-label='Search mail']") as HTMLElement
    ).click();
  }

  /**
   * Extracts the email address of the account on the currently open tab.
   */
  static getActiveTabEmailAccount(): string | undefined {
    const title = document.querySelector("title")?.textContent;
    return title?.split(" - ")[1].trim();
  }

  static displayTutorial() {
    // Create an iframe element
    const iframe = document.createElement("iframe");
    iframe.id = "inboxwhiz-tutorial";
    iframe.src = chrome.runtime.getURL("tutorial/index.html");

    // Style the iframe as a modal
    iframe.setAttribute("allowtransparency", "true");
    iframe.style.backgroundColor = "transparent";
    iframe.style.position = "fixed";
    iframe.style.top = "50%";
    iframe.style.left = "50%";
    iframe.style.transform = "translate(-50%, -50%)";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.zIndex = "10000";

    // Append the iframe to the document body
    document.body.appendChild(iframe);
  }

  static closeTutorial() {
    const iframe = document.getElementById("inboxwhiz-tutorial");
    iframe?.remove();
  }
}
