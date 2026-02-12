import { StorageRepo } from "../../../domain/repositories/storage_repo";
import { Sender } from "../../../domain/entities/sender";

export class MockStorageRepo implements StorageRepo {
  private mockSenders: Sender[] = [];
  private mockHiddenSenders: string[] = [];

  constructor(initialSenders: Sender[] = this.mockSenders) {
    this.mockSenders = initialSenders;
  }

  setSenders(senders: Sender[]) {
    this.mockSenders = senders;
  }

  // - Mock implementations -

  storeSenders(senders: Sender[], accountEmail: string): Promise<void> {
    console.log(`[MOCK] Storing senders for account: ${accountEmail}`);
    senders.forEach((sender) => {
      console.log(`[MOCK] Storing sender: ${sender}`);
    });
    return Promise.resolve();
  }

  readSenders(accountEmail: string): Promise<Sender[]> {
    console.log(`[MOCK] Reading senders for account: ${accountEmail}`);
    return Promise.resolve(this.mockSenders);
  }

  deleteSenders(senderEmails: string[], accountEmail: string): Promise<void> {
    console.log(`[MOCK] Deleting senders for account: ${accountEmail}`);
    senderEmails.forEach((email) => {
      console.log(`[MOCK] Deleting sender: ${email}`);
    });
    return Promise.resolve();
  }

  storeHiddenSenders(emails: string[], accountEmail: string): Promise<void> {
    console.log(`[MOCK] Storing hidden senders for account: ${accountEmail}`);
    emails.forEach((email) => {
      console.log(`[MOCK] Hiding sender: ${email}`);
    });
    this.mockHiddenSenders = Array.from(
      new Set([...this.mockHiddenSenders, ...emails]),
    );
    return Promise.resolve();
  }

  readHiddenSenders(accountEmail: string): Promise<string[]> {
    console.log(`[MOCK] Reading hidden senders for account: ${accountEmail}`);
    return Promise.resolve(this.mockHiddenSenders);
  }

  removeHiddenSenders(emails: string[], accountEmail: string): Promise<void> {
    console.log(
      `[MOCK] Removing hidden senders for account: ${accountEmail}`,
    );
    emails.forEach((email) => {
      console.log(`[MOCK] Unhiding sender: ${email}`);
    });
    this.mockHiddenSenders = this.mockHiddenSenders.filter(
      (email) => !emails.includes(email),
    );
    return Promise.resolve();
  }
}
