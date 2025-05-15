import {
  ManualUnsubscribeData,
  Sender,
  UnsubscribeData,
} from "../../types/types";
import { fetchAllSenders } from "../fetchSenders";
import { trashMultipleSenders } from "../trashSenders";
import {
  getMultipleUnsubscribeData,
  unsubscribeUsingMailTo,
  // unsubscribeUsingPostUrl,
} from "../unsubscribeSenders";
import {
  getOAuthToken,
  getAuthenticatedEmail,
} from "../../../_shared/utils/auth";
import { Actions } from "./types";
import { signInWithGoogle } from "../../../_shared/utils/googleAuth";

export const realActions: Actions = {
  async isLoggedIn(
    getEmailAccount: () => Promise<string> = realActions.getEmailAccount
  ): Promise<boolean> {
    let token: chrome.identity.GetAuthTokenResult;
    try {
      token = await getOAuthToken(false);
    } catch {
      return false; // If getOAuthToken rejects, user needs to sign in
    }
    const authEmail = await getAuthenticatedEmail(token);
    const gmailEmail = await getEmailAccount();

    if (authEmail !== gmailEmail) {
      return false; // User is not logged in to the correct account
    }

    return true; // User is logged in, and into the correct account
  },

  signInWithGoogle,

  async getEmailAccount(): Promise<string> {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0]?.id;
        if (tabId === undefined) {
          reject("No active tab.");
          return;
        }

        chrome.tabs.sendMessage(
          tabId,
          { action: "GET_EMAIL_ACCOUNT" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(
                "Could not get email account:",
                chrome.runtime.lastError
              );
              reject(chrome.runtime.lastError.message);
            } else {
              resolve(response.result);
            }
          }
        );
      });
    });
  },

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
    getEmailAccount: () => Promise<string> = realActions.getEmailAccount
  ): Promise<void> {
    const accountEmail = await getEmailAccount();
    return new Promise((resolve) => {
      trashMultipleSenders(senderEmailAddresses, accountEmail).then(() => {
        // Remove senders from local storage
        chrome.storage.local.get([accountEmail], (result) => {
          if (result[accountEmail].senders) {
            const updatedSenders = result[accountEmail].senders.filter(
              (sender: [string, string, number]) =>
                !senderEmailAddresses.includes(sender[0])
            );
            chrome.storage.local.set(
              { [accountEmail]: { senders: updatedSenders } },
              () => {
                console.log("Updated senders in local storage.");
              }
            );
          }
        });

        resolve(console.log("Trashed senders successfully"));
      });
    });
  },

  async getAllSenders(
    fetchNew: boolean = false,
    getEmailAccount: () => Promise<string> = realActions.getEmailAccount
  ): Promise<Sender[]> {
    const accountEmail = await getEmailAccount();

    if (fetchNew) {
      await fetchAllSenders(accountEmail);
    }

    return new Promise((resolve, reject) => {
      chrome.storage.local.get([accountEmail], async (result) => {
        // If "senders" key does not exist on given email, fetch all senders and retry
        if (!result[accountEmail].senders) {
          await fetchAllSenders(accountEmail);
          const refreshed = await chrome.storage.local.get([accountEmail]);
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
                !sender[0].endsWith("@gmail.com")
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
            await this.getAllSenders((fetchNew = true), getEmailAccount);
          } else {
            // Already fetched - no senders found
            resolve([]);
          }
        }
      });
    });
  },

  async checkFetchProgress(
    setProgressCallback: (progress: number) => void
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
    senderEmailAddresses: string[],
    getEmailAccount: () => Promise<string> = realActions.getEmailAccount
  ): Promise<ManualUnsubscribeData> {
    const accountEmail = await getEmailAccount();

    // Get the latest message ids for each sender
    console.log(
      "Unsubscribing automatically from senders: ",
      senderEmailAddresses
    );

    // Get the latestMessageIds for the given emails from local storage
    const result = await chrome.storage.local.get(["senders"]);
    const messageIds: string[] = result.senders
      .filter((sender: [string, string, number, string]) =>
        senderEmailAddresses.includes(sender[0])
      )
      .map((sender: [string, string, number, string]) => sender[3]);

    console.log("Message IDs for unsubscribe: ", messageIds);
    // Get the unsubscribe data for all the message ids
    const unsubscribeData: UnsubscribeData[] = await getMultipleUnsubscribeData(
      messageIds,
      accountEmail
    );

    console.log("Unsubscribe data: ", unsubscribeData);

    // Attempt to automatically unsubscribe from each.
    const linkOnlySenders: [string, string][] = [];
    const noUnsubscribeSenders: string[] = [];
    unsubscribeData.forEach((sender, index) => {
      // if (sender.posturl !== null) {
      //   unsubscribeUsingPostUrl(sender.posturl);
      // } else if (sender.mailto !== null) {
      if (sender.mailto !== null) {
        unsubscribeUsingMailTo(sender.mailto, accountEmail);
      } else if (sender.clickurl !== null) {
        // If only a click URL is available, store it for later use
        linkOnlySenders.push([senderEmailAddresses[index], sender.clickurl]);
      } else {
        // No unsubscribe data found, so can only block
        noUnsubscribeSenders.push(senderEmailAddresses[index]);
      }
    });

    return {
      linkOnlySenders: linkOnlySenders,
      noUnsubscribeSenders: noUnsubscribeSenders,
    };
  },

  async blockSender(
    senderEmailAddress: string,
    getEmailAccount: () => Promise<string> = realActions.getEmailAccount
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
        }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to create block filter: ${response.statusText}`
        );
      }
    } catch (err) {
      console.error(
        `Failed to create block filter for ${senderEmailAddress}:`,
        err
      );
      throw err;
    }
  },
};
