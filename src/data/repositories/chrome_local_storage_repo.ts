import { Sender } from "../../domain/entities/sender";
import { StorageRepo } from "../../domain/repositories/storage_repo";

export class ChromeLocalStorageRepo implements StorageRepo {
  async storeSenders(senders: Sender[], accountEmail: string): Promise<void> {
    // Sort by count in descending order
    const sortedSenders = senders.sort((a, b) => b.emailCount - a.emailCount);

    // Store in local storage
    await chrome.storage.local.set({
      [accountEmail]: { senders: sortedSenders },
    });
  }

  readSenders(accountEmail: string): Promise<Sender[]> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(accountEmail).then((result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        const senders = result[accountEmail]?.senders || [];
        resolve(senders);
      });
    });
  }

  deleteSenders(senderEmails: string[], accountEmail: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.get([accountEmail], (result) => {
        if (result[accountEmail].senders) {
          const updatedSenders = result[accountEmail].senders.filter(
            (sender: { email: string; emailCount: number; names: string[] }) =>
              !senderEmails.includes(sender.email),
          );
          chrome.storage.local.set(
            { [accountEmail]: { senders: updatedSenders } },
            () => {
              console.log("Updated senders in local storage.");
              resolve();
            },
          );
        }
      });
    });
  }

  async storeHiddenSenders(
    emails: string[],
    accountEmail: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([accountEmail], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        const accountData = result[accountEmail] || { senders: [] };
        const currentHidden = accountData.hiddenSenderEmails || [];
        const updatedHidden = Array.from(
          new Set([...currentHidden, ...emails]),
        );

        chrome.storage.local.set(
          {
            [accountEmail]: {
              ...accountData,
              hiddenSenderEmails: updatedHidden,
            },
          },
          () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
              return;
            }
            console.log("Updated hidden senders in local storage.");
            resolve();
          },
        );
      });
    });
  }

  async readHiddenSenders(accountEmail: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([accountEmail], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        const hiddenSenders = result[accountEmail]?.hiddenSenderEmails || [];
        resolve(hiddenSenders);
      });
    });
  }

  async removeHiddenSenders(
    emails: string[],
    accountEmail: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([accountEmail], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        const accountData = result[accountEmail] || { senders: [] };
        const currentHidden = accountData.hiddenSenderEmails || [];
        const updatedHidden = currentHidden.filter(
          (email: string) => !emails.includes(email),
        );

        chrome.storage.local.set(
          {
            [accountEmail]: {
              ...accountData,
              hiddenSenderEmails: updatedHidden,
            },
          },
          () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
              return;
            }
            console.log("Removed hidden senders from local storage.");
            resolve();
          },
        );
      });
    });
  }
}
