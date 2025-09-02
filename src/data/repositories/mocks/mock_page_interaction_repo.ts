import { PageInteractionRepo } from "../../../domain/repositories/page_interaction_repo";

export class MockPageInteractionRepo implements PageInteractionRepo {
  getActiveTabEmailAccount(): Promise<string> {
    console.log("[MOCK] Getting active tab email account...");
    return Promise.resolve("mock@example.com");
  }

  searchEmailSenders(emails: string[]): void {
    console.log("[MOCK] Searching email senders:", emails);
  }
}
