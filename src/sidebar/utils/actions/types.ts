import { ManualUnsubscribeData, Sender } from "../../types/types";

export interface Actions {
  getEmailAccount(): Promise<string>;
  searchEmailSenders(emails: string[]): void;
  deleteSenders(emails: string[]): Promise<void>;
  getAllSenders(fetchNew?: boolean): Promise<Sender[]>;
  checkFetchProgress(
    setProgressCallback: (progress: number) => void,
  ): Promise<number>;
  unsubscribeSendersAuto(email: string[]): Promise<ManualUnsubscribeData>;
  blockSender(email: string): Promise<void>;
}
