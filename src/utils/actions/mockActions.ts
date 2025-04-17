import { Sender } from '../../types/types';
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
            const mockSenders: Sender[] = [
                { email: 'alice@email.com', name: 'Alice', count: 32 },
                { email: 'bob@email.com', name: 'Bob', count: 78 },
                { email: 'carol@email.com', name: 'Carol', count: 15 },
                { email: 'dave@email.com', name: 'Dave', count: 56 },
                { email: 'eve@email.com', name: 'Eve', count: 49 },
                { email: 'frank@email.com', name: 'Frank', count: 12 },
                { email: 'grace@email.com', name: 'Grace', count: 91 },
                { email: 'heidi@email.com', name: 'Heidi', count: 27 },
                { email: 'ivan@email.com', name: 'Ivan', count: 68 },
                { email: 'judy@email.com', name: 'Judy', count: 39 },
                { email: 'mallory@email.com', name: 'Mallory', count: 50 },
                { email: 'niaj@email.com', name: 'Niaj', count: 83 },
                { email: 'olivia@email.com', name: 'Olivia', count: 21 },
                { email: 'peggy@email.com', name: 'Peggy', count: 74 },
                { email: 'quentin@email.com', name: 'Quentin', count: 59 },
                { email: 'rupert@email.com', name: 'Rupert', count: 34 },
                { email: 'sybil@email.com', name: 'Sybil', count: 88 },
                { email: 'trent@email.com', name: 'Trent', count: 44 },
                { email: 'uma@email.com', name: 'Uma', count: 66 },
                { email: 'victor@email.com', name: 'Victor', count: 29 },
            ];
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
