import { Sender } from "../../domain/entities/sender";
import { StorageRepo } from "../../domain/repositories/storage_repo";

export class ChromeLocalStorageRepo implements StorageRepo {
    async storeSenders(senders: Sender[], accountEmail: string): Promise<void> {
        // Sort by count in descending order
        const sortedSenders = senders.sort((a, b) => b.emailCount - a.emailCount);

        // Store in local storage
        await chrome.storage.local.set({ [accountEmail]: { senders: sortedSenders } });
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
                        (sender: [string, string, number]) =>
                            !senderEmails.includes(sender[0]),
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
}