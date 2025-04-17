// actions/mockActions.ts
import { Sender } from '../types/types';
import { Actions } from './types';

export const mockActions: Actions = {
    searchEmailSenders(emails: string[]): void {
        console.log("[MOCK] Searching for emails:", emails);
    },

    async deleteSenders() {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(console.log("[MOCK] Trashed senders successfully"));
            }, 1000);
        });
    },

    async getAllSenders(): Promise<Sender[]> {
        return new Promise((resolve) => {
            const mockSenders: Sender[] = Array.from({ length: 30 }, (_, i) => ({
                email: `email${i + 1}@email.com`,
                name: `Sender ${i + 1}`,
                count: Math.floor(Math.random() * 100) + 1,
            }));
            resolve(mockSenders);
        });
    },

    async getUnsubscribeLink(email: string): Promise<string> {
        console.log(`[MOCK] Getting unsubscribe link for: ${email}`);
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(`https://example.com/unsubscribe/${email}`);
                // reject("[MOCK] Unsubscribe link not found.");
            }, 1000);
        });
    },

    async blockSender(): Promise<void> {
        // Blocks the sender using the Gmail API.
        // TODO: Implement the actual logic to block the sender.

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(console.log("[MOCK] Blocked sender successfully"));
            }, 1000);
        });
    },
};
