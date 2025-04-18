import { Sender } from "../../types/types";
import { Actions } from "./types";

export const mockActions: Actions = {
  searchEmailSenders(emails: string[]): void {
    console.log("[MOCK] Searching for emails:", emails);
  },

  async deleteSenders(emails: string[]) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(console.log("[MOCK] Trashed senders successfully:", emails));
      }, 1000);
    });
  },

  async getAllSenders(): Promise<Sender[]> {
    return new Promise((resolve) => {
      const mockSenders: Sender[] = [
        { email: "alice@email.com", name: "Alice", count: 32 },
        { email: "bob@email.com", name: "Bob", count: 78 },
        { email: "carol@email.com", name: "Carol", count: 15 },
        { email: "dave@email.com", name: "Dave", count: 56 },
        { email: "eve@email.com", name: "Eve", count: 49 },
        { email: "frank@email.com", name: "Frank", count: 12 },
        { email: "grace@email.com", name: "Grace", count: 91 },
        { email: "heidi@email.com", name: "Heidi", count: 27 },
        { email: "ivan@email.com", name: "Ivan", count: 68 },
        { email: "judy@email.com", name: "Judy", count: 39 },
        { email: "mallory@email.com", name: "Mallory", count: 50 },
        { email: "niaj@email.com", name: "Niaj", count: 83 },
        { email: "olivia@email.com", name: "Olivia", count: 21 },
        { email: "peggy@email.com", name: "Peggy", count: 74 },
        { email: "quentin@email.com", name: "Quentin", count: 59 },
        { email: "rupert@email.com", name: "Rupert", count: 34 },
        { email: "sybil@email.com", name: "Sybil", count: 88 },
        { email: "trent@email.com", name: "Trent", count: 44 },
        { email: "uma@email.com", name: "Uma", count: 66 },
        { email: "victor@email.com", name: "Victor", count: 29 },
      ];
      resolve(mockSenders);
    });
  },

  async getUnsubscribeLink(email: string): Promise<string> {
    // Simulates retrieving an unsubscribe link for the given email.
    // For the purposes of this mock, it will return a link for most emails,
    // but will reject for carol@email.com and dave@email.com.
    console.log(`[MOCK] Getting unsubscribe link for: ${email}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === "carol@email.com" || email === "dave@email.com") {
          reject(console.log("[MOCK] Unsubscribe link not found."));
        }
        resolve(`https://example.com/unsubscribe/${email}`);
      }, 1000);
    });
  },

  async blockSender(email: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(console.log(`[MOCK] Blocked ${email} successfully`));
      }, 1000);
    });
  },
};
