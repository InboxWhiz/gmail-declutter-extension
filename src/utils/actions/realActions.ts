// actions/realActions.ts
import { Sender } from "../../types/types";
import { fetchAllSenders } from "../fetchSenders";
import { trashMultipleSenders } from "../trashSenders";
import { Actions } from "./types";

export const realActions: Actions = {
  searchEmailSenders(emails: string[]): void {
    // Searches for emails in the Gmail tab

    console.log("Searching for emails: ", emails);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "SEARCH_EMAIL_SENDERS",
          emails: emails,
        });
      } else {
        console.error("No active tab found.");
      }
    });
  },

  deleteSenders(emails: string[]): Promise<void> {
    // Moves the senders to trash using Gmail API

    return new Promise((resolve) => {
      trashMultipleSenders(emails).then(() => {
        // Remove senders from local storage
        chrome.storage.local.get(["senders"], (result) => {
          if (result.senders) {
            const updatedSenders = result.senders.filter(
              (sender: [string, string, number]) => !emails.includes(sender[0]),
            );
            chrome.storage.local.set({ senders: updatedSenders }, () => {
              console.log("Updated senders in local storage.");
            });
          }
        });

        resolve(console.log("Trashed senders successfully"));
      });
    });
  },

  async getAllSenders(fetchNew: boolean = false): Promise<Sender[]> {
    // Retrieves all senders from local storage, or fetches them if not available.
    // fetchNew: boolean - whether to fetch new senders from the server

    if (fetchNew) {
      await fetchAllSenders();
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.get(["senders"], async (result) => {
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
            }),
          );
          resolve(realSenders);
        } else {
          if (!fetchNew) {
            // Retry with fetching new senders if not found
            await this.getAllSenders((fetchNew = true));
          } else {
            // Already fetched - no senders found
            resolve([]);
          }
        }
      });
    });
  },

  async getUnsubscribeLink(email: string): Promise<string> {
    // Retrieves the unsubscribe link for a given email address.
    // TODO: Implement the actual logic to get the unsubscribe link.

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://example.com/unsubscribe/${email}`);
      }, 1000);
    });
  },

  async blockSender(email: string): Promise<void> {
    // Blocks the sender using the Gmail API.
    // TODO: Implement the actual logic to block the sender.

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(console.log("Blocked sender successfully", email));
      }, 1000);
    });
  },
};
