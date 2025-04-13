import { Sender } from "../types/types";
import { fetchAllSenders } from "./fetchSenders";
import { trashMultipleSenders } from "./trashSenders";

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

export function deleteSenders(emails: string[]): Promise<void> {
  // Moves the senders to trash using Gmail API

  // return new Promise(resolve => {
  //   setTimeout(() => {
  //     resolve(console.log("Trashed senders successfully"));
  //   }, 1000);
  // });

  return new Promise((resolve) => {
    trashMultipleSenders(emails).then(() => {
      resolve(console.log("Trashed senders successfully"));
    });
  });

}

export async function getAllSenders(): Promise<Sender[]> {
  // Retrieves all senders from local storage, or fetches them if not available

  // // Set mock data
  // await chrome.storage.local.set({
  //   senders: Array.from({ length: 10 }, (_, i) => ([
  //     `email${i + 1}@email.com`,
  //     `Sender ${i + 1}`,
  //     Math.floor(Math.random() * 100) + 1,
  //   ]))
  // });

  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['senders'], async (result) => {
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
        await fetchAllSenders();
        await getAllSenders(); // Retry after fetching
        resolve([]); // No senders saved
      }
    });
  });
}
