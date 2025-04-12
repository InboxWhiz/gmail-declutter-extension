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
  // TODO: Implement a call to the background script to get all senders into storage

  // Set mock data
  await chrome.storage.local.set({
    senders: Array.from({ length: 10 }, (_, i) => ([
      `email${i + 1}@email.com`,
      `Sender ${i + 1}`,
      Math.floor(Math.random() * 100) + 1,
    ]))
  });

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['senders'], (result) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }

      const senders = result.senders;
      if (senders) {
        const realSenders: Sender[] = senders.map(
          (sender: [string, string, number]) => ({
            email: sender[0],
            name: sender[1],
            count: sender[2],
          })
        );
        resolve(realSenders);
      } else {
        resolve([]); // No senders saved
      }
    });
  });
}
