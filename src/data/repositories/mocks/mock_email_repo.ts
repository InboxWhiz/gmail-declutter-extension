import { Sender } from "../../../domain/entities/sender";
import { EmailRepo } from "../../../domain/repositories/email_repo";

export interface FetchProgress {
  currentPage: number;
  totalPages: number;
  processedEmails: number;
  totalEmails: number;
  percentage: number;
}

export class MockEmailRepo implements EmailRepo {
  private mockSenders: Sender[] = [
    { email: "alice@email.com", names: new Set(["Alice"]), emailCount: 32 },
    { email: "bob@email.com", names: new Set(["Bob"]), emailCount: 78 },
    { email: "carol@email.com", names: new Set(["Carol"]), emailCount: 15 },
    { email: "dave@email.com", names: new Set(["Dave"]), emailCount: 56 },
    { email: "eve@email.com", names: new Set(["Eve"]), emailCount: 49 },
    { email: "frank@email.com", names: new Set(["Frank"]), emailCount: 12 },
    { email: "grace@email.com", names: new Set(["Grace"]), emailCount: 91 },
    { email: "heidi@email.com", names: new Set(["Heidi"]), emailCount: 27 },
    { email: "ivan@email.com", names: new Set(["Ivan"]), emailCount: 68 },
    { email: "judy@email.com", names: new Set(["Judy"]), emailCount: 39 },
    { email: "mallory@email.com", names: new Set(["Mallory"]), emailCount: 50 },
    { email: "niaj@email.com", names: new Set(["Niaj"]), emailCount: 83 },
    { email: "olivia@email.com", names: new Set(["Olivia"]), emailCount: 21 },
    { email: "peggy@email.com", names: new Set(["Peggy"]), emailCount: 74 },
    { email: "quentin@email.com", names: new Set(["Quentin"]), emailCount: 59 },
    { email: "rupert@email.com", names: new Set(["Rupert"]), emailCount: 34 },
    { email: "sybil@email.com", names: new Set(["Sybil"]), emailCount: 88 },
    { email: "trent@email.com", names: new Set(["Trent"]), emailCount: 44 },
    { email: "uma@email.com", names: new Set(["Uma"]), emailCount: 66 },
    { email: "victor@email.com", names: new Set(["Victor"]), emailCount: 29 },
  ];

  private failingSenders: string[];
  private progressCallback?: (progress: FetchProgress) => void;
  private abortController?: AbortController;
  private isProgressiveLoadEnabled: boolean = true;

  constructor(initialSenders: Sender[] = this.mockSenders) {
    this.mockSenders = initialSenders;
    this.failingSenders = ["eve@email.com", "frank@email.com"];
  }

  setSenders(senders: Sender[]) {
    this.mockSenders = senders;
  }

  setFailingSenders(senders: string[]) {
    this.failingSenders = senders;
  }

  setProgressCallback(callback: (progress: FetchProgress) => void) {
    this.progressCallback = callback;
  }

  setProgressiveLoadEnabled(enabled: boolean) {
    this.isProgressiveLoadEnabled = enabled;
  }

  async fetchSenders(): Promise<Sender[]> {
    console.log("[MOCK] Fetching senders...");

    if (this.isProgressiveLoadEnabled && this.progressCallback) {
      // Simulate progressive loading
      const totalPages = 5;
      const emailsPerPage = 4;
      const totalEmails = this.mockSenders.length;

      this.abortController = new AbortController();

      for (let page = 1; page <= totalPages; page++) {
        // Check if cancelled
        if (this.abortController.signal.aborted) {
          console.log("[MOCK] Fetch cancelled");
          throw new Error("Fetch cancelled");
        }

        // Simulate page processing delay
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Report progress
        const progress: FetchProgress = {
          currentPage: page,
          totalPages: totalPages,
          processedEmails: Math.min(page * emailsPerPage, totalEmails),
          totalEmails: totalEmails,
          percentage: Math.round((page / totalPages) * 100),
        };
        this.progressCallback(progress);
      }
    } else {
      // Original behavior without progress
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    this.mockSenders.sort((a, b) => b.emailCount - a.emailCount);
    return this.mockSenders;
  }

  async cancelFetch(): Promise<void> {
    console.log("[MOCK] Cancel fetch requested");
    this.abortController?.abort();
  }

  async deleteSenders(senderEmailAddresses: string[]): Promise<void> {
    console.log("[MOCK] Deleting senders:", senderEmailAddresses);
    this.mockSenders = this.mockSenders.filter(
      (sender) => !senderEmailAddresses.includes(sender.email),
    );
    return Promise.resolve();
  }

  async unsubscribeSenders(senderEmailAddresses: string[]): Promise<string[]> {
    console.log("[MOCK] Unsubscribing senders:", senderEmailAddresses);
    const fails = this.failingSenders.filter((email) =>
      senderEmailAddresses.includes(email),
    );
    return Promise.resolve(fails);
  }

  async blockSender(senderEmailAddress: string): Promise<void> {
    console.log("[MOCK] Blocking sender:", senderEmailAddress);
    this.mockSenders = this.mockSenders.filter(
      (sender) => sender.email !== senderEmailAddress,
    );
    return Promise.resolve();
  }
}
