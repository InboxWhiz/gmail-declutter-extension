import { Sender } from "../../types/types";
import { fetchAllSenders } from "../fetchSenders";
import { trashMultipleSenders } from "../trashSenders";
import { unsubscribeSendersAuto } from "../unsubscribeSenders";
import { Actions } from "./actionsInterface";
import { getCachedToken, getValidToken, signInWithGoogle } from "../googleAuth";
import { getEmailAccount } from "../utils";

export const realActions: Actions = {
  async isLoggedIn(
    getEmailAccount: () => Promise<string> = realActions.getEmailAccount,
  ): Promise<boolean> {
    const accountEmail = await getEmailAccount();
    const token = await getCachedToken(accountEmail);
    if (token) {
      return true;
    } else {
      return false;
    }
  },

  signInWithGoogle,

  getEmailAccount,

  searchEmailSenders(senderEmailAddresses: string[]): void {
    // Searches for emails in the Gmail tab

    console.log("Searching for emails: ", senderEmailAddresses);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "SEARCH_EMAIL_SENDERS",
          emails: senderEmailAddresses,
        });
      } else {
        console.error("No active tab found.");
      }
    });
  },

  async deleteSenders(
    senderEmailAddresses: string[],
    getEmailAccount: () => Promise<string> = realActions.getEmailAccount,
  ): Promise<void> {
    const accountEmail = await getEmailAccount();
    return new Promise((resolve) => {
      trashMultipleSenders(senderEmailAddresses, accountEmail).then(() => {
        // Remove senders from local storage
        chrome.storage.local.get([accountEmail], (result) => {
          if (result[accountEmail].senders) {
            const updatedSenders = result[accountEmail].senders.filter(
              (sender: [string, string, number]) =>
                !senderEmailAddresses.includes(sender[0]),
            );
            chrome.storage.local.set(
              { [accountEmail]: { senders: updatedSenders } },
              () => {
                console.log("Updated senders in local storage.");
              },
            );
          }
        });

        resolve(console.log("Trashed senders successfully"));
      });
    });
  },

  async getAllSenders(
    fetchNew: boolean = false,
    getEmailAccount: () => Promise<string> = realActions.getEmailAccount,
  ): Promise<Sender[]> {
    const accountEmail = await getEmailAccount();

    if (fetchNew) {
      await fetchAllSenders(accountEmail);
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.get(accountEmail).then(async (result) => {
        // If "senders" key does not exist on given email, fetch all senders and retry
        if (!result[accountEmail] || !result[accountEmail].senders) {
          await fetchAllSenders(accountEmail);
          const refreshed = await chrome.storage.local.get([accountEmail]);
          result = refreshed;
        }

        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        const senders = result[accountEmail].senders;
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
            await realActions.getAllSenders(true, getEmailAccount);
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
    getEmailAccount: () => Promise<string> = realActions.getEmailAccount,
  ): Promise<number> {
    const accountEmail = await getEmailAccount();
    return new Promise((resolve) => {
      chrome.storage.local.get("fetchProgress").then((data) => {
        if (
          data.fetchProgress !== undefined &&
          data.fetchProgress[accountEmail]
        ) {
          setProgressCallback(data.fetchProgress[accountEmail]);
          resolve(data.fetchProgress[accountEmail]);
        } else {
          setProgressCallback(0);
          resolve(0);
        }
      });
    });
  },

  unsubscribeSendersAuto,

  async blockSender(
    senderEmailAddress: string,
    getEmailAccount: () => Promise<string> = realActions.getEmailAccount,
  ): Promise<void> {
    const accountEmail = await getEmailAccount();
    const token = await getValidToken(accountEmail);

    const filter: gapi.client.gmail.Filter = {
      criteria: { from: senderEmailAddress },
      action: { addLabelIds: ["TRASH"] },
    };
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    try {
      const response = await fetch(
        "https://www.googleapis.com/gmail/v1/users/me/settings/filters",
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify(filter),
        },
      );
      if (!response.ok) {
        throw new Error(
          `Failed to create block filter: ${response.statusText}`,
        );
      }
    } catch (err) {
      console.error(
        `Failed to create block filter for ${senderEmailAddress}:`,
        err,
      );
      throw err;
    }
  },
};
