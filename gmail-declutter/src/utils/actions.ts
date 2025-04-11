import { Sender } from "../types/types";

export function searchEmailSenders(emails: string[]): void {
  console.log("Searching for emails: ", emails);
  // TODO: Implement search emails functionality

  // // Concatenate emails
  // const email = emails.join(" OR ");

  // // Get the search input element
  // const searchInput: HTMLInputElement = document.querySelector("input[name='q']")!;

  // // Set the search input value to the email address
  // searchInput.value = `from:(${email})`;

  // // Submit the search form
  // (document.querySelector("button[aria-label='Search mail']") as HTMLButtonElement)!.click();
}

export function trashSenders(emails: string[]): Promise<void> {
  console.log("Trashing senders: ", emails);

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(console.log("Trashed senders successfully"));
    }, 1000);
  });

  // TODO: Implement delete emails functionality

  // // Show pending popup
  // document.querySelector("#delete-confirm-modal").style.display = "none";
  // document.querySelector("#delete-pending-modal").style.display = "block";

  // // Send message to background script
  // chrome.runtime.sendMessage(
  //   { action: "trashSenders", senders: Object.keys(selectedSenders) },
  //   () => {
  //     if (chrome.runtime.lastError) {
  //       console.error("Message error:", chrome.runtime.lastError.message);
  //     } else {
  //       // Show success popup
  //       document.querySelector("#delete-pending-modal").style.display = "none";
  //       document.querySelector("#delete-success-modal").style.display = "block";

  //       // Reload senders
  //       reloadSenders();
  //     }
  //   },
  // );
}

export async function getAllSenders(): Promise<Sender[]> {
  // TODO: Implement real functionality to get all senders

  const generateMockSenders = (n: number): Sender[] => {
    return Array.from({ length: n }, (_, i) => ({
      name: `Sender ${i + 1}`,
      email: `email${i + 1}@email.com`,
      count: Math.floor(Math.random() * 100) + 1,
    }));
  };

  return new Promise(resolve => {
    setTimeout(() => {
      resolve(generateMockSenders(8));
    }, 1000);
  });
}
