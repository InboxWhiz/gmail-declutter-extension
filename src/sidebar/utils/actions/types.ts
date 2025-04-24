import { ManualUnsubscribeData, Sender } from "../../types/types";

export interface Actions {
  searchEmailSenders(emails: string[]): void;
  deleteSenders(emails: string[]): Promise<void>;
  getAllSenders(fetchNew?: boolean): Promise<Sender[]>;
  unsubscribeSendersAuto(email: string[]): Promise<ManualUnsubscribeData>;
  blockSender(email: string): Promise<void>;
}
