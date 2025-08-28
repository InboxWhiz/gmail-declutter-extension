import { AuthRepo } from '../../domain/repositories/auth_repo';

export class BrowserAuthRepo implements AuthRepo {
    /**
     * Retrieves the Gmail account associated with the currently active browser tab.
     *
     * This function sends a message to the content script of the active tab to request the current email account.
     *
     * @returns {Promise<string>} A promise that resolves to the email address string.
     * @throws Will reject the promise if there is no active tab or if a messaging error occurs.
     */
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
}
