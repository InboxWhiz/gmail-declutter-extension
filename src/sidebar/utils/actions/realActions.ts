import {
  ManualUnsubscribeData,
  Sender,
  UnsubscribeData,
} from "../../types/types";
import { blockOneSender } from "../blockSenders";
import { fetchAllSenders } from "../fetchSenders";
import { trashMultipleSenders } from "../trashSenders";
import {
  getMultipleUnsubscribeData,
  unsubscribeUsingMailTo,
  // unsubscribeUsingPostUrl,
} from "../unsubscribeSenders";
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
        // If "senders" key does not exist, fetch all senders and retry
        if (!result.senders) {
          await fetchAllSenders();
          const refreshed = await chrome.storage.local.get(["senders"]);
          result = refreshed;
        }

        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        const senders = result.senders;
        if (senders) {
          const realSenders: Sender[] = senders
            .filter(
              (sender: [string, string, number]) =>
                !sender[0].endsWith("@gmail.com"),
            )
            .map((sender: [string, string, number]) => ({
              email: sender[0],
              name: sender[1],
              count: sender[2],
            }));
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

  async checkFetchProgress(
    setProgressCallback: (progress: number) => void,
  ): Promise<number> {
    return new Promise((resolve) => {
      chrome.storage.local.get("fetchProgress", (data) => {
        if (data.fetchProgress !== undefined) {
          setProgressCallback(data.fetchProgress);
          resolve(data.fetchProgress);
        } else {
          setProgressCallback(0);
          resolve(0);
        }
      });
    });
  },

  async unsubscribeSendersAuto(
    emails: string[],
  ): Promise<ManualUnsubscribeData> {
    // Attempts to automatically unsubscribes from the given email addresses.

    // Get the latest message ids for each sender
    console.log("Unsubscribing automatically from senders: ", emails);

    // Get the latestMessageIds for the given emails from local storage
    const result = await chrome.storage.local.get(["senders"]);
    const messageIds: string[] = result.senders
      .filter((sender: [string, string, number, string]) =>
        emails.includes(sender[0]),
      )
      .map((sender: [string, string, number, string]) => sender[3]);

    console.log("Message IDs for unsubscribe: ", messageIds);
    // Get the unsubscribe data for all the message ids
    const unsubscribeData: UnsubscribeData[] =
      await getMultipleUnsubscribeData(messageIds);

    console.log("Unsubscribe data: ", unsubscribeData);

    // Attempt to automatically unsubscribe from each.
    const linkOnlySenders: [string, string][] = [];
    const noUnsubscribeSenders: string[] = [];
    unsubscribeData.forEach((sender, index) => {
      // if (sender.posturl !== null) {
      //   unsubscribeUsingPostUrl(sender.posturl);
      // } else if (sender.mailto !== null) {
      if (sender.mailto !== null) {
        unsubscribeUsingMailTo(sender.mailto);
      } else if (sender.clickurl !== null) {
        // If only a click URL is available, store it for later use
        linkOnlySenders.push([emails[index], sender.clickurl]);
      } else {
        // No unsubscribe data found, so can only block
        noUnsubscribeSenders.push(emails[index]);
      }
    });

    return {
      linkOnlySenders: linkOnlySenders,
      noUnsubscribeSenders: noUnsubscribeSenders,
    };
  },

  async blockSender(email: string): Promise<void> {
    // Blocks the sender using the Gmail API.
    await blockOneSender(email);
  },
};
