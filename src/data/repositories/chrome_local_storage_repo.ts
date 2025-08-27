import { Sender } from "../../domain/entities/sender";
import { StorageRepo } from "../../domain/repositories/storage_repo";

export class ChromeLocalStorageRepo implements StorageRepo {
    storeSenders(senders: Sender[], accountEmail: string): void {
        // Sort by count in descending order
        const sortedSenders = senders.sort((a, b) => b.emailCount - a.emailCount);

        // Store in local storage
        chrome.storage.local.set({ [accountEmail]: { senders: sortedSenders } });
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
}