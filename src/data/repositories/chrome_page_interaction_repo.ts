import { PageInteractionRepo } from "../../domain/repositories/page_interaction_repo";

export class ChromePageInteractionRepo implements PageInteractionRepo {
  async getActiveTabEmailAccount(): Promise<string> {
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
                chrome.runtime.lastError,
              );
              reject(chrome.runtime.lastError.message);
            } else {
              resolve(response.result);
            }
          },
        );
      });
    });
  }

  searchEmailSenders(senderEmailAddresses: string[]): void {
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
  }
}
