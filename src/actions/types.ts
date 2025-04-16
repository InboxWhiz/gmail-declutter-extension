import { Sender } from "../types/types";

export interface Actions {
    searchEmailSenders(emails: string[]): void;
    deleteSenders(emails: string[]): Promise<void>;
    getAllSenders(fetchNew?: boolean): Promise<Sender[]>;
    getUnsubscribeLink(email: string): Promise<string>;
    blockSender(email: string): Promise<void>;
  }
  