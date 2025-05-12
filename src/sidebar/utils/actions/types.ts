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

  /**
   * Blocks the specified sender by their email address using the Gmail API.
   * This creates a filter to automatically move emails from the sender to trash.
   *
   * @param senderEmailAddress - The email address of the sender to block.
   * @returns A promise that resolves when the sender has been blocked.
   */
  blockSender(senderEmailAddress: string): Promise<void>;
}
