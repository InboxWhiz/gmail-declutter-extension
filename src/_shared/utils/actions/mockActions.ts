import { ManualUnsubscribeData, Sender } from "../../types/types";
import { Actions } from "./actionsInterface";

export const mockActions: Actions = {
  async isLoggedIn(): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(true); // Simulate that the user is logged in
    });
  },

  async signInWithGoogle(expectedEmailAddress: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (expectedEmailAddress === "usertest@gmail.com") {
          console.log("[MOCK] User authenticated successfully");
          resolve();
        } else {
          reject(
            new Error("Authentication failed: Email address does not match."),
          );
        }
      }, 500);
    });
  },

  async getEmailAccount(): Promise<string> {
    return new Promise((resolve) => {
      resolve("usertest@gmail.com");
    });
  },

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
      setTimeout(() => {
        resolve(mockSenders);
      }, 500);
    });
  },

  async checkFetchProgress(
    setProgressCallback: (progress: number) => void,
  ): Promise<number> {
    // Mock fetch progress by incrementing a static variable
    if (!("mockProgress" in globalThis)) {
      (globalThis as any).mockProgress = 0;
    }
    (globalThis as any).mockProgress = Math.min(
      (globalThis as any).mockProgress + 0.05,
      1,
    );
    const progress = (globalThis as any).mockProgress;
    setProgressCallback(progress);
    return Promise.resolve(progress);
  },

  async unsubscribeSendersAuto(
    senderEmailAddresses: string[],
  ): Promise<ManualUnsubscribeData> {
    // Simulates unsubscribing senders automatically.
    console.log("[MOCK] Automatically unsubscribing:", senderEmailAddresses);
    return new Promise((resolve) => {
      setTimeout(() => {
        const linkOnlySenders: [string, string][] = [];
        const noUnsubscribeOptionSenders: string[] = [];

        // Carol & Dave: Mock that they have a click-link-only unsubscribe option
        if (senderEmailAddresses.includes("carol@email.com")) {
          linkOnlySenders.push([
            "carol@email.com",
            "https://example.com/unsubscribe/carol",
          ]);
        }
        if (senderEmailAddresses.includes("dave@email.com")) {
          linkOnlySenders.push([
            "dave@email.com",
            "https://example.com/unsubscribe/dave",
          ]);
        }

        // Eve & Frank: Mock that they have no unsubscribe option
        if (senderEmailAddresses.includes("eve@email.com")) {
          noUnsubscribeOptionSenders.push("eve@email.com");
        }
        if (senderEmailAddresses.includes("frank@email.com")) {
          noUnsubscribeOptionSenders.push("frank@email.com");
        }

        // All other emails: Mock that they have automatically been unsubscribed
        resolve({
          linkOnlySenders: linkOnlySenders,
          noUnsubscribeOptionSenders: noUnsubscribeOptionSenders,
        });
      }, 1000);
    });
  },

  async blockSender(senderEmailAddress: string): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(
          console.log(`[MOCK] Blocked ${senderEmailAddress} successfully`),
        );
      }, 1000);
    });
  },
};
